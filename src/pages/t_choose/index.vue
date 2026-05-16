<route lang="json5">
{
  style: {
    navigationBarTitleText: '老师选择页面',
    enablePullDownRefresh: true,
  },
}
</route>

<script lang="ts" setup>
import { cancelSelectAndUpdate, getChoosePageData, selectStudentAndUpdate } from '@/api/teaInfo'
import { useSafeArea } from '@/composables/useSafeArea'
import { IOS_BLUE } from '@/constants/theme'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const tabbar = ref('t_choose')

const safeAreaInsets = useSafeArea()

const activeTab = ref('first')
const scrollHeight = ref(0)

const firstList = ref<any[]>([])
const firstChoseStudentList = ref<any[]>([])
const secondList = ref<any[]>([])
const secondChoseStudentList = ref<any[]>([])
const thirdList = ref<any[]>([])
const thirdChoseStudentList = ref<any[]>([])
const dialogVisible = ref(false)
const isToggling = ref(false)

const currentStudent = ref<any>(null)
const selectedNum = ref(0)
const thisActivity = ref<any>(null)
const navItems = [
  { name: 'index', label: '首页' },
  { name: 'myStudent', label: '我的学生' },
  { name: 't_choose', label: '选择情况' },
]

const currentTabList = computed(() => {
  if (activeTab.value === 'first')
    return firstList.value
  if (activeTab.value === 'second')
    return secondList.value
  return thirdList.value
})

async function loadData() {
  calculateScrollHeight()
  const teacherId = userStore.userInfo.username
  const activityId = userStore.userInfo.activityId!

  const res: any = await getChoosePageData(teacherId, activityId)
  const pageData = res.data || res

  categorizeByPriority(pageData.students || [])
  firstChoseStudentList.value = firstList.value.filter(item => item.finalTeacher === item.teacherId)
  secondChoseStudentList.value = secondList.value.filter(item => item.finalTeacher === item.teacherId)
  thirdChoseStudentList.value = thirdList.value.filter(item => item.finalTeacher === item.teacherId)
  selectedNum.value = firstChoseStudentList.value.length + secondChoseStudentList.value.length + thirdChoseStudentList.value.length

  userStore.userInfo.maxSelectNum = pageData.maxSelectNum ?? 0

  thisActivity.value = pageData.activity || null
}

onLoad(async () => {
  try {
    uni.showLoading({ title: '加载中...' })
    await loadData()
  }
  catch (error) {
    uni.showToast({ title: '数据加载失败', icon: 'none' })
  }
  finally {
    uni.hideLoading()
  }
})

onPullDownRefresh(async () => {
  firstList.value = []
  firstChoseStudentList.value = []
  secondList.value = []
  secondChoseStudentList.value = []
  thirdList.value = []
  thirdChoseStudentList.value = []
  selectedNum.value = 0
  await loadData()
  uni.stopPullDownRefresh()
})

function calculateScrollHeight() {
  const sys = uni.getSystemInfoSync()
  const topArea = safeAreaInsets.top + 240
  const bottomArea = 28 + 64 + (safeAreaInsets.bottom || 16)
  scrollHeight.value = sys.windowHeight - topArea - bottomArea
}

function switchTab(e: any) {
  activeTab.value = e.currentTarget.dataset.tab
}

// 检查某个志愿 tab 是否在允许操作的时间范围内
function isInSelectTime(tabName: string): boolean {
  if (!thisActivity.value)
    return true
  const currentTime = new Date().getTime()
  let start = 0
  let end = 0
  if (tabName === 'first') {
    start = new Date(thisActivity.value.firstChooseStartDate).getTime()
    end = new Date(thisActivity.value.firstChooseEndDate).getTime()
  }
  else if (tabName === 'second') {
    start = new Date(thisActivity.value.secondChooseStartDate).getTime()
    end = new Date(thisActivity.value.secondChooseEndDate).getTime()
  }
  else if (tabName === 'third') {
    start = new Date(thisActivity.value.thirdChooseStartDate).getTime()
    end = new Date(thisActivity.value.thirdChooseEndDate).getTime()
  }
  return currentTime >= start && currentTime <= end
}

function viewDetail(data: any) {
  if (data) {
    dialogVisible.value = true
    currentStudent.value = data
  }
}

