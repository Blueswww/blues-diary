/**
 * 登录云函数
 * 获取用户的 openid 并记录到数据库
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const usersCollection = db.collection('users')

/** HTTP 触发兼容：标准化事件 */
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

/** HTTP 触发器统一响应 */
function httpResponse(result) {
  return {
    isBase64Encoded: false,
    statusCode: result.success ? 200 : 400,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result)
  }
}

function wrapResult(event, result) {
  return event._isHttp ? httpResponse(result) : result
}

exports.main = async (event, context) => {
  event = normalizeEvent(event)
  const OPENID = event._isHttp ? event._openid : cloud.getWXContext().OPENID

  if (!OPENID) {
    return wrapResult(event, { success: false, error: '获取用户身份失败' })
  }

  try {
    // 查询是否已有用户记录
    const existing = await usersCollection.where({ openid: OPENID }).get()

    if (existing.data.length === 0) {
      await usersCollection.add({
        data: {
          openid: OPENID,
          nickName: event.nickName || '用户',
          avatarUrl: event.avatarUrl || '',
          createdAt: db.serverDate(),
          lastLoginAt: db.serverDate(),
        },
      })
      return wrapResult(event, { success: true, data: { openid: OPENID, isNewUser: true } })
    }

    const user = existing.data[0]
    await usersCollection.doc(user._id).update({
      data: {
        lastLoginAt: db.serverDate(),
        nickName: event.nickName || user.nickName,
        avatarUrl: event.avatarUrl || user.avatarUrl,
      },
    })

    return wrapResult(event, {
      success: true,
      data: {
        openid: OPENID,
        isNewUser: false,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl,
      },
    })
  } catch (err) {
    console.error('[login] 登录失败:', err)
    return wrapResult(event, { success: false, error: '登录失败，请重试' })
  }
}
