<script lang="ts" setup>
import { getEnvBaseUrl } from '@/utils'

interface Props {
  visible: boolean
  info: any
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const baseUrl = getEnvBaseUrl()

const showPopup = computed({
  get: () => props.visible,
  set: () => emit('close'),
})

const hasResume = computed(() => !!props.info?.resumeName)

async function viewResume() {
  const studentId = props.info?.studentId
  const activityId = props.info?.activityId
  if (!studentId || !activityId) {
    uni.showToast({ title: '缺少学生或活动信息', icon: 'none' })
    return
  }
  try {
    uni.showLoading({ title: '加载简历中...' })
    const accessToken = uni.getStorageSync('accessToken')
    const res = await uni.downloadFile({
      url: `${baseUrl}/api/student/getStudentResume?studentId=${encodeURIComponent(studentId)}&activityId=${encodeURIComponent(activityId)}`,
      header: { Authorization: `Bearer ${accessToken}` },
    })
    uni.hideLoading()

    if (res.statusCode !== 200) {
      uni.showToast({ title: '获取简历失败', icon: 'none' })
      return
    }

    const fileName = (props.info.resumeName || '').toLowerCase()
    const isImage = /\.(?:jpg|jpeg|png)$/.test(fileName)

    if (isImage) {
      uni.previewImage({ urls: [res.tempFilePath], current: res.tempFilePath })
    }
    else {
      uni.openDocument({
        filePath: res.tempFilePath,
        showMenu: true,
        fail: () => uni.showToast({ title: '无法打开此文件类型', icon: 'none' }),
      })
    }
  }
  catch {
    uni.hideLoading()
    uni.showToast({ title: '获取简历失败', icon: 'none' })
  }
}

function handleClose() {
  emit('close')
}
</script>

<template>
  <wd-popup
    v-model="showPopup"
    custom-style="border-radius:40rpx;"
    position="bottom"
  >
    <view class="ios-sheet">
      <view class="ios-sheet__handle" />
      <view class="px-3 pb-2">
        <view class="text-[32rpx] text-[#111827] font-700">
          学生详情
        </view>
        <view class="mt-2 text-[24rpx] text-[#6B7280]">
          {{ info?.name || '未设置' }} 的基本信息
        </view>
      </view>
      <scroll-view scroll-y class="px-3" style="max-height: 60vh">
        <view class="ios-card" style="padding: 0; box-shadow: none;">
          <view class="ios-cell">
            <view class="ios-cell__label" style="width: 160rpx;">
              姓名
            </view>
            <view class="ios-cell__content text-[28rpx] text-[#111827]">
              {{ info?.name || '未设置' }}
            </view>
          </view>
          <view class="ios-divider" style="margin-left: 28rpx;" />
          <view class="ios-cell">
            <view class="ios-cell__label" style="width: 160rpx;">
              学号
            </view>
            <view class="ios-cell__content text-[28rpx] text-[#111827]">
              {{ info?.studentId || '未设置' }}
            </view>
          </view>
          <view class="ios-divider" style="margin-left: 28rpx;" />
          <view class="ios-cell">
            <view class="ios-cell__label" style="width: 160rpx;">
              性别
            </view>
            <view class="ios-cell__content text-[28rpx] text-[#111827]">
              {{ info?.gender || '未设置' }}
            </view>
          </view>
          <view class="ios-divider" style="margin-left: 28rpx;" />
          <view class="ios-cell">
            <view class="ios-cell__label" style="width: 160rpx;">
              年级
            </view>
            <view class="ios-cell__content text-[28rpx] text-[#111827]">
              {{ info?.grade || '未设置' }}
            </view>
          </view>
          <view class="ios-divider" style="margin-left: 28rpx;" />
          <view class="ios-cell">
            <view class="ios-cell__label" style="width: 160rpx;">
              班级
            </view>
            <view class="ios-cell__content text-[28rpx] text-[#111827]">
              {{ info?.classNum || '未设置' }}
            </view>
          </view>
          <view class="ios-divider" style="margin-left: 28rpx;" />
          <view class="ios-cell">
            <view class="ios-cell__label" style="width: 160rpx;">
              电话
            </view>
            <view class="ios-cell__content text-[28rpx] text-[#111827]">
              {{ info?.phone || '未设置' }}
            </view>
          </view>
          <view class="ios-divider" style="margin-left: 28rpx;" />
          <view class="ios-cell">
            <view class="ios-cell__label" style="width: 160rpx;">
              QQ
            </view>
            <view class="ios-cell__content text-[28rpx] text-[#111827]">
              {{ info?.qq || '未设置' }}
            </view>
          </view>
          <view class="ios-divider" style="margin-left: 28rpx;" />
          <view class="ios-cell">
            <view class="ios-cell__label" style="width: 160rpx;">
              微信
            </view>
            <view class="ios-cell__content text-[28rpx] text-[#111827]">
              {{ info?.wechat || '未设置' }}
            </view>
          </view>
          <view class="ios-divider" style="margin-left: 28rpx;" />
          <view class="ios-cell">
            <view class="ios-cell__label" style="width: 160rpx;">
              GPA
            </view>
            <view class="ios-cell__content text-[28rpx] text-[#111827]">
              {{ info?.gpa || '未设置' }}
            </view>
          </view>
          <view class="ios-divider" style="margin-left: 28rpx;" />
          <view class="ios-cell">
            <view class="ios-cell__label" style="width: 160rpx;">
              方向
            </view>
            <view class="ios-cell__content text-[28rpx] text-[#111827]">
              {{ info?.direction || '未设置' }}
            </view>
          </view>
          <view class="ios-divider" style="margin-left: 28rpx;" />
          <view class="ios-cell">
            <view class="ios-cell__label" style="width: 160rpx;">
              简历
            </view>
            <view class="ios-cell__content text-[28rpx]">
              <text v-if="!hasResume" class="text-[#111827]">
                未上传
              </text>
              <text v-else class="text-[#007AFF]" style="text-decoration: underline;" @click="viewResume">
                {{ info?.resumeName || '查看简历' }}
              </text>
            </view>
          </view>
        </view>
      </scroll-view>
      <view class="flex flex-col gap-3 px-3 pt-4">
        <button class="ios-btn ios-btn--secondary w-full" @click="handleClose">
          关闭
        </button>
      </view>
    </view>
  </wd-popup>
</template>
