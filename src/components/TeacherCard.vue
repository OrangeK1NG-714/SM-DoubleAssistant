<script lang="ts" setup>
import { IOS_BLUE, TEACHER_POPULARITY_HIGH, TEACHER_POPULARITY_MEDIUM } from '@/constants/theme'

defineProps<{
  teacher: any
}>()

const emit = defineEmits<{
  viewDetail: [teacher: any]
  toggleSelect: [teacherId: string]
}>()
</script>

<template>
  <view
    class="ios-card mb-4"
    style="padding: 0"
  >
    <view class="ios-cell">
      <view class="flex-1 text-[28rpx] text-[#111827] font-600">
        {{ teacher.name }}
      </view>
      <view
        class="text-[24rpx]"
        :class="
          teacher.number >= TEACHER_POPULARITY_HIGH
            ? 'text-[#FF3B30]'
            : teacher.number >= TEACHER_POPULARITY_MEDIUM
              ? 'text-[#F59E0B]'
              : 'text-[#0A84FF]'
        "
      >
        {{ teacher.number }}
      </view>
    </view>
    <view class="ios-divider" style="margin-left: 28rpx" />
    <view class="flex gap-3 px-4 pb-4 pt-3">
      <button
        class="ios-btn ios-btn--secondary flex-1"
        style="padding: 18rpx 18rpx; font-size: 28rpx"
        @tap="emit('viewDetail', teacher)"
      >
        详情
      </button>
      <button
        class="ios-btn flex-1"
        :class="teacher.selected ? 'ios-btn--secondary' : 'ios-btn--primary'"
        :style="teacher.selected ? {} : { backgroundColor: IOS_BLUE }"
        style="padding: 18rpx 18rpx; font-size: 28rpx"
        @tap="emit('toggleSelect', teacher.teacherId)"
      >
        {{ teacher.selected ? "已选" : "选择" }}
      </button>
    </view>
  </view>
</template>
