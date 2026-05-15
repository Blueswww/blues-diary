/**
 * 登录云函数
 * 通过 cloud.getWXContext() 获取当前用户 openid，这是微信云开发唯一正确的认证方式
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const usersCollection = db.collection('users')

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()

  if (!OPENID) {
    return { success: false, error: '获取用户身份失败，请检查云开发环境配置' }
  }

  try {
    // 记录/更新用户登录信息
    const existing = await usersCollection.where({ openid: OPENID }).get()

    if (existing.data.length === 0) {
      await usersCollection.add({
        data: {
          openid: OPENID,
          nickName: event.nickName || '',
          avatarUrl: event.avatarUrl || '',
          createdAt: db.serverDate(),
          lastLoginAt: db.serverDate(),
        },
      })
      return { success: true, data: { openid: OPENID, isNewUser: true } }
    }

    const user = existing.data[0]
    await usersCollection.doc(user._id).update({
      data: { lastLoginAt: db.serverDate() },
    })

    return {
      success: true,
      data: {
        openid: OPENID,
        isNewUser: false,
        nickName: user.nickName || '',
        avatarUrl: user.avatarUrl || '',
      },
    }
  } catch (err) {
    console.error('[login] 云函数错误:', err)
    return { success: false, error: '登录失败，请重试' }
  }
}
