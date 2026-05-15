<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user'
import { useDiaryStore } from '@/store/diary'
import { useTagStore } from '@/store/tag'
import { useTodoStore } from '@/store/todo'
import { useAnniversaryStore } from '@/store/anniversary'
import { getToday, formatDate } from '@/utils/dayjs'
import { useHolidayStore } from '@/store/holiday'
import TagBadge from '@/components/TagBadge.vue'
import EmptyState from '@/components/EmptyState.vue'
import type { DiaryRecord } from '@/api/diary'

const userStore = useUserStore()
const diaryStore = useDiaryStore()
const tagStore = useTagStore()
const todoStore = useTodoStore()
const anniversaryStore = useAnniversaryStore()
const holidayStore = useHolidayStore()

const currentDate = ref(getToday())
const selectedTag = ref<string | null>(null)

const holiday = computed(() => holidayStore.getHolidayName(currentDate.value))

async function toggleTodoDone(id: string, done: boolean) {
  if (!userStore.isLoggedIn) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  await todoStore.toggleDone(id, done)
}

// 日记列表（按标签筛选或全部）
const displayDiaries = computed(() => {
  if (selectedTag.value) {
    return diaryStore.diaryList.filter(d => d.tags?.includes(selectedTag.value!))
  }
  return diaryStore.diaryList
})

/** 按日期分组，组内按标签分栏 */
interface TagGroup {
  tagId: string | null
  tagName: string
  tagColor: string
  entries: DiaryRecord[]
}
interface DateGroup {
  date: string
  dateDisplay: string
  weekday: string
  tagGroups: TagGroup[]
}

const groupedDiaries = computed<DateGroup[]>(() => {
  // 按日期分组
  const byDate: Record<string, DiaryRecord[]> = {}
  for (const d of displayDiaries.value) {
    if (!byDate[d.date]) byDate[d.date] = []
    byDate[d.date].push(d)
  }

  return Object.entries(byDate)
    .sort(([a], [b]) => b.localeCompare(a))  // 最新日期在前
    .map(([date, entries]) => {
      // 组内按标签分栏
      const byTag: Record<string, TagGroup> = {}
      const untagged: DiaryRecord[] = []

      for (const entry of entries) {
        const tags = entry.tags || []
        if (tags.length > 0) {
          // 每条日记归到第一个标签
          const tagId = tags[0]
          if (!byTag[tagId]) {
            const tag = tagStore.getTagById(tagId)
            byTag[tagId] = {
              tagId,
              tagName: tag?.name || '未知',
              tagColor: tag?.color || '#5B7FFF',
              entries: [],
            }
          }
          byTag[tagId].entries.push(entry)
        } else {
          untagged.push(entry)
        }
      }

      const tagGroups: TagGroup[] = [
        ...Object.values(byTag),
        ...(untagged.length ? [{ tagId: null, tagName: '未分类', tagColor: '#A0AEC0', entries: untagged }] : []),
      ]

      return {
        date,
        dateDisplay: formatDate(date, 'MM月DD日'),
        weekday: formatDate(date, 'dddd'),
        tagGroups,
      }
    })
})

onShow(() => {
  loadData()
})

async function loadData() {
  holidayStore.loadHolidays()
  if (!userStore.isLoggedIn) {
    diaryStore.clearCache()
    tagStore.clearCache()
    todoStore.clearCache()
    anniversaryStore.clearCache()
    return
  }
  const today = new Date()
  await Promise.all([
    diaryStore.loadDiariesByMonth(today.getFullYear(), today.getMonth() + 1),
    tagStore.loadTags(),
    todoStore.loadTodosByDate(currentDate.value),
    anniversaryStore.loadAnniversaries(),
  ])
}

function goWriteDiary() {
  if (!userStore.isLoggedIn) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  uni.navigateTo({ url: `/pages/diary/diary?date=${currentDate.value}` })
}

