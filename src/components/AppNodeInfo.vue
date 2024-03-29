<template>
  <div class="flex flex-col gap-3">
    <AppNodeInfoItem
      v-for="(item, index) in items"
      v-show="item.show ? item.show() : true"
      :key="index"
      :title="item.title"
      :content="item.content"
      :description="item.description"
      :html="item.html"
    />

    <div>
      <n-button
        v-if="!node.isTrashed"
        @click="showEditComment = true"
      >
        Изменить комментарий
      </n-button>

      <n-modal
        v-model:show="showEditComment"
        class="custom-card"
        preset="card"
        style="width: 800px"
        title="Комментарий"
        :bordered="false"
        size="huge"
      >
        <template v-if="!showCommentEditor">
          <div
            v-if="newComment"
            v-html="linkifyHtml(newComment.replace('\n', '<br>'), {target: '_blank'})"
          />
          <div
            v-else
            class="opacity-50"
          >
            Комментарий не указан
          </div>
        </template>

        <div v-else>
          <n-input
            v-model:value="newComment"
            type="textarea"
            placeholder="Комментарий"
            :autosize="{
              minRows: 3
            }"
          />
        </div>

        <template #footer>
          <div class="flex gap-4">
            <n-button
              v-if="!showCommentEditor"
              @click="showCommentEditor = true"
            >
              Редактировать
            </n-button>
            <n-button
              v-else
              @click="showCommentEditor = false"
            >
              Предпросмотр
            </n-button>
            <n-button
              :loading="saving"
              @click="saveComment"
            >
              Сохранить
            </n-button>
            <n-button @click="showEditComment = false">
              Закрыть
            </n-button>
          </div>
        </template>
      </n-modal>
    </div>

    <AppNodeInfoAccess
      v-if="store.currentUser && store.currentUser.isAdmin"
      :node="node"
    />
  </div>
</template>

<script setup lang="ts">
// libs
import linkifyHtml from 'linkify-html';
import { computed, ref } from "vue";

// app
import { useNodesActions } from "@/composables/useNodesActions";
import { useStore } from "@/store/main";

// types
import { INodeModel } from "@/types/INodeModel";

// components
import AppNodeInfoItem from "@/components/AppNodeInfoItem.vue";
import AppNodeInfoAccess from "@/components/AppNodeInfoAccess.vue";

const nodesActions = useNodesActions();
const store = useStore();

const props = defineProps<{
  node: INodeModel;
}>();

const saving = ref(false);

const showCommentEditor = ref(false);
const showEditComment = ref(false);
const newComment = ref(props.node.comment);
const saveComment = async () => {
  saving.value = true;
  await nodesActions.saveComment(props.node, newComment.value || '');
  showEditComment.value = false;
  saving.value = false;
};

const items = computed<{
  title: string;
  content: string;
  description?: string;
  html?: boolean;
  show?: () => boolean;
}[]>(() => {
  return [
    {
      title: props.node.isFolder ? 'Текущая папка' : 'Название файла',
      content: props.node.name as string,
    },
    {
      title: 'Расширение файла',
      content: props.node.extension || '(нет)',
      show: () => !props.node.isFolder
    },
    {
      title: 'Тип данных',
      content: props.node.mimetype || 'Неизвестно',
      show: () => !props.node.isFolder
    },
    {
      title: 'Путь',
      content: props.node.getPath()
    },
    {
      title: 'Размер',
      content: props.node.size ? props.node.getSize() : '0 B',
      description: props.node.size && props.node.size >= 1000 ? `${props.node.size} B` : '',
      show: () => !props.node.isFolder
    },
    {
      title: 'Дата создания',
      content: props.node.getCreatedAt()
    },
    {
      title: 'Дата изменения',
      content: props.node.getUpdatedAt()
    },
    {
      title: 'Дата удаления в корзину',
      content: props.node.getTrashedAt(),
      show: () => !!props.node.trashedAt
    },
    {
      title: 'Дата полного удаления',
      content: props.node.getDeletedAt(),
      show: () => !!props.node.deletedAt
    },
    {
      title: 'Создал',
      content: props.node.author ? props.node.author.fullName : 'Неизвестно'
    },
    {
      title: 'Комментарий',
      html: true,
      content: newComment.value ? linkifyHtml(newComment.value.replaceAll('\n', '<br>')) : '—'
    },
  ];
});

</script>

<style scoped>

</style>
