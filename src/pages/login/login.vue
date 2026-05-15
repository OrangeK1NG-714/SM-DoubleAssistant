<!-- 使用 type="home" 属性设置首页，其他页面不需要设置，默认为page；推荐使用json5，更强大，且允许注释 -->
<route lang="json5" type="home">
{
  layout: "tabbar",
  style: {
    // 'custom' 表示开启自定义导航栏，默认 'default'
    navigationStyle: "custom",
    navigationBarTitleText: "登录",
  },
}
</route>

<script lang="ts" setup>
import { getUserInfo, login } from '@/api/login'
import { saveOpenid } from '@/api/stdInfo'
import { useSafeArea } from '@/composables/useSafeArea'
import { useUserStore } from '@/store/user'

defineOptions({
  name: 'Login',
})

const safeAreaInsets = useSafeArea()

// 表单数据
const username = ref('')
const password = ref('')
const isSubmitting = ref(false)
const focusedField = ref<'username' | 'password' | null>(null)
const errorText = ref('')

function validate() {
  errorText.value = ''
  if (!username.value.trim() || !password.value.trim()) {
    errorText.value = '请输入账号和密码'
    uni.showToast({ title: errorText.value, icon: 'none' })
    return false
  }
  return true
}
// 登录
async function handleLogin() {
  if (isSubmitting.value)
    return
  if (!validate())
    return
  try {
    isSubmitting.value = true
    uni.showLoading({
      title: '登录中...',
    })
    // 调用登录接口
    const res = await login({
      username: username.value,
      password: password.value,
    })
    if (res.code === 200) {
      uni.showToast({
        title: '登录成功',
        icon: 'success',
      })
      // 存储双token
      const useStore = useUserStore()
      const {
        username: resUsername,
        role,
        accessToken,
        refreshToken,
        expiresIn,
      } = res.data
      // 兼容旧版本单token：后端可能只返回 token 字段
      const finalAccessToken = accessToken || (res.data as any).token
      const finalRefreshToken = refreshToken || (res.data as any).token

      // 设置用户信息
      useStore.setUserInfo(resUsername, role)
      // 设置双token（先同步存储到本地，确保后续请求能获取到）
      useStore.setTokens(finalAccessToken, finalRefreshToken, expiresIn)

      // 确保token已存储后再发起请求
      // 获取用户详细信息
      const resUserInfo = await getUserInfo(resUsername, role)

      // 仅小程序端：登录成功后获取 openid 并上报后端
      // #ifdef MP-WEIXIN
      if (role === 'student') {
        try {
          const loginRes = await new Promise<UniApp.LoginRes>(
            (resolve, reject) => {
              uni.login({ provider: 'weixin', success: resolve, fail: reject })
            },
          )
          await saveOpenid(loginRes.code, resUsername)
        }
        catch (wxErr) {
          console.warn('[login] openid 上报失败（不影响登录）:', wxErr)
        }
      }
      // #endif

      if (role === 'student' && resUserInfo.isEmpty === 0) {
        // 跳转页面
        uni.reLaunch({
          url: '/pages/userMsg/index',
        })
      }
      else {
        // 跳转页面
        uni.reLaunch({
          url: '/pages/index/index',
        })
      }
    }
  }
  catch (error) {
    uni.showToast({ title: '登录失败，请稍后重试', icon: 'none' })
  }
  finally {
    isSubmitting.value = false
    uni.hideLoading()
  }
}

// 重置密码
async function handleResetPassword() {
  if (isSubmitting.value)
    return
  uni.navigateTo({
    url: '/pages/resetPassword/index',
  })
}
</script>

<template>
  <view
    class="ios-page"
    :style="{ paddingTop: safeAreaInsets.top + 'px' }"
  >
    <view class="px-5 pt-8">
      <view class="ios-title">
        登录
      </view>
      <view class="ios-subtitle mt-2">
        浙江科技大学数媒专业导师互选系统
      </view>
    </view>

    <view class="px-5 pt-6">
      <view class="ios-card">
        <view
          class="ios-cell ios-cell--first"
          :class="{ 'ios-cell--focused': focusedField === 'username' }"
        >
          <view class="ios-cell__label">
            账号
          </view>
          <view class="ios-cell__content">
            <input
              v-model="username"
              class="ios-input"
              placeholder="学号 / 工号"
              :cursor-spacing="20"
              :disabled="isSubmitting"
              @focus="focusedField = 'username'"
              @blur="focusedField = null"
            >
          </view>
        </view>

        <view class="ios-divider" />

        <view
          class="ios-cell ios-cell--last"
          :class="{ 'ios-cell--focused': focusedField === 'password' }"
        >
          <view class="ios-cell__label">
            密码
          </view>
          <view class="ios-cell__content">
            <input
              v-model="password"
              class="ios-input"
              placeholder="请输入密码"
              password
              :cursor-spacing="20"
              :disabled="isSubmitting"
              @focus="focusedField = 'password'"
              @blur="focusedField = null"
              @confirm="handleLogin"
            >
          </view>
        </view>
      </view>

      <view class="mt-3 px-1 text-xs text-[#6B7280]">
        学生账号为学号，老师账号为工号
      </view>
      <view v-if="errorText" class="mt-2 px-1 text-xs text-[#FF3B30]">
        {{ errorText }}
      </view>

      <view class="mt-8 space-y-3">
        <button
          class="ios-btn ios-btn--primary"
          :disabled="isSubmitting"
          @click="handleLogin"
        >
          {{ isSubmitting ? "登录中…" : "登录" }}
        </button>
        <button
          class="ios-btn ios-btn--secondary"
          :disabled="isSubmitting"
          @click="handleResetPassword"
        >
          修改密码
        </button>
      </view>
    </view>
  </view>

  <!-- <view class="mt-10">
      <image src="/static/logo.svg" alt="" class="mx-auto block h-28 w-28" />
    </view>
    <view class="mt-4 text-center text-4xl text-[#d14328]">
      unibest
    </view>
    <view class="mb-8 mt-2 text-center text-2xl">
      最好用的 uniapp 开发模板
    </view>

    <view class="m-auto mb-2 max-w-100 text-justify indent text-4">
      {{ description }}
    </view>
    <view class="mt-4 text-center">
      作者：
      <text class="text-green-500">
        菲鸽
      </text>
    </view>
    <view class="mt-4 text-center">
      官网地址：
      <text class="text-green-500">
        https://unibest.tech
      </text>
    </view>
    <view class="mt-6 h-1px bg-#eee" />
    <view class="mt-8 text-center">
      当前平台是：
      <text class="text-green-500">
        {{ PLATFORM.platform }}
      </text>
    </view>
    <view class="mt-4 text-center">
      模板分支是：
      <text class="text-green-500">
        base
      </text>
    </view> -->
</template>

<style scoped>
.ios-btn {
  width: 100%;
}
</style>
