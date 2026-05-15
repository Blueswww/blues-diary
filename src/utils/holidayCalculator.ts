/**
 * 算法化节假日计算器
 * 无需人工维护，每年自动计算
 * - 农历节日 → 通过 lunar-javascript 转换
 * - 固定公历节日 → 硬编码
 * - 浮动节日（母亲节/父亲节/感恩节）→ 按周计算
 * - 清明节 → 节气计算
 */
import { Solar, Lunar } from 'lunar-javascript'

export interface HolidayInfo {
  date: string  // YYYY-MM-DD
  name: string
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function fmt(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`
}

/** 计算某个月的第 N 个星期几的日期 */
function nthWeekday(year: number, month: number, weekday: number, nth: number): string {
  const first = new Date(year, month - 1, 1)
  const firstDow = first.getDay()       // 0=Sun
  let diff = (weekday - firstDow + 7) % 7
  diff += (nth - 1) * 7
  const date = new Date(year, month - 1, 1 + diff)
  return fmt(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

/**
 * 计算指定年份的全部节日
 * 可在每年 12 月 31 日自动调用，生成下一年数据
 */
export function computeYearHolidays(year: number): HolidayInfo[] {
  const map = new Map<string, string>()   // date → name（同名节日覆盖，不同名以第一个为准）

  function add(date: string, name: string) {
    if (!map.has(date)) {
      map.set(date, name)
    }
  }

  // ==================== 固定公历节日 ====================
  const solarFestivals: [number, number, string][] = [
    [1, 1, '元旦'],
    [2, 14, '情人节'],
    [3, 8, '妇女节'],
    [3, 12, '植树节'],
    [4, 1, '愚人节'],
    [5, 1, '劳动节'],
    [5, 4, '青年节'],
    [6, 1, '儿童节'],
    [7, 1, '建党节'],
    [8, 1, '建军节'],
    [9, 10, '教师节'],
    [10, 1, '国庆节'],
    [10, 31, '万圣节'],
    [12, 24, '平安夜'],
    [12, 25, '圣诞节'],
    [12, 31, '跨年夜'],
  ]
  for (const [m, d, name] of solarFestivals) {
    add(fmt(year, m, d), name)
  }

  // ==================== 农历节日 ====================
  const lunarFestivals: [number, number, string][] = [
    [1, 1, '春节'],
    [1, 15, '元宵节'],
    [5, 5, '端午节'],
    [7, 7, '七夕节'],
    [7, 15, '中元节'],
    [8, 15, '中秋节'],
    [9, 9, '重阳节'],
    [12, 8, '腊八节'],
    [12, 23, '小年'],
  ]
  for (const [lm, ld, name] of lunarFestivals) {
    try {
      const lunar = Lunar.fromYmd(year, lm, ld)
      const s = lunar.getSolar()
      add(fmt(s.getYear(), s.getMonth(), s.getDay()), name)
    } catch {
      // 该农历日不存在（如该年腊月只有 29 天）
    }
  }

  // 除夕 = 腊月最后一天
  try {
    const lunar = Lunar.fromYmd(year, 12, 30)
    const s = lunar.getSolar()
    add(fmt(s.getYear(), s.getMonth(), s.getDay()), '除夕')
  } catch {
    try {
      const lunar = Lunar.fromYmd(year, 12, 29)
      const s = lunar.getSolar()
      add(fmt(s.getYear(), s.getMonth(), s.getDay()), '除夕')
    } catch {}
  }

  // ==================== 清明节（节气） ====================
  // 清明节气在 4 月 4-6 日之间
  for (let d = 3; d <= 7; d++) {
    const solar = Solar.fromYmd(year, 4, d)
    if (solar.getLunar().getJieQi() === '清明') {
      add(fmt(year, 4, d), '清明节')
      break
    }
  }

  // ==================== 浮动节日 ====================
  // 母亲节：5 月第 2 个星期日
  add(nthWeekday(year, 5, 0, 2), '母亲节')
  // 父亲节：6 月第 3 个星期日
  add(nthWeekday(year, 6, 0, 3), '父亲节')
  // 感恩节：11 月第 4 个星期四
  add(nthWeekday(year, 11, 4, 4), '感恩节')

  // 按日期排序
  return Array.from(map.entries())
    .map(([date, name]) => ({ date, name }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
