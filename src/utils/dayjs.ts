import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import isoWeek from 'dayjs/plugin/isoWeek'
import lunar from 'dayjs/plugin/lunar' // 可选: 阴历支持

dayjs.locale('zh-cn')
dayjs.extend(isoWeek)

export type DateFormat =
  | 'YYYY-MM-DD'
  | 'YYYY年MM月DD日'
  | 'MM月DD日'
  | 'dddd'
  | 'YYYY-MM-DD HH:mm'
  | 'HH:mm'

export function formatDate(date: string | Date | dayjs.ConfigType, format: DateFormat = 'YYYY-MM-DD'): string {
  return dayjs(date).format(format)
}

export function getToday(): string {
  return dayjs().format('YYYY-MM-DD')
}

export function getMonthDays(year: number, month: number): Array<{ date: string; day: number; isCurrentMonth: boolean }> {
  const firstDay = dayjs(`${year}-${month}-01`)
  const startOfMonth = firstDay.startOf('month')
  const endOfMonth = firstDay.endOf('month')
  // 填充到完整周
  const start = startOfMonth.isoWeekday() === 7 ? startOfMonth : startOfMonth.subtract(startOfMonth.isoWeekday(), 'day')
  const end = endOfMonth.isoWeekday() === 7 ? endOfMonth : endOfMonth.add(6 - endOfMonth.isoWeekday() + 1, 'day')

  const days = []
  let current = start
  while (current.isBefore(end) || current.isSame(end, 'day')) {
    days.push({
      date: current.format('YYYY-MM-DD'),
      day: current.date(),
      isCurrentMonth: current.month() + 1 === month
    })
    current = current.add(1, 'day')
  }
  return days
}

export function isToday(date: string): boolean {
  return date === getToday()
}

export function isSameDay(a: string, b: string): boolean {
  return dayjs(a).isSame(dayjs(b), 'day')
}

export function getRelativeDate(days: number): string {
  return dayjs().add(days, 'day').format('YYYY-MM-DD')
}

export default dayjs
