/**
 * API 抽象层
 * 微信小程序: 通过 wx.cloud.callFunction 调用云函数
 * H5 Web: 通过 HTTP 请求调用云函数 HTTP 触发
 *
 * 当前统一使用云函数调用方式（小程序原生支持，H5 降级为模拟数据）
 */

type CloudFunctionName = 'login' | 'diary' | 'tag' | 'todo' | 'anniversary'

interface CloudFunctionOptions {
  name: CloudFunctionName
  data?: Record<string, any>
}

interface CloudFunctionResult<T = any> {
  success: boolean
  data?: T
  error?: string
}

// #ifdef MP-WEIXIN
/** 获取原生 wx 对象（绕过 uni-app 的 wx 标识符变换） */
function getNativeWx(): any {
  // globalThis['w'+'x'] 在运行时拼接字符串，避免构建工具替换 wx 标识符
  return globalThis['w' + 'x']
}

/** 微信小程序端：直接调用云函数 */
export async function callCloudFunction<T = any>(
  options: CloudFunctionName | CloudFunctionOptions
): Promise<CloudFunctionResult<T>> {
  const name = typeof options === 'string' ? options : options.name
  const data = typeof options === 'string' ? {} : options.data || {}

  try {
    const wxNative = getNativeWx()
    console.log('[API] wxNative type:', typeof wxNative)
    console.log('[API] wxNative keys:', wxNative ? Object.keys(wxNative).slice(0, 10) : 'N/A')
    console.log('[API] cloud type:', typeof wxNative?.cloud)
    if (wxNative?.cloud) {
      console.log('[API] callFunction type:', typeof wxNative.cloud.callFunction)
      console.log('[API] cloud keys:', Object.keys(wxNative.cloud))
    }
    const cloud = wxNative.cloud
    const res = await cloud.callFunction({
      name,
      data,
    })
    return res.result as CloudFunctionResult<T>
  } catch (err: any) {
    console.error(`[API] 云函数 ${name} 调用失败:`, err)
    console.error('[API] err.toString():', err?.toString?.())
    console.error('[API] err.stack:', err?.stack)
    return { success: false, error: err.message || '网络错误' }
  }
}
// #endif

// #ifdef H5
/** H5 端：通过 HTTP 请求调用 */
const HTTP_BASE = 'https://你的云函数触发域名'

export async function callCloudFunction<T = any>(
  options: CloudFunctionName | CloudFunctionOptions
): Promise<CloudFunctionResult<T>> {
  const name = typeof options === 'string' ? options : options.name
  const data = typeof options === 'string' ? {} : options.data || {}

  try {
    const res = await uni.request({
      url: `${HTTP_BASE}/${name}`,
      method: 'POST',
      data,
      header: { 'Content-Type': 'application/json' },
    })
    const result = res.data as CloudFunctionResult<T>
    return result
  } catch (err: any) {
    console.error(`[API] HTTP 调用 ${name} 失败:`, err)
    return { success: false, error: err.message || '网络错误' }
  }
}
// #endif

/** 统一错误处理 */
export function handleApiError(result: CloudFunctionResult): string {
  if (result.error) {
    uni.showToast({ title: result.error, icon: 'none' })
    return result.error
  }
  return ''
}
