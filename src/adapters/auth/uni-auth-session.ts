import { DEFAULT_TOKEN_EXPIRY_MS, TOKEN_EXPIRY_BUFFER_MS } from '@/constants/config'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: number
}

const STORAGE_KEYS = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  accessTokenExpiresAt: 'accessTokenExpiresAt',
  legacyToken: 'token',
} as const

function normalizeToken(value: unknown): string {
  if (typeof value !== 'string' || value === 'null' || value === 'undefined')
    return ''
  return value
}

export function readAuthTokens(): AuthTokens {
  const expiresAt = Number(uni.getStorageSync(STORAGE_KEYS.accessTokenExpiresAt))
  return {
    accessToken: normalizeToken(uni.getStorageSync(STORAGE_KEYS.accessToken)),
    refreshToken: normalizeToken(uni.getStorageSync(STORAGE_KEYS.refreshToken)),
    accessTokenExpiresAt: Number.isFinite(expiresAt) ? expiresAt : 0,
  }
}

export function persistAuthTokens(
  accessToken: string,
  refreshToken: string,
  expiresIn?: number,
): AuthTokens {
  const tokens = {
    accessToken,
    refreshToken,
    accessTokenExpiresAt: expiresIn
      ? Date.now() + expiresIn * 1000
      : Date.now() + DEFAULT_TOKEN_EXPIRY_MS,
  }

  uni.setStorageSync(STORAGE_KEYS.accessToken, tokens.accessToken)
  uni.setStorageSync(STORAGE_KEYS.refreshToken, tokens.refreshToken)
  uni.setStorageSync(STORAGE_KEYS.accessTokenExpiresAt, tokens.accessTokenExpiresAt)
  // 兼容仍读取单 token 的旧版本；新代码不得直接依赖此 key。
  uni.setStorageSync(STORAGE_KEYS.legacyToken, tokens.accessToken)
  return tokens
}

export function clearAuthTokens(): void {
  Object.values(STORAGE_KEYS).forEach(key => uni.removeStorageSync(key))
}

export function getStoredAccessToken(): string | null {
  return readAuthTokens().accessToken || null
}

export function getStoredRefreshToken(): string | null {
  return readAuthTokens().refreshToken || null
}

export function getValidAccessToken(now = Date.now()): string | null {
  const tokens = readAuthTokens()
  if (
    tokens.accessToken
    && tokens.accessTokenExpiresAt > now + TOKEN_EXPIRY_BUFFER_MS
  ) {
    return tokens.accessToken
  }
  return null
}

export function shouldRefreshAccessToken(now = Date.now()): boolean {
  const tokens = readAuthTokens()
  return !!(
    tokens.accessToken
    && tokens.refreshToken
    && tokens.accessTokenExpiresAt > now
    && tokens.accessTokenExpiresAt < now + TOKEN_EXPIRY_BUFFER_MS
  )
}

export function hasAuthenticatedSession(now = Date.now()): boolean {
  const tokens = readAuthTokens()
  return !!(
    tokens.refreshToken
    || (tokens.accessToken && tokens.accessTokenExpiresAt > now)
  )
}
