import React, { useEffect } from 'react'
import { MenuItem } from '../services/MenuService'
import { StudentRank } from '../services/RankService'
import { Course } from '../services/ScheduleService'
import { Exam } from '../services/ExamService'
import { MapPin, Eye, EyeOff, Settings, School, CreditCard, User, AlertTriangle, CheckCircle } from 'lucide-react'
import { UserInfo } from '../services/UserInfoService'
import { ThemeConfig } from '../utils/themes'

interface DashboardWidgetsProps {
    userInfo: UserInfo | null
    quickApps: MenuItem[]
    rankData: StudentRank | null
    dailyCourses: Course[]
    exams: Exam[]
    onAppClick: (item: MenuItem) => void
    onQuickAppsChange: (newApps: MenuItem[]) => Promise<void>
    onAddQuickApp: () => void
    theme: ThemeConfig
}

// 🧩 统一的列表项组件 (Unified List Item Component)
interface DashboardListItemProps {
    id: string
    title: string
    subtitle?: string  // teacher or credit
    time: string
    location: string
    locationExtra?: string  // seat number for exams
    status: 'active' | 'upcoming' | 'future' | 'past'
    badgeText: string
    badgeStyle: string
    colors: any
}

const DashboardListItem: React.FC<DashboardListItemProps> = ({
    id,
    title,
    subtitle,
    time,
    location,
    locationExtra,
    status,
    badgeText,
    badgeStyle,
    colors
}) => {
    // 🎨 统一样式逻辑
    let containerClass = "h-28 shrink-0 px-5 py-4 rounded-xl border flex items-center justify-between transition-all duration-300 "

    if (status === 'active') {
        containerClass += `${colors.activeContainer} ${colors.activeBorder} shadow-lg`
    } else if (status === 'upcoming') {
        containerClass += `${colors.upcomingContainer} ${colors.upcomingBorder}`
    } else if (status === 'past') {
        containerClass += `opacity-50 grayscale ${colors.cardBg} ${colors.borderColor}`
    } else {
        containerClass += `${colors.cardBg} ${colors.borderColor} hover:opacity-90`
    }

    return (
        <div id={id} className={containerClass}>
            {/* Left: Info */}
            <div className="flex flex-col justify-center h-full gap-1">
                {/* Title */}
                <div className={`text-lg font-bold ${colors.textPrimary} leading-tight flex items-center gap-2 overflow-hidden`}>
                    <span className="truncate flex-1" title={title}>{title}</span>
                    {subtitle && (
                        <span className={`shrink-0 text-xs font-normal px-2 py-0.5 rounded ${colors.textMuted === 'text-white/40' ? 'bg-white/10' : 'bg-slate-200'} ${colors.textSecondary}`}>
                            {subtitle}
                        </span>
                    )}
                </div>

                {/* Time */}
                <div className={`font-mono text-base font-medium mt-1 ${colors.timeText}`}>
                    {time}
                </div>

                {/* Location */}
                <div className={`flex items-center gap-1.5 text-sm ${colors.textSecondary}`}>
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[180px]">
                        {location}
                        {locationExtra && <span className="opacity-50 ml-1">{locationExtra}</span>}
                    </span>
                </div>
            </div>

            {/* Right: Badge */}
            <div className="flex flex-col items-end justify-center gap-2 min-w-[30%]">
                <span className={`px-3 py-1 rounded-lg text-xs font-bold text-center transition-all ${badgeStyle}`}>
                    {badgeText}
                </span>
            </div>
        </div>
    )
}

