<script setup lang="ts">
defineProps<{
  icon?: string
  text?: string
}>()
</script>

<template>
  <view class="empty-state">
    <text class="icon" v-if="icon">{{ icon }}</text>
    <text class="text">{{ text || '暂无数据' }}</text>
    <slot />
  </view>
</template>

<style lang="scss">
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 160rpx 0;
  .icon {
    font-size: 96rpx;
    margin-bottom: 24rpx;
  }
  .text {
    color: $text-light;
    font-size: 28rpx;
  }
}
</style>
