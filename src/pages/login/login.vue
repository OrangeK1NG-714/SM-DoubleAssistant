<route lang="json5" type="home">
{
  layout: "default",
  style: {
    navigationStyle: "custom",
    navigationBarTitleText: "登录",
  },
}
</route>

<script lang="ts" setup>
import { useToast } from 'wot-design-uni'
import { getUserInfo, login } from '@/api/login'
import { saveOpenid } from '@/api/stdInfo'
import { useSafeArea } from '@/composables/useSafeArea'
import { useUserStore } from '@/store/user'

defineOptions({
  name: 'Login',
})

const safeAreaInsets = useSafeArea()

// 表单数据
const username = ref('')
const password = ref('')
const isSubmitting = ref(false)
const errorText = ref('')
const toast = useToast()

function validate() {
  errorText.value = ''
  if (!username.value.trim() || !password.value.trim()) {
    errorText.value = '请输入账号和密码'
    toast.warning(errorText.value)
    return false
  }
  return true
}
// 登录
async function handleLogin() {
  if (isSubmitting.value)
    return
  if (!validate())
    return
  try {
    isSubmitting.value = true
    toast.loading('正在核验校内身份…')
    // 调用登录接口
    const res = await login({
      username: username.value.trim(),
      password: password.value,
    })
    if (res.code === 200) {
      toast.success('登录成功')
      // 存储双token
      const useStore = useUserStore()
      const {
        username: resUsername,
        role,
        accessToken,
        refreshToken,
        expiresIn,
      } = res.data
      // 兼容旧版本单token：后端可能只返回 token 字段
      const finalAccessToken = accessToken || (res.data as any).token
      const finalRefreshToken = refreshToken || (res.data as any).token

      // 设置用户信息
      useStore.setUserInfo(resUsername, role)
      // 设置双token（先同步存储到本地，确保后续请求能获取到）
      useStore.setTokens(finalAccessToken, finalRefreshToken, expiresIn)

      // 确保token已存储后再发起请求
      // 获取用户详细信息
      const resUserInfo: any = await getUserInfo(resUsername, role)

      // 存储用户姓名到 store，避免首页重复请求
      if (role === 'student' && resUserInfo?.data?.data?.name) {
        useStore.setUserInfo(resUsername, role, undefined, resUserInfo.data.data.name)
      }
      else if (role === 'teacher' && resUserInfo?.data?.name) {
        useStore.setUserInfo(resUsername, role, undefined, resUserInfo.data.name)
      }

      // 仅小程序端：登录成功后获取 openid 并上报后端
      // #ifdef MP-WEIXIN
      if (role === 'student') {
        try {
          const loginRes = await new Promise<UniApp.LoginRes>(
            (resolve, reject) => {
              uni.login({ provider: 'weixin', success: resolve, fail: reject })
            },
          )
          await saveOpenid(loginRes.code, resUsername)
        }
        catch (wxErr) {
          console.warn('[login] openid 上报失败（不影响登录）:', wxErr)
        }
      }
      // #endif

      if (role === 'student' && resUserInfo.isEmpty === 0) {
        uni.reLaunch({
          url: '/pages/userMsg/index',
        })
      }
      else {
        uni.reLaunch({
          url: '/pages/index/index',
        })
      }
    }
    else {
      errorText.value = res.msg || '账号或密码不正确'
      toast.error(errorText.value)
    }
  }
  catch (error) {
    errorText.value = '暂时无法连接服务，请稍后重试'
    toast.error(errorText.value)
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <view
    class="login-page"
    :style="{ paddingTop: `${safeAreaInsets.top}px` }"
  >
    <view class="login-shell">
      <view class="brand-row">
        <view class="brand-mark" aria-hidden="true">
          <wd-icon name="usergroup" size="42rpx" color="#FFFFFF" />
        </view>
        <view class="brand-copy">
          <view class="brand-name">
            ZUST · 数字媒体
          </view>
          <view class="brand-caption">
            校内导师互选服务
          </view>
        </view>
        <wd-tag type="primary" plain round>
          校内系统
        </wd-tag>
      </view>

      <view class="hero-copy">
        <view class="eyebrow">
          双向选择 · 过程清晰
        </view>
        <view class="hero-title">
          导师双选助手
        </view>
        <view class="hero-subtitle">
          查看活动、提交志愿、确认结果，一个入口完成整个互选流程。
        </view>
      </view>

      <view class="process-card">
        <view class="process-title">
          互选流程
        </view>
        <wd-steps :active="0" dot align-center>
          <wd-step title="学生填报" />
          <wd-step title="导师确认" />
          <wd-step title="结果公布" />
        </wd-steps>
      </view>

      <view class="login-panel">
        <view class="panel-header">
          <view>
            <view class="panel-title">
              登录账号
            </view>
            <view class="panel-subtitle">
              使用学校分配的身份账号
            </view>
          </view>
          <wd-icon name="check-circle" size="36rpx" color="#17875D" />
        </view>

        <view class="form-card">
          <wd-input
            v-model="username"
            label="账号"
            label-width="100rpx"
            placeholder="学号 / 工号"
            size="large"
            clearable
            :cursor-spacing="20"
            :disabled="isSubmitting"
            confirm-type="next"
          />
          <wd-input
            v-model="password"
            label="密码"
            label-width="100rpx"
            placeholder="请输入密码"
            size="large"
            show-password
            :cursor-spacing="20"
            :disabled="isSubmitting"
            @confirm="handleLogin"
          />
        </view>

        <view class="role-hint">
          <view class="role-hint__item">
            <wd-icon name="user" size="30rpx" color="#175CD3" />
            <text>学生使用学号</text>
          </view>
          <view class="role-hint__divider" />
          <view class="role-hint__item">
            <wd-icon name="usergroup" size="30rpx" color="#175CD3" />
            <text>老师使用工号</text>
          </view>
        </view>

        <view v-if="errorText" class="error-message" role="alert">
          <wd-icon name="warning" size="30rpx" color="#C4320A" />
          <text>{{ errorText }}</text>
        </view>

        <wd-button
          block
          size="large"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          @click="handleLogin"
        >
          {{ isSubmitting ? "正在登录…" : "进入系统" }}
        </wd-button>

        <view class="security-note">
          <wd-icon name="lock-on" size="26rpx" color="#667085" />
          <text>账号仅用于校内身份核验，不提供自助注册</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
  background: #f4f6fa;
  color: #172033;
}

.login-shell {
  box-sizing: border-box;
  width: 100%;
  max-width: 760rpx;
  min-height: 100vh;
  margin: 0 auto;
  padding: 36rpx 36rpx calc(44rpx + env(safe-area-inset-bottom));
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.brand-mark {
  display: flex;
  width: 76rpx;
  height: 76rpx;
  align-items: center;
  justify-content: center;
  flex: none;
  border-radius: 22rpx;
  background: #175cd3;
  box-shadow: 0 14rpx 30rpx rgba(23, 92, 211, 0.18);
}

.brand-copy {
  min-width: 0;
  flex: 1;
}

.brand-name {
  color: #172033;
  font-size: 28rpx;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.brand-caption {
  margin-top: 5rpx;
  color: #667085;
  font-size: 23rpx;
}

.hero-copy {
  padding: 72rpx 4rpx 46rpx;
}

.eyebrow {
  color: #175cd3;
  font-size: 24rpx;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.hero-title {
  margin-top: 14rpx;
  color: #101828;
  font-size: 54rpx;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.12;
}

.hero-subtitle {
  max-width: 600rpx;
  margin-top: 20rpx;
  color: #667085;
  font-size: 27rpx;
  line-height: 1.7;
}

.process-card {
  padding: 28rpx 24rpx 22rpx;
  border: 1rpx solid #eaecf0;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.76);
}

.process-title {
  margin: 0 8rpx 22rpx;
  color: #344054;
  font-size: 24rpx;
  font-weight: 700;
}

.login-panel {
  margin-top: 28rpx;
  padding: 34rpx 30rpx 28rpx;
  border: 1rpx solid #eaecf0;
  border-radius: 32rpx;
  background: #ffffff;
  box-shadow: 0 20rpx 50rpx rgba(16, 24, 40, 0.07);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 26rpx;
}

.panel-title {
  color: #172033;
  font-size: 32rpx;
  font-weight: 750;
}

.panel-subtitle {
  margin-top: 8rpx;
  color: #98a2b3;
  font-size: 23rpx;
}

.form-card {
  overflow: hidden;
  border: 1rpx solid #e4e7ec;
  border-radius: 24rpx;
}

.role-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 22rpx 0 26rpx;
  color: #475467;
  font-size: 23rpx;
}

.role-hint__item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.role-hint__divider {
  width: 1rpx;
  height: 24rpx;
  margin: 0 20rpx;
  background: #d0d5dd;
}

.error-message {
  display: flex;
  align-items: flex-start;
  gap: 10rpx;
  margin: -4rpx 0 22rpx;
  padding: 18rpx 20rpx;
  border-radius: 18rpx;
  background: #fef3f2;
  color: #b42318;
  font-size: 24rpx;
  line-height: 1.5;
}

.security-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  margin-top: 22rpx;
  color: #667085;
  font-size: 22rpx;
}

@media screen and (min-width: 600px) {
  .login-page {
    --wot-button-large-height: 52px;
    --wot-button-large-radius: 14px;
    --wot-button-large-fs: 16px;
    --wot-input-cell-height: 58px;
    --wot-input-cell-padding-large: 16px 18px;
    --wot-input-fs-large: 16px;
    --wot-steps-title-fs: 13px;
  }

  .login-shell {
    max-width: 520px;
    min-height: auto;
    padding: 36px 24px 48px;
  }

  .hero-copy {
    padding: 40px 2px 24px;
  }

  .brand-mark {
    width: 52px;
    height: 52px;
    border-radius: 15px;
  }

  .brand-name {
    font-size: 18px;
  }

  .brand-caption {
    font-size: 14px;
  }

  .eyebrow {
    font-size: 14px;
  }

  .hero-title {
    margin-top: 10px;
    font-size: 42px;
  }

  .hero-subtitle {
    margin-top: 14px;
    font-size: 17px;
    line-height: 1.65;
  }

  .process-card {
    padding: 15px 16px 12px;
    border-radius: 18px;
  }

  .process-title {
    margin-bottom: 16px;
    font-size: 14px;
  }

  .login-panel {
    margin-top: 16px;
    padding: 20px 22px 16px;
    border-radius: 22px;
  }

  .panel-header {
    margin-bottom: 18px;
  }

  .panel-title {
    font-size: 22px;
  }

  .panel-subtitle {
    font-size: 14px;
  }

  .role-hint {
    margin: 12px 0 14px;
    font-size: 13px;
  }

  .security-note {
    margin-top: 12px;
    font-size: 12px;
  }
}
</style>
