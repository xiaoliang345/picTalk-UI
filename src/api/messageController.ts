// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** getAllMessages GET /api/messages */
export async function getAllMessagesUsingGet(options?: { [key: string]: any }) {
  return request<API.Message[]>('/api/messages', {
    method: 'GET',
    ...(options || {}),
  })
}

/** addMessage POST /api/messages */
export async function addMessageUsingPost(body: API.Message, options?: { [key: string]: any }) {
  return request<boolean>('/api/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** deleteMessage DELETE /api/messages/${param0} */
export async function deleteMessageUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteMessageUsingDELETEParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params
  return request<boolean>(`/api/messages/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  })
}
