<!-- 使用 type="home" 属性设置首页，其他页面不需要设置，默认为page；推荐使用json5，更强大，且允许注释 -->
<route lang="json5">
{

  style: {
    navigationBarTitleText: '老师选择页面',
  },
}
</route>

<script lang="ts" setup>
import { getStudentMsg } from '@/api/stdInfo'
import { cancelSelect, getSelectState, selectStudent } from '@/api/teaInfo'
import { getChooseCount } from '@/api/useraction'
import { useUserStore } from '@/store/user'

import PLATFORM from '@/utils/platform'

const userStore = useUserStore()
console.log(userStore.userInfo)

// 获取屏幕边界到安全区域距离
const safeAreaInsets = ref<any>(null)
const systemInfo = ref<any>(null)

// 表单数据
const activeTab = ref('first')
const scrollHeight = ref(0)
const majorList = ref<any[]>([])
const publicList = ref<any[]>([])
const showSubmitCard = ref(false)
const currentTeacher = ref('')
const selectedMentors = ref<any[]>([])
const priorityOptions = [
  { label: '一', value: 1 },
  { label: '二', value: 2 },
  { label: '三', value: 3 },
]
const priority = ref<number[]>([])
const isProgressPage = ref(true)
const answer = ref<any[]>([])
const teacherName = ref('')
const studentList = ref<any[]>([])
const firstList = ref<any[]>([])
const firstChoseStudentList = ref<any[]>([])
const secondList = ref<any[]>([])
const secondChoseStudentList = ref<any[]>([])
const thirdList = ref<any[]>([])
const thirdChoseStudentList = ref<any[]>([])
const currentStudent = ref<any>({})
const dialogVisible = ref(false)
const formattedDate = ref('')
const testDate = ref<any[]>([])

onLoad(async () => {
  const res: any = await getChooseCount(userStore.userInfo.username, userStore.userInfo.activityId)
  console.log(res)
  categorizeByPriority(res)
  // console.log(firstList.value)
  // console.log(secondList.value)
  // console.log(thirdList.value)
  // console.log('---------------------')

  // console.log(firstChoseStudentList.value)
  // console.log(secondChoseStudentList.value)
  // console.log(thirdChoseStudentList.value)

  //   teacherName.value = userStore.userInfo.username
  //   calculateScrollHeight()
  //   //   await fetchTimeData()
  //   //   await getChooseData(teacherName.value)

  //   // 获取当前日期并格式化为 yyyy-MM-ddTHH:mm:ss
  //   const currentDate = new Date()
  //   formattedDate.value = formatDate(currentDate)

  //   // 判断当前时间在哪个志愿区间
  //   const currentTime = new Date(formattedDate.value).getTime()

  //   if (testDate.value.length >= 3) {
  //     // 转换所有时间格式为统一格式
  //     const firstStart = new Date(testDate.value[0].begin.replace(' ', 'T')).getTime()
  //     const firstEnd = new Date(testDate.value[0].end.replace(' ', 'T')).getTime()

  //     const secondStart = new Date(testDate.value[1].begin.replace(' ', 'T')).getTime()
  //     const secondEnd = new Date(testDate.value[1].end.replace(' ', 'T')).getTime()

  //     const thirdStart = new Date(testDate.value[2].begin.replace(' ', 'T')).getTime()
  //     const thirdEnd = new Date(testDate.value[2].end.replace(' ', 'T')).getTime()

  //     if (currentTime >= firstStart && currentTime <= firstEnd) {
  //       activeTab.value = 'first'
  //     }
  //     else if (currentTime >= secondStart && currentTime <= secondEnd) {
  //       activeTab.value = 'second'
  //     }
  //     else if (currentTime >= thirdStart && currentTime <= thirdEnd) {
  //       activeTab.value = 'third'
  //     }
  //     else {
  //       uni.showToast({ title: '当前不在志愿选择时间段内', icon: 'none' })
  //     }
  //   }
})

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')

  // 使用 iOS 兼容的格式：yyyy-MM-ddTHH:mm:ss
  return `${year}-${month}-${day}T${hour}:${minute}:${second}`
}

