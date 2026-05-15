interface SafeAreaInsets {
  top: number
  right: number
  bottom: number
  left: number
}

export function useSafeArea(): SafeAreaInsets {
  let insets: SafeAreaInsets = { top: 0, right: 0, bottom: 0, left: 0 }

  // #ifdef MP-WEIXIN
  const info = uni.getWindowInfo()
  if (info.safeArea) {
    insets = {
      top: info.safeArea.top,
      right: info.windowWidth - info.safeArea.right,
      bottom: info.windowHeight - info.safeArea.bottom,
      left: info.safeArea.left,
    }
  }
  // #endif

  // #ifndef MP-WEIXIN
  const sys = uni.getSystemInfoSync()
  if (sys.safeAreaInsets) {
    insets = sys.safeAreaInsets
  }
  // #endif

  return insets
}
