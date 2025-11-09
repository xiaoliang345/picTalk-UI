import { addCommentUsingPost, getPostUsingGet } from '@/api/forumController'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePostStore = defineStore('post', () => {
  const postVO = ref<API.PostVO>({})
  //添加评论
  async function setComment(comment: API.AddCommentDTO) {
    const res = await addCommentUsingPost(comment)
    return res
  }

  async function getPostById(postId: number) {
    const res = await getPostUsingGet({ id: postId })
    if (res.data?.code == 200) {
      postVO.value = res.data.data || ({} as API.PostVO)
    }
  }
  return { setComment, getPostById, postVO }
})