// async function fetchTimeData() {
//   try {
//     const res = await cloudCallFunction('getTime')
//     const result = res as {
//       data: Array<{
//         TeaChooseTime: any
//         stdChooseTime: string
//       }>
//     }

//     testDate.value = Object.values(result.data[0].TeaChooseTime)
//   }
//   catch (error) {
//     console.log(error)
//   }
// }

// async function getChooseData(teacherName: string) {
//   try {
//     uni.showLoading({ title: '加载中...' })
//     const chooseRes = await cloudCallFunction('getChooseData', { mentor_name: teacherName })

//     const result = (chooseRes as { data: any[] }).data
//     majorList.value = result

//     // 提取学生ID并查询学生信息
//     const stdIds = result.map(item => item.std_id)

//     if (stdIds.length > 0) {
//       await getStudentData(stdIds)
//     }
//   }
//   catch (err) {
//     console.error('加载失败:', err)
//     uni.showToast({ title: '数据加载失败', icon: 'none' })
//   }
//   finally {
//     uni.hideLoading()
//   }
// }

// async function getStudentData(studentIDs: string[]) {
//   try {
//     const studentRes = await cloudCallFunction('getStudentData', { studentIDs })

//     const studentDataList = (studentRes as { data: any[] }).data

//     // 1. 合并数据到 majorList
//     const updatedMajorList = majorList.value.map((mentor) => {
//       const matchedStudent = studentDataList.find(student => student.studentId === mentor.std_id)

//       if (matchedStudent) {
//         return {
//           ...mentor,
//           studentInfo: {
//             name: matchedStudent.data.name,
//             gender: matchedStudent.data.gender,
//             studentId: matchedStudent.data.studentId,
//             grade: matchedStudent.data.grade,
//             class: matchedStudent.data.class,
//             phone: matchedStudent.data.phone,
//             qq: matchedStudent.data.qq,
//             wechat: matchedStudent.data.wechat,
//             gpa: matchedStudent.data.gpa,
//             direction: matchedStudent.data.direction,
//             portfolio: matchedStudent.data.portfolio,
//             resume: matchedStudent.data.resumeName,
//           },
//           mentor: matchedStudent.mentor,
//         }
//       }
//       return mentor
//     })

//     // 2. 更新数据
//     studentList.value = studentDataList
//     majorList.value = updatedMajorList

//     categorizeByPriority()
//   }
//   catch (error) {
//     console.error('获取学生数据失败:', error)
//     uni.showToast({ title: '加载学生信息失败', icon: 'none' })
//   }
// }

function calculateScrollHeight() {
  const query = uni.createSelectorQuery()
  query.select('.header').boundingClientRect()
  query.select('.footer').boundingClientRect()
  query.exec((res) => {
    const headerHeight = res[0].height
    const footerHeight = res[1].top
    scrollHeight.value = uni.getSystemInfoSync().windowHeight - headerHeight - footerHeight - 80
  })
}

function switchTab(e: any) {
  const targetTab = e.currentTarget.dataset.tab
  //   console.log(targetTab)
  activeTab.value = targetTab
  //   const currentTime = new Date(formattedDate.value).getTime()

  //   let isInTime = false

  //   if (targetTab === 'first' && testDate.value[0]) {
  //     const start = new Date(testDate.value[0].begin.replace(' ', 'T')).getTime()
  //     const end = new Date(testDate.value[0].end.replace(' ', 'T')).getTime()
  //     isInTime = currentTime >= start && currentTime <= end
  //   }
  //   else if (targetTab === 'second' && testDate.value[1]) {
  //     const start = new Date(testDate.value[1].begin.replace(' ', 'T')).getTime()
  //     const end = new Date(testDate.value[1].end.replace(' ', 'T')).getTime()
  //     isInTime = currentTime >= start && currentTime <= end
  //   }
  //   else if (targetTab === 'third' && testDate.value[2]) {
  //     const start = new Date(testDate.value[2].begin.replace(' ', 'T')).getTime()
  //     const end = new Date(testDate.value[2].end.replace(' ', 'T')).getTime()
  //     isInTime = currentTime >= start && currentTime <= end
  //   }

  //   if (isInTime) {
  //     activeTab.value = targetTab
  //   }
  //   else {
  //     uni.showToast({
  //       title: `不在${targetTab === 'first' ? '第一' : targetTab === 'second' ? '第二' : '第三'}志愿选择时间内`,
  //       icon: 'none',
  //       duration: 2000,
  //     })
  //   }
}

