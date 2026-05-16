<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { useUserStore } from '@/store/user'
import { useDiaryStore } from '@/store/diary'
import { useTodoStore } from '@/store/todo'
import { useTagStore } from '@/store/tag'
import { useAnniversaryStore } from '@/store/anniversary'
import { getAvatarUrl } from '@/utils/avatars'
import AvatarSelector from '@/components/AvatarSelector.vue'

const userStore = useUserStore()
const diaryStore = useDiaryStore()
const todoStore = useTodoStore()
const tagStore = useTagStore()
const anniversaryStore = useAnniversaryStore()

const diaryCount = ref(0)
const weekStreak = ref(0)
const version = ref('1.0.0')

const showAvatarSelector = ref(false)
const editingNickname = ref(false)
const nicknameInput = ref('')

onShow(() => {
  diaryCount.value = Object.values(diaryStore.diaryMap).reduce((sum, arr) => sum + arr.length, 0)
  weekStreak.value = diaryStore.weekStreak
})

function goToTags() {
  uni.navigateTo({ url: '/pages/tags/tags' })
}

function goToAnniversaries() {
  uni.navigateTo({ url: '/pages/anniversary/anniversary' })
}

const isLoggingIn = ref(false)

function handleLogout() {
  uni.showModal({
    title: '退出',
    content: '确定退出当前账号？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        diaryStore.clearCache()
        tagStore.clearCache()
        todoStore.clearCache()
        anniversaryStore.clearCache()
      }
    },
  })
}

async function handleLogin() {
  isLoggingIn.value = true
  const ok = await userStore.loginWithWechat()
  isLoggingIn.value = false
  if (!ok) {
    uni.showToast({
      title: userStore.loginError || '登录失败，请重试',
      icon: 'none',
      duration: 3000,
    })
  }
}

function onSelectAvatar(id: string) {
  userStore.updateProfile(userStore.userInfo?.nickName || '用户', id)
  showAvatarSelector.value = false
}

function startEditNickname() {
  if (editingNickname.value) return
  nicknameInput.value = userStore.userInfo?.nickName || ''
  editingNickname.value = true
}

function saveNickname() {
  const name = nicknameInput.value.trim() || '用户'
  userStore.updateProfile(name, userStore.userInfo?.avatarType)
  editingNickname.value = false
  nicknameInput.value = name
  uni.showToast({ title: '昵称已更新', icon: 'none' })
}

function cancelEditNickname() {
  editingNickname.value = false
  nicknameInput.value = userStore.userInfo?.nickName || ''
}
</script>

