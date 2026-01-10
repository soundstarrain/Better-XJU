/**
 * 应用缓存服务
 */

interface CachedApps {
    apps: RawApp[]
    timestamp: number
}

interface RawApp {
    appId: string
    title: string
    url: string
    img: string
    category: string
}

export class AppCacheService {
    private readonly CACHE_KEY = 'better-xju-apps'
    private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000

    async saveApps(apps: RawApp[]): Promise<void> {
        const data: CachedApps = {
            apps,
            timestamp: Date.now(),
        }
        await chrome.storage.local.set({ [this.CACHE_KEY]: data })
    }

    async loadApps(): Promise<RawApp[] | null> {
        try {
            const result = await chrome.storage.local.get(this.CACHE_KEY)
            const cached = result[this.CACHE_KEY] as CachedApps | undefined

            if (!cached) {
                return null
            }

            const age = Date.now() - cached.timestamp
            if (age > this.CACHE_DURATION) {
                return null
            }

            return cached.apps
        } catch (error) {
            return null
        }
    }

    async clearCache(): Promise<void> {
        await chrome.storage.local.remove(this.CACHE_KEY)
    }

    private readonly QUICK_APPS_KEY = 'better-xju-quick-apps-ids'

    async saveQuickAppIds(ids: string[]): Promise<void> {
        await chrome.storage.local.set({ [this.QUICK_APPS_KEY]: ids })
    }

    async loadQuickAppIds(): Promise<string[] | null> {
        const result = await chrome.storage.local.get(this.QUICK_APPS_KEY)
        return result[this.QUICK_APPS_KEY] || null
    }
}
export const appCacheService = new AppCacheService()
