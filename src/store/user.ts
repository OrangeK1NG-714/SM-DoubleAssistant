import type { IUserInfoVo } from '@/api/types/login'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  clearAuthTokens,
  persistAuthTokens,
  getValidAccessToken as readValidAccessToken,
  shouldRefreshAccessToken,
} from '@/adapters/auth/uni-auth-session'

// 初始化状态
const userInfoState: IUserInfoVo = {
  username: '',
  role: '',
  token: '',
  activityId: '',
  maxSelectNum: 0,
  name: '',
}

export const useUserStore = defineStore(
  'user',
  () => {
    // 定义用户信息
    const userInfo = ref<IUserInfoVo>({ ...userInfoState })

    /**
     * 设置展示身份。Token 只允许由 auth session adapter 持久化。
     * @param username - 用户名
     * @param role - 用户角色
     * @param _token - 旧调用签名占位，不再保存
     */
    const setUserInfo = (username: string, role: string, _token?: string, name?: string) => {
      userInfo.value = {
        ...userInfo.value,
        username,
        role,
        token: '',
        name: name || userInfo.value.name || '',
      }
    }

    /**
     * 设置双token（新版本推荐）
     * @param accessToken - 访问令牌
     * @param refreshToken - 刷新令牌
     * @param expiresIn - 过期时间（秒）
     */
    const setTokens = (accessToken: string, refreshToken: string, expiresIn?: number) => {
      persistAuthTokens(accessToken, refreshToken, expiresIn)
    }

    /**
     * 获取有效的访问令牌
     * @returns 有效的accessToken，如果过期返回null
     */
    const getValidAccessToken = (): string | null => {
      return readValidAccessToken()
    }

    /**
     * 检查token是否即将过期
     * @returns 是否即将过期（5分钟内）
     */
    const isTokenExpiringSoon = (): boolean => {
      return shouldRefreshAccessToken()
    }

    const setActivityId = (activityId: string) => {
      userInfo.value.activityId = activityId
    }

    /**
     * 清除用户信息（登出时使用）
     */
    const clearUserInfo = () => {
      userInfo.value = { ...userInfoState }
      clearAuthTokens()
    }

    return {
      userInfo,
      setActivityId,
      setUserInfo,
      setTokens,
      getValidAccessToken,
      isTokenExpiringSoon,
      clearUserInfo,
    }
  },
  {
    persist: {
      paths: [
        'userInfo.username',
        'userInfo.role',
        'userInfo.activityId',
        'userInfo.maxSelectNum',
        'userInfo.name',
      ],
      afterRestore: ({ store }) => {
        // 第一次升级时清掉旧 Pinia 快照中的 token/tokens，并立即按白名单重写。
        store.userInfo.token = ''
        delete (store.$state as Record<string, unknown>).tokens
        store.$persist()
      },
    },
  },
)