function goDiaryDate(date: string) {
  uni.navigateTo({ url: `/pages/diary/diary?date=${date}` })
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

    <!-- 今日待办列表 -->
    <view class="todo-brief card" v-if="todoStore.todayTodos.length">
      <view
        class="todo-row"
        v-for="todo in todoStore.todayTodos"
        :key="todo._id"
        @tap="toggleTodoDone(todo._id, !todo.isDone)"
      >
        <view class="todo-check" :class="{ checked: todo.isDone }">
          <text v-if="todo.isDone" class="check-mark">✓</text>
        </view>
        <view class="todo-body">
          <text class="todo-text" :class="{ done: todo.isDone }">{{ todo.content }}</text>
        </view>
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

    <!-- 日记列表：按日期分组，组内按标签分栏 -->
    <view class="diary-groups" v-if="groupedDiaries.length">
      <view class="date-group" v-for="group in groupedDiaries" :key="group.date">
        <!-- 日期标题 -->
        <view class="date-header" @tap="goDiaryDate(group.date)">
          <view class="date-header-left">
            <text class="date-title">{{ group.dateDisplay }}</text>
            <text class="date-weekday">{{ group.weekday }}</text>
          </view>
          <text class="date-arrow">{{ '>' }}</text>
        </view>

        <!-- 标签分栏 -->
        <view class="tag-section" v-for="tg in group.tagGroups" :key="tg.tagId || 'untagged'">
          <view class="tag-section-header">
            <view class="tag-section-dot" :style="{ backgroundColor: tg.tagColor }"></view>
            <text class="tag-section-name">{{ tg.tagName }}</text>
            <text class="tag-section-count">{{ tg.entries.length }} 条</text>
          </view>

          <view class="tag-entries">
            <view
              class="entry-row"
              v-for="entry in tg.entries"
              :key="entry._id"
              @tap="goDiaryDate(entry.date)"
            >
              <view class="entry-mood" v-if="entry.mood">
                <text>{{ entry.mood }}</text>
              </view>
              <view class="entry-body">
                <text class="entry-content">{{ entry.content }}</text>
                <view class="entry-sub-tags" v-if="entry.tags && entry.tags.length > 1">
                  <TagBadge
                    v-for="tid in entry.tags.slice(1)"
                    :key="tid"
                    :name="tagStore.getTagById(tid)?.name || ''"
                    :color="tagStore.getTagById(tid)?.color"
                    size="small"
                  />
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <EmptyState v-if="!displayDiaries.length && !diaryStore.loading" text="还没有日记，开始写第一篇吧" />

    <!-- 浮动写日记按钮（移动端） -->
    <view class="fab" @tap="goWriteDiary">
      <text class="fab-icon">✏️</text>
    </view>
  </view>
</template>

<style lang="scss">
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
.todo-brief {
  padding: 8rpx 32rpx;
  .todo-row {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 14rpx 0;
    border-bottom: 2rpx solid $border-color;
    &:last-child { border-bottom: none; }
    .todo-check {
      width: 36rpx; height: 36rpx;
      border-radius: 50%;
      border: 3rpx solid $border-color;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      &.checked { background: $success-color; border-color: $success-color; }
      .check-mark { font-size: 22rpx; color: #fff; font-weight: 700; }
    }
    .todo-body {
      flex: 1;
      min-width: 0;
      .todo-text {
        font-size: 26rpx;
        display: block;
        &.done { text-decoration: line-through; color: $text-light; }
      }
    }
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

/* 日期分组 */
.diary-groups {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.date-group {
  margin-bottom: 24rpx;
}
.date-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 32rpx;
  background: $card-bg;
  margin: 0 24rpx 0;
  border-radius: 24rpx 24rpx 0 0;
  box-shadow: $shadow;
  .date-header-left { display: flex; align-items: baseline; gap: 12rpx; }
  .date-title { font-size: 30rpx; font-weight: 600; }
  .date-weekday { font-size: 24rpx; color: $text-secondary; }
  .date-arrow { font-size: 28rpx; color: $text-light; }
}

/* 标签分栏 */
.tag-section {
  margin: 0 24rpx;
  background: $card-bg;
  &:last-child { border-radius: 0 0 24rpx 24rpx; box-shadow: $shadow; }
}
.tag-section-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx 32rpx;
  background: $bg-color;
  .tag-section-dot { width: 12rpx; height: 12rpx; border-radius: 50%; }
  .tag-section-name { font-size: 26rpx; font-weight: 600; }
  .tag-section-count { font-size: 22rpx; color: $text-light; }
}

.entry-row {
  display: flex;
  gap: 16rpx;
  padding: 20rpx 32rpx;
  border-bottom: 2rpx solid $border-color;
  &:last-child { border-bottom: none; }
  .entry-mood { font-size: 36rpx; flex-shrink: 0; padding-top: 4rpx; }
  .entry-body {
    flex: 1;
    min-width: 0;
    .entry-content {
      font-size: 28rpx;
      color: $text-primary;
      line-height: 1.7;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }
    .entry-sub-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8rpx;
      margin-top: 8rpx;
    }
  }
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
