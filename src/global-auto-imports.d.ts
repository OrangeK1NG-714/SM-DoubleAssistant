import type { ComponentPublicInstance, ComputedRef, Ref } from 'vue'

declare global {
  const computed: typeof import('vue')['computed']
  const nextTick: typeof import('vue')['nextTick']
  const onBeforeUnmount: typeof import('vue')['onBeforeUnmount']
  const onMounted: typeof import('vue')['onMounted']
  const reactive: typeof import('vue')['reactive']
  const ref: typeof import('vue')['ref']
  const watch: typeof import('vue')['watch']
  const watchEffect: typeof import('vue')['watchEffect']
  const onLoad: typeof import('@dcloudio/uni-app')['onLoad']
  const onPullDownRefresh: typeof import('@dcloudio/uni-app')['onPullDownRefresh']
  const onReachBottom: typeof import('@dcloudio/uni-app')['onReachBottom']
  const onShow: typeof import('@dcloudio/uni-app')['onShow']
  const onUnload: typeof import('@dcloudio/uni-app')['onUnload']

  type VueRef<T = any> = Ref<T>
  type VueComputedRef<T = any> = ComputedRef<T>
  type VueInstance = ComponentPublicInstance
}

export {}
