import { Solar, Lunar } from 'lunar-javascript'
import dayjs from '@/utils/dayjs'

/**
 * 将阳历日期转为农历，返回从今天往后最近的下一次阳历对应日期
 * 例：getNextLunarDate("2000-05-16") → 五月十六对应的农历四月十三在今年/明年的阳历日期
 */
export function getNextLunarDate(originalSolarDate: string): string {
  try {
    const d = dayjs(originalSolarDate)
    const solar = Solar.fromYmd(d.year(), d.month() + 1, d.date())
    const lunar = solar.getLunar()
    const lm = lunar.getMonth()
    const ld = lunar.getDay()
    const today = dayjs()
    for (let i = 0; i <= 400; i++) {
      const check = today.add(i, 'day')
      const cs = Solar.fromYmd(check.year(), check.month() + 1, check.date())
      const cl = cs.getLunar()
      if (cl.getMonth() === lm && cl.getDay() === ld) {
        return check.format('YYYY-MM-DD')
      }
    }
  } catch {}
  return originalSolarDate
}
