import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { menuService, MenuItem } from '../services/MenuService'
import { userInfoService, UserInfo } from '../services/UserInfoService'
import { rankService, StudentRank } from '../services/RankService'
import { scheduleService, Course } from '../services/ScheduleService'
import { examService, Exam } from '../services/ExamService'
import { ehallService } from '../services/EhallService'
import { DashboardWidgets } from './DashboardWidgets'
import { LifeServiceRow } from '../components/dashboard/LifeServiceRow'
import { themes, getStoredTheme, setStoredTheme, getThemeById, ThemeConfig } from '../utils/themes'


export default function Dashboard() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
    const [rankData, setRankData] = useState<StudentRank | null>(null)
    const [dailyCourses, setDailyCourses] = useState<Course[]>([])
    const [exams, setExams] = useState<Exam[]>([])
    const [loading, setLoading] = useState(true)
    const [statsLoading, setStatsLoading] = useState(true)

    // Life Services Data
    const [cardData, setCardData] = useState<any>(null)
    const [libraryData, setLibraryData] = useState<any>(null)

    // Quick Apps Logic
    const [quickApps, setQuickApps] = useState<MenuItem[]>([])
    const [allApps, setAllApps] = useState<MenuItem[]>([])
    const [isAddingApp, setIsAddingApp] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [weather, setWeather] = useState<string>('')
    const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(() => getThemeById(getStoredTheme()))
    const [showThemePicker, setShowThemePicker] = useState(false)

    useEffect(() => {
        // Fetch Weather for Urumqi (Proxy via Background to avoid CORS/CSP)
        chrome.runtime.sendMessage({
            type: 'PROXY_FETCH',
            payload: {
                url: 'https://wttr.in/Urumqi?format=%C+%t&lang=zh-cn',
                options: { method: 'GET' }
            }
        }).then(response => {
            if (response.ok && response.data) {
                setWeather(response.data.replace('+', ''))
            } else {
                setWeather('')
            }
        }).catch(() => setWeather(''))
    }, [])

    const navigate = useNavigate()

    const loadData = async () => {
        setLoading(true)
        try {
            const [items, user, rank, courses, examList] = await Promise.all([
                menuService.fetchMenuItems()
                    .catch(e => { console.warn('获取菜单失败', e); return [] }),
                userInfoService.getUserInfo()
                    .catch(e => { console.warn('获取用户信息失败', e); return null }),
                rankService.fetchRank()
                    .catch(e => { console.warn('获取排名失败', e); return null }),
                scheduleService.fetchTodaySchedule(new Date())
                    .catch(e => { console.warn('获取课表失败', e); return [] }),
                examService.fetchExams()
                    .catch(e => { console.warn('获取考试失败', e); return [] })
            ])
            setMenuItems(items)
            setUserInfo(user)
            setRankData(rank)
            setDailyCourses(courses)
            setExams(examList)

            // 初始化所有应用和快速应用
            setAllApps(items)
            const quick = await menuService.getQuickApps(items)
            setQuickApps(quick)

            // 异步加载生活服务数据 (不阻塞主加载)
            setStatsLoading(true)
            Promise.all([
                ehallService.fetchCampusCardData(),
                ehallService.fetchLibraryData()
            ]).then(([card, library]) => {
                setCardData(card)
                setLibraryData(library)
            }).finally(() => {
                setStatsLoading(false)
            })

        } catch (error) {
            console.error('加载数据失败:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()

        // 监听 Token 就绪信号
        const listener = (message: any) => {
            if (message.type === 'TOKEN_HARVESTED_SUCCESS') {
                loadData()
            }
        }
        chrome.runtime.onMessage.addListener(listener)

        return () => {
            chrome.runtime.onMessage.removeListener(listener)
        }
    }, [])

    const handleMenuClick = (item: MenuItem) => {
        if (item.route) {
            navigate(item.route)
        } else if (item.url) {
            window.open(item.url, '_blank', 'noopener,noreferrer')
        }
    }

    // 拖拽排序回调
    const handleQuickAppsChange = async (newApps: MenuItem[]) => {
        setQuickApps(newApps)
        await menuService.saveQuickApps(newApps)
    }

    // 添加应用回调
    const handleAddApp = async (app: MenuItem) => {
        if (quickApps.some(a => a.id === app.id)) return

        const newApps = [...quickApps, app]
        setQuickApps(newApps)
        await menuService.saveQuickApps(newApps)
        setIsAddingApp(false)
    }

    // 移除应用回调
    const handleRemoveApp = async (appId: string) => {
        const newApps = quickApps.filter(a => a.id !== appId)
        setQuickApps(newApps)
        await menuService.saveQuickApps(newApps)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                    <p className="text-white text-lg">加载中...</p>
                </div>
            </div>
        )
    }


    const now = new Date()
    const greeting = now.getHours() < 12 ? '早上好' : now.getHours() < 18 ? '下午好' : '晚上好'
    const dateStr = now.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })

    const filteredMenuItems = menuItems.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleThemeChange = (theme: ThemeConfig) => {
        setCurrentTheme(theme)
        setStoredTheme(theme.id)
    }

    return (
        <div className={`min-h-screen bg-gradient-to-br ${currentTheme.gradient} p-8 pt-12 transition-all duration-500 ease-in-out`}>
            <div className="w-[85%] max-w-[1800px] mx-auto">
                {/* 用户欢迎区 - 沉浸式设计 */}
                {userInfo && (
                    <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className={`text-4xl font-bold ${currentTheme.textPrimary} mb-3 tracking-tight flex items-center gap-3`}>
                                    <span>{greeting}，{userInfo.userName}</span>
                                    <span className="animate-pulse">👋</span>
                                </h2>
                                <div className={`flex items-center gap-3 ${currentTheme.textSecondary} text-sm mb-6 font-medium pl-1`}>
                                    <span>今天是 {dateStr}</span>
                                    {weather && (
                                        <>
                                            <span className={`w-1 h-1 rounded-full ${currentTheme.textMuted === 'text-white/40' ? 'bg-white/30' : 'bg-slate-400/30'}`}></span>
                                            <span>乌鲁木齐 {weather}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            {/* 🔧 右上角操作按钮 */}
                            <div className="flex items-center gap-4 mt-0 mr-8">
                                <button
                                    onClick={() => {
                                        chrome.storage.local.set({ PLUGIN_DISABLED: true }, () => {
                                            window.location.href = 'https://ehall.xju.edu.cn/new/index.html'
                                        })
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'rgba(148, 163, 184, 0.7)',
                                        fontSize: '20px',
                                        cursor: 'pointer',
                                        padding: 0
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(148, 163, 184, 1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(148, 163, 184, 0.7)'}
                                >
                                    返回官方
                                </button>
                                <span style={{ color: 'rgba(148, 163, 184, 0.4)' }}>·</span>
                                <button
                                    onClick={() => {
                                        chrome.storage.local.clear(() => {
                                            window.location.href = 'https://ehall.xju.edu.cn/logout'
                                        })
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'rgba(148, 163, 184, 0.7)',
                                        fontSize: '20px',
                                        cursor: 'pointer',
                                        padding: 0
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#f87171'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(148, 163, 184, 0.7)'}
                                >
                                    退出
                                </button>
                                <span style={{ color: 'rgba(148, 163, 184, 0.4)' }}>·</span>
                                {/* 主题选择器 */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowThemePicker(!showThemePicker)}
                                        className={`flex items-center gap-1.5 ${currentTheme.textSecondary} hover:${currentTheme.textPrimary} transition-colors`}
                                        style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: 0 }}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${currentTheme.buttonGradient}`} />
                                        <span>主题</span>
                                    </button>
                                    {showThemePicker && (
                                        <div className="absolute top-full right-0 mt-2 p-4 bg-slate-800/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-xl z-50 min-w-[200px]">
                                            <div className="text-xs text-white/40 mb-2 font-medium">色彩风格</div>
                                            <div className="flex gap-2 mb-4">
                                                {themes.map(theme => (
                                                    <button
                                                        key={theme.id}
                                                        onClick={() => handleThemeChange(theme)}
                                                        className={`w-6 h-6 rounded-full bg-gradient-to-br ${theme.buttonGradient} transition-transform hover:scale-110 ${currentTheme.id === theme.id ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800' : ''}`}
                                                        title={theme.name}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 核心 Widget 区域 (排名 + 快速访问) */}
                <DashboardWidgets
                    userInfo={userInfo}
                    quickApps={quickApps}
                    rankData={rankData}
                    dailyCourses={dailyCourses}
                    exams={exams}
                    onAppClick={handleMenuClick}
                    onQuickAppsChange={handleQuickAppsChange}
                    onAddQuickApp={() => setIsAddingApp(true)}
                    theme={currentTheme}
                />

                {/* 生活服务可视化区域 */}
                <LifeServiceRow
                    cardData={cardData}
                    libraryData={libraryData}
                    loading={statsLoading}
                    theme={currentTheme}
                />

                {/* 所有应用区域 */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3 pl-4">
                            <h2 className={`text-2xl font-bold ${currentTheme.textPrimary}`}>所有应用 ({filteredMenuItems.length})</h2>
                        </div>
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="搜索应用..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`${currentTheme.searchBg} border ${currentTheme.borderColor} rounded-full px-4 py-2 pl-10 ${currentTheme.textPrimary} text-sm focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all w-48 focus:w-64 placeholder-transparent`}
                                style={{
                                    '--tw-placeholder-opacity': 0.4,
                                    color: ['white', 'pink'].includes(currentTheme.id) ? '#1e293b' : 'white'
                                } as any}
                            />
                            <svg className={`w-4 h-4 ${currentTheme.textMuted} absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:${currentTheme.textSecondary} transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                        {filteredMenuItems
                            .map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleMenuClick(item)}
                                    className={`flex flex-col items-center gap-3 p-4 rounded-xl ${currentTheme.cardBg} hover:opacity-90 transition-all group border ${currentTheme.borderColor} hover:border-white/20`}
                                    title={item.title}
                                >
                                    <div className={`w-12 h-12 rounded-full overflow-hidden ${currentTheme.id === 'white' ? 'bg-slate-200' : 'bg-slate-700/50'} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                                        {item.icon ? (
                                            <img src={item.icon} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-2xl">🔗</span>
                                        )}
                                    </div>
                                    <span className={`text-sm ${currentTheme.textSecondary} text-center multiline-clamp-2 h-10 flex items-center justify-center leading-tight`}>
                                        {item.title}
                                    </span>
                                </button>
                            ))}
                    </div>
                </div>

                {/* 页脚 */}
                {/* 页脚 */}
                <div className={`mt-12 text-center ${currentTheme.textMuted}`}>
                    Made with ❤️ by{' '}
                    <a
                        href="https://github.com/soundstarrain/Better-XJU"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${currentTheme.textSecondary} hover:${currentTheme.textPrimary} transition-colors`}
                    >
                        Better-XJU
                    </a>
                </div>
            </div>

            {/* 管理应用弹窗 Modal */}
            {isAddingApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl border border-white/10 overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-800/50 backdrop-blur-md">
                            <div>
                                <h3 className="text-xl font-bold text-white">自定义快速访问</h3>
                                <p className="text-white/40 text-sm mt-1">管理首页卡片，拖动排序功能请在首页直接操作</p>
                            </div>
                            <button
                                onClick={() => setIsAddingApp(false)}
                                className="p-2 rounded-full bg-transparent hover:bg-white/10 text-white/50 hover:text-white transition-colors border-none outline-none"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent bg-slate-900/50 space-y-8">

                            {/* Part 1: 已添加 (Enabled) */}
                            <div>
                                <h4 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    已启用 ({quickApps.length}/12)
                                </h4>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                    {quickApps.map(app => (
                                        <div key={app.id} className="relative group">
                                            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/10 border border-green-500/30">
                                                <div className="w-12 h-12 rounded-full overflow-hidden bg-white/5 flex items-center justify-center">
                                                    {app.icon ? (
                                                        <img src={app.icon} alt={app.title} className="w-full h-full object-cover grayscale-0" />
                                                    ) : (
                                                        <span className="text-xl">🔗</span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-center text-white line-clamp-1 w-full">
                                                    {app.title}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveApp(app.id)}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center shadow-lg hover:bg-red-600 hover:scale-110 transition-all border-2 border-slate-800"
                                                title="移除"
                                            >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                    {quickApps.length === 0 && (
                                        <div className="col-span-full py-6 text-center text-white/20 text-sm border border-dashed border-white/10 rounded-xl bg-white/5">
                                            暂无已启用的应用
                                        </div>
                                    )}
                                </div>
                            </div>

                            <hr className="border-white/5" />

                            {/* Part 2: 未添加 (Available) */}
                            <div>
                                <h4 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-white/20"></div>
                                    更多应用
                                </h4>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                    {allApps
                                        .filter(app => !quickApps.some(q => q.id === app.id))
                                        .map(app => (
                                            <button
                                                key={app.id}
                                                onClick={() => handleAddApp(app)}
                                                disabled={quickApps.length >= 12}
                                                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group border border-white/5 relative disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-1"
                                            >
                                                <div className="w-12 h-12 rounded-full overflow-hidden bg-white/5 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                                                    {app.icon ? (
                                                        <img src={app.icon} alt={app.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-xl">🔗</span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-center text-white/60 group-hover:text-white line-clamp-1 w-full">
                                                    {app.title}
                                                </span>

                                                {/* 角标添加按钮 */}
                                                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md scale-0 group-hover:scale-100">
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                </div>
                                            </button>
                                        ))}
                                </div>
                                {allApps.filter(app => !quickApps.some(q => q.id === app.id)).length === 0 && (
                                    <div className="text-center text-white/30 py-8">
                                        全部应用已添加完成 ✨
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}
