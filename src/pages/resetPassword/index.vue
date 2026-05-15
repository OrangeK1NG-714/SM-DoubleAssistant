<!-- 使用 type="home" 属性设置首页，其他页面不需要设置，默认为page；推荐使用json5，更强大，且允许注释 -->
<route lang="json5">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '重置密码',
  },
}
</route>

<script lang="ts" setup>
import { updateStdPassword } from '@/api/stdInfo'
import { useUserStore } from '@/store/user'

defineOptions({
  name: 'Home',
})

// 获取屏幕边界到安全区域距离
let safeAreaInsets
let systemInfo

// #ifdef MP-WEIXIN
// 微信小程序使用新的API
systemInfo = uni.getWindowInfo()
safeAreaInsets = systemInfo.safeArea
  ? {
      top: systemInfo.safeArea.top,
      right: systemInfo.windowWidth - systemInfo.safeArea.right,
      bottom: systemInfo.windowHeight - systemInfo.safeArea.bottom,
      left: systemInfo.safeArea.left,
    }
  : null
// #endif

// #ifndef MP-WEIXIN
// 其他平台继续使用uni API
systemInfo = uni.getSystemInfoSync()
safeAreaInsets = systemInfo.safeAreaInsets
// #endif

// 密码重置相关状态
const resetUsername = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isSubmitting = ref(false)
const focusedField = ref<string | null>(null)

// 重置密码
async function handleResetPassword() {
  if (isSubmitting.value)
    return
  if (!resetUsername.value || !newPassword.value || !confirmPassword.value) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    uni.showToast({ title: '两次密码输入不一致', icon: 'none' })
    return
  }
  // 调用重置密码API
  // ...
  const { confirm } = await uni.showModal({
    title: '确认重置',
    content: '确定要重置密码吗？',
  })
  if (!confirm) return

  try {
    isSubmitting.value = true
    uni.showLoading({ title: '提交中…' })
    const res = await updateStdPassword({
      username: resetUsername.value,
      password: newPassword.value,
    })
    if (res.code === 200) {
      uni.showToast({ title: '密码重置成功', icon: 'success' })
      uni.reLaunch({
        url: '/pages/login/login',
      })
    }
  }
  catch (error) {
    uni.showToast({ title: `密码重置失败,${error?.data?.msg || '请稍后重试'}`, icon: 'none' })
  }
  finally {
    isSubmitting.value = false
    uni.hideLoading()
  }
}
</script>

<template>
  <view class="ios-page" :style="{ paddingTop: `${safeAreaInsets?.top || 0}px` }">
    <view class="px-5 pt-6">
      <view class="ios-title">
        重置密码
      </view>
      <view class="ios-subtitle mt-2">
        请输入账号并设置新密码。
      </view>
    </view>

    <view class="px-5 pt-6 pb-10">
      <view class="ios-card">
        <view class="ios-cell" :class="{ 'ios-cell--focused': focusedField === 'username' }">
          <view class="ios-cell__label">
            账号
          </view>
          <view class="ios-cell__content">
            <input
              v-model="resetUsername"
              class="ios-input"
              placeholder="学号 / 工号"
              :disabled="isSubmitting"
              @focus="focusedField = 'username'"
              @blur="focusedField = null"
            >
          </view>
        </view>
        <view class="ios-divider" style="margin-left: 28rpx;" />
        <view class="ios-cell" :class="{ 'ios-cell--focused': focusedField === 'new' }">
          <view class="ios-cell__label">
            新密码
          </view>
          <view class="ios-cell__content">
            <input
              v-model="newPassword"
              class="ios-input"
              password
              placeholder="请输入新密码"
              :disabled="isSubmitting"
              @focus="focusedField = 'new'"
              @blur="focusedField = null"
            >
          </view>
        </view>
        <view class="ios-divider" style="margin-left: 28rpx;" />
        <view class="ios-cell" :class="{ 'ios-cell--focused': focusedField === 'confirm' }">
          <view class="ios-cell__label">
            确认
          </view>
          <view class="ios-cell__content">
            <input
              v-model="confirmPassword"
              class="ios-input"
              password
              placeholder="再次输入新密码"
              :disabled="isSubmitting"
              @focus="focusedField = 'confirm'"
              @blur="focusedField = null"
              @confirm="handleResetPassword"
            >
          </view>
        </view>
      </view>

      <view class="mt-8">
        <button class="ios-btn ios-btn--primary w-full" :disabled="isSubmitting" @click="handleResetPassword">
          {{ isSubmitting ? '提交中…' : '确认重置' }}
        </button>
      </view>
    </view>
  </view>
</template>
