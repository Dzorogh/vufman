<template>
  <div
    class="h-full min-h-full relative"
    @dragenter="handleDragEnter"
    @dragover="handleDragOver"
    @drop="handleDrop"
  >
    <n-upload
      v-model:file-list="fileList"
      :abstract="true"
      :multiple="true"
      :custom-request="uploadRequest"
      :show-remove-button="false"
      :show-cancel-button="false"
      @finish="handleUploadFinished"
    >
      <div
        class="border border-slate-200 lg:grid flex flex-col grid-cols-5 grow h-full min-h-full overflow-hidden rounded"
      >
        <AppSidebar
          class="col-span-1 grow shrink-0 bg-slate-200"
          :file-list="fileList"
        />

        <router-view :key="$route.fullPath" />
      </div>
    </n-upload>

    <n-upload
      v-show="showDropArea"
      v-model:file-list="fileList"
      :multiple="true"
      :custom-request="uploadRequest"
      :show-remove-button="false"
      :show-cancel-button="false"
      @finish="handleUploadFinished"
    >
      <n-upload-dragger
        class="absolute right-6 bottom-6 left-6 top-6 w-auto flex items-center justify-center"
        @dragleave="handleDragLeave"
        @dragover="handleDragOver"
        @drop="handleDrop"
        @click="handleDragLeave"
        @mouseover="handleDragLeave"
        @mouseleave="handleDragLeave"
      >
        Перетащите файлы, чтобы загрузить
      </n-upload-dragger>
    </n-upload>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import { UploadCustomRequestOptions, UploadFileInfo } from "naive-ui";
import { useApi } from "@/composables/useApi";
import AppSidebar from "@/components/AppSidebar.vue";
import { useStore } from "@/store/main";
import { useNodesStore } from "@/store/nodes";
import { useMessages } from "@/composables/useMessages";

const store = useStore();
const nodesStore = useNodesStore();
const messages = useMessages();

const fileList = ref<UploadFileInfo[]>([]);
const showDropArea = ref(false);

const api = useApi();

const handleDragEnter = (e: DragEvent) => {
  // e.preventDefault();
  // console.log('dragEnter', e);
  showDropArea.value = true;
};

const handleDragOver = (e: DragEvent) => {
  // e.preventDefault();
  // console.log('dragOver', e);
  showDropArea.value = true;
};

const handleDragLeave = async (e: DragEvent) => {
  // e.preventDefault();
  // console.log('dragLeave', e);
  showDropArea.value = false;
};

const handleDrop = async (e: DragEvent) => {
  e.preventDefault();
  // console.log('drop', e);
  showDropArea.value = false;
};

onMounted(async () => {
  store.currentUser = await api.currentUser();

  if (store.currentUser.isAdmin) {
    store.users = await api.users();
    store.roles = await api.roles();
  }
});

const uploadRequest = async (options: UploadCustomRequestOptions) => {
  const newFile = await api.upload({
    ...options,
    data: {
      ...options.data,
      folderId: nodesStore.currentFolder ? nodesStore.currentFolder.id as string || '' : '',
    },
  });

  if (newFile) {
    messages.uploadSuccess();
    nodesStore.nodes.push(newFile);
  } else {
    messages.uploadFailed();
  }
};

const handleUploadFinished = () => {

  console.log('handleUploadFinished', fileList.value);

  nextTick(() => {
    fileList.value = fileList.value.filter(item => {
      return item.status !== 'finished';
    });
  });
};

</script>

<style scoped>
::v-deep(.n-pagination) {
  @apply overflow-auto;
}
</style>
