import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getLoginUserUsingGet } from '@/api/userController.ts'
import { getSpaceVoByIdUsingGet, listSpaceVoByPageUsingPost } from '@/api/spaceController.ts'
import { getSpaceUserUsingPost, listMyTeamSpaceUsingPost } from '@/api/spaceUserController.ts'

export const useUserStore = defineStore('user', () => {
  const user = ref<API.LoginUserVO>({
    userName: '未登录',
  })

  const showSpaceId = ref() //当前显示的空间id
  const privateSpaceId = ref() //个人空间id常量
  const userSpacePrivate = ref<API.PageSpaceVO_>() //私人空间
  const userSpacePublicList = ref<API.SpaceUserVO[]>([]) //我加入的团队空间
  const userSpaceInfo = ref<API.SpaceUser>() //用户空间信息

  // 获取我加入的团队空间
  async function listMyTeamSpace() {
    if (user.value.id) {
      const res = await listMyTeamSpaceUsingPost()
      if (res.data.code == 200) {
        userSpacePublicList.value =
          res.data.data.filter((item) => {
            if (item.space.spaceType == 1) return item
          }) || []
      }
    }
  }

  // 获取某个空间信息
  async function getSpaceUser() {
    if (user.value.id) {
      const res = await getSpaceUserUsingPost({ spaceId: showSpaceId.value, userId: user.value.id })
      if (res.data.code == 200) {
        userSpaceInfo.value = res.data.data ?? {}
      }
    }
  }

  // 获取用户的空间列表
  async function getUserSpaceList() {
    if (user.value.id) {
      const res = await listSpaceVoByPageUsingPost({ userId: user.value.id })
      if (res.data.code == 200) {
        userSpacePrivate.value = res.data.data ?? {}
        privateSpaceId.value = userSpacePrivate.value?.records?.find(
          (item) => item.spaceType == 0,
        )?.id
        showSpaceId.value = privateSpaceId.value
      }
    }
  }

  // 获取登录用户信息
  async function getLoginUser() {
    await getLoginUserUsingGet().then((res) => {
      if (res.data.code == 200 && res.data.data) {
        user.value = res.data.data
      }
    })
  }

  function setLoginUser(newUser: API.LoginUserVO) {
    user.value = newUser
  }

  return {
    setLoginUser,
    user,
    userSpacePrivate,
    showSpaceId,
    privateSpaceId,
    userSpacePublicList,
    userSpaceInfo,
    getSpaceUser,
    listMyTeamSpace,
    getLoginUser,
    getUserSpaceList,
  }
})
