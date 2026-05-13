<script setup lang="ts">
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { ref, computed } from 'vue'
import { useDiaryStore } from '@/store/diary'
import { useTagStore } from '@/store/tag'
import { useTodoStore } from '@/store/todo'
import { useAnniversaryStore } from '@/store/anniversary'
import { getToday, formatDate } from '@/utils/dayjs'
import { getHoliday } from '@/utils/holidays'
import DiaryCard from '@/components/DiaryCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const diaryStore = useDiaryStore()
const tagStore = useTagStore()
const todoStore = useTodoStore()
const anniversaryStore = useAnniversaryStore()

const currentDate = ref(getToday())
const selectedTag = ref<string | null>(null)

const holiday = computed(() => getHoliday(currentDate.value))

// 日记列表（按标签筛选或全部）
const displayDiaries = computed(() => {
  if (selectedTag.value) {
    return diaryStore.diaryList.filter(d => d.tags?.includes(selectedTag.value!))
  }
  return diaryStore.diaryList
})

onShow(() => {
  loadData()
})

async function loadData() {
  const today = new Date()
  await Promise.all([
    diaryStore.loadDiariesByMonth(today.getFullYear(), today.getMonth() + 1),
    tagStore.loadTags(),
    todoStore.loadTodosByDate(currentDate.value),
    anniversaryStore.loadAnniversaries(),
  ])
}

function goWriteDiary() {
  uni.navigateTo({ url: `/pages/diary/diary?date=${currentDate.value}` })
}

function goCalendar() {
  uni.switchTab({ url: '/pages/calendar/calendar' })
}

function clearTagFilter() {
  selectedTag.value = null
}
</script>

<template>
  <view class="page">
    <!-- 头部问候 -->
    <view class="greeting card">
      <view class="greeting-left">
        <text class="date-text">{{ formatDate(currentDate, 'MM月DD日') }}</text>
        <text class="weekday-text">{{ formatDate(currentDate, 'dddd') }}</text>
      </view>
      <view class="greeting-right">
        <view class="btn-small" @tap="goWriteDiary">+ 写日记</view>
      </view>
    </view>

    <!-- 节假日/Todo 简报 -->
    <view class="brief card" v-if="holiday || todoStore.todayTodos.length">
      <view class="brief-item" v-if="holiday">
        <text class="brief-icon">📌</text>
        <text class="brief-text">{{ holiday }}</text>
      </view>
      <view class="brief-item" v-if="todoStore.todayTodos.length">
        <text class="brief-icon">📋</text>
        <text class="brief-text">
          今日待办 {{ todoStore.todayProgress().done }}/{{ todoStore.todos.length }}
        </text>
      </view>
    </view>

    <!-- 即将到来的纪念日 -->
    <view class="brief card" v-if="anniversaryStore.upcomingAnniversaries.length">
      <view class="brief-item" v-for="item in anniversaryStore.upcomingAnniversaries.slice(0, 3)" :key="item._id">
        <text class="brief-icon">🎉</text>
        <text class="brief-text">{{ item.name }} {{ item.daysUntil === 0 ? '就是今天!' : `还有 ${item.daysUntil} 天` }}</text>
      </view>
    </view>

    <!-- 标签筛选 -->
    <view class="tag-filter" v-if="tagStore.tags.length">
      <view
        class="tag-chip"
        :class="{ active: selectedTag === null }"
        @tap="clearTagFilter"
      >全部</view>
      <view
        class="tag-chip"
        :class="{ active: selectedTag === tag._id }"
        v-for="tag in tagStore.tags"
        :key="tag._id"
        @tap="selectedTag = selectedTag === tag._id ? null : tag._id"
      >{{ tag.name }}</view>
    </view>

    <!-- 日记列表 -->
    <view class="diary-list">
      <DiaryCard v-for="d in displayDiaries" :key="d._id" :diary="d" show-date />
    </view>

    <EmptyState v-if="!displayDiaries.length && !diaryStore.loading" text="今天还没有写日记" />

    <!-- 浮动写日记按钮（移动端） -->
    <view class="fab" @tap="goWriteDiary">
      <text class="fab-icon">✏️</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page { padding-bottom: 120rpx; }
.greeting {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .date-text { font-size: 36rpx; font-weight: 700; }
  .weekday-text { font-size: 24rpx; color: $text-secondary; margin-top: 8rpx; display: block; }
}
.brief {
  padding: 20rpx 32rpx;
  .brief-item {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 8rpx;
    &:last-child { margin-bottom: 0; }
    .brief-icon { font-size: 28rpx; }
    .brief-text { font-size: 26rpx; color: $text-secondary; }
  }
}
.tag-filter {
  display: flex;
  gap: 16rpx;
  padding: 0 32rpx 24rpx;
  overflow-x: auto;
  white-space: nowrap;
  .tag-chip {
    display: inline-block;
    padding: 12rpx 28rpx;
    border-radius: 30rpx;
    background: $card-bg;
    font-size: 26rpx;
    color: $text-secondary;
    border: 2rpx solid $border-color;
    &.active { background: $primary-light; color: $primary-color; border-color: $primary-color; }
  }
}
.diary-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.fab {
  position: fixed;
  right: 32rpx;
  bottom: 120rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: $primary-color;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(91, 127, 255, 0.4);
  .fab-icon { font-size: 44rpx; }
}
</style>
