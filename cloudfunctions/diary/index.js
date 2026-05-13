/**
 * 日记云函数 - 路由到具体操作
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

/** HTTP 触发兼容 */
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
      case 'listByDateRange': result = await listByDateRange(userId, event); break
      case 'getByDate': result = await getByDate(userId, event); break
      case 'create': result = await create(userId, event); break
      case 'update': result = await update(userId, event); break
      case 'delete': result = await deleteDiary(userId, event); break
      case 'listByTag': result = await listByTag(userId, event); break
      default: result = { success: false, error: `未知操作: ${event.action}` }
    }
    return wrapResult(event, result)
  } catch (err) {
    console.error('[diary] 操作失败:', err)
    return wrapResult(event, { success: false, error: '操作失败，请重试' })
  }
}

async function listByDateRange(userId, event) {
  const { startDate, endDate } = event
  if (!startDate || !endDate) return { success: false, error: '缺少日期范围参数' }

  const res = await db.collection('diaries')
    .where({ userId, date: _.gte(startDate).and(_.lt(endDate)) })
    .orderBy('date', 'desc')
    .get()

  return { success: true, data: res.data }
}

async function getByDate(userId, event) {
  const { date } = event
  if (!date) return { success: false, error: '缺少日期参数' }

  const res = await db.collection('diaries').where({ userId, date }).limit(1).get()
  return { success: true, data: res.data[0] || null }
}

async function create(userId, event) {
  const { date, content, mood, weather, images, tags } = event
  if (!date || !content) return { success: false, error: '日期和内容不能为空' }

  const existing = await db.collection('diaries').where({ userId, date }).limit(1).get()

  if (existing.data.length > 0) {
    await db.collection('diaries').doc(existing.data[0]._id).update({
      data: { content, mood: mood || '', weather: weather || '', images: images || [], tags: tags || [], updatedAt: db.serverDate() },
    })
    return { success: true, data: { ...existing.data[0], content, mood, weather, images, tags } }
  }

  const doc = {
    userId, date, content, mood: mood || '', weather: weather || '',
    images: images || [], tags: tags || [],
    createdAt: db.serverDate(), updatedAt: db.serverDate(),
  }

  const res = await db.collection('diaries').add({ data: doc })
  return { success: true, data: { _id: res._id, ...doc } }
}

async function update(userId, event) {
  const { _id, content, mood, weather, images, tags } = event
  if (!_id) return { success: false, error: '缺少日记 ID' }

  const updateData = { updatedAt: db.serverDate() }
  if (content !== undefined) updateData.content = content
  if (mood !== undefined) updateData.mood = mood
  if (weather !== undefined) updateData.weather = weather
  if (images !== undefined) updateData.images = images
  if (tags !== undefined) updateData.tags = tags

  const res = await db.collection('diaries').doc(_id).update({ data: updateData })
  if (res.stats.updated === 0) return { success: false, error: '日记不存在或无权修改' }

  const updated = await db.collection('diaries').doc(_id).get()
  return { success: true, data: updated.data }
}

async function deleteDiary(userId, event) {
  const { _id } = event
  if (!_id) return { success: false, error: '缺少日记 ID' }

  const doc = await db.collection('diaries').doc(_id).get()
  if (!doc.data || doc.data.userId !== userId) return { success: false, error: '无权删除此日记' }

  await db.collection('diaries').doc(_id).remove()
  return { success: true, data: { _id } }
}

async function listByTag(userId, event) {
  const { tagId } = event
  if (!tagId) return { success: false, error: '缺少标签 ID' }

  const res = await db.collection('diaries')
    .where({ userId, tags: _.elemMatch(_.eq(tagId)) })
    .orderBy('date', 'desc')
    .get()

  return { success: true, data: res.data }
}
