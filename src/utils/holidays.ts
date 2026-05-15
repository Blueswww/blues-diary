/**
 * 内置中国法定节假日数据
 * 优先使用云端数据，静态数据作为离线/加载前的降级方案
 */

export interface Holiday {
  date: string    // YYYY-MM-DD
  name: string
  type: 'holiday' | 'workday'  // 法定假日 或 调休工作日
}

// 2026年节假日安排（静态降级数据）
export const holidays2026: Holiday[] = [
  // 元旦
  { date: '2026-01-01', name: '元旦', type: 'holiday' },
  { date: '2026-01-02', name: '元旦', type: 'holiday' },
  { date: '2026-01-03', name: '元旦', type: 'holiday' },
  // 春节
  { date: '2026-02-15', name: '腊月廿八', type: 'holiday' },
  { date: '2026-02-16', name: '除夕', type: 'holiday' },
  { date: '2026-02-17', name: '春节', type: 'holiday' },
  { date: '2026-02-18', name: '春节', type: 'holiday' },
  { date: '2026-02-19', name: '春节', type: 'holiday' },
  { date: '2026-02-20', name: '春节', type: 'holiday' },
  { date: '2026-02-21', name: '春节', type: 'holiday' },
  { date: '2026-02-22', name: '春节', type: 'holiday' },
  { date: '2026-02-23', name: '春节', type: 'holiday' },
  // 清明节
  { date: '2026-04-04', name: '清明节', type: 'holiday' },
  { date: '2026-04-05', name: '清明节', type: 'holiday' },
  { date: '2026-04-06', name: '清明节', type: 'holiday' },
  // 劳动节
  { date: '2026-05-01', name: '劳动节', type: 'holiday' },
  { date: '2026-05-02', name: '劳动节', type: 'holiday' },
  { date: '2026-05-03', name: '劳动节', type: 'holiday' },
  { date: '2026-05-04', name: '劳动节', type: 'holiday' },
  { date: '2026-05-05', name: '劳动节', type: 'holiday' },
  // 端午节
  { date: '2026-06-19', name: '端午节', type: 'holiday' },
  { date: '2026-06-20', name: '端午节', type: 'holiday' },
  { date: '2026-06-21', name: '端午节', type: 'holiday' },
  // 中秋节
  { date: '2026-09-25', name: '中秋节', type: 'holiday' },
  { date: '2026-09-26', name: '中秋节', type: 'holiday' },
  { date: '2026-09-27', name: '中秋节', type: 'holiday' },
  // 国庆节
  { date: '2026-10-01', name: '国庆节', type: 'holiday' },
  { date: '2026-10-02', name: '国庆节', type: 'holiday' },
  { date: '2026-10-03', name: '国庆节', type: 'holiday' },
  { date: '2026-10-04', name: '国庆节', type: 'holiday' },
  { date: '2026-10-05', name: '国庆节', type: 'holiday' },
  { date: '2026-10-06', name: '国庆节', type: 'holiday' },
  { date: '2026-10-07', name: '国庆节', type: 'holiday' },
]

// 常见纪念日
export const commonAnniversaries: { month: number; day: number; name: string }[] = [
  { month: 1, day: 1, name: '元旦' },
  { month: 2, day: 14, name: '情人节' },
  { month: 3, day: 8, name: '妇女节' },
  { month: 5, day: 1, name: '劳动节' },
  { month: 6, day: 1, name: '儿童节' },
  { month: 9, day: 10, name: '教师节' },
  { month: 10, day: 1, name: '国庆节' },
  { month: 12, day: 25, name: '圣诞节' },
]

/** 获取指定日期的节日名称（如果有的话） */
export function getHoliday(date: string): string | null {
  const holiday = holidays2026.find(h => h.date === date && h.type === 'holiday')
  return holiday?.name ?? null
}

/** 获取指定月日的常见纪念日 */
export function getCommonAnniversary(month: number, day: number): string | null {
  const item = commonAnniversaries.find(a => a.month === month && a.day === day)
  return item?.name ?? null
}

/** 判断是否为工作日（考虑调休） */
export function isWorkday(date: string): boolean {
  const d = new Date(date)
  const dayOfWeek = d.getDay()
  const holidayInfo = holidays2026.find(h => h.date === date)

  if (holidayInfo) {
    return holidayInfo.type === 'workday'
  }
  // 默认：周末休息
  return dayOfWeek !== 0 && dayOfWeek !== 6
}

export function isHoliday(date: string): boolean {
  return !isWorkday(date)
}
