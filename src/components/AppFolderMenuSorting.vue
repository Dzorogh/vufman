<template>
  <n-button-group size="small">
    <n-popselect
      v-model:value="nodesStore.sorting"
      :options="sortingTypes"
    >
      <n-button>
        {{ currentSortingLabel }}
      </n-button>
    </n-popselect>

    <n-button @click="nodesStore.sortingDirection = nodesStore.sortingDirection === 'asc' ? 'desc' : 'asc'">
      <template #icon>
        <IconSortUp
          class="transition-transform"
          :style="{transform: nodesStore.sortingDirection === 'desc' ? 'rotate(-180deg)' : null}"
        />
      </template>
    </n-button>
  </n-button-group>
</template>

<script setup lang="ts">
import {
  ArrowSortUp16Filled as IconSortUp
} from "@vicons/fluent";

import { useNodesStore } from "@/store/nodes";
import { SortingType } from "@/types/SortingType";
import { computed } from "vue";

const nodesStore = useNodesStore();

const sortingTypes: {
  label: string;
  value: SortingType;
}[] = [
  { label: 'По названию', value: 'name' },
  { label: 'По типу', value: 'type' },
  { label: 'По размеру', value: 'size' },
  { label: 'По дате создания', value: 'create' },
  { label: 'По дате изменения', value: 'update' },
];

const currentSortingLabel = computed(() => {
  const sortingType = sortingTypes.find(item => item.value === nodesStore.sorting);

  return sortingType?.label;
});

</script>

<style scoped>

</style>
