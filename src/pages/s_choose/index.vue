<route lang="json5">
{
  layout: "default",
  style: {
    navigationBarTitleText: "选择页面",
    enablePullDownRefresh: true,
  },
}
</route>

<script lang="ts" setup>
import type { IRecommendTeacherItem } from '@/api/stdInfo'
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app'
// import { ref } from 'vue'
import { getStoredAccessToken } from '@/adapters/auth/uni-auth-session'
import { getRecommendTeachers, getTeachersForActivity, submitTeacherChoices } from '@/api/stdInfo'
import {
  getActivityDetail,
  getChooseCountWithActivityId,
} from '@/api/useraction'
import TeacherCard from '@/components/TeacherCard.vue'
import { useSafeArea } from '@/composables/useSafeArea'
import { SUBSCRIBE_TEMPLATE_ID } from '@/constants/config'
import { IOS_BLUE } from '@/constants/theme'
import { useUserStore } from '@/store/user'
import { getEnvBaseUrl } from '@/utils'

const store = useUserStore()
const safeAreaInsets = useSafeArea()

const localhost = getEnvBaseUrl()

// 数据定义
const activeTab = ref('major') // 当前激活的选项卡
const showSubmitCard = ref(false) // 是否显示提交卡片
const scrollHeight = ref(0) // 滚动区域高度
const tabbar = ref('s_choose')

const navItems = [
  { name: 'index', label: '首页' },
  { name: 'myAmbition', label: '我的志愿' },
  { name: 's_choose', label: '选择页面' },
]

function handleTabChange(name: string) {
  if (name === 'index') {
    uni.redirectTo({ url: '/pages/index/index' })
  }
  else if (name === 'myAmbition') {
    uni.redirectTo({ url: '/pages/myAmbition/index' })
  }
  else if (name === 's_choose') {
    uni.showToast({ title: '在此页面中', icon: 'none', duration: 1000 })
  }
}

// 志愿列表
const majorList = ref<any[]>([])
const publicList = ref<any[]>([])
const peopleList = ref<any[]>([])

const selectedMentors = ref<Array<any>>([]) // 已选导师列表
const priority = ref<number[]>([]) // 志愿优先级
const priorityOptions = ref([
  { label: '第一志愿', value: 1 },
  { label: '第二志愿', value: 2 },
  { label: '第三志愿', value: 3 },
])

// 志愿是否重复判断
const duplicates = ref()
// 当前活动的选择时间
const currentActivityTime = ref({
  stdChooseStartDate: new Date(),
  stdChooseEndDate: new Date(),
})

const imageUrl = ref('') // 存储图片URL
const showTeacherSheet = ref(false)
const currentTeacher = ref<any | null>(null)

// 提交防重复
const submitting = ref(false)

// AI 推荐相关
const showRecommendPopup = ref(false)
const recommendLoading = ref(false)
const recommendList = ref<IRecommendTeacherItem[]>([])
const recommendError = ref('')

const currentList = computed(() => {
  if (activeTab.value === 'major')
    return majorList.value
  if (activeTab.value === 'public')
    return publicList.value
  return peopleList.value
})

const emptyText = computed(() => {
  if (activeTab.value === 'major')
    return '暂无专业导师数据'
  if (activeTab.value === 'public')
    return '暂无公共导师数据'
  return '暂无校友导师数据'
})

// 计算滚动区域高度（预留顶部标题区 + 底部信息栏 + 底部导航栏）
function calculateScrollHeight() {
  const systemInfo = uni.getSystemInfoSync()
  const topArea = safeAreaInsets.top + 260
  const bottomArea = 16 + 64 + (safeAreaInsets.bottom || 16)
  scrollHeight.value = systemInfo.windowHeight - topArea - bottomArea
}

// 切换选项卡
function switchTab(tab: string) {
  activeTab.value = tab
}

function previewResumeImage() {
  if (imageUrl.value) {
    uni.previewImage({ urls: [imageUrl.value], current: imageUrl.value })
  }
}

