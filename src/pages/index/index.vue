<route lang="json5">
{
layout: 'default',
  style: {
    navigationBarTitleText: '首页',
    enablePullDownRefresh: true,
  },
}
</route>

<script lang="ts" setup>
import { ref } from 'vue'
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app'
import { isStudentInActivity } from '@/api/stdInfo'
import { isTeacherInActivity } from '@/api/teaInfo'
import { getMyActivities, getUserDetail } from '@/api/useraction'
import { IOS_BLUE } from '@/constants/theme'
import { useSafeArea } from '@/composables/useSafeArea'
import { useUserStore } from '@/store/user'

defineOptions({
  name: 'Home',
})

const safeAreaInsets = useSafeArea()
const useStore = useUserStore()

const role = ref()
const name = ref()
const activeTab = ref('ongoing')
const ongoingList = ref<Array<any>>([])
const endedList = ref<Array<any>>([])

const isEntering = ref(false)
const selectedActivity = ref<any | null>(null)

function formatDateRange(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  const sText = `${s.getFullYear()}-${String(s.getMonth() + 1).padStart(2, '0')}-${String(s.getDate()).padStart(2, '0')}`
  const eText = `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, '0')}-${String(e.getDate()).padStart(2, '0')}`
  return `${sText} ~ ${eText}`
}

// 分类活动函数
function classifyActivities(activities: Array<any>) {
  const now = new Date()

  activities.forEach((activity) => {
    const startDate = new Date(activity.startDate)
    const endDate = new Date(activity.endDate)

    const item = {
      id: activity._id,
      name: activity.name,
      description: activity.description,
      startDate: activity.startDate,
      endDate: activity.endDate,
    }

    if (now < startDate) {
      // 未开始的活动也放在进行中列表（即将开始）
      ongoingList.value.push(item)
    }
    else if (now >= startDate && now <= endDate) {
      ongoingList.value.push(item)
    }
    else {
      endedList.value.push(item)
    }
  })
}

function switchTab(tab: string) {
  activeTab.value = tab
}

const showDetailModal = ref(false)
const detailDescription = ref('')
function isActivityEnded(item: any) {
  return item && new Date() > new Date(item.endDate)
}

function viewDetail(item: any) {
  showDetailModal.value = true
  selectedActivity.value = item
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

function editProfile() {
  uni.navigateTo({
    url: '/pages/userMsg/index?mode=edit',
  })
}

function handleLogout() {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出当前账号吗？',
    confirmText: '退出',
    cancelText: '取消',
    success: (res) => {
      if (!res.confirm)
        return

      useStore.clearUserInfo()
      uni.reLaunch({
        url: '/pages/login/login',
      })
    },
  })
}

