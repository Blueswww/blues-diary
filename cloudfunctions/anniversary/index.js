/**
 * 纪念日云函数
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

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
    console.error('[anniversary] 操作失败:', err)
    return { success: false, error: '操作失败' }
  }
}

async function list(userId) {
  const res = await db.collection('anniversaries')
    .where({ userId })
    .orderBy('date', 'asc')
    .get()
  return { success: true, data: res.data }
}

async function create(userId, event) {
  const { name, date, type, remindDays } = event
  if (!name || !date) {
    return { success: false, error: '名称和日期不能为空' }
  }

  const doc = {
    userId,
    name,
    date,
    type: type || 'solar',
    remindDays: remindDays || [7, 1],
    createdAt: db.serverDate(),
  }

  const res = await db.collection('anniversaries').add({ data: doc })
  return { success: true, data: { _id: res._id, ...doc } }
}

async function remove(userId, event) {
  const { _id } = event
  if (!_id) return { success: false, error: '缺少纪念日 ID' }

  const doc = await db.collection('anniversaries').doc(_id).get()
  if (!doc.data || doc.data.userId !== userId) {
    return { success: false, error: '纪念日不存在或无权删除' }
  }

  await db.collection('anniversaries').doc(_id).remove()
  return { success: true }
}
