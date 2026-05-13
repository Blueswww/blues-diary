/**
 * 登录云函数
 * 获取用户的 openid 并记录到数据库
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const usersCollection = db.collection('users')

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { OPENID } = wxContext

  if (!OPENID) {
    return { success: false, error: '获取用户身份失败' }
  }

  try {
    // 查询是否已有用户记录
    const existing = await usersCollection.where({ openid: OPENID }).get()

    if (existing.data.length === 0) {
      // 新用户，创建记录
      const result = await usersCollection.add({
        data: {
          openid: OPENID,
          nickName: event.nickName || '用户',
          avatarUrl: event.avatarUrl || '',
          createdAt: db.serverDate(),
          lastLoginAt: db.serverDate(),
        },
      })

      return {
        success: true,
        data: {
          openid: OPENID,
          isNewUser: true,
        },
      }
    }

    // 已有用户，更新登录时间
    const user = existing.data[0]
    await usersCollection.doc(user._id).update({
      data: {
        lastLoginAt: db.serverDate(),
        nickName: event.nickName || user.nickName,
        avatarUrl: event.avatarUrl || user.avatarUrl,
      },
    })

    return {
      success: true,
      data: {
        openid: OPENID,
        isNewUser: false,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl,
      },
    }
  } catch (err) {
    console.error('[login] 登录失败:', err)
    return { success: false, error: '登录失败，请重试' }
  }
}