async function enterSystem(id: string) {
  if (isEntering.value) return
  isEntering.value = true
  try {
    uni.showToast({ title: '进入中…', icon: 'none' })
    if (useStore.userInfo.role === 'student') {
      const res = await isStudentInActivity(id, useStore.userInfo.username)
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
  catch (error) {
    uni.showToast({ title: '进入失败，请重试', icon: 'none' })
  }
  finally {
    isEntering.value = false
  }
}

async function loadData() {
  try {
    uni.showLoading({ title: '加载中...' })
    const currentRole = useStore.userInfo?.role
    const currentUsername = useStore.userInfo?.username
    role.value = currentRole

    if (useStore.userInfo?.name) {
      name.value = useStore.userInfo.name
    }

    const fetchPromises: Promise<any>[] = [getMyActivities()]
    if (!useStore.userInfo?.name) {
      fetchPromises.push(getUserDetail(currentUsername, currentRole))
    }
    const [res, userDetail] = await Promise.all(fetchPromises)

    if (userDetail) {
      if (currentRole === 'student') {
        name.value = userDetail.data?.data?.name
      }
      else if (currentRole === 'teacher') {
        name.value = userDetail.data?.name
      }
    }

    classifyActivities(res.data || [])
  }
  catch (error) {
    uni.showToast({ title: '数据加载失败', icon: 'none' })
  }
  finally {
    uni.hideLoading()
  }
}

onLoad(async () => {
  await loadData()
})

onPullDownRefresh(async () => {
  ongoingList.value = []
  endedList.value = []
  await loadData()
  uni.stopPullDownRefresh()
})
</script>

<template>
  <view class="ios-page" :style="{ paddingTop: safeAreaInsets.top + 'px' }">
    <view class="px-5 pt-6">
      <view class="ios-header-row">
        <view class="ios-header-main">
          <template v-if="role === 'student'">
            <view class="ios-title">
              你好，{{ name }}
            </view>
            <view class="ios-subtitle mt-2">
              请选择活动后进入系统，开始选择导师。
            </view>
          </template>
          <template v-else-if="role === 'teacher'">
            <view class="ios-title">
              你好，{{ name }}
            </view>
            <view class="ios-subtitle mt-2">
              请选择活动后进入系统，开始选择学生。
            </view>
          </template>
          <template v-else>
            <view class="ios-title">
              信息未录入
            </view>
            <view class="ios-subtitle mt-2" style="color:#FF3B30;">
              请联系管理员完善信息
            </view>
          </template>
        </view>

        <view class="ios-header-btns">
          <button v-if="role === 'student'" class="ios-logout-btn" @tap="editProfile">
            修改信息
          </button>
          <button class="ios-logout-btn" @tap="handleLogout">
            退出
          </button>
        </view>
      </view>

      <!-- Segmented Control -->
      <view class="ios-seg mt-6">
        <view
          class="ios-seg__item"
          :class="{ 'ios-seg__item--active': activeTab === 'ongoing' }"
          :style="activeTab === 'ongoing' ? { color: IOS_BLUE } : {}"
          @tap="switchTab('ongoing')"
        >
          进行中
        </view>
        <view
          class="ios-seg__item"
          :class="{ 'ios-seg__item--active': activeTab === 'ended' }"
          :style="activeTab === 'ended' ? { color: IOS_BLUE } : {}"
          @tap="switchTab('ended')"
        >
          已结束
        </view>
      </view>
    </view>

    <!-- Activities -->
    <view class="px-5 pb-8 pt-5">
      <template v-if="activeTab === 'ongoing'">
        <view v-if="ongoingList.length === 0" class="ios-empty">
          暂无进行中的活动
        </view>
        <view v-for="item in ongoingList" :key="item.id" class="ios-card mb-4">
          <view class="ios-card__top">
            <view class="ios-card__title">
              {{ item.name }}
            </view>
            <view class="ios-badge" :style="{ backgroundColor: 'rgba(10, 132, 255, 0.12)', color: IOS_BLUE }">
              进行中
            </view>
          </view>
          <view class="ios-card__meta mt-2">
            {{ formatDateRange(item.startDate, item.endDate) }}
          </view>
          <view class="ios-card__desc mt-3">
            {{ item.description }}
          </view>
          <view class="ios-card__actions mt-4">
            <button class="ios-btn ios-btn--secondary" @tap="viewDetail(item)">
              详情
            </button>
            <button class="ios-btn ios-btn--primary" @tap="enterSystem(item.id)">
              进入系统
            </button>
          </view>
        </view>
      </template>

      <template v-else>
        <view v-if="endedList.length === 0" class="ios-empty">
          暂无已结束的活动
        </view>
        <view v-for="item in endedList" :key="item.id" class="ios-card ios-card--disabled mb-4">
          <view class="ios-card__top">
            <view class="ios-card__title">
              {{ item.name }}
            </view>
            <view class="ios-badge ios-badge--gray">
              已结束
            </view>
          </view>
          <view class="ios-card__meta mt-2">
            {{ formatDateRange(item.startDate, item.endDate) }}
          </view>
          <view class="ios-card__desc mt-3">
            {{ item.description }}
          </view>
          <view class="ios-card__actions mt-4">
            <button class="ios-btn ios-btn--secondary" @tap="viewDetail(item)">
              详情
            </button>
            <button class="ios-btn ios-btn--primary" disabled>
              进入系统
            </button>
          </view>
        </view>
      </template>
    </view>
  </view>

  <!-- 详情弹窗 -->

  <wd-popup v-model="showDetailModal" custom-style="border-radius:40rpx;" position="bottom">
    <view class="ios-sheet">
      <view class="ios-sheet__handle" />
      <view class="ios-sheet__header">
        <view class="ios-sheet__title">
          {{ selectedActivity?.name || '活动详情' }}
        </view>
        <view v-if="selectedActivity" class="ios-sheet__meta">
          {{ formatDateRange(selectedActivity.startDate, selectedActivity.endDate) }}
        </view>
      </view>
      <scroll-view scroll-y class="ios-sheet__body">
        <view class="ios-sheet__text">
          {{ detailDescription }}
        </view>
      </scroll-view>
      <view class="ios-sheet__footer">
        <button
          v-if="role === 'student' && selectedActivity"
          class="ios-btn ios-btn--secondary"
          @tap="myVolunteer(selectedActivity.id)"
        >
          我的志愿
        </button>
        <button
          v-if="role === 'teacher' && selectedActivity"
          class="ios-btn ios-btn--secondary"
          @tap="myStudent(selectedActivity.id)"
        >
          我的学生
        </button>
        <button
          v-if="selectedActivity && !isActivityEnded(selectedActivity)"
          class="ios-btn ios-btn--primary"
          @tap="enterSystem(selectedActivity.id)"
        >
          进入系统
        </button>
        <button class="ios-btn ios-btn--tertiary" @tap="showDetailModal = false">
          关闭
        </button>
      </view>
    </view>
  </wd-popup>
</template>

<style lang="css" scoped>
.ios-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}
.ios-header-main {
  flex: 1;
  min-width: 0;
}
.ios-header-btns {
  display: flex;
  gap: 12rpx;
  flex-shrink: 0;
}
.ios-logout-btn {
  margin: 0;
  min-width: 112rpx;
  border-radius: 999rpx;
  padding: 12rpx 22rpx;
  font-size: 24rpx;
  font-weight: 600;
  line-height: 1;
  background: rgba(17, 24, 39, 0.06);
  color: #111827;
  border: 1rpx solid rgba(17, 24, 39, 0.08);
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.06);
}
.ios-logout-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}
.ios-empty {
  padding: 40rpx 0;
  text-align: center;
  color: #6b7280;
  font-size: 26rpx;
}
.ios-card {
  background: #ffffff;
  border-radius: 32rpx;
  box-shadow: 0 10rpx 26rpx rgba(0, 0, 0, 0.06);
  padding: 26rpx;
}
.ios-card--disabled {
  opacity: 0.65;
}
.ios-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}
.ios-card__title {
  font-size: 32rpx;
  font-weight: 700;
  color: #111827;
  flex: 1;
  min-width: 0;
}
.ios-card__meta {
  font-size: 24rpx;
  color: #6b7280;
}
.ios-card__desc {
  font-size: 26rpx;
  color: #374151;
  line-height: 1.6;
  line-clamp: 2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ios-badge {
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 600;
  white-space: nowrap;
}
.ios-badge--gray {
  background: rgba(17, 24, 39, 0.08);
  color: #374151;
}
.ios-card__actions {
  display: flex;
  gap: 16rpx;
}
.ios-btn {
  flex: 1;
  border-radius: 24rpx;
  padding: 18rpx 18rpx;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1;
}
.ios-btn[disabled] {
  opacity: 0.6;
}
.ios-btn--primary {
  color: #ffffff;
}
.ios-btn--secondary {
  background: rgba(17, 24, 39, 0.06);
  color: #111827;
}
.ios-btn--tertiary {
  background: transparent;
  color: #6b7280;
}
.ios-btn:active {
  transform: scale(0.99);
  opacity: 0.92;
}
.ios-sheet__header {
  padding: 6rpx 10rpx 10rpx;
}
.ios-sheet__title {
  font-size: 32rpx;
  font-weight: 700;
  color: #111827;
}
.ios-sheet__meta {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #6b7280;
}
.ios-sheet__body {
  max-height: 60vh;
  padding: 10rpx 10rpx 0;
}
.ios-sheet__text {
  font-size: 26rpx;
  color: #374151;
  line-height: 1.7;
  padding-bottom: 10rpx;
}
.ios-sheet__footer {
  padding: 18rpx 10rpx 0;
  display: flex;
  gap: 14rpx;
}
.ios-quick-nav {
  display: flex;
  gap: 10rpx;
}
.ios-quick-nav-btn {
  width: 100%;
  padding: 16rpx 14rpx;
  font-size: 24rpx;
}
</style>
