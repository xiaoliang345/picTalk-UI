<template>
  <a-menu v-model:selectedKeys="selectedKeys" mode="inline" class="menu" :items="items" @click="doMenuClick" />
</template>
<script lang="ts" setup>
import { h, onMounted, reactive, ref, watch } from 'vue'
import router from '@/router'
import { useUserStore } from '@/stores/userStore.ts'
import { usePublicStore } from '@/stores/publicStore.ts'
import { Icon } from '@iconify/vue'

const userStore = useUserStore()
const publicStore = usePublicStore()
const selectedKeys = ref([])
const items = ref([
  {
    key: '/user/mySpace',
    icon: () => h(Icon, {
      icon: "fluent-color:person-48",
      width: 22
    }),
    label: '个人空间',
    title: '个人空间'
  },
  {
    key: '/user/addSpace',
    icon: () => h(Icon, {
      icon: "fluent-color:people-team-16",
      width: 22
    }),
    label: '创建团队',
    title: '创建团队'
  }
])

// 路由跳转事件
function doMenuClick({ key }) {
  router.push(key)
}

const toggleCollapsed = () => {
  state.collapsed = !state.collapsed
  state.openKeys = state.collapsed ? [] : state.preOpenKeys
}

//监听路由变化激活对应菜单
watch(
  () => publicStore.path,
  (newValue: any) => {
    selectedKeys.value = [newValue]
  },
  { immediate: true }
)

let obj = reactive({
  type: "group",
  label: '我的团队',
  title: '我的团队',
  children: []
})

onMounted(() => {
  items.value.push(obj)
})

watch(() => userStore.userSpacePublicList, () => {
  obj.children = []
  userStore.userSpacePublicList?.forEach((item: API.SpaceUserVO) => {
    let child = {
      key: `/user/teamSpace?id=${item.spaceId}`,
      label: item.space?.spaceName,
      title: item.space?.spaceName
    }
    obj.children.push(child)
  })
}, { deep: true, immediate: true })
</script>
<style scoped lang="less">
.menu {
  margin-top: 10px; //TODO移动端48px
}

@media screen and (max-width: 500px) {
  .menu {
    margin-top: 0px;
  }
}
</style>
