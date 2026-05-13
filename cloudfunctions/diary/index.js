/**
 * 日记云函数 - 路由到具体操作
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const userId = wxContext.OPENID

  if (!userId) {
    return { success: false, error: '未登录' }
  }

  try {
    switch (event.action) {
      case 'listByDateRange':
        return await listByDateRange(userId, event)
      case 'getByDate':
        return await getByDate(userId, event)
      case 'create':
        return await create(userId, event)
      case 'update':
        return await update(userId, event)
      case 'delete':
        return await deleteDiary(userId, event)
      case 'listByTag':
        return await listByTag(userId, event)
      default:
        return { success: false, error: `未知操作: ${event.action}` }
    }
  } catch (err) {
    console.error('[diary] 操作失败:', err)
    return { success: false, error: '操作失败，请重试' }
  }
}

/** 按日期范围查询日记 */
async function listByDateRange(userId, event) {
  const { startDate, endDate } = event
  if (!startDate || !endDate) {
    return { success: false, error: '缺少日期范围参数' }
  }

  const res = await db.collection('diaries')
    .where({
      userId,
      date: _.gte(startDate).and(_.lt(endDate)),
    })
    .orderBy('date', 'desc')
    .get()

  return { success: true, data: res.data }
}

/** 获取指定日期日记 */
async function getByDate(userId, event) {
  const { date } = event
  if (!date) {
    return { success: false, error: '缺少日期参数' }
  }

  const res = await db.collection('diaries')
    .where({ userId, date })
    .limit(1)
    .get()

  return { success: true, data: res.data[0] || null }
}

/** 创建日记 */
async function create(userId, event) {
  const { date, content, mood, weather, images, tags } = event
  if (!date || !content) {
    return { success: false, error: '日期和内容不能为空' }
  }

  // 检查同一天是否已有日记
  const existing = await db.collection('diaries')
    .where({ userId, date })
    .limit(1)
    .get()

  if (existing.data.length > 0) {
    // 已有则更新
    const res = await db.collection('diaries')
      .doc(existing.data[0]._id)
      .update({
        data: {
          content,
          mood: mood || '',
          weather: weather || '',
          images: images || [],
          tags: tags || [],
          updatedAt: db.serverDate(),
        },
      })
    return { success: true, data: { ...existing.data[0], content, mood, weather, images, tags } }
  }

  // 新建
  const doc = {
    userId,
    date,
    content,
    mood: mood || '',
    weather: weather || '',
    images: images || [],
    tags: tags || [],
    createdAt: db.serverDate(),
    updatedAt: db.serverDate(),
  }

  const res = await db.collection('diaries').add({ data: doc })
  return { success: true, data: { _id: res._id, ...doc } }
}

/** 更新日记 */
async function update(userId, event) {
  const { _id, content, mood, weather, images, tags } = event
  if (!_id) {
    return { success: false, error: '缺少日记 ID' }
  }

  const updateData = { updatedAt: db.serverDate() }
  if (content !== undefined) updateData.content = content
  if (mood !== undefined) updateData.mood = mood
  if (weather !== undefined) updateData.weather = weather
  if (images !== undefined) updateData.images = images
  if (tags !== undefined) updateData.tags = tags

  const res = await db.collection('diaries')
    .doc(_id)
    .update({ data: updateData })

  if (res.stats.updated === 0) {
    return { success: false, error: '日记不存在或无权修改' }
  }

  // 返回更新后的数据
  const updated = await db.collection('diaries').doc(_id).get()
  return { success: true, data: updated.data }
}

/** 删除日记 */
async function deleteDiary(userId, event) {
  const { _id } = event
  if (!_id) {
    return { success: false, error: '缺少日记 ID' }
  }

  // 验证所有权
  const doc = await db.collection('diaries').doc(_id).get()
  if (!doc.data || doc.data.userId !== userId) {
    return { success: false, error: '无权删除此日记' }
  }

  await db.collection('diaries').doc(_id).remove()
  return { success: true, data: { _id } }
}

/** 按标签获取日记 */
async function listByTag(userId, event) {
  const { tagId } = event
  if (!tagId) {
    return { success: false, error: '缺少标签 ID' }
  }

  const res = await db.collection('diaries')
    .where({
      userId,
      tags: _.elemMatch(_.eq(tagId)),
    })
    .orderBy('date', 'desc')
    .get()

  return { success: true, data: res.data }
}
