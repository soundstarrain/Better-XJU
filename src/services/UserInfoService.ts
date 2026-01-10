/**
 * 用户信息服务
 * 从官方 API 获取用户信息
 */

export interface UserInfo {
  userId: string
  userName: string
  userType: string
  userDepartment: string
  userSex: string
  timestamp: number
}

interface UserDesktopInfoResponse {
  userId: string
  userName: string
  userDepartment: string
  userSex: string
  userTypeName: string
  hasLogin: boolean
  [key: string]: any
}

export class UserInfoService {
  private readonly STORAGE_KEY = 'better-xju-user'
  private readonly API_URL = 'https://ehall.xju.edu.cn/jsonp/userDesktopInfo.json'

  /**
   * 初始化用户信息监听（空实现，兼容旧代码）
   */
  initListener() {
    // API mode - no listener needed
  }

  /**
   * 从 API 获取用户信息
   */
  async fetchUserInfo(): Promise<UserInfo | null> {
    try {
      const url = `${this.API_URL}?type=&_=${Date.now()}`
      const response = await fetch(url, { credentials: 'include' })

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`)
      }

      const data: UserDesktopInfoResponse = await response.json()

      if (!data.hasLogin) {
        return null
      }

      const userInfo: UserInfo = {
        userId: data.userId || '',
        userName: data.userName || '',
        userType: data.userTypeName || '',
        userDepartment: data.userDepartment || '',
        userSex: data.userSex || '',
        timestamp: Date.now(),
      }

      // 保存到缓存
      await this.saveUserInfo(userInfo)

      return userInfo
    } catch (error) {
      return null
    }
  }

  /**
   * 保存用户信息到缓存
   */
  private async saveUserInfo(userInfo: UserInfo) {
    await chrome.storage.local.set({ [this.STORAGE_KEY]: userInfo })
  }

  /**
   * 从缓存读取用户信息
   * 优先从缓存读取，缓存失效则调用 API
   */
  async getUserInfo(): Promise<UserInfo | null> {
    try {
      // 1. 尝试从缓存读取
      const result = await chrome.storage.local.get(this.STORAGE_KEY)
      const cachedUserInfo = result[this.STORAGE_KEY]

      if (cachedUserInfo) {
        return cachedUserInfo
      }

      // 2. 缓存不存在，调用 API
      return await this.fetchUserInfo()
    } catch (error) {
      return null
    }
  }

  /**
   * 清除用户信息缓存
   */
  async clearUserInfo() {
    await chrome.storage.local.remove(this.STORAGE_KEY)
  }
}

export const userInfoService = new UserInfoService()
