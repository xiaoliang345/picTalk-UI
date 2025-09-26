<template>
  <AddSpace v-if="showType == 0" spaceType="private" />
  <SpacePage v-else />
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useUserStore } from '@/stores/userStore.ts'
import AddSpace from '@/components/AddSpace.vue'
import SpacePage from '@/components/SpacePage.vue'

const SPACE_SHOW_TYPE = {
  form: 0,
  table: 1
}
const userStore = useUserStore();
let showType = ref(SPACE_SHOW_TYPE.form)//如果当前用户没有空间则展示表单，否则展示表格

watch(() => userStore.privateSpaceId, (newValue) => {
  if (!newValue) showType.value = SPACE_SHOW_TYPE.form;
  else showType.value = SPACE_SHOW_TYPE.table;
}, { immediate: true })

</script>
<style scoped lang="less">
#addPictures {
  @media screen and (max-width: 400px) {
    .pictureForm input {
      width: 183px;
    }
  }
}
</style>
