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

/** 获取当前用户 openid */
function getUserId(event) {
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

module.exports = { cloud, db, _, ok, fail, getUserId, requireFields }
