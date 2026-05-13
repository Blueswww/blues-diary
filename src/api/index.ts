/**
 * API 抽象层
 * 微信小程序: 通过 wx.cloud.database() 直接操作云数据库
 * H5 Web: 通过 HTTP 请求调用
 */
import { CloudFunctionResult } from './types'

export type { CloudFunctionResult }

// #ifdef MP-WEIXIN
/** 获取原生 wx 对象 */
function getNativeWx(): any {
  return globalThis['w' + 'x']
}

const wxNative = getNativeWx()
let _openid: string | null = null

/** 获取或创建云数据库实例 */
export function getDB() {
  return wxNative.cloud.database()
}

/** 设置当前用户 openid */
export function setOpenid(openid: string | null) {
  _openid = openid
}

/** 获取当前用户 openid */
export function getOpenid(): string | null {
  return _openid
}

/** 尝试从云开发 auth 获取 openid */
export async function fetchOpenid(): Promise<string | null> {
  try {
    if (wxNative.cloud.auth) {
      const auth = wxNative.cloud.auth()
      if (auth && typeof auth.getOpenid === 'function') {
        const result = await auth.getOpenid()
        if (result?.openid) return result.openid
      }
    }
  } catch (e) {
    console.log('[API] getOpenid via auth failed, trying login cloud function...')
  }

  // Fallback: try wx.login
  try {
    const { code } = await wxNative.login({ provider: 'weixin' })
    // Cannot exchange code without cloud function, return null
    console.log('[API] wx.login code:', code)
    return null
  } catch (e) {
    return null
  }
}

/** 统一成功响应 */
export function ok<T = any>(data: T): CloudFunctionResult<T> {
  return { success: true, data }
}

/** 统一错误响应 */
export function fail(error: string): CloudFunctionResult {
  return { success: false, error }
}
// #endif

// #ifdef H5
export function getDB(): any {
  throw new Error('H5 端暂不支持直接数据库操作')
}

let _openid: string | null = null
export function setOpenid(openid: string) { _openid = openid }
export function getOpenid(): string | null { return _openid }
export async function fetchOpenid(): Promise<string | null> { return null }
export function ok<T = any>(data: T): CloudFunctionResult<T> { return { success: true, data } }
export function fail(error: string): CloudFunctionResult { return { success: false, error } }
// #endif

/** 统一错误处理 */
export function handleApiError(result: CloudFunctionResult): string {
  if (result.error) {
    uni.showToast({ title: result.error, icon: 'none' })
    return result.error
  }
  return ''
}