async function viewDetail(data: any) {
  currentTeacher.value = data
  showTeacherSheet.value = true
  try {
    const accessToken = getStoredAccessToken()
    // 使用uni.downloadFile直接下载图片文件
    const downloadResult = await uni.downloadFile({
      url: `${localhost}/api/teacher/getTeacherResume?teacherId=${encodeURIComponent(data.teacherId)}&activityId=${encodeURIComponent(store.userInfo.activityId!)}`,
      header: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (downloadResult.statusCode === 200) {
      imageUrl.value = downloadResult.tempFilePath
    }
    else {
      uni.showToast({ title: '未获取到导师简历', icon: 'none' })
    }
  }
  catch (error) {
    uni.showToast({ title: '获取导师简历失败', icon: 'none' })
  }
}

// 切换选择状态
function toggleSelect(teacherId: string) {
  // 首先在所有列表中查找导师
  let teacher: any = null
  let listToUpdate: any[] = []
  let index = -1

  // 检查专业导师列表
  index = majorList.value.findIndex(item => item.teacherId === teacherId)
  if (index !== -1) {
    teacher = majorList.value[index]
    listToUpdate = majorList.value
  }
  // 检查公共导师列表
  else {
    index = publicList.value.findIndex(item => item.teacherId === teacherId)
    if (index !== -1) {
      teacher = publicList.value[index]
      listToUpdate = publicList.value
    }
    // 检查校友导师列表
    else {
      index = peopleList.value.findIndex(
        item => item.teacherId === teacherId,
      )
      if (index !== -1) {
        teacher = peopleList.value[index]
        listToUpdate = peopleList.value
      }
    }
  }

  // 如果没有找到导师，直接返回
  if (index === -1 || !teacher) {
    console.warn(`未找到导师ID: ${teacherId}`)
    return
  }

  const wasSelected = teacher.selected

  // 仅在新增选择时检查数量限制
  if (!wasSelected && selectedMentors.value.length >= 3) {
    uni.showToast({
      title: '最多只能选3个导师',
      icon: 'none',
      duration: 1000,
    })
    return
  }

  // 原子化更新数据（不修改 number，因为实际选择还未提交到后端）
  const updatedList = [...listToUpdate]
  updatedList[index] = {
    ...teacher,
    selected: !wasSelected,
  }

  // 更新对应的列表
  if (listToUpdate === majorList.value) {
    majorList.value = updatedList
  }
  else if (listToUpdate === publicList.value) {
    publicList.value = updatedList
  }
  else if (listToUpdate === peopleList.value) {
    peopleList.value = updatedList
  }

  // 更新已选列表
  if (!wasSelected) {
    selectedMentors.value = [
      ...selectedMentors.value,
      {
        studentId: store.userInfo.username,
        teacherId: teacher.teacherId,
        activityId: store.userInfo.activityId!,
        name: teacher.name,
      },
    ]
  }
  else {
    // 移除导师并同步清除对应的志愿顺序（保持索引对齐）
    const removeIndex = selectedMentors.value.findIndex(
      item => item.teacherId === teacherId,
    )
    if (removeIndex !== -1) {
      selectedMentors.value.splice(removeIndex, 1)
      priority.value.splice(removeIndex, 1)
    }
  }
}

// 切换提交卡片显示状态
function toggleSubmitCard() {
  showSubmitCard.value = !showSubmitCard.value
}

// 改变志愿优先级
function changePriority(e: any, index: number) {
  priority.value[index] = Number(e.detail.value) + 1

  // 实时检查是否有重复
  duplicates.value = priority.value.filter(
    (p, i) => p !== undefined && priority.value.indexOf(p) !== i,
  )

  if (duplicates.value.length > 0) {
    uni.showToast({
      title: '志愿顺序不能重复！',
      icon: 'none',
    })
  }
}

// 提交志愿
// 请求微信小程序订阅消息授权
async function requestSubmitSubscribeMessage(): Promise<string> {
  let status = 'not_weixin'
  // #ifdef MP-WEIXIN
  try {
    const result: any = await uni.requestSubscribeMessage({
      tmplIds: [SUBSCRIBE_TEMPLATE_ID],
    })

    status = result[SUBSCRIBE_TEMPLATE_ID]

    if (status === 'accept') {
      uni.showToast({ title: '订阅授权成功', icon: 'none' })
    }
    else if (status === 'reject') {
      uni.showToast({ title: '你已拒绝订阅通知', icon: 'none' })
    }
    else if (status === 'ban') {
      uni.showToast({ title: '订阅已被微信拦截', icon: 'none' })
    }
  }
  catch (error: any) {
    console.warn('订阅消息授权请求失败:', error)
    uni.showToast({ title: error?.errMsg || '订阅授权调用失败', icon: 'none' })
    status = 'fail'
  }
  // #endif
  return status
}

async function confirmSubscribeBeforeSubmit(): Promise<string> {
  let result = 'not_weixin'
  // #ifdef MP-WEIXIN
  const modalRes = await uni.showModal({
    title: '结果通知',
    content: '是否开启活动结果提醒？开启后将在活动结束时通过服务通知推送。',
    confirmText: '开启提醒',
    cancelText: '暂不开启',
  })

  if (!modalRes.confirm) {
    return 'user_cancel'
  }

  result = await requestSubmitSubscribeMessage()
  // #endif
  return result
}

async function handleSubmit() {
  if (submitting.value)
    return
  submitting.value = true

  try {
    // 1.检查是否选了3个导师
    if (selectedMentors.value.length !== 3) {
      uni.showToast({ title: '提交失败!请选择3个导师后再次提交!', icon: 'none' })
      showSubmitCard.value = false
      return
    }
    // 2. 检查是否所有导师都设置了志愿
    if (
      priority.value.length !== 3
      || priority.value.some(p => p === undefined || p === null)
    ) {
      uni.showToast({
        title: '请为所有导师设置志愿顺序',
        icon: 'none',
        duration: 2000,
      })
      return
    }
    // 3.检查是否志愿重复
    if (duplicates.value.length > 0) {
      uni.showToast({
        title: '志愿顺序不能重复！',
        icon: 'none',
        duration: 2000,
      })
      return
    }
    const nowDate = new Date()
    const isIn
      = nowDate >= currentActivityTime.value.stdChooseStartDate
        && nowDate <= currentActivityTime.value.stdChooseEndDate
    if (!isIn) {
      uni.showToast({
        title: '当前不在活动时间内',
        icon: 'none',
        duration: 2000,
      })
      return
    }

    // 4-1.检查是否提交过志愿
    const isSubmit: any = await getChooseCountWithActivityId(
      store.userInfo.activityId!,
      store.userInfo.username,
    )
    if ((isSubmit.data || isSubmit).length > 0) {
      uni.showToast({
        title: '您已提交过志愿',
        icon: 'none',
        duration: 2000,
      })
      return
    }

    // 4-1.5 确认提交
    const { confirm } = await uni.showModal({
      title: '确认提交',
      content: '提交后不可更改，确定提交志愿吗？',
    })
    if (!confirm) {
      submitting.value = false
      return
    }

    // 4-2. 提交前先让用户确认是否开启提醒，再请求订阅授权（微信小程序）
    const subscribeStatus = await confirmSubscribeBeforeSubmit()

    // 4-3. 提交志愿
    const choices = selectedMentors.value.map((mentor, index) => ({
      teacherId: mentor.teacherId,
      order: priority.value[index],
    }))
    await submitTeacherChoices({
      activityId: store.userInfo.activityId!,
      studentId: store.userInfo.username,
      choices,
      subscribeStatus,
    })
    uni.showToast({
      title: '提交成功',
      icon: 'success',
      duration: 2000,
    })
    uni.redirectTo({ url: '/pages/myAmbition/index' })
  }
  catch (error: any) {
    console.error('选择失败:', error)
    uni.showToast({
      title: error?.data?.msg || '提交失败',
      icon: 'none',
      duration: 2000,
    })
  }
  finally {
    submitting.value = false
  }
}

// AI 推荐导师
async function handleAiRecommend() {
  recommendLoading.value = true
  recommendError.value = ''
  recommendList.value = []
  showRecommendPopup.value = true

  try {
    const res: any = await getRecommendTeachers(
      store.userInfo.activityId!,
      store.userInfo.username,
    )

    if (res.code === 200 && res.data && res.data.length > 0) {
      recommendList.value = res.data
    }
    else {
      recommendError.value = res.msg || '暂无推荐结果'
    }
  }
  catch (error: any) {
    console.error('AI 推荐失败:', error)
    recommendError.value = error?.data?.msg || error?.message || 'AI 推荐请求失败'
  }
  finally {
    recommendLoading.value = false
  }
}

async function loadData() {
  calculateScrollHeight()
  const activityId = store.userInfo.activityId!

  const [teachersRes, activityDetail]: any[] = await Promise.all([
    getTeachersForActivity(activityId),
    getActivityDetail(activityId),
  ])

  const activityData = activityDetail.data || activityDetail
  currentActivityTime.value.stdChooseEndDate = new Date(activityData.stdChooseEndDate)
  currentActivityTime.value.stdChooseStartDate = new Date(activityData.stdChooseStartDate)

  const teachers = teachersRes.data || teachersRes || []

  // 过滤已满员的导师，按类型分类
  majorList.value = []
  publicList.value = []
  peopleList.value = []

  teachers.forEach((t: any) => {
    if (
      !Number.isInteger(t.maxSelectNum)
      || t.maxSelectNum < 1
      || t.finalCount >= t.maxSelectNum
    ) {
      return
    }

    const item = {
      ...t,
      maxSelectedNum: t.maxSelectNum,
      selectedNum: t.finalCount,
      number: t.chooseCount,
      selected: false,
    }
    switch (t.teacherType) {
      case '0':
        majorList.value.push(item)
        break
      case '1':
        publicList.value.push(item)
        break
      case '2':
        peopleList.value.push(item)
        break
    }
  })
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
  majorList.value = []
  publicList.value = []
  peopleList.value = []
  selectedMentors.value = []
  priority.value = []
  await loadData()
  uni.stopPullDownRefresh()
})
</script>

<template>
  <view class="ios-page s-choose-page" :style="{ paddingTop: `${safeAreaInsets.top}px` }">
    <view class="px-5 pt-6">
      <view class="ios-title">
        选择导师
      </view>
      <view class="ios-subtitle mt-2">
        选择 3 位导师，并设置志愿顺序后提交。
      </view>

      <!-- AI 推荐按钮 -->
      <button
        class="ios-btn ios-btn--primary mt-4 w-full"
        style="background-color: #AF52DE; font-size: 28rpx; padding: 18rpx 0"
        @tap="handleAiRecommend"
      >
        🤖 AI 智能推荐
      </button>

      <view class="ios-seg mt-6">
        <view
          class="ios-seg__item"
          :class="{ 'ios-seg__item--active': activeTab === 'major' }"
          :style="activeTab === 'major' ? { color: IOS_BLUE } : {}"
          @tap="switchTab('major')"
        >
          专业
        </view>
        <view
          class="ios-seg__item"
          :class="{ 'ios-seg__item--active': activeTab === 'public' }"
          :style="activeTab === 'public' ? { color: IOS_BLUE } : {}"
          @tap="switchTab('public')"
        >
          公共
        </view>
        <view
          class="ios-seg__item"
          :class="{ 'ios-seg__item--active': activeTab === 'alumni' }"
          :style="activeTab === 'alumni' ? { color: IOS_BLUE } : {}"
          @tap="switchTab('alumni')"
        >
          校友
        </view>
      </view>
    </view>

    <scroll-view
      scroll-y
      class="s-choose-scroll px-5 pb-4 pt-5"
      :style="{ height: `${scrollHeight}px` }"
    >
      <view
        v-if="currentList.length === 0"
        class="py-10 text-center text-[26rpx] text-[#6B7280]"
      >
        {{ emptyText }}
      </view>
      <TeacherCard
        v-for="item in currentList"
        :key="item.teacherId"
        :teacher="item"
        @view-detail="viewDetail"
        @toggle-select="toggleSelect"
      />
    </scroll-view>

    <!-- 已选导师信息栏 -->
    <view
      v-show="!showRecommendPopup && !showTeacherSheet"
      class="selected-mentors-bar fixed bottom-14 left-0 right-0 z-50 h-16 flex items-center justify-between border-t border-gray-200 bg-[#F2F2F7] px-5"
    >
      <view class="selected-mentors-bar-mentors-info flex items-center">
        <text class="text-[24rpx] text-[#6B7280]">
          已选导师：
        </text>
        <text
          v-if="selectedMentors.length > 0"
          class="ml-2 text-[26rpx] text-[#111827] font-700"
        >
          {{ selectedMentors.length }}位
        </text>
        <text v-else class="ml-2 text-[26rpx] text-[#9CA3AF]">
          暂无选择
        </text>
      </view>
      <view class="selected-mentors-bar-submit-btn-container">
        <button
          class="ios-btn ios-btn--secondary"
          style="padding: 14rpx 18rpx; font-size: 26rpx"
          @tap="toggleSubmitCard"
        >
          {{ showSubmitCard ? "收起" : "展开提交" }}
        </button>
      </view>
    </view>

    <!-- 底部固定导航栏 -->
    <view
      v-show="!showRecommendPopup && !showTeacherSheet"
      class="ios-bottom-nav fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-3 py-4"
      :style="{ paddingBottom: `${safeAreaInsets.bottom + 16}px` }"
    >
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

    <!-- 提交卡片 -->
    <view
      class="submit-card fixed left-0 right-0 z-50 bg-white p-4 shadow-lg transition-all duration-300"
      :class="{ 'bottom-0': showSubmitCard, '-bottom-full': !showSubmitCard }"
      @touchmove.prevent
    >
      <view class="ios-sheet__handle" />
      <view class="card-header mb-4 flex items-center justify-between px-1">
        <text class="text-[30rpx] text-[#111827] font-700">
          设置志愿顺序
        </text>
      </view>
      <view class="card-content">
        <view
          v-for="(item, index) in selectedMentors"
          :key="item.id"
          class="mentor-item border-b border-gray-100 py-3"
        >
          <text class="mentor-name">
            {{ item.name }}
          </text>
          <picker
            mode="selector"
            :range="priorityOptions"
            range-key="label"
            :value="priority[index] ? priority[index] - 1 : -1"
            class="priority-picker mt-2 block border border-gray-200 rounded p-2"
            @change="(e) => changePriority(e, index)"
          >
            <view class="picker" :class="priority[index] ? 'text-[#111827]' : 'text-[#9CA3AF]'">
              {{
                priority[index] ? priorityOptions[priority[index] - 1]?.label : "请选择志愿顺序"
              }}
            </view>
          </picker>
        </view>
      </view>
      <button
        class="ios-btn ios-btn--primary mt-6 w-full"
        @tap="handleSubmit"
      >
        确认提交
      </button>
    </view>

    <!-- 遮罩层 -->
    <view
      v-if="showSubmitCard"
      class="mask fixed bottom-0 left-0 right-0 top-0 z-40 bg-black bg-opacity-50"
      @tap="toggleSubmitCard"
    />
  </view>
  <!-- 导师详情 sheet -->
  <wd-popup
    v-model="showTeacherSheet"
    custom-style="border-radius:40rpx;"
    position="bottom"
  >
    <view class="ios-sheet">
      <view class="ios-sheet__handle" />
      <view class="px-3 pb-2">
        <view class="text-[32rpx] text-[#111827] font-700">
          {{ currentTeacher?.name || "导师详情" }}
        </view>
        <view class="mt-2 text-[24rpx] text-[#6B7280]">
          查看简历后可关闭返回选择。
        </view>
      </view>
      <view v-if="imageUrl" class="px-3 pb-4">
        <image
          :src="imageUrl"
          mode="widthFix"
          class="w-full"
          style="border-radius: 24rpx"
          @tap="previewResumeImage"
        />
      </view>
      <view class="flex flex-col gap-3 px-3 pt-2">
        <button
          class="ios-btn ios-btn--secondary"
          @tap="showTeacherSheet = false"
        >
          关闭
        </button>
      </view>
    </view>
  </wd-popup>

  <!-- AI 推荐结果弹窗 -->
  <wd-popup
    v-model="showRecommendPopup"
    custom-style="border-radius:40rpx;"
    position="bottom"
  >
    <view class="ios-sheet">
      <view class="ios-sheet__handle" />
      <view class="px-3 pb-2">
        <view class="text-[32rpx] text-[#111827] font-700">
          🤖 AI 推荐导师
        </view>
        <view class="mt-2 text-[24rpx] text-[#6B7280]">
          基于你的方向和实时竞争数据，智能推荐志愿组合
        </view>
      </view>

      <!-- 加载中 -->
      <view v-if="recommendLoading" class="px-3 py-8 text-center">
        <view class="text-[28rpx] text-[#6B7280]">
          正在分析中...
        </view>
      </view>

      <!-- 错误提示 -->
      <view v-else-if="recommendError" class="px-3 py-8 text-center">
        <view class="text-[28rpx] text-[#FF3B30]">
          {{ recommendError }}
        </view>
      </view>

      <!-- 推荐结果列表 -->
      <view v-else class="px-3 pb-4">
        <view
          v-for="(item, index) in recommendList"
          :key="item.teacherId"
          class="ios-card mb-3"
          style="padding: 24rpx"
        >
          <view class="flex items-center justify-between">
            <view class="flex items-center gap-2">
              <view
                class="h-[48rpx] w-[48rpx] flex items-center justify-center rounded-full text-[24rpx] text-white font-700"
                :style="{
                  backgroundColor: index === 0 ? '#FF9500' : index === 1 ? '#8E8E93' : '#34C759',
                }"
              >
                {{ index + 1 }}
              </view>
              <view class="text-[30rpx] text-[#111827] font-600">
                {{ item.name }}
              </view>
            </view>
            <view
              class="rounded-full px-2 py-1 text-[22rpx] font-600"
              :class="index < 2 ? 'bg-[#007AFF]/10 text-[#007AFF]' : 'bg-[#34C759]/10 text-[#34C759]'"
            >
              {{ item.slot || `第${index + 1}志愿` }}
            </view>
          </view>
          <view class="mt-2 text-[24rpx] text-[#6B7280]">
            {{ item.reason || '综合评分推荐' }}
          </view>
          <view class="mt-1 text-[22rpx] text-[#9CA3AF]">
            综合分：{{ (item.matchScore * 100).toFixed(1) }}%
          </view>
        </view>
      </view>

      <view class="flex flex-col gap-3 px-3 pt-2">
        <button
          class="ios-btn ios-btn--secondary"
          @tap="showRecommendPopup = false"
        >
          关闭
        </button>
      </view>
    </view>
  </wd-popup>
</template>

<style scoped>
.s-choose-page {
  width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
}

.s-choose-scroll {
  width: auto;
  overflow-x: hidden;
  box-sizing: border-box;
}

.s-choose-scroll :deep(.uni-scroll-view-content) {
  width: 100%;
  scrollbar-width: none;
}

.s-choose-scroll :deep(button) {
  margin-left: 0;
  margin-right: 0;
}

.selected-mentors-bar,
.ios-bottom-nav,
.submit-card {
  box-sizing: border-box;
}
</style>

<style>
page:has(.s-choose-page) {
  height: 100%;
  overflow: hidden;
}
</style>
