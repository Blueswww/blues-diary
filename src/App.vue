<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'

onLaunch(() => {
  console.log('App Launch')
  // 初始化云开发环境（通过 globalThis['w'+'x'] 绕过 uni-app 的 wx 标识符变换）
  // #ifdef MP-WEIXIN
  try {
    const wxNative = globalThis['w' + 'x']
    console.log('[App] wxNative type:', typeof wxNative)
    console.log('[App] wxNative.cloud:', typeof wxNative?.cloud)
    wxNative.cloud.init({
      env: 'cloud1-d5gdqeljo6eacbfc2'
    })
    console.log('[App] cloud init success')
  } catch (e) {
    console.error('[App] cloud init error:', e)
  }
  // #endif
  // 尝试自动登录
  const userStore = useUserStore()
  userStore.tryAutoLogin()
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<template>
  <view class="app-root">
    <slot />
  </view>
</template>

<style lang="scss">
/* 全局样式在 uni.scss 中定义 */
</style>
