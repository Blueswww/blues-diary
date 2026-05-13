import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getDiariesByDateRange,
  getDiaryByDate,
  createDiary,
  updateDiary,
  deleteDiary,
  getDiariesByTag,
  type DiaryRecord,
  type DiaryCreateInput,
  type DiaryUpdateInput,
} from '@/api/diary'
import { getToday } from '@/utils/dayjs'

export const useDiaryStore = defineStore('diary', () => {
  // 当月日记缓存（key: YYYY-MM-DD, value: 日记）
  const diaryMap = ref<Record<string, DiaryRecord>>({})
  const diaryList = ref<DiaryRecord[]>([])   // 用于列表展示
  const currentDiary = ref<DiaryRecord | null>(null)
  const loading = ref(false)

  /** 加载某月有日记的日期（日历标记用） */
  const diaryDates = ref<Set<string>>(new Set())

  /** 获取指定日期范围内的日记 */
  async function loadDiariesByMonth(year: number, month: number) {
    loading.value = true
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-01`

    const res = await getDiariesByDateRange(startDate, endDate)
    if (res.success && res.data) {
      res.data.forEach(d => {
        diaryMap.value[d.date] = d
        diaryDates.value.add(d.date)
      })
      diaryList.value = res.data
    }
    loading.value = false
  }

  /** 获取指定日期的日记 */
  async function loadDiaryByDate(date: string) {
    if (diaryMap.value[date]) {
      currentDiary.value = diaryMap.value[date]
      return diaryMap.value[date]
    }

    loading.value = true
    const res = await getDiaryByDate(date)
    if (res.success && res.data) {
      diaryMap.value[date] = res.data
      currentDiary.value = res.data
      diaryDates.value.add(date)
      loading.value = false
      return res.data
    }
    currentDiary.value = null
    loading.value = false
    return null
  }

  /** 创建日记 */
  async function addDiary(input: DiaryCreateInput) {
    const res = await createDiary(input)
    if (res.success && res.data) {
      diaryMap.value[input.date] = res.data
      diaryDates.value.add(input.date)
      diaryList.value.unshift(res.data)
      return true
    }
    return false
  }

  /** 更新日记 */
  async function editDiary(input: DiaryUpdateInput) {
    const res = await updateDiary(input)
    if (res.success && res.data) {
      diaryMap.value[res.data.date] = res.data
      if (currentDiary.value?._id === res.data._id) {
        currentDiary.value = res.data
      }
      return true
    }
    return false
  }

  /** 删除日记 */
  async function removeDiary(id: string) {
    const res = await deleteDiary(id)
    if (res.success) {
      // 从缓存中移除
      for (const date in diaryMap.value) {
        if (diaryMap.value[date]._id === id) {
          diaryDates.value.delete(date)
          delete diaryMap.value[date]
          break
        }
      }
      diaryList.value = diaryList.value.filter(d => d._id !== id)
      if (currentDiary.value?._id === id) {
        currentDiary.value = null
      }
      return true
    }
    return false
  }

  /** 按标签获取日记 */
  async function loadDiariesByTag(tagId: string) {
    loading.value = true
    const res = await getDiariesByTag(tagId)
    if (res.success && res.data) {
      diaryList.value = res.data
    }
    loading.value = false
  }

  /** 检查某天是否有日记 */
  function hasDiary(date: string): boolean {
    return diaryDates.value.has(date)
  }

  return {
    diaryMap,
    diaryList,
    currentDiary,
    diaryDates,
    loading,
    loadDiariesByMonth,
    loadDiaryByDate,
    addDiary,
    editDiary,
    removeDiary,
    loadDiariesByTag,
    hasDiary,
  }
})
