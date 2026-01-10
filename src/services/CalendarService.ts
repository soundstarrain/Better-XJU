/**
 * 日历服务 - 负责学期基准日管理与周次计算
 */
import { getCurrentAcademicContext } from '../utils/dateUtils'

export class CalendarService {
    // 调试配置
    private readonly IS_DEBUG_MODE = false
    private readonly DEBUG_DATE = '2025-10-27'

    private readonly STORAGE_KEY = 'semesterStartDate'
    private readonly JWXT_URL = 'https://jwxt.xju.edu.cn/xjdxjw/frame/desk/showLessonScheduleInfosV14.action'

    getNow(dateOverride?: Date): Date {
        if (dateOverride) return dateOverride
        if (this.IS_DEBUG_MODE) {
            return new Date(this.DEBUG_DATE)
        }
        return new Date()
    }

    /**
     * 同步学期基准日 (第一周的周一)
     * 发起请求获取第1周课表，从中解析出具体日期
     */
    async syncSemesterStart(): Promise<string | null> {
        try {
            const { xn, xq } = getCurrentAcademicContext(this.getNow())
            const params = new URLSearchParams({
                xn: xn,
                xq: xq,
                jxz: '1'
            })

            const url = `${this.JWXT_URL}?${params.toString()}`

            const response = await chrome.runtime.sendMessage({
                type: 'FETCH_LEGACY',
                payload: { url: url, method: 'GET', encoding: 'utf-8' }
            })

            if (!response.ok) {
                return null
            }

            const html = response.data
            const match = html.match(/>一.*?(\d{2}-\d{2})<\/td>/s)

            if (match && match[1]) {
                const dateStr = match[1]
                const { xn } = getCurrentAcademicContext(this.getNow())
                const currentYear = parseInt(xn)
                const fullDate = `${currentYear}-${dateStr}`
                await chrome.storage.local.set({ [this.STORAGE_KEY]: fullDate })
                return fullDate
            }

        } catch (error) {
            // Sync failed
        }
        return null
    }

    /**
     * 从缓存获取基准日
     */
    async getSemesterStartDate(): Promise<string | null> {
        try {
            const storage = await chrome.storage.local.get(this.STORAGE_KEY)
            return storage[this.STORAGE_KEY] || null
        } catch (e) {
            return null
        }
    }

    /**
     * 获取当前是第几周
     */
    async getCurrentWeek(date?: Date): Promise<number> {
        let startDateStr = await this.getSemesterStartDate()
        if (!startDateStr) {
            startDateStr = await this.syncSemesterStart()
        }

        if (!startDateStr) {
            return 1
        }

        const start = new Date(startDateStr)
        const now = this.getNow(date)

        const diffTime = now.getTime() - start.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        const week = Math.floor(diffDays / 7) + 1

        return week > 0 ? week : 1
    }
}

export const calendarService = new CalendarService()
