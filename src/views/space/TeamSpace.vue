<template>
  <div id="teamSpace">
    <SpacePage @refresh="handleRefresh" :key="refreshKey" :spaceType="1" :spaceId="spaceId" />
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import SpacePage from "./SpacePage.vue"
import { useRoute } from "vue-router";

let refreshKey = ref(0)
let route = useRoute();
let spaceId = ref(route.query.id)
//改变刷新标识
function handleRefresh() {
  console.log("father");
  refreshKey.value = refreshKey.value + 1
}

watch(() => route.query.id, () => {
  spaceId.value = route.query.id
})
</script>
<style scoped lang="less"></style>
