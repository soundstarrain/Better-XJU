import { getCurrentAcademicContext } from '../utils/dateUtils'

export interface Exam {
    id: string
    name: string
    time: string
    location: string
    seat: string
    credit: string
    type: string
    mode: string
    startTime?: Date
    endTime?: Date
}

interface ExamRound {
    code: string
    name: string
}

export class ExamService {
    private readonly DROPLIST_URL = 'https://jwxt.xju.edu.cn/xjdxjw/frame/droplist/getDropLists.action'
    private readonly DATE_TABLE_URL = 'https://jwxt.xju.edu.cn/xjdxjw/taglib/DataTable.jsp'
    private readonly TABLE_ID = '2538'
    private readonly MENU_CODE = 'S20403'

    async fetchExams(): Promise<Exam[]> {
        try {
            const { xn, xq } = getCurrentAcademicContext()

            const rounds = await this.getExamRounds(xn, '0')
            if (rounds.length === 0) {
                return []
            }

            let targetRound = rounds.find(r => r.name.includes(xn) && r.name.includes('期末'))
            if (!targetRound) {
                targetRound = rounds.find(r => r.name.includes(xn) && r.name.includes('考试'))
                if (!targetRound && rounds.length > 0) {
                    targetRound = rounds[0]
                }
            }

            if (!targetRound) {
                return []
            }

            const kslc = targetRound.code
            return await this.fetchExamTableData(this.TABLE_ID, xn, xq, kslc)

        } catch (error) {
            return []
        }
    }

    private async getExamRounds(xn: string, xq: string): Promise<ExamRound[]> {
        const rawParamValue = `xn=${xn}&xq_m=${xq}&ksxz_m=%`

        const body = [
            `comboBoxName=MsKSSW_KSLC`,
            `paramValue=${encodeURIComponent(rawParamValue)}`,
            `isYXB=0`,
            `isCDDW=0`,
            `isXQ=0`,
            `isDJKSLB=0`,
            `isZY=0`
        ].join('&')

        const response = await chrome.runtime.sendMessage({
            type: 'FETCH_LEGACY',
            payload: {
                url: this.DROPLIST_URL,
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                body: body,
                encoding: 'utf-8'
            }
        })

        if (!response.ok) {
            return []
        }

        try {
            const json = JSON.parse(response.data)
            return json as ExamRound[]
        } catch (e) {
            return []
        }
    }

    private async fetchExamTableData(tableId: string, xn: string, xq: string, kslc: string): Promise<Exam[]> {
        const xn1 = (parseInt(xn) + 1).toString()
        const btnQry = '%BC%EC%CB%F7'

        const body = [
            `tableId=${tableId}`,
            `menucode_current=${this.MENU_CODE}`,
            `xn=${xn}`,
            `xn1=${xn1}`,
            `xq=${xq}`,
            `roleType=STU`,
            `kslc=${kslc}`,
            `initQry=0`,
            `btnQry=${btnQry}`
        ].join('&')

        const url = `${this.DATE_TABLE_URL}?tableId=${tableId}`

        const response = await chrome.runtime.sendMessage({
            type: 'FETCH_LEGACY',
            payload: {
                url: url,
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: body,
                encoding: 'gbk'
            }
        })

        if (!response.ok) {
            return []
        }

        return this.parseExamHtml(response.data)
    }

    private parseExamHtml(html: string): Exam[] {
        const exams: Exam[] = []
        try {
            const parser = new DOMParser()
            const doc = parser.parseFromString(html, 'text/html')

            const rows = Array.from(doc.querySelectorAll('tr'))

            let headerIndex: Record<string, number> = {}
            let dataStartIndex = -1

            rows.forEach((row, rowIndex) => {
                const cells = row.querySelectorAll('th, td')
                const cellTexts = Array.from(cells).map(c => c.textContent?.trim() || '')

                if (dataStartIndex === -1 && (cellTexts.some(t => t.includes('课程名称') || t.includes('考试时间')))) {
                    cellTexts.forEach((text, idx) => {
                        headerIndex[text] = idx
                        if (text.includes('课程名称')) headerIndex['课程名称'] = idx
                        if (text.includes('考试时间')) headerIndex['考试时间'] = idx
                        if (text.includes('考试地点')) headerIndex['考试地点'] = idx
                        if (text.includes('座位号')) headerIndex['座位号'] = idx
                        if (text.includes('学分')) headerIndex['学分'] = idx
                        if (text.includes('性质') || text.includes('考试性质')) headerIndex['考试性质'] = idx
                        if (text.includes('方式') || text.includes('考核方式')) headerIndex['考核方式'] = idx
                        if (text.includes('课程号')) headerIndex['课程号'] = idx
                    })
                    dataStartIndex = rowIndex + 1
                }
            })

            if (dataStartIndex === -1) {
                return []
            }

            for (let i = dataStartIndex; i < rows.length; i++) {
                const cells = rows[i].querySelectorAll('td')
                if (cells.length < 3) continue

                const getText = (key: string) => {
                    const idx = headerIndex[key]
                    return idx !== undefined && cells[idx] ? cells[idx].textContent?.trim() || '' : ''
                }

                let name = getText('课程名称')
                let id = getText('课程号')

                const combinedName = getText('课程')
                if (!name && combinedName) {
                    name = combinedName
                }

                if (name && name.startsWith('[')) {
                    const match = name.match(/^\[([\w-]+)\](.*)/)
                    if (match) {
                        id = match[1]
                        name = match[2]
                    }
                }

                if (!name) continue

                const timeAndDate = this.parseTimeStr(getText('考试时间'))

                exams.push({
                    id,
                    name,
                    time: getText('考试时间'),
                    location: getText('考试地点'),
                    seat: getText('座位号'),
                    credit: getText('学分'),
                    type: getText('考试性质') || getText('类别'),
                    mode: getText('考核方式'),
                    startTime: timeAndDate?.start,
                    endTime: timeAndDate?.end
                })
            }

            exams.sort((a, b) => {
                const t1 = a.startTime?.getTime() || 0
                const t2 = b.startTime?.getTime() || 0
                return t1 - t2
            })

        } catch (e) {
            // Parse error
        }
        return exams
    }

    private parseTimeStr(str: string): { start: Date, end: Date } | null {
        try {
            const match = str.match(/(\d{4}-\d{2}-\d{2}).*?(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/)
            if (!match) return null

            const datePart = match[1]
            const startPart = match[2]
            const endPart = match[3]

            return {
                start: new Date(`${datePart}T${startPart}:00`),
                end: new Date(`${datePart}T${endPart}:00`)
            }
        } catch (e) {
            return null
        }
    }
}

export const examService = new ExamService()
