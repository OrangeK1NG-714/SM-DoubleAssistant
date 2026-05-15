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
import { IOS_BLUE } from '@/constants/theme'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

// 志愿列表
const list = ref<any[]>([])
const sortedList = ref<any[]>([])
const mentor = ref<string>('')
const isProgressPage = ref(false)

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

function navigateHome() {
  uni.navigateTo({
    url: '/pages/index/index',
  })
}

onLoad(async () => {
  try {
    const res: any = await getChooseCountWithActivityId(userStore.userInfo.activityId, userStore.userInfo.username)
    if (res.length === 0) {
      uni.showToast({
        title: '您还未选择志愿',
        icon: 'none',
        duration: 2000,
      })
    }
    res.sort((a: any, b: any) => a.order - b.order)
    const teacherList: any = await getTeacherList()

    const teacherNameMap: Record<number, string> = {}
    teacherList.data.forEach((item) => {
      teacherNameMap[item.teacherId] = item.name
    })

    const finalChoice: any = await getStudentFinalChoice(userStore.userInfo.username, userStore.userInfo.activityId)
    sortedList.value = res.map(item => ({
      ...item,
      mentor_name: teacherNameMap[item.teacherId],
    }))
    if (finalChoice.data) {
      mentor.value = teacherNameMap[finalChoice.teacherId]
    }
  }
  catch (error) {
    uni.showToast({ title: '数据加载失败', icon: 'none' })
  }
})
</script>

<template>
  <view class="ios-page pb-30">
    <view class="px-5 pt-6">
      <view class="ios-header-row">
        <view class="ios-header-main">
          <view class="ios-title">
            我的志愿
          </view>
          <view class="ios-subtitle mt-2">
            查看已提交的志愿顺序与最终导师结果。
          </view>
        </view>

        <button class="ios-home-btn" @tap="navigateHome">
          首页
        </button>
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
    <view class="bottom-nav fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-3 py-4">
      <button
        class="ios-btn nav-switch-btn mx-1 flex-1"
        :class="isProgressPage ? 'ios-btn--secondary' : 'ios-btn--primary'"
        :style="isProgressPage ? {} : { backgroundColor: IOS_BLUE }"
        @tap="navigateToMyChoices"
      >
        我的志愿
      </button>
      <button
        class="ios-btn nav-switch-btn mx-1 flex-1"
        :class="isProgressPage ? 'ios-btn--primary' : 'ios-btn--secondary'"
        :style="isProgressPage ? { backgroundColor: IOS_BLUE } : {}"
        @tap="navigateToProgress"
      >
        选择页面
      </button>
    </view>
  </view>
</template>

<style scoped>
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

.ios-home-btn {
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

.ios-home-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.bottom-nav {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.nav-switch-btn {
  width: auto;
  min-width: 0;
  padding: 20rpx 12rpx;
  font-size: 32rpx;
}
</style>
