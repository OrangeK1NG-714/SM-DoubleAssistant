import type { IUserInfoVo, IUserLogin } from './types/login'
import { getEnvBaseUrl } from '@/utils'
import { http } from '@/utils/http'

const localhost = getEnvBaseUrl()

export interface ILoginForm {
  username: string
  password: string
}

export function login(loginForm: ILoginForm) {
  return http.post<IUserLogin>(`${localhost}/api/user/login`, loginForm)
}

export function getUserInfo(username: string, role: string) {
  return http.get<IUserInfoVo>(`${localhost}/api/user/detail`, { username, role }, undefined, { requireAuth: true })
}

export interface IRefreshTokenParams {
  refreshToken: string
}

export interface IRefreshTokenResult {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export function refreshToken(data: IRefreshTokenParams) {
  return http.post<IRefreshTokenResult>(`${localhost}/api/user/refreshToken`, data)
}
