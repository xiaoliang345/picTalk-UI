// @ts-ignore
/* eslint-disable */
import { uploadRequest } from '@/request'

/** getDownloadUrl POST /api/files/download-url */
export async function getDownloadUrlUsingPost(
  body: API.UploadVO,
  options?: { [key: string]: any },
) {
  return uploadRequest<string>('/api/files/download-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** listFiles GET /api/files/list/${param0} */
export async function listFilesUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listFilesUsingGETParams,
  options?: { [key: string]: any },
) {
  const { code: param0, ...queryParams } = params
  console.log(param0)

  return uploadRequest<string[]>(`/api/files/list/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** uploadFile POST /api/files/upload */
export async function uploadFileUsingPost(body: {}, file?: File, options?: { [key: string]: any }) {
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
          formData.append(ele, new Blob([JSON.stringify(item)], { type: 'application/json' }))
        }
      } else {
        formData.append(ele, item)
      }
    }
  })

  return uploadRequest<API.UploadVO>('/api/files/upload', {
    method: 'POST',
    data: formData,
    requestType: 'form',
    ...(options || {}),
  })
}

/** getUploadProgress GET /api/files/upload/progress/${param0} */
export async function getUploadProgressUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getUploadProgressUsingGETParams,
  options?: { [key: string]: any },
) {
  const { authCode: param0, ...queryParams } = params
  return uploadRequest<Record<string, any>>(`/api/files/upload/progress/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}
