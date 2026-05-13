<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { ref, computed } from 'vue'
import { useDiaryStore } from '@/store/diary'
import { useAnniversaryStore } from '@/store/anniversary'
import { getMonthDays, formatDate } from '@/utils/dayjs'
import { getHoliday, getCommonAnniversary } from '@/utils/holidays'

const diaryStore = useDiaryStore()
const anniversaryStore = useAnniversaryStore()

const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)
const selectedDate = ref(formatDate(new Date(), 'YYYY-MM-DD'))

const monthDays = computed(() => getMonthDays(currentYear.value, currentMonth.value))

const selectedDiary = computed(() => diaryStore.diaryMap[selectedDate.value])
const selectedHoliday = computed(() => {
  return getHoliday(selectedDate.value) || getCommonAnniversary(
    parseInt(selectedDate.value.slice(5, 7)),
    parseInt(selectedDate.value.slice(8, 10))
  )
})

onShow(() => {
  loadMonthData()
})

async function loadMonthData() {
  await diaryStore.loadDiariesByMonth(currentYear.value, currentMonth.value)
  await anniversaryStore.loadAnniversaries()
}

function changeMonth(delta: number) {
  currentMonth.value += delta
  if (currentMonth.value > 12) { currentMonth.value = 1; currentYear.value++ }
  if (currentMonth.value < 1) { currentMonth.value = 12; currentYear.value-- }
  loadMonthData()
}

function selectDate(date: string) {
  selectedDate.value = date
}

function goWriteDiary(date: string) {
  uni.navigateTo({ url: `/pages/diary/diary?date=${date}` })
}

function goToday() {
  const today = new Date()
  currentYear.value = today.getFullYear()
  currentMonth.value = today.getMonth() + 1
  selectedDate.value = formatDate(today, 'YYYY-MM-DD')
  loadMonthData()
}
</script>

<template>
  <view class="page">
    <!-- 月份导航 -->
    <view class="month-nav">
      <text class="nav-arrow" @tap="changeMonth(-1)">&lt;</text>
      <text class="month-title">{{ currentYear }}年{{ currentMonth }}月</text>
      <text class="nav-arrow" @tap="changeMonth(1)">&gt;</text>
      <text class="today-btn" @tap="goToday">今天</text>
    </view>

    <!-- 星期头 -->
    <view class="weekday-header">
      <text v-for="w in ['一','二','三','四','五','六','日']" :key="w" class="weekday">{{ w }}</text>
    </view>

    <!-- 日期网格 -->
    <view class="calendar-grid">
      <view
        class="day-cell"
        :class="{
          'other-month': !day.isCurrentMonth,
          'today': day.date === formatDate(new Date(), 'YYYY-MM-DD'),
          'selected': day.date === selectedDate,
          'has-diary': diaryStore.hasDiary(day.date)
        }"
        v-for="(day, idx) in monthDays"
        :key="idx"
        @tap="selectDate(day.date)"
      >
        <text class="day-number">{{ day.day }}</text>
        <view class="day-indicator" v-if="getHoliday(day.date)">
          <text class="holiday-dot">·</text>
        </view>
        <view class="diary-dot" v-if="diaryStore.hasDiary(day.date)"></view>
      </view>
    </view>

    <!-- 选中日期的详情 -->
    <view class="selected-detail card" v-if="selectedDate">
      <view class="detail-header">
        <text class="detail-date">{{ selectedDate }}</text>
        <text class="detail-weekday">{{ formatDate(selectedDate, 'dddd') }}</text>
        <text class="detail-holiday" v-if="selectedHoliday">- {{ selectedHoliday }}</text>
      </view>

      <view class="detail-body" v-if="selectedDiary">
        <view class="detail-content">
          <text>{{ selectedDiary.content.slice(0, 200) }}</text>
        </view>
        <view class="detail-footer">
          <text class="read-more" @tap="uni.navigateTo({ url: `/pages/diary/diary?date=${selectedDate}` })">查看完整日记 &gt;</text>
        </view>
      </view>

      <view class="detail-empty" v-else>
        <text class="empty-text">今天还没有日记</text>
        <view class="btn-small" @tap="goWriteDiary(selectedDate)">写一篇</view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page { padding-top: 24rpx; padding-bottom: 40rpx; }
.month-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
  padding: 0 32rpx 24rpx;
  .nav-arrow { font-size: 36rpx; color: $primary-color; padding: 0 12rpx; }
  .month-title { font-size: 34rpx; font-weight: 700; min-width: 200rpx; text-align: center; }
  .today-btn {
    position: absolute;
    right: 32rpx;
    font-size: 26rpx;
    color: $primary-color;
    padding: 8rpx 20rpx;
    background: $primary-light;
    border-radius: 24rpx;
  }
}
.weekday-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 0 32rpx 16rpx;
  .weekday { text-align: center; font-size: 24rpx; color: $text-secondary; }
}
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4rpx;
  padding: 0 24rpx 24rpx;
  .day-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12rpx 0;
    border-radius: 16rpx;
    position: relative;
    &.other-month { opacity: 0.3; }
    &.today {
      background: $primary-light;
      .day-number { color: $primary-color; font-weight: 700; }
    }
    &.selected { background: $primary-color; .day-number { color: #fff; font-weight: 700; } }
    .day-number { font-size: 28rpx; }
    .diary-dot {
      width: 8rpx;
      height: 8rpx;
      border-radius: 50%;
      background: $primary-color;
      margin-top: 4rpx;
    }
    .day-indicator {
      position: absolute;
      top: 4rpx;
      right: 4rpx;
      .holiday-dot { color: $danger-color; font-size: 20rpx; }
    }
  }
}
.selected-detail {
  .detail-header {
    margin-bottom: 16rpx;
    .detail-date { font-size: 30rpx; font-weight: 600; }
    .detail-weekday { font-size: 24rpx; color: $text-secondary; margin-left: 12rpx; }
    .detail-holiday { font-size: 24rpx; color: $danger-color; margin-left: 8rpx; }
  }
  .detail-content { font-size: 28rpx; color: $text-secondary; line-height: 1.7; }
  .detail-footer { margin-top: 16rpx; .read-more { font-size: 26rpx; color: $primary-color; } }
  .detail-empty { margin-top: 16rpx; display: flex; align-items: center; gap: 20rpx;
    .empty-text { font-size: 26rpx; color: $text-light; }
  }
}
</style>