function viewDetail(studentId: string) {
  console.log(studentId)

  // if (student) {
  //   dialogVisible.value = true
  //   currentStudent.value = student.data
  // }
}

function handleCloseDialog() {
  dialogVisible.value = false
}

function hideTeacherForm() {
  currentTeacher.value = ''
}

async function toggleSelect(item: any) {
  console.log(item)

  // try {
  //   if (item.isChose) {
  //     const res = await cancelSelect({
  //       studentId: item.studentId,
  //       teacherId: userStore.userInfo.username,
  //       activityId: item.activityId,
  //     })
  //     console.log(item.studentId, item.teacherId, item.activityId)
  //     console.log(res)
  //   }
  //   else {
  //     const res = await selectStudent({
  //       studentId: item.studentId,
  //       teacherId: item.teacherId,
  //       activityId: item.activityId,
  //     })
  //     console.log(res)
  //   }
  //   item.isChose = !item.isChose
  // }
  // catch (error) {
  //   console.log(error)
  // }
}

function updateLocalData(_id: string, newStatus: boolean) {
  const index = majorList.value.findIndex(item => item._id === _id)
  if (index !== -1) {
    majorList.value[index].isChoose = newStatus
  }
}

function toggleSubmitCard() {
  showSubmitCard.value = !showSubmitCard.value
}

function changePriority(e: any) {
  const index = e.currentTarget.dataset.index
  const value = Number.parseInt(e.detail.value)
  priority.value[index] = value
}

function preventTouchMove() {

}

function closeCard() {
  showSubmitCard.value = false
}

// async function handleSubmit() {
//   if (selectedMentors.value.length !== 3) {
//     uni.showToast({
//       title: '请选择 3 位导师',
//       icon: 'none',
//       duration: 2000,
//     })
//     return
//   }

//   if (priority.value.length !== 3 || priority.value.some(p => p === undefined || p === null)) {
//     uni.showToast({
//       title: '请为所有导师设置志愿顺序',
//       icon: 'none',
//       duration: 2000,
//     })
//     return
//   }

//   const submitValue = selectedMentors.value.map((mentor, index) => ({
//     ...mentor,
//     priority: priority.value[index],
//     teacher_name: teacherName.value,
//   }))

//   try {
//     uni.showLoading({ title: '提交中...', mask: true })
//     await cloudCallFunction('submitMentorChoices', { choices: submitValue })
//     uni.hideLoading()
//     uni.showToast({ title: '提交成功', icon: 'success' })
//     uni.navigateTo({ url: '/pages/ambition/index' })
//   }
//   catch (err) {
//     uni.hideLoading()
//     uni.showToast({ title: '提交失败，请重试', icon: 'none' })
//   }
// }

