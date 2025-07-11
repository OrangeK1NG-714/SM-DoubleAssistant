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
import { getActivityList, getUserDetail } from '@/api/useraction'
import { useUserStore } from '@/store/user'

import PLATFORM from '@/utils/platform'

defineOptions({
  name: 'Home',
})
const useStore = useUserStore()
console.log(useStore.userInfo)

const nowDate = ref(new Date())
// console.log(nowDate)

const role = ref()
const name = ref()
const activeTab = ref('ongoing')
const ongoingList = ref<Array<any>>([])
const endedList = ref<Array<any>>([])
// console.log(ongoingList.value)
// console.log(endedList.value)

// 分类活动函数
function classifyActivities(activities: Array<any>) {
  const now = nowDate.value

  activities.forEach((activity) => {
    const startDate = new Date(activity.startDate)
    const endDate = new Date(activity.endDate)

    if (now >= startDate && now <= endDate) {
      // 进行中的活动
      ongoingList.value.push({
        id: activity._id,
        name: activity.name,
        description: activity.description,
        startDate: activity.startDate,
        endDate: activity.endDate,
      })
    }
    else {
      // 已结束的活动
      endedList.value.push({
        id: activity._id,
        name: activity.name,
        description: activity.description,
        startDate: activity.startDate,
        endDate: activity.endDate,
      })
    }
  })
}

function switchTab(tab: string) {
  activeTab.value = tab
}

function viewDetail() {
  uni.showToast({ title: '查看详情', icon: 'none' })
}

function myStudent() {
  uni.showToast({ title: '我的学生', icon: 'none' })
}

function enterSystem(id: string) {
  console.log(123)
  console.log(id)
  uni.showToast({ title: '进入系统', icon: 'none' })
  useStore.setActivityId(id)
  console.log(useStore.userInfo)
  if (useStore.userInfo?.role === 'student') {
    uni.navigateTo({
      url: '/pages/s_choose/index',
    })
  }
  else if (useStore.userInfo?.role === 'teacher') {
    uni.navigateTo({
      url: '/pages/t_choose/index',
    })
  }
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

onLoad(async () => {
  const res = await getActivityList()
  console.log(res)

  // 分类活动
  classifyActivities(res as any)

  // 从服务器查询用户信息
  const userDetail: any = await getUserDetail(useStore.userInfo?.username, useStore.userInfo?.role)
  console.log(userDetail)
  // 新增赋值逻辑
  role.value = useStore.userInfo?.role
  if (role.value === 'student') {
    name.value = userDetail.data.data.name
  }
  else if (role.value === 'teacher') {
    name.value = userDetail.data.name
  }
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
              @tap="enterSystem(item.id)"
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