function handleCloseDialog() {
  dialogVisible.value = false
}

async function toggleSelect(item: any) {
  if (isToggling.value)
    return
  isToggling.value = true
  try {
    // #19: 时间检查仅在操作时生效，不限制查看
    const targetTab = item.order === 1 ? 'first' : item.order === 2 ? 'second' : 'third'
    if (!isInSelectTime(targetTab)) {
      const label = targetTab === 'first' ? '第一' : targetTab === 'second' ? '第二' : '第三'
      uni.showToast({ title: `不在${label}志愿选择时间内`, icon: 'none', duration: 2000 })
      return
    }

    if (item.isChose) {
      const confirmCancel = await new Promise<boolean>((resolve) => {
        uni.showModal({
          title: '确认取消',
          content: `确定不再选择学生「${item.data?.name || item.studentId}」吗？`,
          confirmText: '确定',
          cancelText: '再想想',
          success: res => resolve(!!res.confirm),
          fail: () => resolve(false),
        })
      })
      if (!confirmCancel)
        return

      await cancelSelectAndUpdate({
        studentId: item.studentId,
        teacherId: item.teacherId,
        activityId: item.activityId,
      })
      item.isChose = false
      item.finalTeacher = ''
      selectedNum.value--
    }
    else {
      const maxNum = userStore.userInfo.maxSelectNum ?? 0
      if (selectedNum.value >= maxNum) {
        uni.showToast({
          title: `已达到最大选择人数限制(${maxNum}人)`,
          icon: 'none',
        })
        return
      }

      await selectStudentAndUpdate({
        studentId: item.studentId,
        teacherId: item.teacherId,
        activityId: item.activityId,
        data: item.data,
        order: item.order,
      })
      item.isChose = true
      item.finalTeacher = userStore.userInfo.username
      selectedNum.value++
    }

    // 重新计算三个志愿学生列表
    firstChoseStudentList.value = firstList.value.filter(i => i.finalTeacher === i.teacherId)
    secondChoseStudentList.value = secondList.value.filter(i => i.finalTeacher === i.teacherId)
    thirdChoseStudentList.value = thirdList.value.filter(i => i.finalTeacher === i.teacherId)
  }
  catch (error) {
    uni.showToast({ title: '操作失败，请重试', icon: 'none' })
  }
  finally {
    isToggling.value = false
  }
}

function categorizeByPriority(list: any[]) {
  const firstListTemp: any[] = []
  const secondListTemp: any[] = []
  const thirdListTemp: any[] = []

  list.forEach((item) => {
    switch (item.order) {
      case 1:
        firstListTemp.push(item)
        break
      case 2:
        secondListTemp.push(item)
        break
      case 3:
        thirdListTemp.push(item)
        break
    }
  })

  firstList.value = firstListTemp
  secondList.value = secondListTemp
  thirdList.value = thirdListTemp
}

function handleTabChange(e: any) {
  if (e !== 't_choose') {
    uni.navigateTo({
      url: `/pages/${e}/index`,
    })
  }
}
</script>

