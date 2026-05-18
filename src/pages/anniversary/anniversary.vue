<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { useUserStore } from '@/store/user'
import { useAnniversaryStore } from '@/store/anniversary'
import { Solar } from 'lunar-javascript'
import dayjs, { getToday } from '@/utils/dayjs'
import { getNextLunarDate } from '@/utils/lunar'
import EmptyState from '@/components/EmptyState.vue'

const userStore = useUserStore()
const store = useAnniversaryStore()
const showForm = ref(false)
const editingId = ref<string | null>(null)
const isEditing = computed(() => !!editingId.value)
const nameInput = ref('')
const form = ref({ date: getToday(), type: 'solar' as 'solar' | 'lunar', isOneTime: false })

onShow(() => {
  if (!userStore.isLoggedIn) {
    store.clearCache()
    return
  }
  store.loadAnniversaries()
})

function requireLogin(): boolean {
  if (!userStore.isLoggedIn) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return false
  }
  return true
}

/** 过滤掉已过期的一次性提醒 */
const visibleAnniversaries = computed(() => {
  const today = dayjs().startOf('day')
  return store.anniversaries.filter(a => {
    if (!a.isOneTime) return true
    if (a.type === 'lunar') {
      // 阴历一次性：用换算后的阳历日期判断
      const nextSolar = getNextLunarDate(a.date)
      return dayjs(nextSolar).startOf('day').isAfter(today) || dayjs(nextSolar).startOf('day').isSame(today, 'day')
    }
    return dayjs(a.date).startOf('day').isAfter(today) || dayjs(a.date).startOf('day').isSame(today, 'day')
  })
})

/** 计算提醒的倒计时/已过天数 */
function itemInfo(item: { date: string; type: string; isOneTime: boolean }): { badge: string; detail?: string } {
  const today = dayjs().startOf('day')

  if (item.type === 'lunar') {
    // 阴历：换算到最近的下一次阳历日期
    const nextDate = getNextLunarDate(item.date)
    const target = dayjs(nextDate).startOf('day')
    const diff = target.diff(today, 'day')
    const originalTarget = dayjs(item.date).startOf('day')
    const totalElapsed = today.diff(originalTarget, 'day')
    if (diff === 0) {
      if (totalElapsed > 0) return { badge: '就是今天!', detail: `已过 ${totalElapsed} 天` }
      return { badge: '就是今天!' }
    }
    if (diff > 0) return { badge: `还有 ${diff} 天`, detail: totalElapsed > 0 ? `已过 ${totalElapsed} 天` : undefined }
    if (item.isOneTime) return { badge: '已过期' }
    return { badge: '已过期', detail: `已过 ${totalElapsed} 天` }
  }

  // 阳历：在当前年找对应月日
  const target = dayjs(item.date).startOf('day')
  const thisYear = dayjs(`${today.year()}-${target.format('MM-DD')}`).startOf('day')
  const diff = thisYear.diff(today, 'day')

  if (diff === 0) {
    if (item.isOneTime) return { badge: '就是今天!' }
    // 原日期是往年但月日同今天：纪念日在今天，同时显示总天数
    const elapsed = today.diff(target, 'day')
    if (elapsed > 0) return { badge: '就是今天!', detail: `已过 ${elapsed} 天` }
    return { badge: '就是今天!' }
  }
  if (diff > 0) {
    // 今年还未到：同时显示从原始日期算的已过天数
    const totalElapsed = today.diff(target, 'day')
    return { badge: `还有 ${diff} 天`, detail: totalElapsed > 0 ? `已过 ${totalElapsed} 天` : undefined }
  }
  if (item.isOneTime) return { badge: '已过期' }

  const nextYearDate = thisYear.add(1, 'year')
  const nextDiff = nextYearDate.diff(today, 'day')
  const totalElapsed = today.diff(target, 'day')
  return { badge: `还有 ${nextDiff} 天`, detail: `已过 ${totalElapsed} 天` }
}

function startEdit(item: { _id: string; name: string; date: string; type: 'solar' | 'lunar'; isOneTime: boolean }) {
  editingId.value = item._id
  nameInput.value = item.name
  form.value = { date: item.date, type: item.type, isOneTime: item.isOneTime }
  showForm.value = true
}

function cancelEdit() {
  editingId.value = null
  nameInput.value = ''
  form.value = { date: getToday(), type: 'solar', isOneTime: false }
  showForm.value = false
}

async function saveItem() {
  if (!requireLogin()) return
  if (!nameInput.value.trim()) {
    uni.showToast({ title: '请输入提醒名称', icon: 'none' })
    return
  }
  // 校验：一次性日期不能在过去
  if (form.value.isOneTime) {
    const checkDate = form.value.type === 'lunar' ? getNextLunarDate(form.value.date) : form.value.date
    if (dayjs(checkDate).isBefore(dayjs(), 'day')) {
      uni.showToast({ title: '日期已过，无法添加一次性提醒', icon: 'none' })
      return
    }
  }
  const payload = { ...form.value, name: nameInput.value.trim() }
  if (editingId.value) {
    await store.editAnniversary(editingId.value, payload)
    cancelEdit()
  } else {
    await store.addAnniversary(payload)
    nameInput.value = ''
    form.value = { date: getToday(), type: 'solar', isOneTime: false }
    showForm.value = false
  }
}

