import type { IUserInfoVo } from '@/api/types/login'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getUserInfo as _getUserInfo,
  login as _login,
  logout as _logout,
  wxLogin as _wxLogin,
  getWxCode,
} from '@/api/login'
import { toast } from '@/utils/toast'

// 初始化状态
const userInfoState: IUserInfoVo = {
  username: '',
  role: '',
  token: '',
}

export const useUserStore = defineStore(
  'user',
  () => {
    // 定义用户信息
    const userInfo = ref<IUserInfoVo>({ ...userInfoState })

    /**
     * 设置用户信息
     * @param username - 用户名
     * @param role - 用户角色
     * @param token - 认证token
     */
    const setUserInfo = (username: string, role: string, token: string) => {
      userInfo.value = {
        username,
        role,
        token,
      }
    }
    const getUserInfo = () => {

    }
    /**
     * 清除用户信息（登出时使用）
     */
    const clearUserInfo = () => {
      userInfo.value = { ...userInfoState }
    }
    return {
      userInfo,
      setUserInfo,
      clearUserInfo,
    }
  },
  {
    persist: true,
  },
)
