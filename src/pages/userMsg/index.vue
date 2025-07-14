<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '学生基本信息',
  },
}
</route>

<script lang="ts" setup>
import { writeStdInfo } from '@/api/stdInfo'

import PLATFORM from '@/utils/platform'

// 定义表单数据类型
interface StudentForm {
  name: string
  gender: string
  studentId: string
  grade: string
  classNum: string
  phone: string
  gpa: string
  direction: string
  // resumeName: string
}

defineOptions({
  name: 'Home',
})
// 获取屏幕边界到安全区域距离
let safeAreaInsets
let systemInfo

// #ifdef MP-WEIXIN
// 微信小程序使用新的API
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
// 其他平台继续使用uni API
systemInfo = uni.getSystemInfoSync()
safeAreaInsets = systemInfo.safeAreaInsets
// #endif

const genderArray = ['男', '女']
const directionArray = ['前端开发', '后端开发', '移动开发', 'UI设计', '产品经理', '其他']

// 使用reactive创建表单对象
const formData = ref<StudentForm>({
  name: '',
  gender: '',
  studentId: '',
  grade: '',
  classNum: '',
  phone: '',
  gpa: '',
  direction: '',
  // resumeName: '',
})

const showAgreement = ref(false)

function uploadResume() {
  // 上传简历逻辑
  console.log('上传简历')
}

function submitForm() {
  console.log(formData.value)

  // 表单验证
  if (!validateForm()) {
    return
  }

  // 提交表单逻辑
  console.log('提交表单', formData.value)
  writeStdInfo(formData.value).then((res) => {
    uni.showToast({
      title: '提交成功',
      icon: 'success',
    })
    uni.navigateTo({ url: '/pages/index/index' })
  })
  // 这里可以添加API调用
  // uni.request({
  //   url: 'your-api-endpoint',
  //   method: 'POST',
  //   data: formData.value,
  //   success: (res) => {
  //     console.log('提交成功', res)
  //   }
  // })
}

function validateForm(): boolean {
  const requiredFields: (keyof StudentForm)[] = ['name', 'gender', 'studentId', 'grade', 'classNum', 'phone', 'gpa', 'direction']

  for (const field of requiredFields) {
    if (!formData.value[field]) {
      uni.showToast({
        title: `请填写${getFieldName(field)}`,
        icon: 'none',
      })
      return false
    }
  }

  // 学号验证
  if (!/^\d+$/.test(formData.value.studentId)) {
    uni.showToast({
      title: '学号必须为数字',
      icon: 'none',
    })
    return false
  }

  // 电话验证
  if (!/^1[3-9]\d{9}$/.test(formData.value.phone)) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none',
    })
    return false
  }

  // GPA验证
  console.log(typeof formData.value.gpa)
  if (!/^[1-4]\.\d$/.test(formData.value.gpa)) {
    uni.showToast({
      title: '绩点范围应为1.0-4.9，格式X.X（例如3.1）',
      icon: 'none',
    })
    return false
  }

  return true
}

function getFieldName(field: keyof StudentForm): string {
  const fieldNames: Record<keyof StudentForm, string> = {
    name: '姓名',
    gender: '性别',
    studentId: '学号',
    grade: '年级',
    classNum: '班级',
    phone: '联系电话',
    gpa: '绩点',
    direction: '意向方向',
    // resumeName: '简历',
  }
  return fieldNames[field]
}

// 选择性别
function bindGenderChange(e: any) {
  formData.value.gender = genderArray[e.detail.value]
}

function bindClassInput(e) {
  formData.value.classNum = e.detail.value
}

function bindPhoneInput(e) {
  formData.value.phone = e.detail.value
}

function bindGPAInput(e) {
  formData.value.gpa = e.detail.value
}

function bindDirectionChange(e) {
  formData.value.direction = directionArray[e.detail.value]
}

function handleDisagree() {
  showAgreement.value = false
}

function handleAgree() {
  showAgreement.value = false
  // 同意后的逻辑
}

function viewFullAgreement() {
  // 查看完整协议逻辑
  uni.navigateTo({
    url: '/pages/agreement/index',
  })
}
</script>

