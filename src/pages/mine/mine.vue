<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { useUserStore } from '@/store/user'
import { useDiaryStore } from '@/store/diary'
import { useTodoStore } from '@/store/todo'

const userStore = useUserStore()
const diaryStore = useDiaryStore()
const todoStore = useTodoStore()

const diaryCount = ref(0)
const weekStreak = ref(0)
const version = ref('1.0.0')

onShow(() => {
  diaryCount.value = Object.keys(diaryStore.diaryMap).length
})

function goToTags() {
  uni.navigateTo({ url: '/pages/tags/tags' })
}

function goToAnniversaries() {
  uni.navigateTo({ url: '/pages/anniversary/anniversary' })
}

function handleLogout() {
  uni.showModal({
    title: '退出',
    content: '确定退出当前账号？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
      }
    },
  })
}
</script>

<template>
  <view class="page">
    <!-- 用户信息 -->
    <view class="user-section card">
      <view class="avatar">
        <text class="avatar-text">{{ userStore.userInfo?.nickName?.charAt(0) || 'U' }}</text>
      </view>
      <text class="nickname">{{ userStore.userInfo?.nickName || '用户' }}</text>
    </view>

    <!-- 数据统计 -->
    <view class="stats-row card">
      <view class="stat-item">
        <text class="stat-number">{{ diaryCount }}</text>
        <text class="stat-label">日记</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ todoStore.todos.length }}</text>
        <text class="stat-label">待办</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ weekStreak }}</text>
        <text class="stat-label">连续天数</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section card">
      <view class="menu-item" @tap="goToTags">
        <text class="menu-icon">🏷️</text>
        <text class="menu-label">标签管理</text>
        <text class="menu-arrow">&gt;</text>
      </view>
      <view class="menu-item" @tap="goToAnniversaries">
        <text class="menu-icon">🎉</text>
        <text class="menu-label">纪念日</text>
        <text class="menu-arrow">&gt;</text>
      </view>
    </view>

    <!-- 设置 -->
    <view class="menu-section card">
      <view class="menu-item" @tap="handleLogout">
        <text class="menu-icon">👋</text>
        <text class="menu-label" style="color: $danger-color">退出登录</text>
      </view>
    </view>

    <text class="version">Blues Diary v{{ version }}</text>
  </view>
</template>

<style lang="scss" scoped>
.page { padding-top: 24rpx; }
.user-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 32rpx;
  .avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    background: $primary-light;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16rpx;
    .avatar-text {
      font-size: 48rpx;
      color: $primary-color;
      font-weight: 600;
    }
  }
  .nickname { font-size: 34rpx; font-weight: 600; }
}
.stats-row {
  display: flex;
  justify-content: space-around;
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    .stat-number { font-size: 40rpx; font-weight: 700; color: $primary-color; }
    .stat-label { font-size: 24rpx; color: $text-secondary; margin-top: 8rpx; }
  }
}
.menu-section {
  padding: 0;
  .menu-item {
    display: flex;
    align-items: center;
    padding: 32rpx;
    border-bottom: 1rpx solid $border-color;
    &:last-child { border-bottom: none; }
    .menu-icon { font-size: 36rpx; margin-right: 20rpx; }
    .menu-label { flex: 1; font-size: 28rpx; }
    .menu-arrow { color: $text-light; font-size: 28rpx; }
  }
}
.version {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: $text-light;
  padding: 48rpx 0;
}
</style>
