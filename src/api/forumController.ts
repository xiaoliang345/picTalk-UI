// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** addComment POST /api/forum/comment */
export async function addCommentUsingPost(
  body: API.AddCommentDTO,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseComment_>('/api/forum/comment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** deleteComment POST /api/forum/comment/delete */
export async function deleteCommentUsingPost(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/forum/comment/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** createPost POST /api/forum/post */
export async function createPostUsingPost(
  body: API.CreatePostDTO,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePostVO_>('/api/forum/post', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** getPost GET /api/forum/post/${param0} */
export async function getPostUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getPostUsingGETParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params
  return request<API.BaseResponsePostVO_>(`/api/forum/post/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** likePost POST /api/forum/post/${param0}/like */
export async function likePostUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.likePostUsingPOSTParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params
  return request<API.BaseResponseBoolean_>(`/api/forum/post/${param0}/like`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** deletePost POST /api/forum/post/delete */
export async function deletePostUsingPost(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/forum/post/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** updatePost POST /api/forum/post/update */
export async function updatePostUsingPost(
  body: API.UpdatePostDTO,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePostVO_>('/api/forum/post/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** listPostsByPage GET /api/forum/posts */
export async function listPostsByPageUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listPostsByPageUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseIPagePostVO_>('/api/forum/posts', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** uploadPicture POST /api/forum/upload */
export async function uploadPictureUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.uploadPictureUsingPOSTParams,
  body: {},
  file?: File,
  options?: { [key: string]: any }
) {
  const formData = new FormData()

  if (file) {
    formData.append('file', file)
  }

  Object.keys(body).forEach((ele) => {
    const item = (body as any)[ele]

    if (item !== undefined && item !== null) {
      if (typeof item === 'object' && !(item instanceof File)) {
        if (item instanceof Array) {
          item.forEach((f) => formData.append(ele, f || ''))
        } else {
          formData.append(ele, JSON.stringify(item))
        }
      } else {
        formData.append(ele, item)
      }
    }
  })

  return request<API.BaseResponseMapStringString_>('/api/forum/upload', {
    method: 'POST',
    params: {
      ...params,
    },
    data: formData,
    requestType: 'form',
    ...(options || {}),
  })
}
