<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { useUserStore } from '@/store/user'
import { useTagStore } from '@/store/tag'
import { useDiaryStore } from '@/store/diary'
import EmptyState from '@/components/EmptyState.vue'

const userStore = useUserStore()
const tagStore = useTagStore()
const diaryStore = useDiaryStore()

const showInput = ref(false)
const newTagName = ref('')
const tagColors = ['#5B7FFF', '#FF6B6B', '#34C759', '#FF9500', '#AF52DE', '#FFD60A']

onShow(() => {
  if (!userStore.isLoggedIn) {
    tagStore.clearCache()
    return
  }
  tagStore.loadTags()
})

function requireLogin(): boolean {
  if (!userStore.isLoggedIn) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return false
  }
  return true
}

async function createTag() {
  if (!requireLogin()) return
  const name = newTagName.value.trim()
  if (!name) {
    uni.showToast({ title: '请输入标签名', icon: 'none' })
    return
  }
  const color = tagColors[Math.floor(Math.random() * tagColors.length)]
  const tag = await tagStore.addTag(name, color)
  if (tag) {
    newTagName.value = ''
    showInput.value = false
    uni.showToast({ title: '标签已创建' })
  }
}

async function deleteTag(id: string, name: string) {
  if (!requireLogin()) return
  uni.showModal({
    title: '删除标签',
    content: `确定删除「${name}」吗？`,
    success: async (res) => {
      if (res.confirm) {
        await tagStore.removeTag(id)
      }
    },
  })
}

function viewTagDiaries(tagId: string) {
  diaryStore.loadDiariesByTag(tagId)
  uni.switchTab({ url: '/pages/index/index' })
}
</script>

<template>
  <view class="page">
    <view class="header-actions" v-if="userStore.isLoggedIn">
      <view class="btn-small" @tap="showInput = !showInput">
        {{ showInput ? '取消' : '+ 新建标签' }}
      </view>
    </view>

    <view class="input-area" v-if="showInput && userStore.isLoggedIn">
      <input
         type="text"
        class="input-field"
        :value="newTagName"
          @input="e => newTagName = e.detail.value"
        placeholder="输入标签名称"
        maxlength="10"
        confirm-type="done"
        @confirm="createTag"
      />
      <view class="btn-primary" @tap="createTag">创建</view>
    </view>

    <view class="tag-list" v-if="tagStore.tags.length && userStore.isLoggedIn">
      <view
        class="tag-item card"
        v-for="tag in tagStore.tags"
        :key="tag._id"
        @tap="viewTagDiaries(tag._id)"
      >
        <view class="tag-left">
          <view class="tag-dot" :style="{ backgroundColor: tag.color }"></view>
          <text class="tag-name">{{ tag.name }}</text>
        </view>
        <view class="tag-right" v-if="userStore.isLoggedIn">
          <text class="delete-btn" @tap.stop="deleteTag(tag._id, tag.name)">删除</text>
        </view>
      </view>
    </view>

    <EmptyState v-else text="还没有标签，创建一个吧" />
  </view>
</template>

<style lang="scss">
.page { padding-top: 24rpx; }
.header-actions {
  padding: 0 32rpx 24rpx;
  display: flex;
  justify-content: flex-end;
}
.input-area {
  padding: 0 32rpx 24rpx;
  display: flex;
  gap: 16rpx;
  align-items: center;
  .input-field { flex: 1; }
  .btn-primary {
    width: auto;
    padding: 20rpx 40rpx;
    font-size: 28rpx;
  }
}
.tag-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .tag-left {
    display: flex;
    align-items: center;
    gap: 20rpx;
    .tag-dot {
      width: 24rpx;
      height: 24rpx;
      border-radius: 50%;
    }
    .tag-name { font-size: 30rpx; font-weight: 500; }
  }
  .delete-btn {
    color: $danger-color;
    font-size: 26rpx;
    padding: 8rpx 16rpx;
  }
}
</style>
