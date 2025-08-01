<!-- 路由配置保持不变 -->
<route lang="json5">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '选择页面',
  },
}
</route>

<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app'
// import { ref } from 'vue'
import { getTeacherListInActivity, selectTeacher } from '@/api/stdInfo'
import { getTeacherList } from '@/api/teaInfo'
import { getActivityDetail, getChooseCount, getChooseCountWithActivityId } from '@/api/useraction'
import { useUserStore } from '@/store/user'

import PLATFORM from '@/utils/platform'

// 安全区域处理
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

const store = useUserStore()

// 数据定义
const activeTab = ref('major') // 当前激活的选项卡
const showSubmitCard = ref(false) // 是否显示提交卡片
const scrollHeight = ref(0) // 滚动区域高度
const isProgressPage = ref(true) // 是否是进度页面

// 志愿列表
const majorList = ref<any[]>([])
const publicList = ref<any[]>([])
const peopleList = ref<any[]>([])

const selectedMentors = ref<Array<any>>([]) // 已选导师列表
const priority = ref([]) // 志愿优先级
const priorityOptions = ref([
  { label: '第一志愿', value: 1 },
  { label: '第二志愿', value: 2 },
  { label: '第三志愿', value: 3 },
])

// 中本判断位
const isEight = ref<boolean>(false)
// 志愿是否重复判断
const duplicates = ref()
// 当前活动的选择时间
const currentActivityTime = ref({
  stdChooseStartDate: new Date(),
  stdChooseEndDate: new Date(),
})

// function formatDate(date: Date) {
//   const now = new Date()
//   const year = now.getFullYear()
//   const month = String(now.getMonth() + 1).padStart(2, '0')
//   const day = String(now.getDate()).padStart(2, '0')
//   const hours = String(now.getHours()).padStart(2, '0')
//   const minutes = String(now.getMinutes()).padStart(2, '0')
//   const seconds = String(now.getSeconds()).padStart(2, '0')
//   return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
// }

// 计算滚动区域高度
function calculateScrollHeight() {
  const systemInfo = uni.getSystemInfoSync()
  scrollHeight.value = systemInfo.windowHeight - 200 // 减去头部高度
}

// 切换选项卡
function switchTab(tab: string) {
  activeTab.value = tab
}

// 查看导师详情
function viewDetail(id: string) {
  uni.showToast({ title: `查看导师${id}详情`, icon: 'none' })
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
      index = peopleList.value.findIndex(item => item.teacherId === teacherId)
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

  // 原子化更新数据
  const updatedList = [...listToUpdate]
  updatedList[index] = {
    ...teacher,
    selected: !wasSelected,
    number: wasSelected ? teacher.number - 1 : teacher.number + 1,
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
    selectedMentors.value = [...selectedMentors.value, {
      studentId: store.userInfo.username,
      teacherId: teacher.teacherId,
      activityId: store.userInfo.activityId,
      name: teacher.name,
    }]
  }
  else {
    selectedMentors.value = selectedMentors.value.filter(item => item.teacherId !== teacherId)
    // 同步清除对应志愿顺序
    const priorityIndex = priority.value.findIndex((_, i) =>
      selectedMentors.value[i]?.teacherId === teacherId,
    )
    if (priorityIndex !== -1) {
      priority.value.splice(priorityIndex, 1)
    }
  }

  console.log('更新后的已选导师:', selectedMentors.value)
}

// 切换提交卡片显示状态
function toggleSubmitCard() {
  showSubmitCard.value = !showSubmitCard.value
}

// 关闭提交卡片
function closeCard() {
  showSubmitCard.value = false
}

// 改变志愿优先级
function changePriority(e: any, index: number) {
  priority.value[index] = Number(e.detail.value) + 1
  console.log(typeof e.detail.value)

  console.log(priority.value)
  // 实时检查是否有重复
  duplicates.value = priority.value.filter((p, i) =>
    p !== undefined && priority.value.indexOf(p) !== i,
  )

  if (duplicates.value.length > 0) {
    uni.showToast({
      title: '志愿顺序不能重复！',
      icon: 'none',
    })
  }
}

