import { defineStore } from 'pinia'
import { ref } from 'vue'
import { listPictureTagCategoryUsingGet } from '@/api/pictureController.ts'

export const usePublicStore = defineStore('public', () => {
  let tagOptions = ref() //标签选项
  let categoryOptions = ref() //分类选项
  const path = ref('/') //当前路径
  let isMobile = ref(false) //是否移动端
  let isFold = ref(true) //是否折叠

  // 获取标签分类选项
  async function getTagAndCategory() {
    const res = await listPictureTagCategoryUsingGet()
    if (res.data.code == 200) {
      tagOptions.value = (res.data.data?.tagList ?? []).map((item) => {
        return { label: item, value: item }
      })
      categoryOptions.value = (res.data.data?.categoryList ?? []).map((item) => {
        return { label: item, value: item }
      })
    }
  }

  return { tagOptions, path, categoryOptions, getTagAndCategory, isMobile, isFold }
})
