<script setup lang="ts">
defineProps<{
  name: string
  color?: string
  size?: 'normal' | 'small'
}>()
</script>

<template>
  <view
    class="tag-badge"
    :class="[size === 'small' ? 'tag-small' : '']"
    :style="{ backgroundColor: (color || '#5B7FFF') + '20', color: color || '#5B7FFF' }"
  >
    <text>{{ name }}</text>
  </view>
</template>

<style lang="scss">
.tag-badge {
  display: inline-flex;
  align-items: center;
  padding: 6rpx 18rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  white-space: nowrap;
}
.tag-small {
  padding: 4rpx 14rpx;
  font-size: 20rpx;
  border-radius: 16rpx;
}
</style>
