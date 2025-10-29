// 审核
export const PIC_REVIEW_STATUS_ENUM = {
  REVIEWING: 0,
  PASS: 1,
  REJECT: 2,
}

export const PIC_REVIEW_STATUS_MAP = {
  0: '待审核',
  1: '通过',
  2: '拒绝',
}

export const PIC_REVIEW_STATUS_OPTIONS = Object.keys(PIC_REVIEW_STATUS_MAP).map((key) => {
  return {
    label: PIC_REVIEW_STATUS_MAP[key],
    value: key,
  }
})

// 空间等级
export const SPACE_STATUS_ENUM = {
  COMMON: 0,
  VIP: 1,
  SVIP: 2,
}

export const SPACE_STATUS_MAP = {
  0: '普通',
  1: '标准',
  2: '旗舰',
}

export const SPACE_STATUS_OPTIONS = Object.keys(SPACE_STATUS_MAP).map((key) => {
  return {
    label: SPACE_STATUS_MAP[key],
    value: key,
  }
})

//空间类型
export const SPACE_TYPE_ENUM = {
  PRIVATE: 0,
  TEAM: 1,
}

export const SPACE_TYPE_MAP = {
  0: '私有',
  1: '团队',
}

// 空间用户角色
export const SPACE_USER_ROLE_MAP = {
  viewer: '浏览者',
  editor: '编辑者',
  admin: '管理员',
}

export const SPACE_USER_ROLE_OPTIONS = Object.keys(SPACE_USER_ROLE_MAP).map((key) => {
  return {
    label: SPACE_USER_ROLE_MAP[key],
    value: key,
  }
})

//系统角色
export const SYSTEM_USER_ROLE_MAP = {
  user: '用户',
  admin: '管理员',
}
export const SYSTEM_USER_ROLE_OPTIONS = Object.keys(SYSTEM_USER_ROLE_MAP).map((key) => {
  return {
    label: SYSTEM_USER_ROLE_MAP[key],
    value: key,
  }
})

//标签颜色
export const TAG_COLOR_MAP: Record<string, string> = {
  治愈: 'success',
  高清: 'processing',
  可爱: 'magenta',
  性感: 'red',
  风景: 'orange',
  动漫: 'geekblue',
}
