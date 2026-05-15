<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { useAnniversaryStore } from '@/store/anniversary'
import dayjs, { getToday } from '@/utils/dayjs'
import EmptyState from '@/components/EmptyState.vue'

const store = useAnniversaryStore()
const showForm = ref(false)
const form = ref({ name: '', date: getToday(), type: 'solar' as 'solar' | 'lunar' })

onShow(() => store.loadAnniversaries())

async function addAnniversary() {
  if (!form.value.name.trim()) {
    uni.showToast({ title: '请输入纪念日名称', icon: 'none' })
    return
  }
  await store.addAnniversary({ ...form.value })
  form.value = { name: '', date: getToday(), type: 'solar' }
  showForm.value = false
}

function deleteItem(id: string, name: string) {
  uni.showModal({
    title: '删除纪念日',
    content: `确定删除「${name}」吗？`,
    success: (res) => { if (res.confirm) store.removeAnniversary(id) },
  })
}

function countDays(targetDate: string): string {
  const today = dayjs()
  const target = dayjs(targetDate)
  const thisYear = dayjs(`${today.year()}-${target.format('MM-DD')}`)
  const diff = thisYear.diff(today, 'day')
  if (diff === 0) return '就是今天!'
  if (diff > 0) return `还有 ${diff} 天`
  const nextYear = thisYear.add(1, 'year')
  const nextDiff = nextYear.diff(today, 'day')
  return `还有 ${nextDiff} 天`
}
</script>

<template>
  <view class="page">
    <view class="header-actions">
      <view class="btn-small" @tap="showForm = !showForm">
        {{ showForm ? '取消' : '+ 添加纪念日' }}
      </view>
    </view>

    <!-- 添加表单 -->
    <view class="form-area card" v-if="showForm">
      <input class="input-field" v-model="form.name" placeholder="纪念日名称" />
      <picker mode="date" :value="form.date" @change="e => form.date = e.detail.value">
        <view class="picker">{{ form.date }}</view>
      </picker>
      <view class="type-select">
        <text
          class="type-option"
          :class="{ active: form.type === 'solar' }"
          @tap="form.type = 'solar'"
        >阳历</text>
        <text
          class="type-option"
          :class="{ active: form.type === 'lunar' }"
          @tap="form.type = 'lunar'"
        >阴历</text>
      </view>
      <view class="btn-primary" @tap="addAnniversary">保存</view>
    </view>

    <!-- 即将到来 -->
    <view class="section" v-if="store.upcomingAnniversaries.length">
      <text class="section-title">即将到来</text>
      <view class="upcoming-list">
        <view
          class="upcoming-item card"
          v-for="item in store.upcomingAnniversaries"
          :key="item._id"
        >
          <view class="item-left">
            <text class="item-name">{{ item.name }}</text>
            <text class="item-countdown">{{ item.daysUntil }} 天后</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 全部纪念日 -->
    <view class="section">
      <text class="section-title">全部纪念日</text>
      <view class="anniversary-list" v-if="store.anniversaries.length">
        <view class="anniversary-item card" v-for="item in store.anniversaries" :key="item._id">
          <view class="item-info">
            <text class="item-name">{{ item.name }}</text>
            <text class="item-date">{{ item.date }} ({{ item.type === 'lunar' ? '阴历' : '阳历' }})</text>
            <view class="countdown-badge">{{ countDays(item.date) }}</view>
          </view>
          <text class="delete-btn" @tap="deleteItem(item._id, item.name)">删除</text>
        </view>
      </view>
      <EmptyState v-else text="还没有纪念日" />
    </view>
  </view>
</template>

<style lang="scss">
.page { padding-top: 24rpx; }
.header-actions { padding: 0 32rpx 24rpx; display: flex; justify-content: flex-end; }
.form-area {
  margin: 0 32rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  .picker {
    padding: 24rpx 28rpx;
    background: $bg-color;
    border-radius: 16rpx;
    border: 2rpx solid $border-color;
    font-size: 28rpx;
  }
  .type-select {
    display: flex;
    gap: 16rpx;
    .type-option {
      padding: 12rpx 32rpx;
      border-radius: 30rpx;
      font-size: 26rpx;
      background: $bg-color;
      color: $text-secondary;
      &.active { background: $primary-light; color: $primary-color; font-weight: 500; }
    }
  }
}
.section { padding: 0 32rpx 24rpx; }
.section-title { font-size: 28rpx; font-weight: 600; color: $text-primary; margin-bottom: 16rpx; display: block; }
.anniversary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
  .item-info { display: flex; flex-direction: column; gap: 8rpx; }
  .item-name { font-size: 30rpx; font-weight: 500; }
  .item-date { font-size: 24rpx; color: $text-secondary; }
  .countdown-badge {
    display: inline-block;
    font-size: 24rpx;
    color: $primary-color;
    background: $primary-light;
    padding: 4rpx 16rpx;
    border-radius: 16rpx;
    margin-top: 4rpx;
  }
  .delete-btn { color: $danger-color; font-size: 26rpx; }
}
.upcoming-item {
  margin-bottom: 16rpx;
  .item-left {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .item-countdown { color: $primary-color; font-weight: 500; }
  }
}
</style>
