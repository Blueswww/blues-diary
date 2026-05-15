import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { setOpenid } from '@/api'

interface UserInfo {
  openid: string
  nickName?: string
  avatarUrl?: string
}

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)
  const isLoggedIn = computed(() => !!userInfo.value)
  const loginError = ref<string | null>(null)

  /** 微信小程序登录：调用 login 云函数获取真实 openid */
  async function loginWithWechat(): Promise<boolean> {
    loginError.value = null

    // #ifdef MP-WEIXIN
    try {
      const wxNative = globalThis['w' + 'x']
      const res = await wxNative.cloud.callFunction({ name: 'login' })
      if (res.result?.success && res.result.data?.openid) {
        const openid = res.result.data.openid
        const nickName = res.result.data.nickName || '用户'
        setOpenid(openid)
        userInfo.value = { openid, nickName }
        uni.setStorageSync('user_openid', openid)
        uni.setStorageSync('user_nickName', nickName)
        return true
      }
      loginError.value = res.result?.error || '登录失败：云函数返回异常'
      return false
    } catch (err: any) {
      console.error('[UserStore] 云函数登录失败', err)
      loginError.value = '登录失败：无法调用云函数（' + (err.errMsg || err.message || '未知错误') + '）'
      return false
    }
    // #endif

    // #ifdef H5
    loginError.value = 'H5 端暂不支持微信登录'
    return false
    // #endif
  }

  /** 尝试自动登录（App 启动时从缓存恢复） */
  async function tryAutoLogin(): Promise<boolean> {
    const stored = uni.getStorageSync('user_openid')
    if (stored) {
      setOpenid(stored)
      userInfo.value = {
        openid: stored,
        nickName: uni.getStorageSync('user_nickName') || '用户',
      }
      return true
    }
    return false // 无缓存，让页面引导用户主动点击登录
  }

  /** 登出 */
  function logout() {
    userInfo.value = null
    setOpenid(null)
    loginError.value = null
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
    loginError,
    loginWithWechat,
    tryAutoLogin,
    logout,
    updateProfile,
  }
})
