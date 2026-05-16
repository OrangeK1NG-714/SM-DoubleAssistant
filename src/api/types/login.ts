export interface IUserInfoVo {
  username: string
  role: string
  token: string
  activityId?: string
  maxSelectNum?: number
  name?: string
}

export interface IUserLogin {
  id: string
  username: string
  role: string
  accessToken: string
  refreshToken: string
  expiresIn?: number
}
