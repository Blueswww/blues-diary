import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getDiariesByDateRange,
  getDiariesByDate,
  createDiary,
  updateDiary,
  deleteDiary,
  getDiariesByTag,
  type DiaryRecord,
  type DiaryCreateInput,
  type DiaryUpdateInput,
} from '@/api/diary'
import dayjs from '@/utils/dayjs'

export const useDiaryStore = defineStore('diary', () => {
  // 当月日记缓存（key: YYYY-MM-DD, value: 该天所有日记条目）
  const diaryMap = ref<Record<string, DiaryRecord[]>>({})
  const diaryList = ref<DiaryRecord[]>([])   // 平铺列表，用于首页展示
  const currentEntries = ref<DiaryRecord[]>([])  // 当前选中日期的所有条目
  const loading = ref(false)

  /** 有日记的日期集合（日历标记用） */
  const diaryDates = ref<Set<string>>(new Set())

  /** 连续写日记天数 */
  const weekStreak = computed(() => {
    let count = 0
    const today = dayjs()
    for (let i = 0; i < 365; i++) {
      const d = today.subtract(i, 'day').format('YYYY-MM-DD')
      if (diaryDates.value.has(d)) {
        count++
      } else {
        break
      }
    }
    return count
  })

  /** 获取指定日期范围内的日记 */
  async function loadDiariesByMonth(year: number, month: number) {
    loading.value = true
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-01`

    const res = await getDiariesByDateRange(startDate, endDate)
    if (res.success && res.data) {
      const newMap: Record<string, DiaryRecord[]> = {}
      const newDates = new Set<string>()
      res.data.forEach(d => {
        if (!newMap[d.date]) newMap[d.date] = []
        newMap[d.date].push(d)
        newDates.add(d.date)
      })
      diaryMap.value = newMap
      diaryDates.value = newDates
      diaryList.value = res.data
    }
    loading.value = false
  }

  /** 获取指定日期的所有日记 */
  async function loadDiariesByDate(date: string): Promise<DiaryRecord[]> {
    if (diaryMap.value[date]) {
      currentEntries.value = diaryMap.value[date]
      return diaryMap.value[date]
    }

    loading.value = true
    const res = await getDiariesByDate(date)
    if (res.success && res.data) {
      diaryMap.value[date] = res.data
      currentEntries.value = res.data
      if (res.data.length > 0) diaryDates.value.add(date)
      loading.value = false
      return res.data
    }
    currentEntries.value = []
    loading.value = false
    return []
  }

  /** 创建日记 */
  async function addDiary(input: DiaryCreateInput) {
    const res = await createDiary(input)
    if (res.success && res.data) {
      if (!diaryMap.value[input.date]) diaryMap.value[input.date] = []
      diaryMap.value[input.date].push(res.data)
      diaryDates.value.add(input.date)
      diaryList.value.unshift(res.data)
      currentEntries.value = diaryMap.value[input.date]
      return true
    }
    return false
  }

  /** 更新日记 */
  async function editDiary(input: DiaryUpdateInput) {
    const res = await updateDiary(input)
    if (res.success && res.data) {
      const idx = diaryList.value.findIndex(d => d._id === input._id)
      if (idx >= 0) diaryList.value[idx] = res.data

      for (const date in diaryMap.value) {
        const arr = diaryMap.value[date]
        const i = arr.findIndex(d => d._id === input._id)
        if (i >= 0) {
          arr[i] = res.data
          break
        }
      }

      const ci = currentEntries.value.findIndex(d => d._id === input._id)
      if (ci >= 0) currentEntries.value[ci] = res.data

      return true
    }
    return false
  }

  /** 删除日记 */
  async function removeDiary(id: string) {
    const res = await deleteDiary(id)
    if (res.success) {
      for (const date in diaryMap.value) {
        const arr = diaryMap.value[date]
        const idx = arr.findIndex(d => d._id === id)
        if (idx >= 0) {
          arr.splice(idx, 1)
          if (arr.length === 0) {
            delete diaryMap.value[date]
            diaryDates.value.delete(date)
          }
          break
        }
      }
      diaryList.value = diaryList.value.filter(d => d._id !== id)
      currentEntries.value = currentEntries.value.filter(d => d._id !== id)
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

  /** 清空缓存（退出登录时调用） */
  function clearCache() {
    diaryMap.value = {}
    diaryList.value = []
    currentEntries.value = []
    diaryDates.value = new Set()
    loading.value = false
  }

  /** 检查某天是否有日记 */
  function hasDiary(date: string): boolean {
    return diaryDates.value.has(date)
  }

  return {
    diaryMap,
    diaryList,
    currentEntries,
    diaryDates,
    weekStreak,
    loading,
    loadDiariesByMonth,
    loadDiariesByDate,
    addDiary,
    editDiary,
    removeDiary,
    clearCache,
    loadDiariesByTag,
    hasDiary,
  }
})
