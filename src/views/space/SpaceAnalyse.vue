<template>
  <div id="spaceAnalyse">
    <div class="space-header">
      <h1 class="space-title">
        <span class="space-name">{{ space?.spaceName }}</span>
        <span class="space-id">ID: {{ space?.id }}</span>
      </h1>
    </div>
    <SpaceStatistics :space="space" />
  </div>
</template>

<script setup lang="ts">
import { getSpaceVoByIdUsingGet } from '@/api/spaceController';
import { useUserStore } from '@/stores/userStore';
import { onMounted, ref } from 'vue';
import SpaceStatistics from "./SpaceStatistics.vue";

const userStore = useUserStore();
let space = ref<API.SpaceVO>({}) //当前空间信息
// 根据id获取空间
async function getSpaceById() {
  const res = await getSpaceVoByIdUsingGet({ id: userStore.showSpaceId })
  if (res.data.code == 200) {
    space.value = res.data.data ?? {}
  }
}
onMounted(async () => {
  await getSpaceById()
});
</script>

<style scoped lang="less">
#spaceAnalyse {

  .space-header {
    margin-bottom: 24px;
    padding: 16px 24px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .space-title {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;

      .space-name {
        font-size: 24px;
        font-weight: 600;
        color: #1f1f1f;
      }

      .space-id {
        font-size: 14px;
        color: #666;
        background: #f5f5f5;
        padding: 4px 8px;
        border-radius: 4px;
      }
    }
  }
}
</style>