// 已移除 onRefreshRank
export const DashboardWidgets: React.FC<DashboardWidgetsProps> = ({
    userInfo,
    quickApps,
    rankData,
    dailyCourses,
    exams,
    onAppClick,
    onQuickAppsChange,
    onAddQuickApp,
    theme,
}) => {

    // 主题颜色映射
    // 主题颜色映射
    const themeColors = {
        blue: {
            activeContainer: 'bg-gradient-to-r from-blue-600/50 to-blue-900/40 border border-blue-500/30',
            activeBorder: 'border-l-4 border-l-blue-400',
            upcomingContainer: 'bg-gradient-to-r from-blue-600/30 to-blue-900/10 border border-blue-500/10',
            upcomingBorder: 'border-l-4 border-l-blue-500/60',
            timeText: 'text-blue-200 font-bold',
            badgeActive: 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 animate-pulse',
            badgeUrgent: 'bg-orange-500 text-white shadow-lg shadow-orange-500/20',
            badgeUpcoming: 'bg-blue-600/30 text-blue-100 border border-blue-400/30',
            badgeCountdown: 'bg-blue-500 text-white shadow-lg shadow-blue-500/20',
            bg: '#1e40af',
            toggleBg: 'bg-black/20',
            emptyText: 'text-white/30',
            shadow: 'shadow-blue-500/40'
        },
        purple: {
            activeContainer: 'bg-gradient-to-r from-purple-600/50 to-purple-900/40 border border-purple-500/30',
            activeBorder: 'border-l-4 border-l-purple-400',
            upcomingContainer: 'bg-gradient-to-r from-purple-600/30 to-purple-900/10 border border-purple-500/10',
            upcomingBorder: 'border-l-4 border-l-purple-500/60',
            timeText: 'text-purple-200 font-bold',
            badgeActive: 'bg-purple-500 text-white shadow-lg shadow-purple-500/30 animate-pulse',
            badgeUrgent: 'bg-pink-500 text-white shadow-lg shadow-pink-500/20',
            badgeUpcoming: 'bg-purple-600/30 text-purple-100 border border-purple-400/30',
            badgeCountdown: 'bg-purple-500 text-white shadow-lg shadow-purple-500/20',
            bg: '#6b21a8',
            toggleBg: 'bg-black/20',
            emptyText: 'text-white/30',
            shadow: 'shadow-purple-500/40'
        },
        pink: {
            activeContainer: 'bg-gradient-to-r from-pink-400/20 to-rose-300/10 border border-pink-200/50',
            activeBorder: 'border-l-4 border-l-pink-400',
            upcomingContainer: 'bg-gradient-to-r from-pink-400/10 to-transparent',
            upcomingBorder: 'border-l-4 border-l-pink-400/30',
            timeText: 'text-pink-600',
            badgeActive: 'bg-pink-400 text-white shadow-lg shadow-pink-400/20 animate-pulse',
            badgeUrgent: 'bg-rose-400 text-white shadow-lg shadow-rose-400/20',
            badgeUpcoming: 'bg-pink-100 text-pink-600 border border-pink-200',
            badgeCountdown: 'bg-pink-500 text-white shadow-lg shadow-pink-500/20',
            bg: '#e363a3ff',
            toggleBg: 'bg-pink-100/50 border border-pink-200/50',
            emptyText: 'text-pink-800/40',
            shadow: 'shadow-pink-500/30'
        },
        green: {
            activeContainer: 'bg-gradient-to-r from-emerald-600/50 to-emerald-900/40 border border-emerald-500/30',
            activeBorder: 'border-l-4 border-l-emerald-400',
            upcomingContainer: 'bg-gradient-to-r from-emerald-600/30 to-emerald-900/10 border border-emerald-500/10',
            upcomingBorder: 'border-l-4 border-l-emerald-500/60',
            timeText: 'text-emerald-200 font-bold',
            badgeActive: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 animate-pulse',
            badgeUrgent: 'bg-red-500 text-white shadow-lg shadow-red-500/20',
            badgeUpcoming: 'bg-emerald-600/30 text-emerald-100 border border-emerald-400/30',
            badgeCountdown: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20',
            bg: '#047857',
            toggleBg: 'bg-black/20',
            emptyText: 'text-white/30',
            shadow: 'shadow-emerald-500/40'
        },
        gray: {
            activeContainer: 'bg-gradient-to-r from-gray-600/50 to-gray-800/40 border border-gray-500/30',
            activeBorder: 'border-l-4 border-l-gray-300',
            upcomingContainer: 'bg-gradient-to-r from-gray-600/30 to-gray-800/10 border border-gray-500/10',
            upcomingBorder: 'border-l-4 border-l-gray-400/60',
            timeText: 'text-gray-200 font-bold',
            badgeActive: 'bg-gray-500 text-white shadow-lg shadow-gray-500/30 animate-pulse',
            badgeUrgent: 'bg-red-500 text-white shadow-lg shadow-red-500/20',
            badgeUpcoming: 'bg-gray-600/30 text-gray-100 border border-gray-400/30',
            badgeCountdown: 'bg-gray-500 text-white shadow-lg shadow-gray-500/20',
            bg: '#959fb1ff',
            toggleBg: 'bg-black/20',
            emptyText: 'text-white/30',
            shadow: 'shadow-gray-500/40'
        },
        orange: {
            activeContainer: 'bg-gradient-to-r from-orange-400/20 to-amber-300/10 border border-orange-200/50',
            activeBorder: 'border-l-4 border-l-orange-400',
            upcomingContainer: 'bg-gradient-to-r from-orange-400/10 to-transparent',
            upcomingBorder: 'border-l-4 border-l-orange-400/30',
            timeText: 'text-orange-600',
            badgeActive: 'bg-orange-400 text-white shadow-lg shadow-orange-400/20 animate-pulse',
            badgeUrgent: 'bg-red-400 text-white shadow-lg shadow-red-400/20',
            badgeUpcoming: 'bg-orange-100 text-orange-600 border border-orange-200',
            badgeCountdown: 'bg-orange-500 text-white shadow-lg shadow-orange-500/20',
            bg: '#e28949ff',
            toggleBg: 'bg-orange-100/50 border border-orange-200/50',
            emptyText: 'text-orange-800/40',
            shadow: 'shadow-orange-400/30'
        },
        white: {
            activeContainer: 'bg-gradient-to-r from-slate-200/50 to-slate-100/30',
            activeBorder: 'border-l-4 border-l-slate-400',
            upcomingContainer: 'bg-gradient-to-r from-slate-100/50 to-transparent',
            upcomingBorder: 'border-l-4 border-l-slate-300/50',
            timeText: 'text-slate-600',
            badgeActive: 'bg-slate-500 text-white shadow-lg shadow-slate-500/20 animate-pulse',
            badgeUrgent: 'bg-red-400 text-white shadow-lg shadow-red-400/20',
            badgeUpcoming: 'bg-slate-100 text-slate-600 border border-slate-200',
            badgeCountdown: 'bg-slate-500 text-white shadow-lg shadow-slate-500/20',
            bg: '#64748b',
            toggleBg: 'bg-slate-200/50 border border-slate-300/50',
            emptyText: 'text-slate-500/40',
            shadow: 'shadow-slate-400/20'
        }
    } as const
    const baseColors = themeColors[theme.id as keyof typeof themeColors] || themeColors.blue
    const currentColors = {
        ...baseColors,
        textPrimary: theme.textPrimary,
        textSecondary: theme.textSecondary,
        textMuted: theme.textMuted,
        borderColor: theme.borderColor,
        cardBg: theme.cardBg
    }

    // 拖拽处理
    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.setData('text/plain', index.toString())
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault() // 必须允许 Drop
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault()
        const sourceIndexStr = e.dataTransfer.getData('text/plain')
        if (!sourceIndexStr) return

        const sourceIndex = parseInt(sourceIndexStr)
        if (sourceIndex === targetIndex) return

        // 交换位置
        const newApps = [...quickApps]
        const [movedApp] = newApps.splice(sourceIndex, 1)
        newApps.splice(targetIndex, 0, movedApp)

        onQuickAppsChange(newApps)
    }



    // Helper to parse "HH:mm" to Date object for today


    // 移除 isRankRefreshing 状态

    const [now, setNow] = React.useState(new Date())

    // Helper to parse "HH:mm" to Date object using 'now' (supports mock time)
    const parseTime = React.useCallback((timeStr: string | undefined): Date | null => {
        if (!timeStr) return null
        const [hours, minutes] = timeStr.split(':').map(Number)
        if (isNaN(hours) || isNaN(minutes)) return null
        const date = new Date(now)
        date.setHours(hours, minutes, 0, 0)
        return date
    }, [now])



    // View Mode State
    const [activeTab, setActiveTab] = React.useState<'schedule' | 'exam'>('schedule')
    //  隐私模式状态 (持久化)
    const [privacyMode, setPrivacyMode] = React.useState(() => {
        return localStorage.getItem('better-xju-privacy-mode') === 'true'
    })

    // 监听隐私模式变化并保存
    React.useEffect(() => {
        localStorage.setItem('better-xju-privacy-mode', privacyMode.toString())
    }, [privacyMode])

    // Initial View Logic
    React.useEffect(() => {
        if (dailyCourses.length > 0) {
            setActiveTab('schedule')
        } else if (exams.length > 0) {
            setActiveTab('exam')
        } else {
            setActiveTab('schedule')
        }
    }, [dailyCourses.length, exams.length])

    const examListRef = React.useRef<HTMLDivElement>(null)

    // Auto-scroll logic
    React.useEffect(() => {
        const scrollToTarget = () => {
            const container = examListRef.current
            if (!container) return

            const currentTime = new Date()

            const parseTimeNow = (timeStr?: string): Date | null => {
                if (!timeStr) return null
                const [hours, minutes] = timeStr.split(':').map(Number)
                if (isNaN(hours) || isNaN(minutes)) return null
                const date = new Date(currentTime)
                date.setHours(hours, minutes, 0, 0)
                return date
            }

            let targetIndex = -1

            if (activeTab === 'schedule') {
                for (let i = 0; i < dailyCourses.length; i++) {
                    const course = dailyCourses[i]
                    const start = parseTimeNow(course.startTime)
                    const end = parseTimeNow(course.endTime)
                    if (start && end && currentTime <= end) {
                        targetIndex = i
                        break
                    }
                }
            } else {
                for (let i = 0; i < exams.length; i++) {
                    const exam = exams[i]
                    const examEnd = exam.endTime ? new Date(exam.endTime) :
                        (exam.startTime ? new Date(exam.startTime) : null)
                    if (examEnd && examEnd > currentTime) {
                        targetIndex = i
                        break
                    }
                }
            }
            if (targetIndex >= 0) {
                setTimeout(() => {
                    if (!container) return

                    // 容器内部结构：<div class="space-y-3 pb-2"> 包裹所有 DashboardListItem
                    const listContainer = container.querySelector('.space-y-3')
                    if (!listContainer) return

                    const card = listContainer.children[targetIndex] as HTMLElement
                    if (card) {
                        const containerRect = container.getBoundingClientRect()
                        const cardRect = card.getBoundingClientRect()
                        const relativeTop = cardRect.top - containerRect.top + container.scrollTop
                        // 留出 5px 的顶部间距
                        const offsetTop = Math.max(0, relativeTop - 5)
                        container.scrollTo({ top: offsetTop, behavior: 'smooth' })
                    }
                }, 500)
            }
        }

        const timer = setTimeout(scrollToTarget, 150)
        return () => clearTimeout(timer)
    }, [activeTab, dailyCourses, exams])

    // 🕒 更新 now 状态用于 Badge 倒计时显示
    React.useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])



    // Tab 切换逻辑
    useEffect(() => {
        // 如果今天有课，优先显示课表
        if (dailyCourses.length > 0) {
            setActiveTab('schedule')
            return
        }

        // 如果今天无课，但有未来考试，显示考试
        const hasFutureExams = exams.some(e => e.startTime ? new Date(e.startTime) > now : false)
        if (hasFutureExams) {
            setActiveTab('exam')
        }

        // 默认为 schedule (已在 useState 初始化)
    }, [dailyCourses, exams])


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 items-start">
            {/* 1. 学业概览卡片 */}
            <div className={`${theme.cardBg} backdrop-blur-md rounded-2xl p-6 border ${theme.borderColor} shadow-lg relative group overflow-hidden h-[360px] min-h-[360px] flex flex-col`}>
                {/* Header Row: Title & User Info */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className={`text-2xl font-bold ${theme.textPrimary} flex items-center gap-2 mb-1`}>
                            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            个人概览
                        </h3>
                    </div>

                    <button
                        onClick={() => setPrivacyMode(!privacyMode)}
                        className={`p-2 rounded-full bg-transparent ${theme.textMuted} hover:${theme.textPrimary} hover:bg-white/10 transition-all border-none outline-none`}
                        title={privacyMode ? "显示分数" : "隐藏分数 (隐私模式)"}
                    >
                        {privacyMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>

                {/* Compact User Info - Centered & Detached */}
                {userInfo && !privacyMode && (
                    <div className="flex justify-center items-center mb-4 mt-2">
                        <div className={`flex items-center gap-4 text-xs ${theme.textSecondary} transform scale-[1.7] origin-center`}>
                            <div className="flex items-center gap-1">
                                <School className={`w-3 h-3 ${theme.textMuted}`} />
                                <span>{userInfo.userDepartment}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <CreditCard className={`w-3 h-3 ${theme.textMuted}`} />
                                <span className="font-mono">{userInfo.userId}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <User className={`w-3 h-3 ${theme.textMuted}`} />
                                <span>{userInfo.userType}</span>
                            </div>
                        </div>
                    </div>
                )}

                {!rankData ? (
                    <div className="text-center py-8 text-white/50">
                        暂无排名数据
                    </div>
                ) : (
                    <div className="flex flex-1 items-center justify-center relative px-2">
                        <div
                            className="flex items-center gap-4 transform scale-[1.5] origin-center"
                            style={{ minWidth: 'max-content', flex: '0 0 auto' }}
                        >
                            {/* Left: Circular Gauge (GPA) - Triple Lock Layout (Inline Styles) */}
                            <div
                                className="relative flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300"
                                onClick={() => setPrivacyMode(!privacyMode)}
                                title={privacyMode ? "点击显示分数" : "点击隐藏分数"}
                                style={{
                                    width: '140px',
                                    height: '140px',
                                    minWidth: '140px',
                                    minHeight: '140px',
                                    flex: '0 0 140px'
                                }}
                            >
                                <div className="relative w-full h-full">
                                    {/* SVG with preserveAspectRatio */}
                                    <svg
                                        className="w-full h-full transform -rotate-90"
                                        viewBox="0 0 128 128"
                                        preserveAspectRatio="xMidYMid meet"
                                    >
                                        {/* Background Circle */}
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            className="text-white/10"
                                        />
                                        {/* Progress Circle */}
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            strokeDasharray={2 * Math.PI * 56}
                                            strokeDashoffset={privacyMode ? (2 * Math.PI * 56) : (2 * Math.PI * 56 * (1 - Math.min((parseFloat(rankData.gpa) || 0) / 4.0, 1)))}
                                            strokeLinecap="round"
                                            className={`transition-all duration-1000 ease-out ${privacyMode ? 'opacity-0 text-emerald-400' : 'opacity-100 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]'}`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className={`text-xs ${theme.textMuted} font-bold tracking-wider mb-0.5`}>GPA</span>
                                        <span className={`text-3xl font-bold font-mono ${theme.textPrimary} tracking-tighter`}>
                                            {privacyMode ? '**.**' : (parseFloat(rankData.gpa) || 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute inset-0 pointer-events-none" /> {/* Spacer overlay if needed, but flex-gap handles it */}

                            {/* Right Side Wrapper: Group Badge + Grid as "One Whole" */}
                            <div className="flex-1 flex flex-col justify-center gap-2 relative z-10 pl-2">
                                {/* Academic Status Badge (Now part of the vertical flow for better alignment) */}
                                {!privacyMode && (
                                    <div className="flex justify-end mr-[8px]">
                                        {(rankData.failedCourses || 0) > 0 ? (
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/10 backdrop-blur-sm border border-red-500/20 pointer-events-none">
                                                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                                                <span className="text-[10px] font-bold text-red-500">挂科预警: {rankData.failedCourses}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 pointer-events-none">
                                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                                <span className="text-[10px] font-bold text-emerald-500">学业状态: 全过</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Data Grid 2x2 */}
                                <div className="grid grid-cols-2 gap-x-2 gap-y-3">
                                    {/* Top Left: Avg Score */}
                                    <div>
                                        <div className={`text-xs ${theme.textMuted} mb-1`}>加权平均分</div>
                                        <div className={`text-xl font-bold font-mono ${theme.textPrimary}`}>
                                            {privacyMode ? '**.**' : (parseFloat(rankData.avgScore) || 0).toFixed(2)}
                                        </div>
                                    </div>
                                    {/* Top Right: Total Courses */}
                                    <div>
                                        <div className={`text-xs ${theme.textMuted} mb-1`}>已修课程</div>
                                        <div className={`text-xl font-bold font-mono ${theme.textPrimary} flex items-baseline gap-1`}>
                                            {privacyMode ? '**' : (rankData.totalPassedCourses !== undefined ? rankData.totalPassedCourses : '-')}
                                            <span className={`text-xs ${theme.textMuted} font-sans font-normal`}>门</span>
                                        </div>
                                    </div>
                                    {/* Bottom Left: Major Rank */}
                                    <div>
                                        <div className={`text-xs ${theme.textMuted} mb-1`}>专业排名</div>
                                        <div className={`text-base font-bold font-mono ${theme.textSecondary}`}>
                                            {privacyMode ? 'No.**' : `No.${rankData.majorRank}`}
                                        </div>
                                    </div>
                                    {/* Bottom Right: Class Rank */}
                                    <div>
                                        <div className={`text-xs ${theme.textMuted} mb-1`}>班级排名</div>
                                        <div className={`text-base font-bold font-mono ${theme.textSecondary}`}>
                                            {privacyMode ? 'No.**' : `No.${rankData.classRank}`}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative Background Element */}
                        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>


                    </div>
                )}


            </div>

            {/* 2. Today's Schedule / Exam Schedule */}
            <div className={`${theme.cardBg} backdrop-blur-md rounded-2xl p-6 border ${theme.borderColor} shadow-lg ${theme.textPrimary} flex flex-col h-[360px] min-h-[360px] overflow-hidden`}>
                <div className="flex items-center justify-between mb-4 gap-3">
                    {/* 1. 切换栏 */}
                    <div className={`flex-1 ${currentColors.toggleBg || 'bg-black/20'} p-1.5 rounded-xl flex backdrop-blur-sm transition-colors duration-300`}>
                        <button
                            onClick={() => setActiveTab('schedule')}
                            style={{ backgroundColor: activeTab === 'schedule' ? currentColors.bg : 'rgba(0,0,0,0)', border: 'none' }}
                            className={`flex-1 flex items-center justify-center gap-3 py-2.5 rounded-lg text-lg font-bold transition-all ${activeTab === 'schedule'
                                ? `text-white shadow-lg ${currentColors.shadow}`
                                : `${theme.textMuted} hover:${theme.textPrimary}`
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>今日课表</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('exam')}
                            style={{ backgroundColor: activeTab === 'exam' ? currentColors.bg : 'rgba(0,0,0,0)', border: 'none' }}
                            className={`flex-1 flex items-center justify-center gap-3 py-2.5 rounded-lg text-lg font-bold transition-all ${activeTab === 'exam'
                                ? `text-white shadow-lg ${currentColors.shadow}`
                                : `${theme.textMuted} hover:${theme.textPrimary}`
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span>考试安排</span>
                        </button>
                    </div>
                </div>

                {/* 统一的内容区域 (Unified Content Area) */}
                <div ref={examListRef} className="flex-1 overflow-y-auto px-1 min-h-0 relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

                    {/* Empty State */}
                    {(activeTab === 'schedule' ? dailyCourses : exams).length === 0 && (
                        <div className={`absolute inset-0 flex flex-col items-center justify-center ${currentColors.emptyText || 'text-white/30'} gap-3 pointer-events-none`}>
                            {activeTab === 'schedule' ? (
                                <>
                                    <svg className="w-12 h-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <span className="text-sm font-medium">今日无课，好好休息</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-12 h-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <span className="text-sm font-medium">近期暂无考试安排</span>
                                </>
                            )}
                        </div>
                    )}

                    {/* List Content */}
                    <div className="space-y-3 pb-2">
                        {activeTab === 'schedule'
                            ? (() => {
                                // Pre-calculate Active/Next for Schedule
                                let activeIndex = -1
                                let nextFutureIndex = -1

                                for (let i = 0; i < dailyCourses.length; i++) {
                                    const start = parseTime(dailyCourses[i].startTime)
                                    const end = parseTime(dailyCourses[i].endTime)
                                    if (start && end) {
                                        if (now >= start && now <= end) {
                                            activeIndex = i
                                            break // Found current
                                        } else if (now < start && nextFutureIndex === -1) {
                                            nextFutureIndex = i
                                        }
                                    }
                                }
                                return dailyCourses.map((course, index) => {
                                    const start = parseTime(course.startTime)
                                    const end = parseTime(course.endTime)
                                    const isPast = end ? now > end : false
                                    const isActive = activeIndex === index
                                    const isNext = nextFutureIndex === index

                                    // 确定状态
                                    let status: 'active' | 'upcoming' | 'future' | 'past' = 'future'
                                    if (isActive) status = 'active'
                                    else if (isNext && activeIndex === -1) status = 'upcoming'
                                    else if (isPast) status = 'past'

                                    // Badge 逻辑
                                    let badgeText = '未开始'
                                    let badgeStyle = 'text-gray-500'

                                    if (isActive) {
                                        badgeText = '进行中'
                                        badgeStyle = currentColors.badgeActive
                                    } else if (isNext && start) {
                                        const diffMs = start.getTime() - now.getTime()
                                        const diffMinsTotal = Math.floor(diffMs / 60000)
                                        const isUrgent = diffMinsTotal < 60 && (activeIndex === -1)

                                        if (isUrgent) {
                                            const diffMins = Math.floor(diffMs / 60000)
                                            const diffSecs = Math.floor((diffMs % 60000) / 1000)
                                            badgeText = `${diffMins}分${diffSecs}秒`
                                            badgeStyle = currentColors.badgeUrgent
                                        } else {
                                            if (diffMinsTotal < 60) {
                                                badgeText = `${diffMinsTotal}分钟后`
                                            } else {
                                                const hours = Math.floor(diffMinsTotal / 60)
                                                const mins = diffMinsTotal % 60
                                                badgeText = `${hours}小时${mins}分后`
                                            }
                                            badgeStyle = currentColors.badgeCountdown
                                        }
                                    } else if (isPast) {
                                        badgeText = '已结束'
                                        badgeStyle = 'text-gray-600'
                                    }

                                    return (
                                        <DashboardListItem
                                            key={index}
                                            id={`course-card-${index}`}
                                            title={course.name}
                                            subtitle={course.teacher || '未知教师'}
                                            time={course.startTime ? `${course.startTime} - ${course.endTime}` : course.time}
                                            location={course.location}
                                            status={status}
                                            badgeText={badgeText}
                                            badgeStyle={badgeStyle}
                                            colors={currentColors}
                                        />
                                    )
                                })
                            })()
                            : exams.map((exam, index) => {
                                // Exam Logic
                                const isFuture = exam.endTime ? new Date(exam.endTime) > now : true
                                const isPast = !isFuture
                                const isNext = isFuture && exams.findIndex(e => e.endTime ? new Date(e.endTime) > now : true) === index

                                // 确定状态
                                let status: 'active' | 'upcoming' | 'future' | 'past' = 'future'
                                if (isNext) status = 'upcoming'
                                else if (isPast) status = 'past'

                                // Badge 逻辑
                                let badgeText = '等待开始'
                                let badgeStyle = 'text-gray-500'

                                if (isNext && exam.startTime) {
                                    const diffMs = new Date(exam.startTime).getTime() - now.getTime()
                                    const isUrgent = diffMs < (24 * 60 * 60 * 1000)

                                    if (diffMs > 0) {
                                        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
                                        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                                        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

                                        if (isUrgent) {
                                            badgeStyle = 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                            if (diffHours > 0) {
                                                badgeText = `${diffHours}小时${diffMins}分`
                                            } else {
                                                badgeText = `${diffMins}分钟`
                                            }
                                        } else {
                                            badgeStyle = currentColors.badgeCountdown || 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                            badgeText = `${diffDays}天${diffHours}小时`
                                        }
                                    } else {
                                        badgeText = '进行中'
                                        badgeStyle = currentColors.badgeActive
                                    }
                                } else if (isFuture) {
                                    if (exam.startTime) {
                                        const diffMs = new Date(exam.startTime).getTime() - now.getTime()
                                        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
                                        badgeText = `${diffDays}天后`
                                        badgeStyle = 'bg-white/10 text-gray-400'
                                    }
                                } else {
                                    badgeText = '已结束'
                                    badgeStyle = 'text-gray-600'
                                }

                                return (
                                    <DashboardListItem
                                        key={index}
                                        id={`exam-card-${index}`}
                                        title={exam.name}
                                        subtitle={`${exam.credit}学分`}
                                        time={exam.time.split(')')[1] || exam.time}
                                        location={exam.location}
                                        locationExtra={`${exam.seat}号`}
                                        status={status}
                                        badgeText={badgeText}
                                        badgeStyle={badgeStyle}
                                        colors={currentColors}
                                    />
                                )
                            })
                        }
                    </div>
                </div>
            </div>

            {/* 3. 快速访问卡片 (Draggable) */}
            {/* 3. 快速访问卡片 (Draggable) */}
            <div className={`${theme.cardBg} backdrop-blur-md rounded-2xl p-6 border ${theme.borderColor} shadow-lg ${theme.textPrimary} h-[360px] min-h-[360px] overflow-hidden flex flex-col`}>
                <div className="flex items-center justify-between mb-4 shrink-0">
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        快速访问
                    </h3>
                    <button
                        onClick={onAddQuickApp}
                        className={`p-2 rounded-full bg-transparent ${theme.textMuted} hover:${theme.textPrimary} hover:bg-white/10 transition-all border-none outline-none`}
                        title="自定义快速访问"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pt-6">
                    <div className="grid grid-cols-4 gap-3">
                        {quickApps.map((app, index) => (
                            <div
                                key={app.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, index)}
                                className="cursor-move group"
                            >
                                <button
                                    onClick={() => onAppClick(app)}
                                    className={`w-full flex flex-col items-center gap-2 p-3 rounded-xl ${theme.searchBg} hover:opacity-80 transition-all border ${theme.borderColor} hover:border-white/20`}
                                    title={`${app.title} (拖动可排序)`}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110 ${['white'].includes(theme.id) ? 'bg-slate-200' : ''}`}>
                                        {app.icon ? (
                                            <img src={app.icon} alt={app.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-blue-500/20 flex items-center justify-center text-xl">
                                                🔗
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-xs text-center ${theme.textSecondary} line-clamp-1 w-full scale-90`}>
                                        {app.title}
                                    </span>
                                </button>
                            </div>
                        ))}

                        {quickApps.length === 0 && (
                            <button
                                onClick={onAddQuickApp}
                                className={`col-span-4 py-8 flex flex-col items-center justify-center border border-dashed ${theme.borderColor} rounded-xl hover:border-opacity-100 ${theme.searchBg} transition-all ${theme.textMuted} hover:${theme.textSecondary} gap-2`}
                            >
                                <span className="text-2xl">+</span>
                                <span className="text-sm">点击添加快速访问</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div >
    )
}
