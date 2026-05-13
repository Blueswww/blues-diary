// 收集用户在使用中需要填写的配置项
export const CONFIG = {
  // 微信云开发环境 ID（在微信开发者工具 -> 云开发控制台获取）
  CLOUD_ENV_ID: 'cloud1-d5gdqeljo6eacbfc2',

  // 微信小程序 APPID
  MINI_APP_ID: 'wxf4e3f22aebaeaad9',

  // 节日数据来源（内置节假日 JSON 或 API）
  HOLIDAY_SOURCE: 'local' as 'local' | 'api',
}

// 云函数名称常量
export const CLOUD_FUNCTIONS = {
  LOGIN: 'login',
  DIARY: 'diary',
  TAG: 'tag',
  TODO: 'todo',
  ANNIVERSARY: 'anniversary',
} as const

// 纪念日类型
export const ANNIVERSARY_TYPES = {
  SOLAR: 'solar',   // 阳历
  LUNAR: 'lunar',   // 阴历
} as const

// 每周第一天（0=周日, 1=周一）
export const WEEK_START_DAY = 1 // 周一为一周开始
