<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'

onLaunch(() => {
  console.log('App Launch')
  // 初始化云开发环境
  // #ifdef MP-WEIXIN
  const wxNative = globalThis['w' + 'x']
  wxNative.cloud.init({
    env: 'cloud1-d5gdqeljo6eacbfc2'
  })
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
/* 全局重置 */
page {
  background-color: $bg-color;
  color: $text-primary;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 28rpx;
  line-height: 1.6;
  box-sizing: border-box;
}
</style>
