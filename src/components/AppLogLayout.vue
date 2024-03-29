<template>
  <div class="flex flex-col col-span-4 h-full bg-white overflow-hidden">
    <div class="bg-indigo-200 p-4 py-6 font-bold flex items-center">
      Лог действий пользователей

      <n-button
        class="ml-auto"
        circle
        @click="handleCloseLog"
      >
        <template #icon>
          <n-icon>
            <Dismiss24Filled />
          </n-icon>
        </template>
      </n-button>
    </div>
    <div
      class="overflow-auto"
    >
      <div class="p-4 flex flex-col gap-4">
        <n-form
          inline
          class="flex-wrap"
          :model="filters"
        >
          <n-form-item
            label="Дата события"
            path="date"
          >
            <n-date-picker
              v-model:value="filters.date"
              type="date"
              clearable
              placeholder="Выберите дату"
            />
          </n-form-item>

          <n-form-item
            label="Пользователь"
            path="userId"
          >
            <n-select
              v-model:value="filters.userId"
              filterable
              clearable
              placeholder="Выберите пользователя"
              :options="usersOptions"
              :loading="loading"
            />
          </n-form-item>

          <n-form-item
            label="Операция"
            path="action"
            class="!w-52"
          >
            <n-select
              v-model:value="filters.action"
              placeholder="Выберите операцию"
              :options="actionsOptions"
              :loading="loading"
              clearable
              filterable
            />
          </n-form-item>

          <n-form-item
            label="Название файла/папки"
            path="nodeName"
            class="!w-52"
          >
            <n-input
              v-model:value="filters.nodeName"
              placeholder="Введите название"
            />
          </n-form-item>
        </n-form>

        <n-data-table
          ref="table"
          remote
          :columns="columns"
          :data="data"
          :loading="loading"
          :pagination="pagination"
          @update:page="handlePageChange"
          @update:sorter="handleSorterChange"
        >
          <template #empty>
            <div class="flex flex-col gap-6 justify-center items-center text-slate-300 font-bold text-lg">
              <TableDismiss28Filled class="w-20 h-20" />

              Ничего не найдено
            </div>
          </template>
        </n-data-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { computed, h, onMounted, reactive, ref, watch } from "vue";
import { useDebounceFn } from '@vueuse/core';
import { DataTableColumn, DataTableColumns, DataTableSortState, NInput, PaginationInfo, SelectOption } from "naive-ui";
import { TableDismiss28Filled } from "@vicons/fluent";
import { useApi } from "@/composables/useApi";
import { ILogRow } from "@/types/ILogRow";
import { IUser } from "@/types/IUser";
import { PaginationProps } from "naive-ui/lib/pagination";
import { Mutable } from "@/types/Mutable";
import { ActionType } from "@/types/ActionType";
import { actions } from "@/formatters/actions";
import { format } from 'date-fns';
import { useStore } from "@/store/main";
import { IRequestLog } from "@/types/IRequestLog";
import { INodeModel } from "@/types/INodeModel";
import { RouterLink } from "vue-router";
import { NodeModel } from "@/models/NodeModel";
import { INode } from "@/types/INode";
import {
  Dismiss24Filled
} from "@vicons/fluent";
import router from "@/router";

const store = useStore();

const usersOptions = computed<SelectOption[]>(() => {
  return store.users.map(user => {
    return {
      value: user.id,
      label: `${user.lastName} ${user.firstName}`
    };
  });
});

const actionsOptions = Object.entries(actions).map(([ value, label ]) => {
  return {
    value,
    label
  };
});

const dateColumn: DataTableColumn = {
  title: 'Дата',
  key: 'createdAt',
  sorter: true,
  width: 150,
  render: (rowData, rowIndex) => {
    const date = rowData.createdAt as number;

    return format(date, 'dd.MM.yyyy HH:mm');
  }
};

const userColumn: DataTableColumn = {
  title: 'Пользователь',
  key: 'userId',
  sorter: true,
  width: 200,

  render: (rowData, rowIndex) => {
    const user = rowData.user as IUser;

    return `${user.firstName} ${user.lastName}`;
  }
};

const nodeColumn: DataTableColumn = {
  title: 'Файл/папка',
  key: 'nodeName',
  sorter: true,
  className: 'min-w-[12em]',

  render: (rowData, rowIndex) => {
    const data = rowData as unknown as ILogRow;

    if (data.node) {
      const node = new NodeModel(data.node as INode) as INodeModel;

      return h(RouterLink, {
        to: (() => {
          if (node.isFolder) {
            return {
              name: 'folder',
              params: {
                folderId: node.id,
              }
            };
          } else {
            return {
              name: 'file',
              params: {
                fileId: node.id,
              }
            };
          }
        })()
      }, () => node.getPath() + '/' + node.getFullName());
    }

    if (data.action === 'emptyTrash') {
      return h(RouterLink, {
        to: {
          name: 'trash',
        }
      }, () => 'Корзина');
    }
  }
};

const actionColumn: DataTableColumn = {
  title: 'Действие',
  key: 'action',
  sorter: true,
  width: 200,

  render: (rowData, rowIndex) => {
    const action = rowData.action as ActionType;

    return actions[action];
  }
};

const columns = reactive<Array<DataTableColumn>>([
  dateColumn,
  userColumn,
  actionColumn,
  nodeColumn,
]);

const pagination = reactive<Mutable<PaginationProps>>({
  page: 1,
  pageCount: 1,
  pageSize: 1,
  itemCount: 1
});

const filters = reactive({
  date: null as IRequestLog['date'],
  userId: null as IRequestLog['userId'],
  action: null as IRequestLog['actionType'],
  nodeName: ''
});

const sorting = reactive({
  orderBy: null as IRequestLog['orderBy'],
  orderDirection: null as IRequestLog['orderDirection'],
});

const data = ref<ILogRow[]>([]);

const loading = ref(true);

const api = useApi();

const load = async (page: number) => {
  loading.value = true;

  const response = await api.log({
    actionType: filters.action || null,
    date: filters.date || null,
    userId: filters.userId || null,
    nodeName: filters.nodeName || null,
    orderBy: sorting.orderBy || null,
    orderDirection: sorting.orderDirection || null,
    page: page,
    perPage: 15
  });

  const responseData = response.data.map(item => {
    item.key = item.id;

    return item;
  });

  loading.value = false;
  data.value = responseData;

  pagination.page = response.meta.current_page;
  pagination.pageSize = response.meta.per_page;
  pagination.itemCount = response.meta.total;
};

onMounted(async () => {
  await load(1);
});

const handlePageChange = (page: number) => {
  load(page);
};

const handleSorterChange = (sorter: DataTableSortState) => {
  console.log(sorter);

  sorting.orderBy = sorter.order && typeof sorter.columnKey === 'string' ? sorter.columnKey : null;
  sorting.orderDirection = sorter.order ? sorter.order === 'descend' ? 'desc' : 'asc' : null;

  load(1);
};

watch(
  () => filters,
  useDebounceFn(() => {
    load(1);
  }, 500),
  {
    deep: true
  }
);

const handleCloseLog = () => {
  router.push('/');
};

</script>

<style scoped>


</style>
