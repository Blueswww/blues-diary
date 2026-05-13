/**
 * 云函数公共工具模块
 * 部署时需要在每个云函数目录下配置引用路径
 */

const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

/** 统一成功响应 */
function ok(data = null) {
  return { success: true, data }
}

/** 统一错误响应 */
function fail(message = '操作失败', code = -1) {
  return { success: false, error: message, code }
}

/** 获取当前用户 openid（同时支持直接调用和 HTTP 触发器） */
function getUserId(event) {
  if (event._isHttp && event._openid) {
    return event._openid
  }
  const wxContext = cloud.getWXContext()
  return wxContext.OPENID
}

/** 校验必填参数 */
function requireFields(event, fields) {
  for (const field of fields) {
    if (event[field] === undefined || event[field] === null) {
      return `缺少必填参数: ${field}`
    }
  }
  return null
}

/** 标准化事件格式（将 HTTP 触发器事件转为统一格式） */
function normalizeEvent(event) {
  if (event.httpMethod) {
    const body = event.body ? JSON.parse(event.body) : {}
    return {
      ...body,
      _openid: event.headers?.['X-WX-OPENID'] || event.headers?.['x-wx-openid'],
      _isHttp: true
    }
  }
  return event
}

/** HTTP 触发器统一响应格式 */
function httpResponse(result) {
  return {
    isBase64Encoded: false,
    statusCode: result.success ? 200 : 400,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result)
  }
}

module.exports = { cloud, db, _, ok, fail, getUserId, requireFields, normalizeEvent, httpResponse }
