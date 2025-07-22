<route lang="json5">
{
  style: {
    navigationBarTitleText: '我的学生',
  }
}
</route>

<script lang="ts" setup>
import { getSelectState } from '@/api/teaInfo'
import { useUserStore } from '@/store/user'

import PLATFORM from '@/utils/platform'

const userStore = useUserStore()
const scrollHeight = ref(0)
const studentList = ref<Array<any>>([])
const currentStudent = ref<any>(null)
const dialogVisible = ref(false)

const isProgressPage = ref(false)

function calculateScrollHeight() {
  const systemInfo = uni.getSystemInfoSync()
  const query = uni.createSelectorQuery()

  query.select('.header').boundingClientRect()
  query.select('.footer').boundingClientRect()

  query.exec((res) => {
    const headerHeight = res[0]?.height || 0
    const footerHeight = res[1]?.top || 0
    scrollHeight.value = systemInfo.windowHeight - headerHeight - footerHeight - 80
  })
}

async function getStudentData(name: string) {

}

function viewDetail(studentId: string) {
  console.log(studentId)

  // const student = studentList.value.find(item => item.studentId === studentId)
  // if (student) {
  //   currentStudent.value = student.data
  //   dialogVisible.value = true
  // }
}

function handleCloseDialog() {
  dialogVisible.value = false
}

function navigateToProgress() {
  uni.navigateTo({
    url: '/pages/t_choose/index',
  })
}

onLoad(async () => {
  const res: any = await getSelectState({
    teacherId: userStore.userInfo.username,
    activityId: userStore.userInfo.activityId,
  })
  console.log(res)
  studentList.value = res
  // calculateScrollHeight()
  // if (teacherName.value) {
  //   getStudentData(teacherName.value)
  // }
})
</script>

<template>
  <view class="bg-white">
    <view class="header">
      <!-- 列表标题 -->
      <view class="flex px-5">
        <view class="flex-1 py-5 text-center text-base text-gray-500">
          姓名
        </view>
        <view class="flex-1 py-5 text-center text-base text-gray-500">
          班级
        </view>
        <view class="flex-1 py-5 text-center text-base text-gray-500">
          年级
        </view>
        <view class="flex-1 py-5 text-center text-base text-gray-500">
          方向
        </view>
        <view class="flex-1 py-5 text-center text-base text-gray-500">
          操作
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="list-container" :style="{ height: `500px` }">
      <view v-for="item in studentList" :key="item._id" class="flex items-center justify-center">
        <view class="flex-1 text-center">
          {{ item.data.name }} {{ item.data.gender === '男' ? '男' : '女' }}
        </view>
        <view class="flex-1 text-center">
          {{ item.data.classNum || '未设置班级' }}
        </view>
        <view class="flex-1 text-center">
          {{ item.data.grade || '未设置年级' }}
        </view>
        <view class="flex-1 text-center">
          {{ item.data.direction || '未设置方向' }}
        </view>
        <view class="flex-1 text-center">
          <button
            class="rounded bg-gray-100 px-4 py-2 text-xs text-gray-800"
            size="mini"
            @click="viewDetail(item.studentId)"
          >
            查看详情
          </button>
        </view>
      </view>
    </scroll-view>

    <!-- Student Dialog Component -->
    <!-- You'll need to create a separate StudentDialog component -->
    <!-- <student-dialog :visible="dialogVisible" :info="currentStudent" @close="handleCloseDialog" /> -->

    <!-- 底部固定导航栏 -->
    <view class="bottom-nav fixed bottom-0 left-0 right-0 z-100 flex border-t border-gray-200 bg-white p-3">
      <button
        class="nav-btn flex-1" :class="isProgressPage ? 'bg-gray-100 text-gray-500' : 'bg-blue-500 text-white'"
      >
        我的学生
      </button>
      <button
        class="nav-btn ml-2 flex-1"
        :class="isProgressPage ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'"
        @click="navigateToProgress"
      >
        查看选择情况
      </button>
    </view>
  </view>
</template>
