<template>
  <n-config-provider
    :theme-overrides="themeOverrides"
    class="h-full"
  >
    <n-loading-bar-provider>
      <n-notification-provider>
        <n-message-provider>
          <n-loading-bar-provider>
            <router-view />
            <DialogConfirm />
            <DialogPrompt />
          </n-loading-bar-provider>
        </n-message-provider>
      </n-notification-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>


<script setup lang="ts">
import DialogConfirm from "./components/DialogConfirm.vue";
import DialogPrompt from "@/components/DialogPrompt.vue";
// import { GlobalThemeOverrides } from "naive-ui";
import themeOverrides from "./naive-ui-theme-overrides.json";

// const themeOverrides: GlobalThemeOverrides = {
//   "common": {
//     "primaryColor": "#2a86daFF",
//     "primaryColorHover": "#50A2EDFF",
//     "primaryColorPressed": "#1D72C1FF",
//     "primaryColorSuppl": "#165691FF"
//   }
// };

</script>
