/**
 * 菜单服务 - 从官方 API 获取应用列表
 */

import { appCacheService } from './AppCacheService'
import { sortAppsByPriority } from './AppPriority'

// TypeScript 接口定义
interface AppPc {
    appUrl?: string
    [key: string]: any
}

interface AppItem {
    appId: string
    appName: string
    middleIcon: string
    appUrl?: string
    homePage?: string
    appPc?: AppPc
    categoryName?: string
    [key: string]: any
}

interface PcAppCategory {
    categoryId: string
    categoryName: string
    appList: AppItem[]
}

interface ApiResponse {
    pcAppCategory: PcAppCategory[]
    [key: string]: any
}

export interface MenuItem {
    id: string
    title: string
    icon: string
    category?: string
    route?: string
    url?: string
    isExternal: boolean
}

export class MenuService {
    private readonly API_URL = 'https://ehall.xju.edu.cn/jsonp/getUserCategoryAppList.json'

    // 已适配的功能映射表（应用名称 → 内部路由）
    // 待手动添加
    private readonly adaptedApps: Record<string, string> = {}

    /**
     * 获取应用列表
     * 优先从缓存读取，缓存失效则调用 API
     */
    async fetchMenuItems(): Promise<MenuItem[]> {
        try {
            // 优先从持久化存储读取
            const cachedApps = await appCacheService.loadApps()
            if (cachedApps && Array.isArray(cachedApps) && cachedApps.length > 0) {
                return this.mapToMenuItems(cachedApps)
            }

            // 缓存失效，调用 API
            const apps = await this.fetchFromApi()
            return apps.length > 0 ? apps : []
        } catch (error) {
            return []
        }
    }

    /**
     * 从官方 API 获取应用列表
     */
    private async fetchFromApi(): Promise<MenuItem[]> {
        try {
            const url = `${this.API_URL}?_=${Date.now()}`
            const response = await fetch(url, { credentials: 'include' })

            if (!response.ok) {
                throw new Error(`API 请求失败: ${response.status}`)
            }

            const data: ApiResponse = await response.json()


            if (!data.pcAppCategory || !Array.isArray(data.pcAppCategory)) {
                throw new Error('API 返回数据格式错误')
            }

            // 优先使用 'all' 分类获取完整应用列表
            const allApps: AppItem[] = []
            const allCategory = data.pcAppCategory.find((c) => c.categoryId === 'all')

            if (allCategory && allCategory.appList && Array.isArray(allCategory.appList)) {
                // 使用 'all' 分类（包含所有应用）
                allCategory.appList.forEach((app) => {
                    allApps.push(app)
                })
            } else {
                // 备用方案：遍历所有分类（跳过 all 避免重复）
                data.pcAppCategory.forEach((category) => {
                    if (category.categoryId === 'all') return

                    if (category.appList && Array.isArray(category.appList)) {
                        category.appList.forEach((app) => {
                            allApps.push({
                                ...app,
                                categoryName: category.categoryName,
                            })
                        })
                    }
                })
            }



            // 转换为 MenuItem
            const menuItems = this.convertToMenuItems(allApps)

            // 保存原始数据到缓存
            const rawApps = allApps.map((app) => ({
                appId: app.appId,
                title: app.appName,
                url: this.extractAppUrl(app),
                img: app.middleIcon,
                category: app.categoryName || '',
            }))

            await appCacheService.saveApps(rawApps)

            return menuItems
        } catch (error) {
            throw error
        }
    }

    /**
     * 提取应用的跳转 URL
     * 使用 ehall 标准 appShow 格式
     */
    private extractAppUrl(app: AppItem): string {
        return `https://ehall.xju.edu.cn/appShow?appId=${app.appId}`
    }

    /**
     * 将 API 返回的应用转换为 MenuItem
     */
    private convertToMenuItems(apps: AppItem[]): MenuItem[] {
        // 先转换为临时对象并排序
        const tempApps = apps.map((app) => ({
            appId: app.appId,
            title: app.appName,
            img: app.middleIcon,
            category: app.categoryName || '',
            url: this.extractAppUrl(app),
        }))

        const sortedApps = sortAppsByPriority(tempApps)

        // 转换为 MenuItem
        return sortedApps.map((app) => {
            const route = this.adaptedApps[app.title]

            if (route) {
                return {
                    id: app.appId,
                    title: app.title,
                    icon: app.img,
                    category: app.category,
                    route,
                    isExternal: false,
                }
            } else {
                return {
                    id: app.appId,
                    title: app.title,
                    icon: app.img,
                    category: app.category,
                    url: app.url,
                    isExternal: true,
                }
            }
        })
    }

    /**
     * 将缓存的原始数据转换为 MenuItem
     */
    private mapToMenuItems(rawApps: any[]): MenuItem[] {
        // 先排序
        const sortedApps = sortAppsByPriority(rawApps)

        return sortedApps.map((app) => {
            const route = this.adaptedApps[app.title]

            if (route) {
                return {
                    id: app.appId,
                    title: app.title,
                    icon: app.img,
                    category: app.category,
                    route,
                    isExternal: false,
                }
            } else {
                return {
                    id: app.appId,
                    title: app.title,
                    icon: app.img,
                    category: app.category,
                    url: app.url,
                    isExternal: true,
                }
            }
        })
    }
    /**
     * 获取快速访问应用列表
     * 如果有自定义保存的 ID 列表，则按顺序返回；否则返回默认的前 7 个
     */
    async getQuickApps(allApps: MenuItem[]): Promise<MenuItem[]> {
        const storedIds = await appCacheService.loadQuickAppIds()

        if (storedIds && storedIds.length > 0) {
            // 根据存储的 ID 顺序筛选和排序
            const quickApps: MenuItem[] = []
            storedIds.forEach(id => {
                const app = allApps.find(a => a.id === id)
                if (app) quickApps.push(app)
            })
            // 如果存储的 ID 有效，返回它们
            if (quickApps.length > 0) return quickApps
        }

        // 默认行为：返回前 12 个 (按权重)
        return allApps.slice(0, 12)
    }

    /**
     * 保存快速访问应用列表顺序
     */
    async saveQuickApps(apps: MenuItem[]): Promise<void> {
        const ids = apps.map(a => a.id)
        await appCacheService.saveQuickAppIds(ids)
    }
}

export const menuService = new MenuService()
