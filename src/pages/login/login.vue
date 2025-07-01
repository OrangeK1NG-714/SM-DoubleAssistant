<!-- 使用 type="home" 属性设置首页，其他页面不需要设置，默认为page；推荐使用json5，更强大，且允许注释 -->
<route lang="json5" type="home">
{
  layout: 'tabbar',
  style: {
    // 'custom' 表示开启自定义导航栏，默认 'default'
    navigationStyle: 'custom',
    navigationBarTitleText: '首页',
  },
}
</route>

<script lang="ts" setup>
import { getUserInfo, login } from '@/api/login'
import PLATFORM from '@/utils/platform'

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
const author = ref('菲鸽')
const description = ref(
  'unibest 是一个集成了多种工具和技术的 uniapp 开发模板，由 uniapp + Vue3 + Ts + Vite5 + UnoCss + VSCode 构建，模板具有代码提示、自动格式化、统一配置、代码片段等功能，并内置了许多常用的基本组件和基本功能，让你编写 uniapp 拥有 best 体验。',
)
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
    console.log(res)

    if (res.code === 200) {
      uni.showToast({
        title: '登录成功',
        icon: 'success',
      })
      // 存储token
      uni.setStorageSync('token', res.data.token)
      const resUserInfo = await getUserInfo(username.value, res.data.role)
      console.log(resUserInfo)
      console.log(123)

      // 跳转页面
      uni.navigateTo({
        url: '/pages/index/index',
      })
    }
  }
  catch (error) {
    console.log(error)
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
    <view class="mt-14 flex items-center justify-center">
      浙江科技大学数媒专业导师互选系统
    </view>
    <view class="ml-6 mr-6 mt-10 flex pb-2" style="border-bottom: 1px solid rgba(0, 0, 0, 0.1);">
      <view>账号</view>
      <view>
        <image class="ml-2 h-6 w-6" src="../../assets/login/user.png" />
      </view>
      <view class="flex">
        <input v-model="username" class="pl-2" placeholder="请输入学号/工号">
        <!-- <text
          class="uni-icon" :class="[!showPassword ? 'uni-eye-active' : '']"
          @click="changePassword"
        >
          &#xe568;
        </text> -->
      </view>
    </view>
    <view class="ml-6 mr-6 mt-4 flex pb-2" style="border-bottom: 1px solid rgba(0, 0, 0, 0.1);">
      <view>密码</view>
      <view>
        <image class="ml-2 h-6 w-6" src="../../assets/login/password.png" />
      </view>
      <view class="flex">
        <input v-model="password" class="pl-2" placeholder="请输入密码">
        <!-- <text class="uni-icon" :class="[!showPassword ? 'uni-eye-active' : '']" @click="changePassword">
          &#xe568;
        </text> -->
      </view>
    </view>
    <view class="mb-4 mt-4 flex items-center justify-center text-sm text-red-500">
      学生用户名为学号，老师为工号
    </view>
    <view class="flex">
      <button size="default" class="w-40 bg-[#caf2ff] text-[#272727]" @click="handleLogin">
        登录
      </button>
      <button size="default" class="w-40 bg-[#caf2ff] text-[#272727]" bind:tap="loginTest">
        修改密码
      </button>
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
