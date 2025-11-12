<template>
  <a-config-provider :locale="locale" :theme="theme">
    <div id="app">
      <router-view />
    </div>
  </a-config-provider>
</template>
<script setup lang="ts">
import { useUserStore } from './stores/userStore'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { onMounted, ref } from 'vue'
import { usePublicStore } from '@/stores/publicStore.ts'

const locale = zhCN
const userStore = useUserStore()
const publicStore = usePublicStore()
//主题配置
const theme = ref({
  token: {
    // colorPrimary:'#00b96b',
  }
  // algorithm: 'dark' // 或 'dark'
});
onMounted(async () => {
  await userStore.getLoginUser()
  await publicStore.getTagAndCategory()
  await userStore.getUserSpaceList()
  await userStore.listMyTeamSpace()
})
</script>
<style scoped></style>
