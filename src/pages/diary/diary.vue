<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { useDiaryStore } from '@/store/diary'
import { useTagStore } from '@/store/tag'
import { getToday } from '@/utils/dayjs'
import type { DiaryRecord } from '@/api/diary'
import TagBadge from '@/components/TagBadge.vue'

const diaryStore = useDiaryStore()
const tagStore = useTagStore()

const date = ref(getToday())
const entries = ref<DiaryRecord[]>([])
const loading = ref(false)

// 编辑器状态
const showEditor = ref(false)
const editTarget = ref<DiaryRecord | null>(null)
const editorContent = ref('')
const editorMood = ref('')
const editorTags = ref<string[]>([])
const isSubmitting = ref(false)
const isDeleting = ref<string | null>(null)

const moods = ['😊', '😢', '😡', '😴', '🥰', '🤔', '💪', '😌', '🎉', '☕️']

onLoad(async (query) => {
  if (query.date) date.value = query.date
  await tagStore.loadTags()
  await loadEntries()
})

async function loadEntries() {
  loading.value = true
  await diaryStore.loadDiariesByDate(date.value)
  entries.value = [...diaryStore.currentEntries]
  loading.value = false
}

/** 打开新建表单 */
function openNewEntry() {
  editTarget.value = null
  editorContent.value = ''
  editorMood.value = ''
  editorTags.value = []
  showEditor.value = true
}

/** 打开编辑表单 */
function openEditEntry(entry: DiaryRecord) {
  editTarget.value = entry
  editorContent.value = entry.content
  editorMood.value = entry.mood || ''
  editorTags.value = [...(entry.tags || [])]
  showEditor.value = true
}

function closeEditor() {
  showEditor.value = false
  editTarget.value = null
  editorContent.value = ''
  editorMood.value = ''
  editorTags.value = []
}

async function handleSave() {
  if (!editorContent.value.trim()) {
    uni.showToast({ title: '请写点什么', icon: 'none' })
    return
  }

  isSubmitting.value = true
  let success: boolean

  if (editTarget.value) {
    success = await diaryStore.editDiary({
      _id: editTarget.value._id,
      content: editorContent.value,
      mood: editorMood.value,
      tags: editorTags.value,
    })
  } else {
    success = await diaryStore.addDiary({
      date: date.value,
      content: editorContent.value,
      mood: editorMood.value,
      tags: editorTags.value,
    })
  }

  isSubmitting.value = false

  if (success) {
    uni.showToast({ title: '保存成功', icon: 'success' })
    closeEditor()
    await loadEntries()
  } else {
    uni.showToast({ title: '保存失败', icon: 'error' })
  }
}

async function handleDelete(entry: DiaryRecord) {
  uni.showModal({
    title: '确认删除',
    content: '删除后无法恢复，确定要删除这条日记吗？',
    success: async (res) => {
      if (res.confirm) {
        isDeleting.value = entry._id
        const success = await diaryStore.removeDiary(entry._id)
        isDeleting.value = null
        if (success) {
          uni.showToast({ title: '已删除', icon: 'success' })
          await loadEntries()
        } else {
          uni.showToast({ title: '删除失败', icon: 'error' })
        }
      }
    },
  })
}

function toggleTag(tagId: string) {
  const idx = editorTags.value.indexOf(tagId)
  if (idx >= 0) {
    editorTags.value.splice(idx, 1)
  } else {
    editorTags.value.push(tagId)
  }
}

function goManageTags() {
  uni.navigateTo({ url: '/pages/tags/tags' })
}
</script>

