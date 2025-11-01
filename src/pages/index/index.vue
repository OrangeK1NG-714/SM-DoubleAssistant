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
import { ref } from 'vue'
import { isStudentInActivity } from '@/api/stdInfo'
import { isTeacherInActivity } from '@/api/teaInfo'
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

const showDetailModal = ref(false)
const detailDescription = ref('')
function viewDetail(item: any) {
  showDetailModal.value = true
  detailDescription.value = item.description
}

function myStudent(id: string) {
  useStore.setActivityId(id)
  uni.navigateTo({
    url: '/pages/myStudent/index',
  })
}

function myVolunteer(id: string) {
  useStore.setActivityId(id)
  uni.navigateTo({
    url: '/pages/myAmbition/index',
  })
}

async function enterSystem(id: string) {
  uni.showToast({ title: '进入系统', icon: 'none' })
  console.log(id)
  console.log(useStore.userInfo.username)
  if (useStore.userInfo.role === 'student') {
    const res = await isStudentInActivity(id, useStore.userInfo.username)
    console.log(res)
    useStore.setActivityId(id)
    if (res.code === 200) {
      uni.navigateTo({
        url: '/pages/s_choose/index',
      })
    }
    else {
      uni.showToast({ title: '您不在此活动中！(有疑问请联系管理员)', icon: 'none' })
    }
  }
  else if (useStore.userInfo.role === 'teacher') {
    const res = await isTeacherInActivity(id, useStore.userInfo.username)
    console.log(res)
    useStore.setActivityId(id)
    if (res.code === 200) {
      uni.navigateTo({
        url: '/pages/t_choose/index',
      })
    }
    else {
      uni.showToast({ title: '您不在此活动中！(有疑问请联系管理员)', icon: 'none' })
    }
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
  const res: any = await getActivityList()
  console.log(res)

  if (useStore.userInfo?.role === 'student') {
    // 先检查用户是否在每个活动中
    const promises = res.map(async (item) => {
      return await isStudentInActivity(item._id, useStore.userInfo?.username)
    })
    const asd = await Promise.all(promises)
    console.log(asd)

    // 过滤出用户参与的活动
    const userActivities = res.filter((item, index) => {
      return asd[index].code === 200
    })
    console.log('用户参与的活动:', userActivities)

    // 再根据时间分类活动
    classifyActivities(userActivities as any)
    console.log('进行中的活动:', ongoingList.value)
    console.log('已结束的活动:', endedList.value)
  }
  else {
    // 先检查用户是否在每个活动中
    const promises = res.map(async (item) => {
      return await isTeacherInActivity(item._id, useStore.userInfo?.username)
    })
    const asd = await Promise.all(promises)
    console.log(asd)

    // 过滤出用户参与的活动
    const userActivities = res.filter((item, index) => {
      return asd[index].code === 200
    })
    console.log('用户参与的活动:', userActivities)

    // 再根据时间分类活动
    classifyActivities(userActivities as any)
    console.log('进行中的活动:', ongoingList.value)
    console.log('已结束的活动:', endedList.value)
  }

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
              hover-class="bg-blue-50 text-blue-500 underline" @click="viewDetail(item)"
            >
              查看详情
            </button>
            <button
              v-if="role === 'student'"
              class="flex-1 border border-gray-300 rounded bg-white py-2 text-gray-700 active:bg-gray-100"
              @tap="myVolunteer(item.id)"
            >
              我的志愿
            </button>
            <button
              v-if="role === 'teacher'"
              class="flex-1 border border-gray-300 rounded bg-white py-2 text-gray-700 active:bg-gray-100"
              @tap="myStudent(item.id)"
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
              v-if="role === 'student'"
              class="flex-1 border border-gray-300 rounded bg-white py-2 text-gray-700 opacity-50"
            >
              我的志愿
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

  <!-- 详情弹窗 -->

  <wd-popup v-model="showDetailModal" custom-style="border-radius:32rpx;" close="showDetailModal=false">
    <text class="custom-txt">
      {{ detailDescription }}
    </text>
  </wd-popup>
</template>

<style lang="css" scoped>
.custom-txt {
  color: #333;
  max-width: 600rpx;
  max-height: 600rpx;
  padding: 30rpx;
  margin: 0 auto;
  display: block;
  font-size: 28rpx;
  line-height: 1.6;
  border-radius: 32rpx;
  background-color: #fff;
  overflow: auto;
  text-align: left;
}
</style>
