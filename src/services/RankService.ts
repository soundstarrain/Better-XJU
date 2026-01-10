import { ehallService } from './EhallService'

/**
 * 成绩排名查询服务
 */

export interface StudentRank {
    gpa: string
    avgScore: string
    majorRank: string
    classRank: string
    rankTime: string
    totalPassedCourses?: number
    failedCourses?: number
    fullHtml?: string
}

export class RankService {
    private RANK_PAGE_URL = 'https://jwxt.xju.edu.cn/xjdxjw/student/xscj.ckzybjpm.html?menucode=S40320'

    private async proxyFetch(url: string, options: RequestInit = {}): Promise<string> {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                type: 'PROXY_FETCH',
                payload: { url, options }
            }, (response) => {
                if (chrome.runtime.lastError) {
                    return reject(new Error(chrome.runtime.lastError.message))
                }
                if (response && response.ok) {
                    resolve(response.data)
                } else {
                    reject(new Error(response?.error || `Request failed: ${response?.status}`))
                }
            })
        })
    }

    private getCurrentAcademicYear(): string {
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth() + 1
        return (month >= 8 ? year : year - 1).toString()
    }

    private async fetchContextParams(): Promise<{ tableId: string, xn: string, xq: string, menucode: string }> {
        const defaults = {
            tableId: '5366424',
            xn: this.getCurrentAcademicYear(),
            xq: '0',
            menucode: 'S40320'
        }

        try {
            const html = await this.proxyFetch(this.RANK_PAGE_URL)

            const tableIdMatch = html.match(/frmReport\s*:\s*["'](\d+)["']/)
            const tableId = tableIdMatch ? tableIdMatch[1] : defaults.tableId

            const parser = new DOMParser()
            const doc = parser.parseFromString(html, 'text/html')

            const xnInput = doc.querySelector('input[name="xn"]') as HTMLInputElement
            let xn = xnInput?.value || defaults.xn

            const xqInput = doc.querySelector('input[name="xq"]') as HTMLInputElement
            let xq = xqInput?.value || defaults.xq

            const menucode = defaults.menucode

            return { tableId, xn, xq, menucode }

        } catch (error) {
            return defaults
        }
    }

    private async ensureJwxtSession(): Promise<void> {
        return new Promise(async (resolve) => {
            const checkResult = await new Promise<{ ready: boolean }>((res) => {
                chrome.runtime.sendMessage({ type: 'CHECK_JWXT_SESSION' }, res)
            })

            if (checkResult.ready) {
                resolve()
                return
            }

            await new Promise<{ ok: boolean, error?: string }>((res) => {
                chrome.runtime.sendMessage({ type: 'ACTIVATE_JWXT_SESSION' }, res)
            })
            resolve()
        })
    }

    async fetchRank(): Promise<StudentRank> {
        // 缓存检查
        const cache = await chrome.storage.local.get(['rankData'])
        if (cache.rankData) {
            const data = cache.rankData as StudentRank
            const lastUpdate = new Date(data.rankTime).getTime()
            const now = Date.now()
            const sevenDays = 7 * 24 * 60 * 60 * 1000

            if (!isNaN(lastUpdate) && (now - lastUpdate < sevenDays)) {
                return data
            }
        }

        await this.ensureJwxtSession()

        const { tableId, xn, xq, menucode } = await this.fetchContextParams()
        const xn1 = (parseInt(xn) + 1).toString()

        const payload = {
            tableId,
            xn,
            xn1,
            xq,
            roleType: 'STU',
            menucode_current: menucode
        }

        const [rankResult, stats] = await Promise.all([
            new Promise<StudentRank>((resolve, reject) => {
                chrome.runtime.sendMessage({
                    type: 'FETCH_RANK_DATA',
                    payload: payload
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        return reject(new Error(chrome.runtime.lastError.message))
                    }
                    if (response && response.ok) {
                        resolve(this.parseRankHtml(response.data))
                    } else {
                        chrome.storage.local.remove(['JWXT_SESSION_READY', 'JWXT_SESSION_TIME'])
                        reject(new Error(response?.error || 'Unknown error'))
                    }
                })
            }),
            ehallService.fetchAcademicStats().catch(() => ({ totalCourses: 0, failedCourses: 0 }))
        ])

        const finalData = {
            ...rankResult,
            totalPassedCourses: stats.totalCourses,
            failedCourses: stats.failedCourses
        }

        // 数据有效时才缓存
        const isValidData = finalData.gpa !== '-' && finalData.majorRank !== '-'
        if (isValidData) {
            chrome.storage.local.set({ rankData: finalData })
        }

        return finalData
    }

    private parseRankHtml(html: string): StudentRank {
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')

        const getText = (id: string): string => {
            const el = doc.getElementById(id)
            return el ? el.innerText.trim() : '-'
        }

        return {
            gpa: getText('tr0_pjxfjd'),
            avgScore: getText('tr0_pjcj'),
            majorRank: getText('tr0_zypm'),
            classRank: getText('tr0_bjpm'),
            rankTime: getText('tr0_pmsj'),
            totalPassedCourses: undefined,
            fullHtml: html
        }
    }
}

export const rankService = new RankService()
