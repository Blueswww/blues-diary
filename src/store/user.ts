import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { setOpenid } from '@/api'

interface UserInfo {
  openid: string
  nickName?: string
  avatarUrl?: string
}

function generateLocalId(): string {
  return 'local_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
}

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)
  const isLoggedIn = computed(() => !!userInfo.value)

  /** 微信小程序登录 */
  async function loginWithWechat() {
    // #ifdef MP-WEIXIN
    try {
      await uni.login({ provider: 'weixin' })
      // Try to get openid from cloud auth (works on real devices, not DevTools)
      const wxNative = globalThis['w' + 'x']
      if (wxNative.cloud && wxNative.cloud.auth) {
        const auth = wxNative.cloud.auth()
        if (auth && typeof auth.getOpenid === 'function') {
          const result = await auth.getOpenid()
          if (result?.openid) {
            setOpenid(result.openid)
            userInfo.value = { openid: result.openid }
            uni.setStorageSync('user_openid', result.openid)
            return true
          }
        }
      }
    } catch (err) {
      console.error('[UserStore] 微信登录失败', err)
    }
    // #endif

    // H5 降级 / DevTools 兜底：本地生成用户标识
    // #ifdef H5 || MP-WEIXIN
    let uid = uni.getStorageSync('user_openid')
    if (!uid) {
      uid = generateLocalId()
      uni.setStorageSync('user_openid', uid)
    }
    setOpenid(uid)
    userInfo.value = { openid: uid, nickName: '用户' }
    return true
    // #endif
  }

  /** 尝试自动登录（App 启动时调用） */
  async function tryAutoLogin() {
    const stored = uni.getStorageSync('user_openid')
    if (stored) {
      setOpenid(stored)
      userInfo.value = { openid: stored, nickName: uni.getStorageSync('user_nickName') || '用户' }
      return true
    }
    return loginWithWechat()
  }

  /** 登出 */
  function logout() {
    userInfo.value = null
    setOpenid(null)
    uni.removeStorageSync('user_openid')
    uni.removeStorageSync('user_token')
    uni.removeStorageSync('user_nickName')
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
