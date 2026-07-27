<route lang="json5">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '重置密码',
  },
}
</route>

<script lang="ts" setup>
import { selfResetPassword } from '@/api/stdInfo'
import { useSafeArea } from '@/composables/useSafeArea'

defineOptions({
  name: 'ResetPassword',
})

const safeAreaInsets = useSafeArea()

// 密码重置相关状态
const resetUsername = ref('')
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isSubmitting = ref(false)
const focusedField = ref<string | null>(null)

// 重置密码
async function handleResetPassword() {
  if (isSubmitting.value)
    return
  if (!resetUsername.value || !oldPassword.value || !newPassword.value || !confirmPassword.value) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    uni.showToast({ title: '两次密码输入不一致', icon: 'none' })
    return
  }

  const { confirm } = await uni.showModal({
    title: '确认修改',
    content: '确定要修改密码吗？',
  })
  if (!confirm)
    return

  try {
    isSubmitting.value = true
    uni.showLoading({ title: '提交中…' })
    const res = await selfResetPassword({
      username: resetUsername.value,
      oldPassword: oldPassword.value,
      newPassword: newPassword.value,
    })
    if (res.code === 200) {
      uni.showToast({ title: '密码修改成功', icon: 'success' })
      uni.reLaunch({
        url: '/pages/login/login',
      })
    }
  }
  catch (error) {
    uni.showToast({ title: `修改失败，${error?.data?.msg || '请稍后重试'}`, icon: 'none' })
  }
  finally {
    isSubmitting.value = false
    uni.hideLoading()
  }
}
</script>

<template>
  <view class="ios-page" :style="{ paddingTop: `${safeAreaInsets.top}px` }">
    <view class="px-5 pt-6">
      <view class="ios-title">
        重置密码
      </view>
      <view class="ios-subtitle mt-2">
        请输入账号并设置新密码。
      </view>
    </view>

    <view class="px-5 pb-10 pt-6">
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
              :cursor-spacing="20"
              :disabled="isSubmitting"
              @focus="focusedField = 'username'"
              @blur="focusedField = null"
            >
          </view>
        </view>
        <view class="ios-divider" style="margin-left: 28rpx;" />
        <view class="ios-cell" :class="{ 'ios-cell--focused': focusedField === 'old' }">
          <view class="ios-cell__label">
            原密码
          </view>
          <view class="ios-cell__content">
            <input
              v-model="oldPassword"
              class="ios-input"
              password
              placeholder="请输入原密码"
              :cursor-spacing="20"
              :disabled="isSubmitting"
              @focus="focusedField = 'old'"
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
              :cursor-spacing="20"
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
              :cursor-spacing="20"
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
          {{ isSubmitting ? '提交中…' : '确认修改' }}
        </button>
      </view>
    </view>
  </view>
</template>
