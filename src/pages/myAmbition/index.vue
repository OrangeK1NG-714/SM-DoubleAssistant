<route lang="json5">
{
  style: {
    navigationBarTitleText: '志愿查看',
    enablePullDownRefresh: true,
  }
}
</route>

<script lang="ts" setup>
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { getStudentFinalChoice } from '@/api/stdInfo'
import { getTeacherList } from '@/api/teaInfo'
import { getChooseCountWithActivityId } from '@/api/useraction'
import { useSafeArea } from '@/composables/useSafeArea'
import { useUserStore } from '@/store/user'

const safeAreaInsets = useSafeArea()

const userStore = useUserStore()

const sortedList = ref<any[]>([])
const mentor = ref<string>('')
const tabbar = ref('myAmbition')

const navItems = [
  { name: 'index', label: '首页' },
  { name: 'myAmbition', label: '我的志愿' },
  { name: 's_choose', label: '选择页面' },
]

function handleTabChange(name: string) {
  if (name === 'index') {
    uni.redirectTo({ url: '/pages/index/index' })
  }
  else if (name === 's_choose') {
    uni.navigateTo({ url: '/pages/s_choose/index' })
  }
  else if (name === 'myAmbition') {
    uni.showToast({ title: '在此页面中', icon: 'none', duration: 1000 })
  }
}

async function loadData() {
  const [resRaw, teacherList, finalChoice]: any = await Promise.all([
    getChooseCountWithActivityId(userStore.userInfo.activityId!, userStore.userInfo.username),
    getTeacherList(),
    getStudentFinalChoice(userStore.userInfo.username, userStore.userInfo.activityId!),
  ])

  const res = resRaw.data || resRaw
  if (res.length === 0) {
    uni.showToast({
      title: '您还未选择志愿',
      icon: 'none',
      duration: 2000,
    })
  }
  res.sort((a: any, b: any) => a.order - b.order)

  const teacherNameMap: Record<number, string> = {}
  teacherList.data.forEach((item) => {
    teacherNameMap[item.teacherId] = item.name
  })

  sortedList.value = res.map(item => ({
    ...item,
    mentor_name: teacherNameMap[item.teacherId],
  }))
  const finalData = finalChoice.data || finalChoice
  if (finalData) {
    mentor.value = teacherNameMap[finalData.teacherId]
  }
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
  sortedList.value = []
  mentor.value = ''
  await loadData()
  uni.stopPullDownRefresh()
})
</script>

<template>
  <view class="ios-page pb-30" :style="{ paddingTop: safeAreaInsets.top + 'px' }">
    <view class="px-5 pt-6">
      <view class="ios-title">
        我的志愿
      </view>
      <view class="ios-subtitle mt-2">
        查看已提交的志愿顺序与最终导师结果。
      </view>
    </view>

    <view class="px-5 pb-24 pt-6">
      <view class="ios-card">
        <view
          v-for="(label, index) in ['第一志愿', '第二志愿', '第三志愿']"
          :key="label"
          class="ios-cell"
        >
          <view class="ios-cell__label" style="width: 160rpx;">
            {{ label }}
          </view>
          <view class="ios-cell__content">
            <view class="text-[28rpx]" :class="sortedList[index] ? 'text-[#111827] font-600' : 'text-[#9CA3AF]'">
              {{ sortedList[index] ? sortedList[index].mentor_name : '未选择' }}
            </view>
          </view>
        </view>
      </view>

      <view class="ios-card mt-5" style="padding: 26rpx;">
        <view class="text-[24rpx] text-[#6B7280]">
          最终导师
        </view>
        <view v-if="mentor" class="mt-2 text-[32rpx] text-[#111827] font-700">
          {{ mentor }} 老师
        </view>
        <view v-else class="mt-2 text-[28rpx] text-[#6B7280]">
          结果生成中，请稍后再看
        </view>
      </view>
    </view>

    <!-- 底部固定导航栏 -->
    <view class="ios-bottom-nav fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-3 py-4" :style="{ paddingBottom: (safeAreaInsets.bottom + 16) + 'px' }">
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
</template>