async function categorizeByPriority(res: any) {
  const firstListTemp: any[] = []
  const secondListTemp: any[] = []
  const thirdListTemp: any[] = []

  const request = res.map(async (item) => {
    try {
      const response = await getStudentMsg(item.studentId)
      const chooseState: any = await getSelectState({
        studentId: item.studentId,
        // teacherId: item.teacherId,
        activityId: item.activityId,
      })
      // console.log(chooseState)
      // console.log(chooseState.length)
      if (chooseState.length > 0) {
        return {
          ...item,
          isChose: true,
          finalTeacher: chooseState[0].teacherId,
          data: response.data,
        }
      }
      else {
        return {
          ...item,
          isChose: false,
          finalTeacher: '',
          data: response.data,
        }
      }
    }
    catch (error) {
      console.error('获取学生数据失败:', error)
      return {
        ...item,
        data: {
          name: '数据异常',
          gender: '',
          class: '',
          grade: '',
        },
      }
    }
  })

  const processedData = await Promise.all(request)
  console.log(processedData)

  processedData.forEach((item) => {
    // // 确保数据结构稳定
    // const standardizedItem = {
    //   ...item,
    //   data: {
    //     name: String(item.data.name || ''),
    //     gender: ['男', '女'].includes(item.data.gender) ? item.data.gender : '未知',
    //     class: item.data.class ? `班级 ${item.data.class}` : '未分班',
    //     grade: item.data.grade ? `${item.data.grade}级` : '未设置',
    //   },
    // }
    // console.log(processedData)

    // 分配优先级
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

  // 响应式更新
  firstList.value = firstListTemp
  secondList.value = secondListTemp
  thirdList.value = thirdListTemp
  console.log(firstListTemp, secondListTemp, thirdListTemp)
}

function navigateToMyChoices() {
  uni.navigateTo({
    url: '/pages/myStudent/index',
  })
}
</script>

<template>
  <view class="bg-white px-4 pt-2" :style="{ marginTop: `${safeAreaInsets?.top}px` }">
    <!-- 选项卡 -->
    <view class="header">
      <view class="tabs flex">
        <view
          class="flex-1 py-5 text-center tab"
          :class="activeTab === 'first' ? 'text-green-500 border-b-4 border-green-500' : 'text-gray-500'"
          data-tab="first" @click="switchTab"
        >
          第一志愿
        </view>
        <view
          class="flex-1 py-5 text-center tab"
          :class="activeTab === 'second' ? 'text-green-500 border-b-4 border-green-500' : 'text-gray-500'"
          data-tab="second" @click="switchTab"
        >
          第二志愿
        </view>
        <view
          class="flex-1 py-5 text-center tab"
          :class="activeTab === 'third' ? 'text-green-500 border-b-4 border-green-500' : 'text-gray-500'"
          data-tab="third" @click="switchTab"
        >
          第三志愿
        </view>
      </view>
      <!-- 列表标题 -->
      <view class="listTitles flex">
        <view class="listTitle flex-1 py-5 text-center text-sm text-gray-500">
          姓名
        </view>
        <view class="listTitle flex-1 py-5 text-center text-sm text-gray-500">
          班级
        </view>
        <view class="listTitle flex-1 py-5 pr-4 text-center text-sm text-gray-500">
          年级
        </view>
        <view class="listTitle1 flex-1 py-5 pr-5 text-center text-sm text-gray-500">
          操作
        </view>
      </view>
    </view>
    <!-- <student-dialog id="student-dialog" :visible="dialogVisible" :info="currentStudent" @close="handleCloseDialog" /> -->
    <!-- 可滚动的内容区域 -->
    <scroll-view scroll-y :style="{ height: `500px` }">
      <!-- 第一志愿列表 -->
      <template v-if="activeTab === 'first'">
        <view v-for="item in firstList" :key="item._id" class="list-item flex items-center justify-center">
          <view class="list-item1 flex-1 text-center">
            {{ item.data?.name || '未设置名字' }}
            {{ item.data.gender === '男' ? '男' : '女' }}
          </view>
          <view class="list-item2 flex-1 text-center">
            {{ item.data.classNum || '未设置班级' }}
          </view>
          <view class="list-item3 flex-1 text-center">
            {{ item.data.grade || '未设置年级' }}
          </view>
          <view class="action-buttons flex-1.3 flex">
            <button
              class="btn-detail rounded bg-gray-100 px-4 py-1 text-xs text-gray-800" size="mini"
              :data-id="item.std_id" @click="viewDetail(item.data.studentId)"
            >
              查看
            </button>
            <button
              size="mini" class="btn-select ml-2 rounded px-4 py-1 text-xs" :class="{
                'bg-green-500 text-white': item.isChose,
                'bg-gray-800 text-gray-500': item.finalTeacher && item.finalTeacher !== item.teacherId,
                'bg-gray-100 text-gray-800': !item.isChose && (!item.finalTeacher || item.finalTeacher === item.teacherId),
              }" :data-id="item._id" :data-is-choose="item.isChose"
              :disabled="item.finalTeacher.length > 0 && item.finalTeacher !== item.teacherId" @click="toggleSelect(item)"
            >
              {{ item.finalTeacher === item.teacherId ? '已选' : (item.finalTeacher.length > 0 && item.finalTeacher !== item.teacherId) ? '被选走' : '未选' }}
            </button>
          </view>
        </view>
        <view v-if="firstList.length === 0" class="empty-tip h-15 flex items-center justify-center bg-gray-300">
          暂无第一志愿学生
        </view>
      </template>

      <!-- 第二志愿列表 -->
      <template v-if="activeTab === 'second'">
        <view v-for="item in secondList" :key="item.std_id" class="list-item flex items-center justify-center">
          <view class="list-item1 flex-1 text-center">
            {{ item.data.name }}
            {{ item.data.gender === '男' ? '男' : '女' }}
          </view>
          <view class="list-item2 flex-1 text-center">
            {{ item.data.classNum || '未设置班级' }}
          </view>
          <view class="list-item3 flex-1 text-center">
            {{ item.data.grade || '未设置年级' }}
          </view>
          <view class="action-buttons flex-1.3 flex">
            <button
              class="btn-detail rounded bg-gray-100 px-4 py-1 text-xs text-gray-800" size="mini"
              :data-id="item.std_id" @click="viewDetail"
            >
              查看
            </button>
            <button
              size="mini" class="btn-select ml-2 rounded px-4 py-1 text-xs" :class="{
                'bg-green-500 text-white': item.isChose,
                'bg-gray-800 text-gray-500': item.finalTeacher && item.finalTeacher !== item.teacherId,
                'bg-gray-100 text-gray-800': !item.isChose && (!item.finalTeacher || item.finalTeacher === item.teacherId),
              }" :data-id="item._id" :data-is-choose="item.isChose"
              :disabled="item.finalTeacher.length > 0 && item.finalTeacher !== item.teacherId" @click="toggleSelect(item)"
            >
              {{ item.finalTeacher === item.teacherId ? '已选' : (item.finalTeacher.length > 0 && item.finalTeacher !== item.teacherId) ? '被选走' : '未选' }}
            </button>
          </view>
        </view>
        <view v-if="secondList.length === 0" class="empty-tip h-15 flex items-center justify-center bg-gray-300">
          暂无第二志愿学生
        </view>
      </template>

      <!-- 第三志愿列表 -->
      <template v-if="activeTab === 'third'">
        <view v-for="item in thirdList" :key="item.std_id" class="list-item flex items-center justify-center">
          <view class="list-item1 flex-1 text-center">
            {{ item.data.name }}
            {{ item.data.gender === '男' ? '男' : '女' }}
          </view>
          <view class="list-item2 flex-1 text-center">
            {{ item.data.class || '未设置班级' }}
          </view>
          <view class="list-item3 flex-1 text-center">
            {{ item.data.grade || '未设置年级' }}
          </view>
          <view class="action-buttons flex-1.3 flex">
            <button
              class="btn-detail rounded bg-gray-100 px-4 py-1 text-xs text-gray-800" size="mini"
              :data-id="item.std_id" @click="viewDetail"
            >
              查看
            </button>
            <button
              size="mini" class="btn-select ml-2 rounded px-4 py-1 text-xs" :class="{
                'bg-green-500 text-white': item.isChose,
                'bg-gray-800 text-gray-500': item.finalTeacher && item.finalTeacher !== item.teacherId,
                'bg-gray-100 text-gray-800': !item.isChose && (!item.finalTeacher || item.finalTeacher === item.teacherId),
              }" :data-id="item._id" :data-is-choose="item.isChose"
              :disabled="item.finalTeacher.length > 0 && item.finalTeacher !== item.teacherId" @click="toggleSelect(item)"
            >
              {{ item.finalTeacher === item.teacherId ? '已选' : (item.finalTeacher.length > 0 && item.finalTeacher !== item.teacherId) ? '被选走' : '未选' }}
            </button>
          </view>
        </view>
        <view v-if="thirdList.length === 0" class="empty-tip h-15 flex items-center justify-center bg-gray-300">
          暂无第三志愿学生
        </view>
      </template>
    </scroll-view>

    <!-- 老师信息表单弹层 -->
    <view
      v-if="currentTeacher"
      class="form-modal fixed inset-0 z-999 flex items-center justify-center bg-black bg-opacity-50"
      @click="hideTeacherForm"
    >
      <view class="form-container h-full w-full" @click.stop="hideTeacherForm">
        <image
          class="teacher-avatar h-full w-full object-contain" :src="`/assets/teachers/${currentTeacher}.png`"
          mode="aspectFit"
        />
      </view>
    </view>

    <!-- 弹出的卡片 -->
    <view
      class="submit-card fixed left-0 right-0 z-1000 rounded-t-6 bg-white px-8 py-6 shadow-md transition-all duration-300"
      :class="showSubmitCard ? 'bottom-0' : 'bottom--100%'" @touchmove.prevent="preventTouchMove"
    >
      <view class="card-header mb-8 flex items-center justify-between">
        <text class="student-list-text flex-1 text-left text-xl font-bold">
          选择学生列表
        </text>
        <button class="close-btn m-0 h-15 w-15 bg-transparent p-0 text-2xl text-gray-500 leading-15" @click="closeCard">
          ×
        </button>
      </view>
      <view>第一志愿学生:{{ firstChoseStudentList.length }}</view>
      <view>第二志愿学生:{{ secondChoseStudentList.length }}</view>
      <view>第三志愿学生:{{ thirdChoseStudentList.length }}</view>
    </view>

    <!-- 遮罩层 -->
    <view v-if="showSubmitCard" class="mask fixed inset-0 z-999 bg-black bg-opacity-50" @click="toggleSubmitCard" />

    <view class="footer">
      <!-- 已选导师信息栏 -->
      <view
        class="selected-mentors-bar fixed bottom-18 left-0 right-0 z-50 h-10 flex items-center justify-between border-t border-gray-200 bg-gray-100 px-4"
      >
        <view class="selected-mentors-bar-mentors-info flex items-center whitespace-nowrap">
          <text class="info-text">
            已选学生总数：
          </text>
          <text
            v-if="firstChoseStudentList.length + secondChoseStudentList.length + thirdChoseStudentList.length > 0"
            class="info-count"
          >
            {{ firstChoseStudentList.length + secondChoseStudentList.length
              + thirdChoseStudentList.length }}名
          </text>
          <text v-else class="info-empty">
            暂无选择
          </text>
        </view>
        <view class="selected-mentors-bar-submit-btn-container mt-5">
          <button size="mini" class="bg-gray-100 active:bg-gray-200" @click="toggleSubmitCard">
            {{ showSubmitCard ? '收起' : '展开人数详情' }}
          </button>
        </view>
      </view>
      <!-- 底部固定导航栏 -->
      <view class="bottom-nav fixed bottom-0 left-0 right-0 z-100 flex border-t border-gray-200 bg-white p-3">
        <button
          class="nav-btn flex-1" :class="isProgressPage ? 'bg-gray-100 text-gray-500' : 'bg-blue-500 text-white'"
          @click="navigateToMyChoices"
        >
          我的学生
        </button>
        <button
          class="nav-btn ml-2 flex-1"
          :class="isProgressPage ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'"
        >
          查看选择情况
        </button>
      </view>
    </view>
  </view>
</template>
