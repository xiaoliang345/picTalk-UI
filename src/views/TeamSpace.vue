<template>
  <div id="teamSpace">
    <SpacePage/>
  </div>
</template>
<script setup lang="ts">
import SpacePage from '@/components/SpacePage.vue'

/*import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore.ts'

const SPACE_SHOW_TYPE = {
  form: 0,
  table: 1
}
const userStore = useUserStore();
const route = useRoute()
let showType = ref(SPACE_SHOW_TYPE.form)//如果当前用户没有空间则展示表单，否则展示表格

onMounted(() => {
  // 如果当前用户没有空间，则展示表单
  if (!userStore.privateSpaceId) showType.value = SPACE_SHOW_TYPE.form;
  else showType.value = SPACE_SHOW_TYPE.table;
})*/

</script>
<style scoped lang="less">
/* #addPictures {
  @media screen and (max-width: 400px) {
    .pictureForm input {
      width: 183px;
    }
  }
} */
</style>
