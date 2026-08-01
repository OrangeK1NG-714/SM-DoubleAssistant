<script lang="ts" setup>
import { TEACHER_POPULARITY_HIGH, TEACHER_POPULARITY_MEDIUM } from '@/constants/theme'

defineProps<{
  teacher: any
}>()

const emit = defineEmits<{
  viewDetail: [teacher: any]
  toggleSelect: [teacherId: string]
}>()
</script>

<template>
  <wd-card custom-class="teacher-card">
    <template #title>
      <view class="teacher-card__header">
        <view>
          <view class="teacher-card__name">
            {{ teacher.name }}
          </view>
          <view class="teacher-card__meta">
            导师信息与当前报名情况
          </view>
        </view>
        <wd-tag
          round
          :type="
            teacher.number >= TEACHER_POPULARITY_HIGH
              ? 'danger'
              : teacher.number >= TEACHER_POPULARITY_MEDIUM
                ? 'warning'
                : 'primary'
          "
        >
          报名热度 {{ teacher.number }}
        </wd-tag>
      </view>
    </template>

    <view class="teacher-card__actions">
      <wd-button
        type="info"
        plain
        size="large"
        custom-class="teacher-card__button"
        @click="emit('viewDetail', teacher)"
      >
        详情
      </wd-button>
      <wd-button
        :type="teacher.selected ? 'success' : 'primary'"
        size="large"
        custom-class="teacher-card__button"
        @click="emit('toggleSelect', teacher.teacherId)"
      >
        {{ teacher.selected ? "已选择" : "选择导师" }}
      </wd-button>
    </view>
  </wd-card>
</template>

<style scoped>
.teacher-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18rpx;
}

.teacher-card__name {
  color: #172033;
  font-size: 31rpx;
  font-weight: 700;
}

.teacher-card__meta {
  margin-top: 7rpx;
  color: #98a2b3;
  font-size: 22rpx;
}

.teacher-card__actions {
  display: flex;
  gap: 18rpx;
}

:deep(.teacher-card) {
  margin: 0 0 24rpx;
  border: 1rpx solid #eaecf0;
  box-shadow: 0 12rpx 30rpx rgba(16, 24, 40, 0.05);
}

:deep(.teacher-card__button) {
  min-width: 0;
  flex: 1;
}
</style>
