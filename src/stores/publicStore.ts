import { defineStore } from 'pinia'
import { ref } from 'vue'
import { listPictureTagCategoryUsingGet } from '@/api/pictureController.ts'

export const usePublicStore = defineStore('public', () => {
  let tagOptions = ref() //标签选项
  let tagMap = ref([]) //标签选项
  let categoryMap = ref([]) //分类选项
  let categoryIcon = ref() //分类图标
  const path = ref('/') //当前路径
  let isMobile = ref(false) //是否移动端
  let isFold = ref(true) //是否折叠

  // 获取标签分类选项
  async function getTagAndCategory() {
    const res = await listPictureTagCategoryUsingGet()
    if (res.data.code == 200) {
      /* tagMap.value = (res.data.data?.tagList ?? []).map((item) => {
        return { label: item, value: item }
      }) */
      new Map(Object.entries(res.data.data?.tagMap) ?? {}).forEach((item, key) => {
        tagMap.value.push({ label: key, value: key, color: item })
      })
      new Map(Object.entries(res.data.data?.categoryMap) ?? {}).forEach((item, key) => {
        categoryMap.value.push({ label: key, value: key, icon: item })
      })
    }
  }

  return { tagMap, path, categoryMap, getTagAndCategory, isMobile, isFold }
})