function deleteItem(id: string, name: string) {
  if (!requireLogin()) return
  uni.showModal({
    title: '删除提醒',
    content: `确定删除「${name}」吗？`,
    success: (res) => { if (res.confirm) store.removeAnniversary(id) },
  })
}

const LUNAR_MONTHS = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊']
const LUNAR_DAYS = [
  '初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
  '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
  '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十',
]

function getLunarDisplay(solarDate: string): string {
  const d = dayjs(solarDate)
  if (!d.isValid()) return ''
  const solar = Solar.fromYmd(d.year(), d.month() + 1, d.date())
  const lunar = solar.getLunar()
  const m = lunar.getMonth()
  const day = lunar.getDay()
  return `农历${LUNAR_MONTHS[m - 1]}月${LUNAR_DAYS[day - 1]}`
}
</script>

<template>
  <view class="page">
    <view class="header-actions" v-if="userStore.isLoggedIn">
      <view class="btn-small" @tap="isEditing ? cancelEdit() : (showForm = !showForm)">
        {{ showForm ? '取消' : '+ 添加提醒' }}
      </view>
    </view>

    <!-- 添加/编辑表单 -->
    <view class="form-area card" v-if="showForm">
      <text class="form-title">{{ isEditing ? '编辑提醒' : '新建提醒' }}</text>
      <input class="input-field" v-model="nameInput" placeholder="提醒名称" style="color: #1a1a2e;" />
      <picker mode="date" :value="form.date" @change="e => form.date = e.detail.value">
        <view class="picker">{{ form.date }}</view>
      </picker>
      <text class="lunar-hint" v-if="form.type === 'lunar'">{{ getLunarDisplay(form.date) }}</text>
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
      <view class="checkbox-row" @tap="form.isOneTime = !form.isOneTime">
        <view class="checkbox" :class="{ checked: form.isOneTime }">
          <text v-if="form.isOneTime">✓</text>
        </view>
        <text class="checkbox-label">一次性（日期过后消失）</text>
      </view>
      <view class="btn-row">
        <view class="btn-primary" @tap="saveItem">{{ isEditing ? '更新' : '保存' }}</view>
        <view class="btn-cancel" v-if="isEditing" @tap="cancelEdit">取消编辑</view>
      </view>
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

    <!-- 全部提醒 -->
    <view class="section">
      <text class="section-title">全部提醒</text>
      <view class="anniversary-list" v-if="visibleAnniversaries.length">
        <view class="anniversary-item card" v-for="item in visibleAnniversaries" :key="item._id">
          <view class="item-info">
            <text class="item-name">{{ item.name }}</text>
            <text class="item-date">
              {{ item.date }} ({{ item.type === 'lunar' ? getLunarDisplay(item.date) : '阳历' }})
              <text class="one-time-tag" v-if="item.isOneTime">一次性</text>
            </text>
            <view class="badge-row">
              <text class="countdown-badge">{{ itemInfo(item).badge }}</text>
              <text class="elapsed-text" v-if="itemInfo(item).detail">{{ itemInfo(item).detail }}</text>
            </view>
          </view>
          <view class="item-actions" v-if="userStore.isLoggedIn">
            <text class="edit-btn" @tap="startEdit(item)">编辑</text>
            <text class="delete-btn" @tap="deleteItem(item._id, item.name)">删除</text>
          </view>
        </view>
      </view>
      <EmptyState v-else text="还没有提醒" />
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
  .input-field {
    flex: 1;
    height: 72rpx;
    padding: 0 28rpx;
    background: $bg-color;
    border-radius: 16rpx;
    border: 2rpx solid $border-color;
    font-size: 28rpx;
    color: #1a1a2e;
  }
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
  .lunar-hint { font-size: 24rpx; color: $primary-color; text-align: center; }
  .form-title { font-size: 30rpx; font-weight: 600; color: $text-primary; text-align: center; }
  .checkbox-row {
    display: flex;
    align-items: center;
    gap: 16rpx;
    .checkbox {
      width: 36rpx;
      height: 36rpx;
      border-radius: 8rpx;
      border: 2rpx solid $border-color;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24rpx;
      color: #fff;
      &.checked { background: $primary-color; border-color: $primary-color; }
    }
    .checkbox-label { font-size: 26rpx; color: $text-secondary; }
  }
  .btn-row { display: flex; gap: 16rpx; align-items: center; }
  .btn-cancel {
    font-size: 26rpx;
    color: $text-secondary;
    padding: 20rpx 32rpx;
    text-align: center;
    border-radius: 40rpx;
    border: 2rpx solid $border-color;
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
  .one-time-tag { font-size: 20rpx; color: $warning-color; background: #FFF3E0; padding: 2rpx 10rpx; border-radius: 10rpx; margin-left: 8rpx; vertical-align: middle; }
  .badge-row { display: flex; gap: 12rpx; align-items: center; margin-top: 4rpx; }
  .countdown-badge {
    display: inline-block;
    font-size: 24rpx;
    color: $primary-color;
    background: $primary-light;
    padding: 4rpx 16rpx;
    border-radius: 16rpx;
    margin-top: 4rpx;
  }
  .elapsed-text { font-size: 24rpx; color: $text-secondary; }
  .item-actions { display: flex; flex-direction: column; gap: 12rpx; }
  .edit-btn { color: $primary-color; font-size: 26rpx; }
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
