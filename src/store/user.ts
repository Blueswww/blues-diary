import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { callCloudFunction } from '@/api'
import { getToday } from '@/utils/dayjs'

interface UserInfo {
  openid: string
  nickName?: string
  avatarUrl?: string
}

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)
  const isLoggedIn = computed(() => !!userInfo.value)

  /** 微信小程序登录 */
  async function loginWithWechat() {
    // #ifdef MP-WEIXIN
    try {
      const { code } = await uni.login({ provider: 'weixin' })
      const res = await callCloudFunction<{ openid: string; token: string }>({
        name: 'login',
        data: { code },
      })
      if (res.success && res.data) {
        const { openid, ...rest } = res.data
        userInfo.value = { openid, ...rest }
        uni.setStorageSync('user_openid', openid)
        uni.setStorageSync('user_token', rest.token)
        return true
      }
    } catch (err) {
      console.error('微信登录失败', err)
    }
    // #endif

    // H5 降级：本地存储用户标识
    // #ifdef H5
    let uid = uni.getStorageSync('user_openid')
    if (!uid) {
      uid = 'h5_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
      uni.setStorageSync('user_openid', uid)
    }
    userInfo.value = { openid: uid, nickName: 'Web 用户' }
    // #endif

    return false
  }

  /** 尝试自动登录（App 启动时调用） */
  async function tryAutoLogin() {
    const openid = uni.getStorageSync('user_openid')
    if (openid) {
      userInfo.value = { openid, nickName: uni.getStorageSync('user_nickName') || '用户' }
      return true
    }
    return loginWithWechat()
  }

  /** 登出 */
  function logout() {
    userInfo.value = null
    uni.removeStorageSync('user_openid')
    uni.removeStorageSync('user_token')
  }

  /** 更新个人资料 */
  function updateProfile(nickName: string, avatarUrl?: string) {
    if (userInfo.value) {
      userInfo.value.nickName = nickName
      userInfo.value.avatarUrl = avatarUrl
      uni.setStorageSync('user_nickName', nickName)
    }
  }

  return {
    userInfo,
    isLoggedIn,
    loginWithWechat,
    tryAutoLogin,
    logout,
    updateProfile,
  }
})