// 提交志愿
async function handleSubmit() {
  // uni.showToast({ title: '志愿提交成功', icon: 'success' })
  // showSubmitCard.value = false

  // 1.检查是否选了3个导师
  if (selectedMentors.value.length !== 3) {
    uni.showToast({ title: '提交失败!请选择3个导师后再次提交!', icon: 'none' })
    showSubmitCard.value = false
    return
  }
  // 2. 检查是否所有导师都设置了志愿
  if (priority.value.length !== 3 || priority.value.some(p => p === undefined || p === null)) {
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
  console.log(nowDate)
  const isIn = nowDate >= currentActivityTime.value.stdChooseStartDate
    && nowDate <= currentActivityTime.value.stdChooseEndDate
  console.log(isIn)
  if (!isIn) {
    uni.showToast({
      title: '当前不在活动时间内',
      icon: 'none',
      duration: 2000,
    })
    return
  }
  // // currentActivityTime.value.stdChooseStartDate = formatDate(currentActivityTime.value.stdChooseStartDate)
  // // currentActivityTime.value.stdChooseEndDate = new Date(currentActivityTime.value.stdChooseEndDate)
  // // console.log(currentActivityTime.value.stdChooseStartDate)
  // // console.log(currentActivityTime.value.stdChooseEndDate)

  // console.log(123)

  // 4-1.检查是否提交过志愿
  const isSubmit = await getChooseCountWithActivityId(store.userInfo.activityId, store.userInfo.username)
  if (isSubmit.length > 0) {
    uni.showToast({
      title: '您已提交过志愿',
      icon: 'none',
      duration: 2000,
    })
    return
  }
  console.log(priority.value)

  // 4-2. 提交志愿
  const submitData = selectedMentors.value.map((mentor, index) => ({
    activityId: store.userInfo.activityId,
    studentId: store.userInfo.username,
    teacherId: mentor.teacherId,
    order: priority.value[index],
    isChose: false,
    createTime: new Date().toString(),
  }))
  console.log(submitData)
  // 5. 提交数据
  try {
    for (const data of submitData) {
      const response = await selectTeacher(data)
      console.log('选择成功:', response)
    }
    uni.showToast({
      title: '提交成功',
      icon: 'success',
      duration: 2000,
    })
    uni.navigateTo({ url: '/pages/myAmbition/index' })
  }
  catch (error) {
    console.error('选择失败:', error)
    uni.showToast({
      title: error.data.msg,
      icon: 'none',
      duration: 2000,
    })
  }
}

// 导航到我的志愿
function navigateToMyChoices() {
  isProgressPage.value = true
  // uni.showToast({ title: '跳转到我的志愿页面', icon: 'none' })
  uni.navigateTo({ url: '/pages/myAmbition/index' })
}

// 导航到选择页面
function navigateToProgress() {
  isProgressPage.value = false
  uni.showToast({
    title: '在此页面中',
    icon: 'none',
    duration: 1000,
  })
}

// 阻止触摸移动
function preventTouchMove() {

}

onLoad(() => {
  calculateScrollHeight()
})
onLoad(async () => {
  const store = useUserStore()
  console.log(store.userInfo)
  // 中本判断
  if (store.userInfo.username[store.userInfo.username.length - 5] === '8') {
    isEight.value = true
  }

  const res: any = await getTeacherList()
  const teacherList: any = await getTeacherListInActivity(useUserStore().userInfo.activityId)
  // console.log(res.data)
  // console.log(teacherList)
  // 提取teacherList中所有的teacherId
  const existingTeacherIds = teacherList.map(teacher => teacher.teacherId)
  console.log(existingTeacherIds)

  // 过滤res.data，只保留存在于existingTeacherIds中的老师
  const filteredTeachers = res.data.filter(teacher =>
    existingTeacherIds.includes(teacher.teacherId),
  )
  const requests = filteredTeachers.map(async (teacher) => {
    try {
      // const response =
      const response: any = await getChooseCount(teacher.teacherId, useUserStore().userInfo.activityId)
      console.log(response)
      return {
        ...teacher,
        number: response.length,
        selected: false,
      }
    }
    catch (error) {
      console.error(`获取老师 ${teacher.name} 的选择学生数失败:`, error)
      // 如果请求失败，默认设为 0
      return {
        ...teacher,
        number: 0,
        selected: false,

      }
    }
  })
  const processedTeachers = await Promise.all(requests)

  // 根据teacherType分类数据
  majorList.value = []
  publicList.value = []
  peopleList.value = []

  processedTeachers.forEach((teacher) => {
    switch (teacher.teacherType) {
      case '0':
        majorList.value.push(teacher)
        break
      case '1':
        publicList.value.push(teacher)
        break
      case '2':
        peopleList.value.push(teacher)
        break
      default:
        console.warn(`未知的教师类型: ${teacher.teacherType}`, teacher)
    }
  })

  console.log('分类后的教师列表:', {
    majorList: majorList.value,
    publicList: publicList.value,
    peopleList: peopleList.value,
  })

  // 查询活动详情
  const res1: any = await getActivityDetail(useUserStore().userInfo.activityId)
  // console.log(res1)
  currentActivityTime.value.stdChooseEndDate = new Date(res1.stdChooseEndDate)
  currentActivityTime.value.stdChooseStartDate = new Date(res1.stdChooseStartDate)
  console.log(currentActivityTime.value)
})
</script>

<template>
  <view class="bg-white px-4" :style="{ marginTop: `${safeAreaInsets?.top}px` }">
    <!-- 头部选项卡 -->
    <view class="header">
      <view class="tabs flex border-b border-gray-200">
        <view
          v-for="tab in ['major', 'public', 'alumni']" :key="tab" class="flex-1 py-4 text-center transition-colors"
          :class="{
            'text-green-500 border-b-2 border-green-500 font-medium': activeTab === tab,
            'text-gray-500': activeTab !== tab,
          }" @tap="switchTab(tab)"
        >
          {{
            tab === 'major' ? '专业导师'
            : tab === 'public' ? '公共导师' : '校友导师'
          }}
        </view>
      </view>

      <!-- 列表标题 -->
      <view class="listTitles flex border-b border-gray-200 py-2">
        <view class="flex-1 text-center text-gray-600">
          导师
        </view>
        <view class="flex-1 text-center text-gray-600">
          已报名人数
        </view>
        <view class="flex-1 text-center text-gray-600">
          操作
        </view>
      </view>
    </view>

    <!-- 可滚动的内容区域 -->
    <scroll-view scroll-y class="list-container" :style="{ height: `${scrollHeight}px` }">
      <!-- 专业导师列表 -->
      <template v-if="activeTab === 'major'">
        <view
          v-for="item in majorList" :key="item.id"
          class="list-item flex items-center justify-center border-b border-gray-100 py-3"
        >
          <view class="list-item1 flex flex-1 items-center justify-center text-center">
            <image src="/static/icons/user.svg" class="mr-1 h-5 w-5" />
            {{ item.name }}
          </view>
          <view
            class="list-item2 flex-1 text-center" :class="{
              'text-blue-500': item.number < 18,
              'text-yellow-500': item.number >= 18 && item.number < 36,
              'text-red-500': item.number >= 36,
            }"
          >
            {{ item.number }}
            <text v-if="item.number >= 18 && item.number < 36">
              ⚠️
            </text>
            <text v-if="item.number >= 36">
              ❗
            </text>
          </view>
          <view class="action-buttons flex flex-1 justify-center space-x-2">
            <button class="btn-detail rounded bg-gray-100 px-3 py-1 text-sm text-gray-700" @tap="viewDetail(item.id)">
              查看
            </button>
            <button
              class="btn-select rounded px-3 py-1 text-sm text-white"
              :class="item.selected ? 'bg-gray-400' : 'bg-green-500'" @tap="toggleSelect(item.teacherId)"
            >
              {{ item.selected ? '已选' : '未选' }}
            </button>
          </view>
        </view>
        <view v-if="majorList.length === 0" class="empty-state h-40 flex items-center justify-center bg-gray-100">
          暂无专业导师数据
        </view>
      </template>

      <!-- 公共导师 -->
      <template v-else-if="activeTab === 'public'">
        <view
          v-for="item in publicList" :key="item.id"
          class="list-item flex items-center justify-center border-b border-gray-100 py-3"
        >
          <view class="list-item1 flex flex-1 items-center justify-center text-center">
            <image src="/static/icons/user.svg" class="mr-1 h-5 w-5" />
            {{ item.name }}
          </view>
          <view
            class="list-item2 flex-1 text-center" :class="{
              'text-blue-500': item.number < 18,
              'text-yellow-500': item.number >= 18 && item.number < 36,
              'text-red-500': item.number >= 36,
            }"
          >
            {{ item.number }}
            <text v-if="item.number >= 18 && item.number < 36">
              ⚠️
            </text>
            <text v-if="item.number >= 36">
              ❗
            </text>
          </view>
          <view class="action-buttons flex flex-1 justify-center space-x-2">
            <button class="btn-detail rounded bg-gray-100 px-3 py-1 text-sm text-gray-700" @tap="viewDetail(item.id)">
              查看
            </button>
            <button
              class="btn-select rounded px-3 py-1 text-sm text-white"
              :class="item.selected ? 'bg-gray-400' : 'bg-green-500'" @tap="toggleSelect(item.teacherId)"
            >
              {{ item.selected ? '已选' : '未选' }}
            </button>
          </view>
        </view>
        <view v-if="publicList.length === 0" class="empty-state h-40 flex items-center justify-center bg-gray-100">
          暂无公共导师数据
        </view>
      </template>

      <!-- 校友导师 -->
      <template v-else>
        <view
          v-for="item in peopleList" :key="item.id"
          class="list-item flex items-center justify-center border-b border-gray-100 py-3"
        >
          <view class="list-item1 flex flex-1 items-center justify-center text-center">
            <image src="/static/icons/user.svg" class="mr-1 h-5 w-5" />
            {{ item.name }}
          </view>
          <view
            class="list-item2 flex-1 text-center" :class="{
              'text-blue-500': item.number < 18,
              'text-yellow-500': item.number >= 18 && item.number < 36,
              'text-red-500': item.number >= 36,
            }"
          >
            {{ item.number }}
            <text v-if="item.number >= 18 && item.number < 36">
              ⚠️
            </text>
            <text v-if="item.number >= 36">
              ❗
            </text>
          </view>
          <view class="action-buttons flex flex-1 justify-center space-x-2">
            <button class="btn-detail rounded bg-gray-100 px-3 py-1 text-sm text-gray-700" @tap="viewDetail(item.id)">
              查看
            </button>
            <button
              class="btn-select rounded px-3 py-1 text-sm text-white"
              :class="item.selected ? 'bg-gray-400' : 'bg-green-500'" @tap="toggleSelect(item.teacherId)"
            >
              {{ item.selected ? '已选' : '未选' }}
            </button>
          </view>
        </view>
        <view v-if="peopleList.length === 0" class="empty-state h-40 flex items-center justify-center bg-gray-100">
          暂无校友导师数据
        </view>
      </template>
    </scroll-view>

    <!-- 已选导师信息栏 -->
    <view
      class="selected-mentors-bar fixed bottom-18 left-0 right-0 z-50 h-10 flex items-center justify-between border-t border-gray-200 bg-gray-100 px-4"
    >
      <view class="selected-mentors-bar-mentors-info flex items-center">
        <text class="text-sm text-gray-600">
          已选导师：
        </text>
        <text v-if="selectedMentors.length > 0" class="text-sm text-gray-800">
          {{ selectedMentors.length }}位
        </text>
        <text v-else class="text-sm text-gray-500">
          暂无选择
        </text>
      </view>
      <view class="selected-mentors-bar-submit-btn-container">
        <button class="rounded bg-gray-200 px-3 py-1 text-sm text-gray-700" @tap="toggleSubmitCard">
          {{ showSubmitCard ? '收起' : '展开提交' }}
        </button>
      </view>
    </view>

    <!-- 底部固定导航栏 -->
    <view class="bottom-nav fixed bottom-0 left-0 right-0 z-50 flex border-t border-gray-200 bg-white p-2">
      <button
        class="nav-btn mx-1 flex-1 rounded py-2"
        :class="isProgressPage ? 'bg-gray-200 text-gray-600' : 'bg-blue-500 text-white'" @tap="navigateToMyChoices"
      >
        我的志愿
      </button>
      <button
        class="nav-btn mx-1 flex-1 rounded py-2"
        :class="isProgressPage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'" @tap="navigateToProgress"
      >
        选择页面
      </button>
    </view>

    <!-- 提交卡片 -->
    <view
      class="submit-card fixed left-0 right-0 z-50 rounded-t-lg bg-white p-4 shadow-lg transition-all duration-300"
      :class="{ 'bottom-0': showSubmitCard, '-bottom-full': !showSubmitCard }" @touchmove="preventTouchMove"
    >
      <view class="card-header mb-4 flex items-center justify-between">
        <text class="font-bold">
          请选择志愿(点击选择)
        </text>
        <button class="close-btn text-xl text-gray-500" @tap="closeCard">
          ×
        </button>
      </view>
      <view class="card-content">
        <view v-for="(item, index) in selectedMentors" :key="item.id" class="mentor-item border-b border-gray-100 py-3">
          <text class="mentor-name">
            {{ item.name }}
          </text>
          <picker
            mode="selector" :range="priorityOptions" range-key="label" :value="priority[index] || 0"
            class="priority-picker mt-2 block border border-gray-200 rounded p-2"
            @change="(e) => changePriority(e, index)"
          >
            <view class="picker">
              {{ priorityOptions[priority[index] - 1]?.label || '未选择志愿顺序' }}
            </view>
          </picker>
        </view>
      </view>
      <button class="confirm-btn mt-6 w-full rounded bg-green-500 py-2 text-white" @tap="handleSubmit">
        确认提交
      </button>
    </view>

    <!-- 遮罩层 -->
    <view
      v-if="showSubmitCard" class="mask fixed bottom-0 left-0 right-0 top-0 z-40 bg-black bg-opacity-50"
      @tap="toggleSubmitCard"
    />
  </view>
</template>
