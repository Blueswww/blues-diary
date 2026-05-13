<script setup lang="ts">
defineProps<{
  name: string
  color?: string
}>()
</script>

<template>
  <view class="tag-badge" :style="{ backgroundColor: (color || '#5B7FFF') + '20', color: color || '#5B7FFF' }">
    <text>{{ name }}</text>
  </view>
</template>

<style lang="scss" scoped>
.tag-badge {
  display: inline-flex;
  align-items: center;
  padding: 6rpx 18rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  white-space: nowrap;
}
</style>
