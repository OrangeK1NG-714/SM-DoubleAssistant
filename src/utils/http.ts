import type { CustomRequestOptions } from '@/interceptors/request'
import {
  clearAuthTokens,
  getStoredRefreshToken,
  getValidAccessToken,
  persistAuthTokens,
  shouldRefreshAccessToken,
} from '@/adapters/auth/uni-auth-session'
import { getEnvBaseUrl } from '@/utils'

const localhost = getEnvBaseUrl()
/**
 * 刷新token返回结果
 */
interface IRefreshTokenResult {
  code: number
  data: {
    accessToken: string
    refreshToken: string
    expiresIn: number
  }
  msg: string
}

let refreshPromise: Promise<string | null> | null = null

/**
 * 执行实际请求
 */
function executeRequest<T>(options: CustomRequestOptions): Promise<IResData<T>> {
  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      dataType: 'json',
      // #ifndef MP-WEIXIN
      responseType: options.responseType || 'json',
      // #endif
      success(res) {
        // 状态码 2xx
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as IResData<T>)
        }
        else if (res.statusCode === 401) {
          // 401错误 -> 清理用户信息，跳转到登录页
          clearAuthTokens()
          uni.redirectTo({ url: '/pages/login/login' })
          reject(new Error('登录已过期，请重新登录'))
        }
        else {
          // 其他错误 -> 根据后端错误信息轻提示
          if (!options.hideErrorToast) {
            uni.showToast({
              icon: 'none',
              title: (res.data as IResData<T>).msg || '请求错误',
            })
          }
          reject(res)
        }
      },
      fail(err) {
        uni.showToast({
          icon: 'none',
          title: '网络错误，换个网络试试',
        })
        reject(err)
      },
    })
  })
}

/**
 * 刷新accessToken
 */
async function doRefreshToken(): Promise<string | null> {
  const refreshToken = getStoredRefreshToken()

  if (!refreshToken) {
    return null
  }

  try {
    const res = await uni.request({
      url: `${localhost}/api/user/refreshToken`,
      method: 'POST',
      data: { refreshToken },
      dataType: 'json',
    })

    if (res.statusCode === 200 && (res.data as IRefreshTokenResult).code === 200) {
      const { accessToken, refreshToken: newRefreshToken, expiresIn } = (res.data as IRefreshTokenResult).data

      persistAuthTokens(accessToken, newRefreshToken, expiresIn)

      return accessToken
    }
    else {
      // 刷新失败，清除所有token
      clearAuthTokens()
      return null
    }
  }
  catch (error) {
    clearAuthTokens()
    return null
  }
}

function refreshAccessTokenOnce(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = doRefreshToken().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

/**
 * 为普通请求和 uploadFile 提供同一认证/刷新边界，避免页面直接读取 token。
 */
export async function getAuthorizedAccessToken(): Promise<string> {
  const accessToken = getValidAccessToken()
  if (accessToken) {
    if (shouldRefreshAccessToken()) {
      void refreshAccessTokenOnce()
    }
    return accessToken
  }

  if (!getStoredRefreshToken()) {
    uni.redirectTo({ url: '/pages/login/login' })
    throw new Error('未登录，请先登录')
  }

  const refreshedToken = await refreshAccessTokenOnce()
  if (!refreshedToken) {
    uni.redirectTo({ url: '/pages/login/login' })
    throw new Error('登录已过期，请重新登录')
  }
  return refreshedToken
}

export async function http<T>(options: CustomRequestOptions): Promise<IResData<T>> {
  if (options.requireAuth) {
    const accessToken = await getAuthorizedAccessToken()
    options.header = {
      ...options.header,
      Authorization: `Bearer ${accessToken}`,
    }
  }
  return executeRequest<T>(options)
}

/**
 * GET 请求
 * @param url 后台地址
 * @param query 请求query参数
 * @param header 请求头，默认为json格式
 * @returns
 */
export function httpGet<T>(url: string, query?: Record<string, any>, header?: Record<string, any>, options?: Partial<CustomRequestOptions>) {
  return http<T>({
    url,
    query,
    method: 'GET',
    header,
    ...options,
  })
}

/**
 * POST 请求
 * @param url 后台地址
 * @param data 请求body参数
 * @param query 请求query参数，post请求也支持query，很多微信接口都需要
 * @param header 请求头，默认为json格式
 * @returns
 */
export function httpPost<T>(url: string, data?: Record<string, any>, query?: Record<string, any>, header?: Record<string, any>, options?: Partial<CustomRequestOptions>) {
  return http<T>({
    url,
    query,
    data,
    method: 'POST',
    header,
    ...options,
  })
}

/**
 * PUT 请求
 */
export function httpPut<T>(url: string, data?: Record<string, any>, query?: Record<string, any>, header?: Record<string, any>, options?: Partial<CustomRequestOptions>) {
  return http<T>({
    url,
    data,
    query,
    method: 'PUT',
    header,
    ...options,
  })
}

/**
 * DELETE 请求（无请求体，仅 query）
 */
export function httpDelete<T>(url: string, query?: Record<string, any>, header?: Record<string, any>, options?: Partial<CustomRequestOptions>) {
  return http<T>({
    url,
    query,
    method: 'DELETE',
    header,
    ...options,
  })
}

http.get = httpGet
http.post = httpPost
http.put = httpPut
http.delete = httpDelete
