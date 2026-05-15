declare module 'lunar-javascript' {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar
    static fromDate(date: Date): Solar
    getYear(): number
    getMonth(): number
    getDay(): number
    toYmd(): string
    getLunar(): Lunar
    getFestivals(): string[]
    getOtherFestivals(): string[]
  }

  export class Lunar {
    static fromYmd(year: number, month: number, day: number): Lunar
    getYear(): number
    getMonth(): number
    getDay(): number
    getSolar(): Solar
    getFestivals(): string[]
    getOtherFestivals(): string[]
    getJieQi(): string
    getJieQiTable(): Record<string, Solar>
    toFullString(): string
  }

  export class SolarUtil {
    static FESTIVAL: Record<string, string[]>
    static OTHER_FESTIVAL: Record<string, string[]>
    static WEEK_FESTIVAL: Record<string, string>
  }
}
