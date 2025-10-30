<route lang="json5">
{
  style: {
    navigationBarTitleText: '志愿查看',
  }
}
</route>

<script lang="ts" setup>
import { getStudentFinalChoice } from '@/api/stdInfo'
import { getTeacherList } from '@/api/teaInfo'
import { getChooseCountWithActivityId } from '@/api/useraction'
import { useUserStore } from '@/store/user'

import PLATFORM from '@/utils/platform'

const userStore = useUserStore()

// 志愿列表
const list = ref<any[]>([])
const sortedList = ref<any[]>([])
const mentor = ref<string>('')
const isProgressPage = ref(false)

// 获取学生导师信息
async function getStudentMentor(std_id: string) {

}

// 加载志愿数据
async function loadVolunteerData() {

}

// 导航到选择页面
function navigateToProgress() {
  uni.navigateTo({ url: '/pages/s_choose/index' })
}

// 导航到我的志愿
function navigateToMyChoices() {
  uni.showToast({
    title: '在此页面中',
    icon: 'none',
    duration: 1000,
  })
}

onLoad(async () => {
  console.log(userStore.userInfo)

  const res: any = await getChooseCountWithActivityId(userStore.userInfo.activityId, userStore.userInfo.username)
  console.log(res)
  if (res.length === 0) {
    uni.showToast({
      title: '您还未选择志愿',
      icon: 'none',
      duration: 2000, // 增加持续时间
    })
  }
  res.sort((a: any, b: any) => a.order - b.order)
  const teacherList: any = await getTeacherList()
  console.log(teacherList)

  const teacherNameMap: Record<number, string> = {}
  teacherList.data.forEach((item) => {
    teacherNameMap[item.teacherId] = item.name
  })
  console.log(teacherNameMap)
  console.log(res)

  const finalChoice: any = await getStudentFinalChoice(userStore.userInfo.username, userStore.userInfo.activityId)
  console.log(finalChoice)
  sortedList.value = res.map(item => ({
    ...item,
    mentor_name: teacherNameMap[item.teacherId],
  }))
  if (finalChoice.data) {
    mentor.value = teacherNameMap[finalChoice.teacherId]
  }
})
</script>

<template>
  <view class="pb-30">
    <!-- 动态渲染志愿列表 -->
    <view v-for="(item, index) in ['第一志愿', '第二志愿', '第三志愿']" :key="index">
      <view class="bg-gray-200 text-6">
        {{ item }}
      </view>
      <view class="">
        {{ sortedList[index] ? sortedList[index].mentor_name : '未选择' }}
      </view>
    </view>

    <view v-if="mentor" class="mt-5 h-25 flex items-center justify-center bg-gray-300">
      导师：{{ mentor }}老师
    </view>
    <view v-else class="mt-5 h-25 flex items-center justify-center bg-gray-300">
      导师还在选择中...请稍等
    </view>

    <!-- 底部固定导航栏 -->
    <view class="bottom-nav fixed bottom-0 left-0 right-0 z-50 flex border-t border-gray-200 bg-white p-2">
      <button
        class="nav-btn mx-1 flex-1 rounded py-2"
        :class="isProgressPage ? 'bg-gray-200 text-gray-600' : 'bg-blue-500 text-white'"
        @tap="navigateToMyChoices"
      >
        我的志愿
      </button>
      <button
        class="nav-btn mx-1 flex-1 rounded py-2"
        :class="isProgressPage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'"
        @tap="navigateToProgress"
      >
        选择页面
      </button>
    </view>
  </view>
</template>
