/**
 * 待办提醒云函数
 * 通过云调用发送订阅消息（无需额外配置 access_token）
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()

  if (!OPENID) {
    return { success: false, error: '获取用户身份失败' }
  }

  const { templateId, content, time, date, page = 'pages/todo/todo' } = event
  if (!templateId || !content) {
    return { success: false, error: '缺少必填参数: templateId, content' }
  }

  try {
    const result = await cloud.openapi.subscribeMessage.send({
      touser: OPENID,
      templateId,
      page,
      data: {
        thing2: { value: content.slice(0, 20) },
        date4: { value: date || '今日' },
        thing11: { value: '点击查看待办详情' },
        time30: { value: time || '即将开始' },
      },
    })
    return { success: true, data: result }
  } catch (err) {
    console.error('[sendReminder] 发送失败:', err)
    return { success: false, error: err.message || '发送订阅消息失败' }
  }
}