<template>
  <view class="page">
    <!-- 日期头部 -->
    <view class="diary-header">
      <text class="diary-date">{{ date }}</text>
      <view class="header-actions">
        <text class="btn-add" @tap="openNewEntry" v-if="!showEditor">+ 写新日记</text>
      </view>
    </view>

    <!-- 加载中 -->
    <view class="loading-state" v-if="loading">
      <text>加载中...</text>
    </view>

    <!-- 日记条目列表 -->
    <view class="entries-list" v-else-if="entries.length">
      <view class="entry-card card" v-for="entry in entries" :key="entry._id">
        <view class="entry-mood" v-if="entry.mood">
          <text class="mood-text">{{ entry.mood }}</text>
        </view>

        <view class="entry-content">
          <text class="content-text">{{ entry.content }}</text>
        </view>

        <view class="entry-tags" v-if="entry.tags && entry.tags.length">
          <TagBadge
            v-for="tagId in entry.tags"
            :key="tagId"
            :name="tagStore.getTagById(tagId)?.name || ''"
            :color="tagStore.getTagById(tagId)?.color"
          />
        </view>

        <view class="entry-actions">
          <text class="action-btn edit-btn" @tap="openEditEntry(entry)">编辑</text>
          <text class="action-btn delete-btn" :class="{ loading: isDeleting === entry._id }" @tap="handleDelete(entry)">
            {{ isDeleting === entry._id ? '删除中...' : '删除' }}
          </text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else-if="!loading">
      <text class="empty-icon">📝</text>
      <text class="empty-text">这一天还没有日记</text>
      <text class="empty-hint">点击上方"写新日记"开始记录</text>
    </view>

    <!-- 编辑器 -->
    <view class="editor-overlay" v-if="showEditor">
      <view class="editor-panel">
        <view class="editor-header">
          <text class="editor-title">{{ editTarget ? '编辑日记' : '写新日记' }}</text>
          <text class="editor-close" @tap="closeEditor">✕</text>
        </view>

        <!-- 心情选择 -->
        <view class="mood-picker">
          <text
            class="mood-option"
            :class="{ active: editorMood === m }"
            v-for="m in moods"
            :key="m"
            @tap="editorMood = editorMood === m ? '' : m"
          >{{ m }}</text>
        </view>

        <!-- 内容编辑 -->
        <textarea
          class="editor-textarea"
          v-model="editorContent"
          placeholder="今天发生了什么？"
          maxlength="10000"
          auto-height
        />

        <!-- 标签选择 -->
        <view class="tags-section">
          <view class="tags-header">
            <text class="section-label">标签</text>
            <text class="manage-link" @tap="goManageTags">管理</text>
          </view>
          <view class="tag-list">
            <view
              class="tag-option"
              :class="{ active: editorTags.includes(tag._id) }"
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
        <view class="selected-tags" v-if="editorTags.length">
          <TagBadge
            v-for="tagId in editorTags"
            :key="tagId"
            :name="tagStore.getTagById(tagId)?.name || ''"
            :color="tagStore.getTagById(tagId)?.color"
          />
        </view>

        <!-- 操作按钮 -->
        <view class="editor-actions">
          <view class="btn-cancel" @tap="closeEditor">取消</view>
          <view class="btn-primary" :class="{ loading: isSubmitting }" @tap="handleSave">
            <text>{{ isSubmitting ? '保存中...' : '保存' }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
.page { padding-top: 24rpx; padding-bottom: 100rpx; }

.diary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 32rpx 24rpx;
  .diary-date { font-size: 32rpx; font-weight: 700; }
  .btn-add {
    font-size: 28rpx;
    color: $primary-color;
    padding: 12rpx 28rpx;
    background: $primary-light;
    border-radius: 30rpx;
  }
}

.loading-state {
  text-align: center;
  padding: 80rpx 0;
  color: $text-light;
  font-size: 28rpx;
}

.entries-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.entry-card {
  .entry-mood {
    margin-bottom: 12rpx;
    .mood-text { font-size: 40rpx; }
  }
  .entry-content {
    margin-bottom: 12rpx;
    .content-text {
      font-size: 28rpx;
      color: $text-primary;
      line-height: 1.8;
      white-space: pre-wrap;
      word-break: break-word;
    }
  }
  .entry-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-bottom: 16rpx;
  }
  .entry-actions {
    display: flex;
    gap: 24rpx;
    justify-content: flex-end;
    border-top: 2rpx solid $border-color;
    padding-top: 16rpx;
    .action-btn {
      font-size: 26rpx;
      padding: 8rpx 20rpx;
      border-radius: 20rpx;
    }
    .edit-btn { color: $primary-color; background: $primary-light; }
    .delete-btn { color: $danger-color; background: #FFF0F0; }
    .loading { opacity: 0.6; }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
  .empty-icon { font-size: 80rpx; margin-bottom: 20rpx; }
  .empty-text { font-size: 30rpx; color: $text-secondary; margin-bottom: 8rpx; }
  .empty-hint { font-size: 26rpx; color: $text-light; }
}

/* 编辑器浮层 */
.editor-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 100;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.editor-panel {
  background: $card-bg;
  border-radius: 32rpx 32rpx 0 0;
  padding: 32rpx;
  max-height: 80vh;
  overflow-y: auto;
}
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  .editor-title { font-size: 32rpx; font-weight: 600; }
  .editor-close { font-size: 36rpx; color: $text-light; padding: 8rpx; }
}
.mood-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 24rpx;
  .mood-option {
    font-size: 40rpx;
    padding: 8rpx 16rpx;
    border-radius: 16rpx;
    opacity: 0.5;
    &.active { opacity: 1; background: $primary-light; }
  }
}
.editor-textarea {
  width: 100%;
  min-height: 240rpx;
  font-size: 30rpx;
  line-height: 1.8;
  border: 2rpx solid $border-color;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 24rpx;
  box-sizing: border-box;
  background: $bg-color;
}
.tags-section {
  margin-bottom: 20rpx;
  .tags-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
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
  margin-bottom: 24rpx;
}
.editor-actions {
  display: flex;
  gap: 20rpx;
  .btn-cancel {
    flex: 1;
    text-align: center;
    padding: 24rpx 0;
    border-radius: 40rpx;
    font-size: 30rpx;
    background: $bg-color;
    color: $text-secondary;
  }
  .btn-primary {
    flex: 2;
    text-align: center;
    padding: 24rpx 0;
    border-radius: 40rpx;
    font-size: 30rpx;
    background: $primary-color;
    color: #fff;
    &.loading { opacity: 0.7; }
  }
}
</style>
