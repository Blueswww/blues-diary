/**
 * 标签云函数
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

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
    console.error('[tag] 操作失败:', err)
    return wrapResult(event, { success: false, error: '操作失败' })
  }
}

async function list(userId) {
  const res = await db.collection('tags').where({ userId }).orderBy('createdAt', 'desc').get()
  return { success: true, data: res.data }
}

async function create(userId, event) {
  const { name, color } = event
  if (!name || !name.trim()) return { success: false, error: '标签名不能为空' }

  const existing = await db.collection('tags').where({ userId, name: name.trim() }).limit(1).get()
  if (existing.data.length > 0) return { success: false, error: '标签已存在' }

  const doc = { userId, name: name.trim(), color: color || '#5B7FFF', createdAt: db.serverDate() }
  const res = await db.collection('tags').add({ data: doc })
  return { success: true, data: { _id: res._id, ...doc } }
}

async function remove(userId, event) {
  const { _id } = event
  if (!_id) return { success: false, error: '缺少标签 ID' }

  const doc = await db.collection('tags').doc(_id).get()
  if (!doc.data || doc.data.userId !== userId) return { success: false, error: '标签不存在或无权删除' }

  await db.collection('tags').doc(_id).remove()

  // 同时移除所有日记中对该标签的引用
  await db.collection('diaries').where({ userId, tags: _id }).update({ data: { tags: _.pull(_id) } })

  return { success: true }
}
