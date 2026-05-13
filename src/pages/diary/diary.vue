<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { ref, computed } from 'vue'
import { useDiaryStore } from '@/store/diary'
import { useTagStore } from '@/store/tag'
import { getToday } from '@/utils/dayjs'
import TagBadge from '@/components/TagBadge.vue'

const diaryStore = useDiaryStore()
const tagStore = useTagStore()

const date = ref(getToday())
const content = ref('')
const mood = ref('')
const selectedTags = ref<string[]>([])
const isEditing = ref(false)
const diaryId = ref('')
const isSubmitting = ref(false)

const moods = ['😊', '😢', '😡', '😴', '🥰', '🤔', '💪', '😌', '🎉', '☕️']

onLoad(async (query) => {
  if (query.date) date.value = query.date
  await tagStore.loadTags()

  // 检查是否有已有日记
  const existing = await diaryStore.loadDiaryByDate(date.value)
  if (existing) {
    content.value = existing.content
    mood.value = existing.mood || ''
    selectedTags.value = existing.tags || []
    diaryId.value = existing._id
    isEditing.value = true
  }
})

async function handleSave() {
  if (!content.value.trim()) {
    uni.showToast({ title: '请写点什么', icon: 'none' })
    return
  }

  isSubmitting.value = true

  let success: boolean
  if (isEditing.value) {
    success = await diaryStore.editDiary({
      _id: diaryId.value,
      content: content.value,
      mood: mood.value,
      tags: selectedTags.value,
    })
  } else {
    success = await diaryStore.addDiary({
      date: date.value,
      content: content.value,
      mood: mood.value,
      tags: selectedTags.value,
    })
  }

  isSubmitting.value = false

  if (success) {
    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 500)
  } else {
    uni.showToast({ title: '保存失败', icon: 'error' })
  }
}

function toggleTag(tagId: string) {
  const idx = selectedTags.value.indexOf(tagId)
  if (idx >= 0) {
    selectedTags.value.splice(idx, 1)
  } else {
    selectedTags.value.push(tagId)
  }
}

function goManageTags() {
  uni.navigateTo({ url: '/pages/tags/tags' })
}
</script>

<template>
  <view class="page">
    <!-- 日期与心情 -->
    <view class="diary-header">
      <text class="diary-date">{{ date }}</text>

      <view class="mood-picker">
        <text
          class="mood-option"
          :class="{ active: mood === m }"
          v-for="m in moods"
          :key="m"
          @tap="mood = mood === m ? '' : m"
        >{{ m }}</text>
      </view>
    </view>

    <!-- 内容编辑区 -->
    <view class="editor-area card">
      <textarea
        class="editor"
        v-model="content"
        placeholder="今天发生了什么？"
        maxlength="10000"
        auto-height
      />
    </view>

    <!-- 标签选择 -->
    <view class="tags-section card">
      <view class="tags-header">
        <text class="section-label">标签</text>
        <text class="manage-link" @tap="goManageTags">管理</text>
      </view>
      <view class="tag-list">
        <view
          class="tag-option"
          :class="{ active: selectedTags.includes(tag._id) }"
          v-for="tag in tagStore.tags"
          :key="tag._id"
          @tap="toggleTag(tag._id)"
        >
          <view class="tag-dot" :style="{ backgroundColor: tag.color }"></view>
          <text>{{ tag.name }}</text>
        </view>
        <view class="tag-option add-tag" @tap="goManageTags" v-if="!tagStore.tags.length">
          <text>+ 新建标签</text>
        </view>
      </view>
    </view>

    <!-- 已选标签预览 -->
    <view class="selected-tags" v-if="selectedTags.length">
      <TagBadge
        v-for="tagId in selectedTags"
        :key="tagId"
        :name="tagStore.getTagById(tagId)?.name || ''"
        :color="tagStore.getTagById(tagId)?.color"
      />
    </view>

    <!-- 提交按钮 -->
    <view class="submit-area">
      <view class="btn-primary" :class="{ loading: isSubmitting }" @tap="handleSave">
        <text>{{ isSubmitting ? '保存中...' : (isEditing ? '更新日记' : '保存日记') }}</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page { padding-top: 24rpx; padding-bottom: 100rpx; }
.diary-header {
  padding: 0 32rpx 24rpx;
  .diary-date { font-size: 32rpx; font-weight: 700; display: block; margin-bottom: 16rpx; }
}
.mood-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  .mood-option {
    font-size: 40rpx;
    padding: 8rpx 16rpx;
    border-radius: 16rpx;
    opacity: 0.5;
    &.active { opacity: 1; background: $primary-light; }
  }
}
.editor-area {
  min-height: 400rpx;
  .editor {
    width: 100%;
    min-height: 360rpx;
    font-size: 30rpx;
    line-height: 1.8;
    border: none;
    background: transparent;
  }
}
.tags-section {
  .tags-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    .section-label { font-size: 28rpx; font-weight: 600; }
    .manage-link { font-size: 24rpx; color: $primary-color; }
  }
  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    .tag-option {
      display: flex;
      align-items: center;
      gap: 12rpx;
      padding: 12rpx 24rpx;
      border-radius: 30rpx;
      font-size: 26rpx;
      background: $bg-color;
      border: 2rpx solid transparent;
      &.active { background: $primary-light; border-color: $primary-color; }
      .tag-dot { width: 16rpx; height: 16rpx; border-radius: 50%; }
    }
    .add-tag { color: $primary-color; border: 2rpx dashed $primary-color; }
  }
}
.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  padding: 0 32rpx 24rpx;
}
.submit-area {
  padding: 0 32rpx;
  .loading { opacity: 0.7; }
}
</style>