<template>
  <view class="page">
    <!-- 未登录 -->
    <view class="login-prompt card" v-if="!userStore.isLoggedIn">
      <text class="login-icon">👤</text>
      <text class="login-title">未登录</text>
      <text class="login-desc">登录后可同步数据到云端</text>
      <button class="login-btn" :class="{ loading: isLoggingIn }" :disabled="isLoggingIn" @tap="handleLogin">
        {{ isLoggingIn ? '登录中...' : '微信一键登录' }}
      </button>
    </view>

    <!-- 用户信息（已登录） -->
    <template v-else>
      <view class="user-section card">
        <view class="avatar-wrap" @tap="showAvatarSelector = true">
          <image
            v-if="getAvatarUrl(userStore.userInfo?.avatarType)"
            class="avatar-img"
            :src="getAvatarUrl(userStore.userInfo?.avatarType)"
            mode="aspectFit"
          />
          <text v-else class="avatar-text">{{ userStore.userInfo?.nickName?.charAt(0) || 'U' }}</text>
          <view class="avatar-edit-badge">
            <text class="edit-icon">✎</text>
          </view>
        </view>
        <!-- 昵称输入框：始终渲染，永不隐藏销毁 -->
        <view class="nickname-area">
          <input
            class="nickname-input"
            :class="{ editing: editingNickname }"
            v-model="nicknameInput"
            style="color: #1a1a2e;"
            placeholder="昵称"
            :readonly="!editingNickname"
            :focus="editingNickname"
            @tap="startEditNickname"
            @confirm="saveNickname"
          />
          <text class="edit-hint" v-if="!editingNickname" @tap="startEditNickname">编辑</text>
        </view>
        <!-- 编辑按钮 -->
        <view class="edit-actions" v-if="editingNickname">
          <view class="btn-edit-cancel" @tap="cancelEditNickname">取消</view>
          <view class="btn-edit-save" @tap="saveNickname">保存</view>
        </view>
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
    </template>

    <!-- 功能菜单 -->
    <view class="menu-section card">
      <view class="menu-item" @tap="goToTags">
        <text class="menu-icon">🏷️</text>
        <text class="menu-label">标签管理</text>
        <text class="menu-arrow">{{ '>' }}</text>
      </view>
      <view class="menu-item" @tap="goToAnniversaries">
        <text class="menu-icon">🎉</text>
        <text class="menu-label">纪念日</text>
        <text class="menu-arrow">{{ '>' }}</text>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="menu-section card" v-if="userStore.isLoggedIn">
      <view class="menu-item" @tap="handleLogout">
        <text class="menu-icon">👋</text>
        <text class="menu-label" style="color: #ff4757">退出登录</text>
      </view>
    </view>

    <text class="version">Blues Diary v{{ version }}</text>

    <!-- 头像选择器 -->
    <AvatarSelector
      v-if="showAvatarSelector"
      @select="onSelectAvatar"
      @close="showAvatarSelector = false"
    />
  </view>
</template>

<style lang="scss">
.page { padding-top: 24rpx; }
.login-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64rpx 32rpx;
  .login-icon { font-size: 80rpx; margin-bottom: 16rpx; }
  .login-title { font-size: 36rpx; font-weight: 600; margin-bottom: 8rpx; }
  .login-desc { font-size: 26rpx; color: $text-secondary; margin-bottom: 32rpx; }
  .login-btn {
    width: 80%;
    height: 88rpx;
    line-height: 88rpx;
    background: $primary-color;
    color: #fff;
    border-radius: 44rpx;
    font-size: 30rpx;
    text-align: center;
  }
}
.user-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 32rpx;
  .avatar-wrap {
    position: relative;
    width: 120rpx;
    height: 120rpx;
    margin-bottom: 16rpx;
  }
  .avatar-img {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
  }
  .avatar-text {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    background: $primary-light;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48rpx;
    color: $primary-color;
    font-weight: 600;
  }
  .avatar-edit-badge {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 36rpx;
    height: 36rpx;
    border-radius: 50%;
    background: $primary-color;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3rpx solid #fff;
    .edit-icon { font-size: 20rpx; color: #fff; }
  }
  .nickname-area {
    display: flex;
    align-items: center;
    gap: 12rpx;
    width: 100%;
    .nickname-input {
      flex: 1;
      font-size: 34rpx;
      font-weight: 600;
      text-align: center;
      border: none;
      background: transparent;
      padding: 0;
      min-height: auto;
      color: $text-primary;
      &.editing {
        font-size: 28rpx;
        font-weight: normal;
        text-align: left;
        background: $bg-color;
        border: 2rpx solid $border-color;
        border-radius: 16rpx;
        padding: 24rpx 28rpx;
      }
    }
    .edit-hint {
      font-size: 24rpx;
      color: $text-light;
      flex-shrink: 0;
    }
  }
  .edit-actions {
    display: flex;
    gap: 20rpx;
    margin-top: 20rpx;
    width: 100%;
    .btn-edit-cancel, .btn-edit-save {
      flex: 1;
      text-align: center;
      padding: 22rpx 0;
      border-radius: 36rpx;
      font-size: 28rpx;
    }
    .btn-edit-save {
      background: $primary-color;
      color: #fff;
    }
    .btn-edit-cancel {
      background: $bg-color;
      color: $text-secondary;
      border: 2rpx solid $border-color;
    }
  }
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
