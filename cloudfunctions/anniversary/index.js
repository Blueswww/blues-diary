/**
 * 纪念日云函数
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

function normalizeEvent(event) {
  if (event.httpMethod) {
    const body = event.body ? JSON.parse(event.body) : {}
    return { ...body, _openid: event.headers?.['X-WX-OPENID'] || event.headers?.['x-wx-openid'], _isHttp: true }
  }
  return event
}

function httpResponse(result) {
  return { isBase64Encoded: false, statusCode: result.success ? 200 : 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(result) }
}

function wrapResult(event, result) {
  return event._isHttp ? httpResponse(result) : result
}

function getUserId(event) {
  return event._isHttp ? event._openid : cloud.getWXContext().OPENID
}

exports.main = async (event, context) => {
  event = normalizeEvent(event)
  const userId = getUserId(event)

  if (!userId) {
    return wrapResult(event, { success: false, error: '未登录' })
  }

  try {
    let result
    switch (event.action) {
      case 'list': result = await list(userId); break
      case 'create': result = await create(userId, event); break
      case 'delete': result = await remove(userId, event); break
      default: result = { success: false, error: `未知操作: ${event.action}` }
    }
    return wrapResult(event, result)
  } catch (err) {
    console.error('[anniversary] 操作失败:', err)
    return wrapResult(event, { success: false, error: '操作失败' })
  }
}

async function list(userId) {
  const res = await db.collection('anniversaries').where({ userId }).orderBy('date', 'asc').get()
  return { success: true, data: res.data }
}

async function create(userId, event) {
  const { name, date, type, remindDays } = event
  if (!name || !date) return { success: false, error: '名称和日期不能为空' }

  const doc = { userId, name, date, type: type || 'solar', remindDays: remindDays || [7, 1], createdAt: db.serverDate() }
  const res = await db.collection('anniversaries').add({ data: doc })
  return { success: true, data: { _id: res._id, ...doc } }
}

async function remove(userId, event) {
  const { _id } = event
  if (!_id) return { success: false, error: '缺少纪念日 ID' }

  const doc = await db.collection('anniversaries').doc(_id).get()
  if (!doc.data || doc.data.userId !== userId) return { success: false, error: '纪念日不存在或无权删除' }

  await db.collection('anniversaries').doc(_id).remove()
  return { success: true }
}
