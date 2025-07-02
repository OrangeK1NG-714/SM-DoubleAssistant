<!-- 路由配置保持不变 -->
<route lang="json5">
{
layout: 'default',
  style: {
    navigationBarTitleText: '首页',
  },
}
</route>

<script lang="ts" setup>
// 脚本部分保持不变
import { login } from '@/api/login'
import { useUserStore } from '@/store/user'
import PLATFORM from '@/utils/platform'

defineOptions({
  name: 'Home',
})

const role = ref('student')
const name = ref('张三')
const activeTab = ref('ongoing')
const ongoingList = ref([{ id: 1, name: '2023年导师互选' }])
const endedList = ref([{ id: 2, name: '2022年导师互选' }])

function switchTab(tab: string) {
  activeTab.value = tab
}

function viewDetail() {
  uni.showToast({ title: '查看详情', icon: 'none' })
}

function myStudent() {
  uni.showToast({ title: '我的学生', icon: 'none' })
}

function enterSystem() {
  uni.showToast({ title: '进入系统', icon: 'none' })
}

// 安全区域处理保持不变
let safeAreaInsets
let systemInfo

// #ifdef MP-WEIXIN
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
systemInfo = uni.getSystemInfoSync()
safeAreaInsets = systemInfo.safeAreaInsets
// #endif

onLoad(() => {
  const useStore = useUserStore()
  console.log(useStore.userInfo)
})
</script>

<template>
  <view class="bg-white px-4 pt-2" :style="{ marginTop: `${safeAreaInsets?.top}px` }">
    <!-- 用户欢迎语 -->
    <view class="my-6 text-center text-lg text-gray-800 font-bold">
      <text v-if="role === 'student'">
        {{ name }}同学你好！请进入系统选择导师！
      </text>
      <text v-else-if="role === 'teacher'">
        {{ name }}老师您好！请进入系统选择学生！
      </text>
      <text v-else class="text-red-500">
        信息未录入，请联系管理员
      </text>
    </view>

    <!-- 选项卡 -->
    <view class="mb-5 flex border-b border-gray-200">
      <view
        class="flex-1 py-4 text-center transition-colors" :class="{
          'text-green-500 border-b-2 border-green-500 font-medium': activeTab === 'ongoing',
          'text-gray-500': activeTab !== 'ongoing',
        }" @tap="switchTab('ongoing')"
      >
        进行中
      </view>
      <view
        class="flex-1 py-4 text-center transition-colors" :class="{
          'text-green-500 border-b-2 border-green-500 font-medium': activeTab === 'ended',
          'text-gray-500': activeTab !== 'ended',
        }" @tap="switchTab('ended')"
      >
        已结束
      </view>
    </view>

    <!-- 活动列表 -->
    <view class="space-y-4">
      <template v-if="activeTab === 'ongoing'">
        <!-- 进行中的活动列表 -->
        <view v-for="item in ongoingList" :key="item.id" class="rounded-lg bg-sky-100 p-4 shadow-sm">
          <view class="text-lg text-gray-800 font-medium">
            {{ item.name }}（进行中）
          </view>
          <view class="mt-4 flex justify-end space-x-2">
            <button
              class="flex-1 border border-gray-300 rounded bg-white py-2 text-gray-700 active:bg-gray-100"
              hover-class="bg-blue-50 text-blue-500 underline" @tap="viewDetail"
            >
              查看详情
            </button>
            <button
              v-if="role === 'teacher'"
              class="flex-1 border border-gray-300 rounded bg-white py-2 text-gray-700 active:bg-gray-100"
              @tap="myStudent"
            >
              我的学生
            </button>
            <button
              class="flex-1 border border-gray-300 rounded bg-white py-2 text-gray-700 active:bg-gray-100"
              @tap="enterSystem"
            >
              进入系统
            </button>
          </view>
        </view>
      </template>
      <template v-else>
        <!-- 已结束的活动列表 -->
        <view v-for="item in endedList" :key="item.id" class="rounded-lg bg-gray-100 p-4 shadow-sm">
          <view class="text-lg text-gray-800 font-medium">
            {{ item.name }}（已结束）
          </view>
          <view class="mt-4 flex justify-end space-x-2">
            <button class="flex-1 border border-gray-300 rounded bg-white py-2 text-gray-700 opacity-50">
              查看详情
            </button>
            <button
              v-if="role === 'teacher'"
              class="flex-1 border border-gray-300 rounded bg-white py-2 text-gray-700 opacity-50"
            >
              我的学生
            </button>
            <button class="flex-1 border border-gray-300 rounded bg-white py-2 text-gray-700 opacity-50">
              进入系统
            </button>
          </view>
        </view>
      </template>
    </view>
  </view>
</template>
