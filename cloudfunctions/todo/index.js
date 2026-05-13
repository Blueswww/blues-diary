/**
 * 待办事项云函数
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
      case 'listByDate':
        return await listByDate(userId, event)
      case 'create':
        return await create(userId, event)
      case 'toggle':
        return await toggle(userId, event)
      case 'delete':
        return await remove(userId, event)
      default:
        return { success: false, error: `未知操作: ${event.action}` }
    }
  } catch (err) {
    console.error('[todo] 操作失败:', err)
    return { success: false, error: '操作失败' }
  }
}

async function listByDate(userId, event) {
  const { date } = event
  if (!date) return { success: false, error: '缺少日期参数' }

  const res = await db.collection('todos')
    .where({ userId, date })
    .orderBy('priority', 'desc')
    .orderBy('createdAt', 'asc')
    .get()

  return { success: true, data: res.data }
}

async function create(userId, event) {
  const { date, content, priority } = event
  if (!date || !content) {
    return { success: false, error: '日期和内容不能为空' }
  }

  const doc = {
    userId,
    date,
    content,
    isDone: false,
    priority: priority || 'medium',
    createdAt: db.serverDate(),
  }

  const res = await db.collection('todos').add({ data: doc })
  return { success: true, data: { _id: res._id, ...doc } }
}

async function toggle(userId, event) {
  const { _id, isDone } = event
  if (!_id) return { success: false, error: '缺少待办 ID' }

  const doc = await db.collection('todos').doc(_id).get()
  if (!doc.data || doc.data.userId !== userId) {
    return { success: false, error: '待办不存在或无权操作' }
  }

  await db.collection('todos').doc(_id).update({
    data: { isDone },
  })

  return { success: true, data: { _id, isDone } }
}

async function remove(userId, event) {
  const { _id } = event
  if (!_id) return { success: false, error: '缺少待办 ID' }

  const doc = await db.collection('todos').doc(_id).get()
  if (!doc.data || doc.data.userId !== userId) {
    return { success: false, error: '待办不存在或无权删除' }
  }

  await db.collection('todos').doc(_id).remove()
  return { success: true }
}