<template>
  <view class="t-choose-page" :style="{ paddingTop: `${safeAreaInsets.top}px` }">
    <view class="px-5 pt-6">
      <view class="ios-title">
        学生选择
      </view>
      <view class="ios-subtitle mt-2">
        按志愿查看学生，并在允许时间内进行选择。
      </view>

      <view class="ios-seg mt-6">
        <view
          class="ios-seg__item"
          :class="{ 'ios-seg__item--active': activeTab === 'first' }"
          :style="activeTab === 'first' ? { color: IOS_BLUE } : {}"
          data-tab="first"
          @click="switchTab"
        >
          第一志愿
        </view>
        <view
          class="ios-seg__item"
          :class="{ 'ios-seg__item--active': activeTab === 'second' }"
          :style="activeTab === 'second' ? { color: IOS_BLUE } : {}"
          data-tab="second"
          @click="switchTab"
        >
          第二志愿
        </view>
        <view
          class="ios-seg__item"
          :class="{ 'ios-seg__item--active': activeTab === 'third' }"
          :style="activeTab === 'third' ? { color: IOS_BLUE } : {}"
          data-tab="third"
          @click="switchTab"
        >
          第三志愿
        </view>
      </view>
    </view>
    <!-- 使用学生信息弹窗组件 -->
    <StudentDialog :visible="dialogVisible" :info="currentStudent" @close="handleCloseDialog" />
    <!-- 可滚动的内容区域 -->
    <scroll-view scroll-y class="t-choose-scroll px-5 pb-4 pt-5" :style="{ height: `${scrollHeight}px` }">
      <view v-if="currentTabList.length === 0" class="py-10 text-center text-[26rpx] text-[#6B7280]">
        暂无{{ activeTab === 'first' ? '第一' : activeTab === 'second' ? '第二' : '第三' }}志愿学生
      </view>
      <view v-for="item in currentTabList" :key="item._id" class="ios-card mb-4" style="padding: 0;">
        <view class="ios-cell">
          <view class="flex-1">
            <view class="text-[28rpx] text-[#111827] font-700">
              {{ item.data?.name || '未设置名字' }}
              <text class="ml-2 text-[24rpx] text-[#6B7280] font-500">
                {{ item.data?.gender || '' }}
              </text>
            </view>
            <view class="mt-1 text-[24rpx] text-[#6B7280]">
              {{ item.data?.classNum || '未设置班级' }} · {{ item.data?.grade || '未设置年级' }}
            </view>
          </view>
        </view>
        <view class="ios-divider" style="margin-left: 28rpx;" />
        <view class="flex gap-3 px-4 pb-4 pt-3">
          <button class="ios-btn ios-btn--secondary flex-1" style="padding: 18rpx 18rpx; font-size: 28rpx;" @click="viewDetail(item.data)">
            查看
          </button>
          <button
            class="ios-btn flex-1"
            :class="item.finalTeacher === item.teacherId ? 'ios-btn--primary' : 'ios-btn--secondary'"
            style="padding: 18rpx 18rpx; font-size: 28rpx;"
            :disabled="item.finalTeacher.length > 0 && item.finalTeacher !== item.teacherId"
            @click="toggleSelect(item)"
          >
            {{ item.finalTeacher === item.teacherId ? '已选' : (item.finalTeacher.length > 0 && item.finalTeacher !== item.teacherId) ? '被选走' : '选择' }}
          </button>
        </view>
      </view>
    </scroll-view>

    <view class="footer">
      <!-- 已选学生信息栏 -->
      <view v-show="!dialogVisible" class="selected-mentors-bar fixed bottom-20 left-0 right-0 z-50 px-5">
        <view class="ios-card ios-selected-card">
          <view class="ios-selected-title-row">
            <view class="text-[24rpx] text-[#6B7280]">
              总计 已选学生
            </view>
            <view class="text-[32rpx] text-[#111827] font-700">
              {{ selectedNum }} 名
            </view>
          </view>
          <view class="ios-selected-breakdown">
            <text>第一志愿 {{ firstChoseStudentList.length }}</text>
            <text>第二志愿 {{ secondChoseStudentList.length }}</text>
            <text>第三志愿 {{ thirdChoseStudentList.length }}</text>
          </view>
        </view>
      </view>
      <!-- 底部固定导航栏 -->
      <view v-show="!dialogVisible" class="ios-bottom-nav fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-3 py-4" :style="{ paddingBottom: `${safeAreaInsets.bottom + 16}px` }">
        <button
          v-for="item in navItems"
          :key="item.name"
          class="ios-btn ios-bottom-nav-btn"
          :class="tabbar === item.name ? 'ios-btn--primary' : 'ios-btn--secondary'"
          @click="() => { tabbar = item.name; handleTabChange(item.name) }"
        >
          {{ item.label }}
        </button>
      </view>
    </view>
  </view>
</template>

<style>
page:has(.t-choose-page) {
  height: 100%;
  overflow: hidden;
}
</style>

<style scoped>
.t-choose-page {
  width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
}
.t-choose-scroll {
  width: auto;
  overflow-x: hidden;
  box-sizing: border-box;
}
.t-choose-scroll :deep(.uni-scroll-view-content) {
  width: 100%;
  scrollbar-width: none;
}
.ios-selected-card {
  padding: 18rpx 22rpx;
}
.ios-selected-title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.ios-selected-breakdown {
  margin-top: 8rpx;
  display: flex;
  gap: 60rpx;
  font-size: 23rpx;
  color: #6b7280;
}
</style>
