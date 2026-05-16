<script setup lang="ts">
import { AVATARS } from '@/utils/avatars'

const emit = defineEmits<{
  select: [id: string]
  close: []
}>()

function handleSelect(id: string) {
  emit('select', id)
}
</script>

<template>
  <view class="overlay" @tap.self="emit('close')">
    <view class="selector-panel">
      <text class="selector-title">选择头像</text>
      <view class="avatar-grid">
        <view
          class="avatar-option"
          v-for="a in AVATARS"
          :key="a.id"
          @tap="handleSelect(a.id)"
        >
          <image class="avatar-img" :src="a.dataUrl" mode="aspectFit" />
          <text class="avatar-name">{{ a.name }}</text>
        </view>
      </view>
      <view class="close-btn" @tap="emit('close')">取消</view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.selector-panel {
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 48rpx 32rpx 64rpx;
  width: 100%;
  box-sizing: border-box;
}
.selector-title {
  display: block;
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 40rpx;
}
.avatar-grid {
  display: flex;
  justify-content: center;
  gap: 24rpx;
  flex-wrap: wrap;
}
.avatar-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx;
  border-radius: 24rpx;
  background: $bg-color;
  width: 120rpx;
}
.avatar-option:active {
  background: #EDF0F2;
}
.avatar-img {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
}
.avatar-name {
  font-size: 24rpx;
  color: $text-secondary;
}
.close-btn {
  text-align: center;
  font-size: 28rpx;
  color: $text-secondary;
  margin-top: 32rpx;
  padding: 20rpx;
}
</style>
