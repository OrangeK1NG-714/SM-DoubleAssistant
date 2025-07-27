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
import { getUserInfo, login } from '@/api/login'
import { updateStdPassword } from '@/api/stdInfo'
import { useUserStore } from '@/store/user'
import PLATFORM from '@/utils/platform'

defineOptions({
  name: 'Home',
})

onLoad(() => {
  const useStore = useUserStore()
  console.log(useStore.userInfo)
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

// 表单数据
const username = ref('')
const password = ref('')
// 登录
async function handleLogin() {
  if (!username.value || !password.value) {
    uni.showToast({
      title: '请输入账号和密码',
      icon: 'none',
    })
    return
  }
  try {
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
      // 存储token
      const useStore = useUserStore()
      useStore.setUserInfo(res.data.username, res.data.role, res.data.token)
      uni.setStorageSync('token', res.data.token)
      const resUserInfo = await getUserInfo(username.value, res.data.role)
      console.log(resUserInfo)
      console.log(res)

      if (res.data.role === 'student' && resUserInfo.isEmpty === 0) {
        // 跳转页面
        uni.navigateTo({
          url: '/pages/userMsg/index',
        })
      }
      else {
        // 跳转页面
        uni.navigateTo({
          url: '/pages/index/index',
        })
      }
    }
  }
  catch (error) {
    console.log(error)
  }
}

// 密码重置相关状态
const resetUsername = ref('')
const verifyCode = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const countDown = ref(0)
// 发送验证码
async function sendVerifyCode() {
  if (!resetUsername.value) {
    uni.showToast({ title: '请输入账号', icon: 'none' })
    return
  }
  // 调用发送验证码API
  // ...
  countDown.value = 60
  const timer = setInterval(() => {
    countDown.value--
    if (countDown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// 重置密码
async function handleResetPassword() {
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
  try {
    const res = await updateStdPassword({
      username: resetUsername.value,
      password: newPassword.value,
    })
    console.log(res)
    if (res.code === 200) {
      uni.showToast({ title: '密码重置成功', icon: 'success' })
    }
    uni.navigateTo({
      url: '/pages/login/index',
    })
  }
  catch (error) {
    console.log(error)

    uni.showToast({ title: `密码重置失败,${error.data.msg}`, icon: 'none' })
  }
}
// 测试 uni API 自动引入
onLoad(() => {
  console.log()
})

console.log('index')
</script>

<template>
  <view class="bg-white px-4 pt-2" :style="{ marginTop: `${safeAreaInsets?.top}px` }">
    <view class="p-4">
      <view class="mb-4">
        <text class="text-sm text-gray-600">
          账号
        </text>
        <input v-model="resetUsername" class="mt-1 w-full border border-gray-300 rounded-md p-2" placeholder="请输入学号/工号">
      </view>
      <view class="mb-4 flex space-x-2">
        <view class="flex-1">
          <text class="text-sm text-gray-600">
            验证码
          </text>
          <input v-model="verifyCode" class="mt-1 w-full border border-gray-300 rounded-md p-2" placeholder="请输入验证码">
        </view>
        <button class="mt-6 h-10 rounded-md bg-[#409eff] px-4 text-white" @click="sendVerifyCode">
          {{ countDown > 0 ? `${countDown}s后重新发送` : '发送验证码' }}
        </button>
      </view>
      <view class="mb-4">
        <text class="text-sm text-gray-600">
          新密码
        </text>
        <input
          v-model="newPassword" class="mt-1 w-full border border-gray-300 rounded-md p-2"
          placeholder="请输入新密码"
        >
      </view>
      <view class="mb-4">
        <text class="text-sm text-gray-600">
          确认密码
        </text>
        <input
          v-model="confirmPassword" class="mt-1 w-full border border-gray-300 rounded-md p-2"
          placeholder="请确认新密码"
        >
      </view>
      <button class="mt-4 w-full rounded-md bg-[#409eff] py-2 text-white" @click="handleResetPassword">
        确认重置
      </button>
    </view>
  </view>
</template>
