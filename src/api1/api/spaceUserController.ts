// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** acceptInvite POST /api/spaceUser/acceptInvite/${param0} */
export async function acceptInviteUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.acceptInviteUsingPOSTParams,
  options?: { [key: string]: any }
) {
  const { inviteCode: param0, ...queryParams } = params
  return request<API.BaseResponseBoolean_>(`/api/spaceUser/acceptInvite/${param0}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** addSpaceUser POST /api/spaceUser/add */
export async function addSpaceUserUsingPost(
  body: API.SpaceUserAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong_>('/api/spaceUser/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** deleteSpaceUser POST /api/spaceUser/delete */
export async function deleteSpaceUserUsingPost(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/spaceUser/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** editSpaceUser POST /api/spaceUser/edit */
export async function editSpaceUserUsingPost(
  body: API.SpaceUserEditRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/spaceUser/edit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** getSpaceUser POST /api/spaceUser/get */
export async function getSpaceUserUsingPost(
  body: API.SpaceUserQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseSpaceUser_>('/api/spaceUser/get', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** getInviteInfo POST /api/spaceUser/inviteInfo/${param0} */
export async function getInviteInfoUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getInviteInfoUsingPOSTParams,
  options?: { [key: string]: any }
) {
  const { inviteCode: param0, ...queryParams } = params
  return request<API.BaseResponseIniteInfoVO_>(`/api/spaceUser/inviteInfo/${param0}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** createIniteLink POST /api/spaceUser/link/${param0} */
export async function createIniteLinkUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.createIniteLinkUsingPOSTParams,
  options?: { [key: string]: any }
) {
  const { spaceId: param0, ...queryParams } = params
  return request<API.BaseResponseString_>(`/api/spaceUser/link/${param0}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** listSpaceUser POST /api/spaceUser/list */
export async function listSpaceUserUsingPost(
  body: API.SpaceUserQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListSpaceUserVO_>('/api/spaceUser/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** listMyTeamSpace POST /api/spaceUser/list/my */
export async function listMyTeamSpaceUsingPost(options?: { [key: string]: any }) {
  return request<API.BaseResponseListSpaceUserVO_>('/api/spaceUser/list/my', {
    method: 'POST',
    ...(options || {}),
  })
}
