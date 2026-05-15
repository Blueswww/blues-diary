import { defineStore } from 'pinia'
import { ref } from 'vue'
import { computeYearHolidays, type HolidayInfo } from '@/utils/holidayCalculator'
import { commonAnniversaries } from '@/utils/holidays'

const CACHE_KEY = 'holiday_cache'
const CACHE_YEAR_KEY = 'holiday_cache_year'

export const useHolidayStore = defineStore('holiday', () => {
  const holidays = ref<HolidayInfo[]>([])
  const loaded = ref(false)

  function pad(n: number): string {
    return String(n).padStart(2, '0')
  }

  /** 从缓存加载 */
  function loadFromCache(year: number): boolean {
    try {
      const cacheYear = uni.getStorageSync(CACHE_YEAR_KEY)
      if (cacheYear !== year) return false
      const cached = uni.getStorageSync(CACHE_KEY)
      if (cached) {
        holidays.value = JSON.parse(cached)
        return true
      }
    } catch {}
    return false
  }

  function saveToCache(year: number) {
    try {
      uni.setStorageSync(CACHE_YEAR_KEY, year)
      uni.setStorageSync(CACHE_KEY, JSON.stringify(holidays.value))
    } catch {}
  }

  /**
   * 加载节假日数据
   * 算法本地计算 → 缓存，无需云端
   * 每年第一次打开时自动计算新数据
   */
  async function loadHolidays() {
    const now = new Date()
    const year = now.getFullYear()

    // 缓存命中且年份一致则跳过
    if (loaded.value && loadFromCache(year)) return

    // 计算今年 + 明年（因为除夕/腊八可能落在次年1月）
    const thisYear = computeYearHolidays(year)
    const nextYear = computeYearHolidays(year + 1)
    holidays.value = [...thisYear, ...nextYear]

    saveToCache(year)
    loaded.value = true
  }

  /** 获取指定日期的节日名称 */
  function getHolidayName(date: string): string | null {
    const h = holidays.value.find(h => h.date === date)
    return h?.name ?? null
  }

  /** 获取指定月日的常见纪念日 */
  function getCommonAnniversaryName(month: number, day: number): string | null {
    const item = commonAnniversaries.find(a => a.month === month && a.day === day)
    return item?.name ?? null
  }

  function clearCache() {
    holidays.value = []
    loaded.value = false
    try {
      uni.removeStorageSync(CACHE_KEY)
      uni.removeStorageSync(CACHE_YEAR_KEY)
    } catch {}
  }

  return {
    holidays,
    loaded,
    loadHolidays,
    getHolidayName,
    getCommonAnniversaryName,
    clearCache,
  }
})
