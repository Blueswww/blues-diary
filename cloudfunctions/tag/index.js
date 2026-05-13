/**
 * 标签云函数
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
      case 'list':
        return await list(userId)
      case 'create':
        return await create(userId, event)
      case 'delete':
        return await remove(userId, event)
      default:
        return { success: false, error: `未知操作: ${event.action}` }
    }
  } catch (err) {
    console.error('[tag] 操作失败:', err)
    return { success: false, error: '操作失败' }
  }
}

async function list(userId) {
  const res = await db.collection('tags')
    .where({ userId })
    .orderBy('createdAt', 'desc')
    .get()
  return { success: true, data: res.data }
}

async function create(userId, event) {
  const { name, color } = event
  if (!name || !name.trim()) {
    return { success: false, error: '标签名不能为空' }
  }

  // 检查同名标签
  const existing = await db.collection('tags')
    .where({ userId, name: name.trim() })
    .limit(1)
    .get()

  if (existing.data.length > 0) {
    return { success: false, error: '标签已存在' }
  }

  const doc = {
    userId,
    name: name.trim(),
    color: color || '#5B7FFF',
    createdAt: db.serverDate(),
  }

  const res = await db.collection('tags').add({ data: doc })
  return { success: true, data: { _id: res._id, ...doc } }
}

async function remove(userId, event) {
  const { _id } = event
  if (!_id) {
    return { success: false, error: '缺少标签 ID' }
  }

  const doc = await db.collection('tags').doc(_id).get()
  if (!doc.data || doc.data.userId !== userId) {
    return { success: false, error: '标签不存在或无权删除' }
  }

  await db.collection('tags').doc(_id).remove()

  // 同时移除所有日记中对该标签的引用
  await db.collection('diaries')
    .where({ userId, tags: _id })
    .update({
      data: { tags: _.pull(_id) },
    })

  return { success: true }
}