<template>
  <view class="bg-gray-100 p-3" :style="{ marginTop: `${safeAreaInsets?.top}px` }">
    <view class="rounded-lg bg-white p-6 shadow-sm">
      <view class="mb-8 text-center text-2xl font-bold">
        学生基本信息
      </view>

      <!-- 基本信息部分 -->
      <view class="mb-10">
        <view
          class="algin-center mb-5 flex pl-2 text-xl font-bold"
          style="border-left: 6rpx solid #07c160;line-height: 1.5;"
        >
          基本信息
        </view>

        <view class="mb-7">
          <text class="mb-2 block text-sm text-gray-600">
            <text class="text-red-500">
              *
            </text>姓名
          </text>
          <input
            v-model="formData.name" class="border rounded p-2 text-sm"
            style="border: 1px solid rgba(0, 0, 0, 0.3);" placeholder="请输入姓名"
          >
        </view>

        <view class="mb-7">
          <text class="mb-2 block text-sm text-gray-600">
            <text class="text-red-500">
              *
            </text>性别
          </text>
          <picker
            class="border rounded p-2 text-sm" style="border: 1px solid rgba(0, 0, 0, 0.3);"
            mode="selector" :range="genderArray" @change="bindGenderChange"
          >
            <view class="text-gray-800">
              {{ formData.gender || '请选择性别' }}
            </view>
          </picker>
        </view>

        <view class="mb-7">
          <text class="mb-2 block text-sm text-gray-600">
            <text class="text-red-500">
              *
            </text>学号
          </text>
          <input
            v-model="formData.studentId" class="border rounded p-2 text-sm"
            style="border: 1px solid rgba(0, 0, 0, 0.3);" type="number" placeholder="请输入学号"
          >
        </view>

        <view class="mb-7">
          <text class="mb-2 block text-sm text-gray-600">
            <text class="text-red-500">
              *
            </text>年级
          </text>
          <input
            v-model="formData.grade" class="border rounded p-2 text-sm"
            style="border: 1px solid rgba(0, 0, 0, 0.3);" placeholder="请输入年级"
          >
        </view>

        <view class="mb-7">
          <text class="mb-2 block text-sm text-gray-600">
            <text class="text-red-500">
              *
            </text>班级
          </text>
          <input
            v-model="formData.classNum" class="border rounded p-2 text-sm"
            style="border: 1px solid rgba(0, 0, 0, 0.3);" placeholder="请输入班级"
          >
        </view>

        <view class="mb-7">
          <text class="mb-2 block text-sm text-gray-600">
            <text class="text-red-500">
              *
            </text>联系电话
          </text>
          <input
            v-model="formData.phone" class="border rounded p-2 text-sm"
            style="border: 1px solid rgba(0, 0, 0, 0.3);" type="number" placeholder="请输入联系电话"
          >
        </view>
      </view>

      <!-- 其他信息部分 -->
      <view class="mb-10">
        <view
          class="algin-center mb-5 flex pl-2 text-xl font-bold"
          style="border-left: 6rpx solid #07c160;line-height: 1.5;"
        >
          其他信息
        </view>

        <view class="mb-7">
          <text class="mb-2 block text-sm text-gray-600">
            <text class="text-red-500">
              *
            </text>绩点（必填）
          </text>
          <input
            v-model="formData.gpa" class="border rounded p-2 text-sm"
            style="border: 1px solid rgba(0, 0, 0, 0.3);" type="digit" placeholder="请输入绩点"
          >
        </view>

        <view class="mb-7">
          <text class="mb-2 block text-sm text-gray-600">
            <text class="text-red-500">
              *
            </text>意向方向（必填）
          </text>
          <picker
            class="border rounded p-2 text-sm" style="border: 1px solid rgba(0, 0, 0, 0.3);"
            mode="selector" :range="directionArray" @change="bindDirectionChange"
          >
            <view class="text-gray-800">
              {{ formData.direction || '请选择意向方向' }}
            </view>
          </picker>
        </view>

        <view class="mb-7">
          <text class="mb-2 block text-sm text-gray-600">
            简历上传（选填）
          </text>
          <button class="mt-2 bg-gray-100 text-sm text-green-500" @tap="uploadResume">
            上传PDF简历
          </button>
          <!-- <text v-if="formData.resumeName" class="ml-5 text-xs text-gray-500">
            {{ formData.resumeName }}
          </text> -->
        </view>
      </view>

      <!-- 提交按钮 -->
      <button class="mt-10 w-full rounded-full bg-green-500 py-3 text-lg text-white" @tap="submitForm">
        提交信息
      </button>
    </view>
  </view>

  <!-- 用户协议弹窗 -->
  <view v-if="showAgreement" class="fixed inset-0 z-999 flex items-center justify-center bg-black bg-opacity-50">
    <view class="w-4/5 rounded-lg bg-white p-6">
      <view class="mb-5 text-center text-xl font-bold">
        用户协议及隐私政策
      </view>
      <view class="mb-7 text-sm leading-relaxed">
        我们将会收集您填写的<text class="text-red-500 font-bold">
          个人信息（包括姓名、学号、联系方式等）
        </text>，
        用于<text class="text-red-500 font-bold">
          招新审核及团队管理
        </text>。
        您可以在"我的"页面随时查看或删除您的信息。
        请仔细阅读<text class="text-blue-500 underline" @tap="viewFullAgreement">
          《用户协议》
        </text>和<text class="text-blue-500 underline" @tap="viewFullAgreement">
          《隐私政策》
        </text>。
      </view>
      <view class="flex justify-between">
        <button class="w-48 bg-gray-100 text-gray-800" @tap="handleDisagree">
          暂不同意
        </button>
        <button class="w-48 bg-green-500 text-white" @tap="handleAgree">
          同意并继续
        </button>
      </view>
    </view>
  </view>
</template>
