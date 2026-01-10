/**
 * 课表服务
 */
import { calendarService } from './CalendarService'
import { getCurrentAcademicContext } from '../utils/dateUtils'

export interface Course {
    name: string
    teacher: string
    location: string
    time: string
    startTime?: string
    endTime?: string
    sectionIndex: number
    weeks: string
}

export class ScheduleService {
    private readonly JWXT_URL = 'https://jwxt.xju.edu.cn/xjdxjw/frame/desk/showLessonScheduleInfosV14.action'

    async fetchTodaySchedule(date?: Date): Promise<Course[]> {
        try {
            const targetDate = date || calendarService.getNow()
            const currentWeek = await calendarService.getCurrentWeek(targetDate)

            const { xn, xq } = getCurrentAcademicContext(targetDate)
            const params = new URLSearchParams({
                xn: xn,
                xq: xq,
                jxz: currentWeek.toString()
            })

            const url = `${this.JWXT_URL}?${params.toString()}`

            const response = await chrome.runtime.sendMessage({
                type: 'FETCH_LEGACY',
                payload: { url: url, method: 'GET', encoding: 'utf-8' }
            })

            if (!response.ok) {
                return []
            }

            const html = response.data
            return this.parseDailyCourses(html, targetDate)

        } catch (error) {
            return []
        }
    }

    private parseDailyCourses(html: string, date?: Date): Course[] {
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')

        const targetDate = date || calendarService.getNow()
        let dayIndex = targetDate.getDay()
        if (dayIndex === 0) dayIndex = 7

        const dayStr = String(dayIndex).padStart(2, '0')

        const dailyCourses: Course[] = []

        // 解析时间表
        const timeMap = new Map<number, { start: string, end: string }>()
        const timeRegex = />(\d+)\s*\(\s*(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})\s*\)/g
        let match
        while ((match = timeRegex.exec(html)) !== null) {
            const section = parseInt(match[1])
            const start = match[2]
            const end = match[3]
            timeMap.set(section, { start, end })
        }

        const processedCourses = new Set<string>()

        for (let i = 1; i <= 14; i++) {
            const divId = `weekly${dayStr}_${i}`
            const div = doc.getElementById(divId)

            if (div) {
                const text = div.innerHTML

                const nameMatch = text.match(/课程名称[：:]\s*<b>(.*?)<\/b>/)
                const teacherMatch = text.match(/任课教师[：:]\s*<b>(.*?)<\/b>/)
                const locationMatch = text.match(/上课地点[：:]\s*<b>(.*?)<\/b>/)
                const timeMatch = text.match(/上课时间[：:]\s*<b>\[(.*?)\]/)
                const sectionMatch = text.match(/[一二三四五六日]\[([0-9,-]+)节\]/)

                const name = nameMatch ? nameMatch[1].trim() : ''

                if (name) {
                    const timeStr = sectionMatch ? `${sectionMatch[1]}节` : ''
                    const uniqueKey = `${name}_${timeStr}`

                    if (processedCourses.has(uniqueKey)) continue;
                    processedCourses.add(uniqueKey)

                    let startSlot = i
                    let endSlot = i
                    if (sectionMatch) {
                        const parts = sectionMatch[1].split('-')
                        if (parts.length === 2) {
                            startSlot = parseInt(parts[0])
                            endSlot = parseInt(parts[1])
                        } else {
                            startSlot = parseInt(parts[0])
                            endSlot = startSlot
                        }
                    }

                    const startTime = timeMap.get(startSlot)?.start || ''
                    const endTime = timeMap.get(endSlot)?.end || ''

                    dailyCourses.push({
                        name,
                        teacher: teacherMatch ? teacherMatch[1].trim() : '未知教师',
                        location: locationMatch ? locationMatch[1].trim() : '未知地点',
                        time: timeStr || `${startSlot}-${endSlot}节`,
                        startTime,
                        endTime,
                        sectionIndex: startSlot,
                        weeks: timeMatch ? timeMatch[1].trim() : ''
                    })
                }
            }
        }

        return dailyCourses
    }
}

export const scheduleService = new ScheduleService()
