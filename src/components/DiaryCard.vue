<script setup lang="ts">
import type { DiaryRecord } from '@/api/diary'
import TagBadge from './TagBadge.vue'
import { formatDate } from '@/utils/dayjs'
import { useTagStore } from '@/store/tag'

const props = defineProps<{
  diary: DiaryRecord
  showDate?: boolean
}>()

const tagStore = useTagStore()

function getTagName(tagId: string): string {
  return tagStore.getTagById(tagId)?.name || ''
}

function getTagColor(tagId: string): string {
  return tagStore.getTagById(tagId)?.color || '#5B7FFF'
}
</script>

<template>
  <view class="diary-card card" @tap="uni.navigateTo({ url: `/pages/diary/diary?date=${diary.date}` })">
    <view class="card-header" v-if="showDate">
      <text class="date">{{ formatDate(diary.date, 'MM月DD日') }}</text>
      <text class="weekday">{{ formatDate(diary.date, 'dddd') }}</text>
    </view>

    <view class="mood-row" v-if="diary.mood">
      <text class="mood">{{ diary.mood }}</text>
    </view>

    <view class="content-preview">
      <text class="content">{{ diary.content }}</text>
    </view>

    <view class="tags-row" v-if="diary.tags && diary.tags.length">
      <TagBadge
        v-for="tagId in diary.tags"
        :key="tagId"
        :name="getTagName(tagId)"
        :color="getTagColor(tagId)"
      />
    </view>
  </view>
</template>

<style lang="scss">
.diary-card {
  .card-header {
    display: flex;
    align-items: baseline;
    gap: 16rpx;
    margin-bottom: 16rpx;
    .date { font-size: 30rpx; font-weight: 600; color: $text-primary; }
    .weekday { font-size: 24rpx; color: $text-light; }
  }
  .mood-row {
    margin-bottom: 12rpx;
    .mood { font-size: 40rpx; }
  }
  .content-preview {
    .content {
      font-size: 28rpx;
      color: $text-secondary;
      line-height: 1.7;
    }
  }
  .tags-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-top: 16rpx;
  }
}
</style>
