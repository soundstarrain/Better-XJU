/**
 * 主题配色配置
 */


export interface ThemeConfig {
    id: string
    name: string
    gradient: string
    accent: string
    cardBg: string
    buttonGradient: string
    shadowColor: string
    // 用于 UI 元素的动态颜色
    tabActive: string
    badgeBg: string
    textAccent: string
    // 动态文本与边框颜色 (支持浅色模式)
    textPrimary: string    // 主要文字 (标题)
    textSecondary: string  // 次要文字 (正文)
    textMuted: string      // 弱化文字 (辅助信息)
    borderColor: string;
    searchBg: string; // Search bar background
    hex: string;
}

export const themes: ThemeConfig[] = [
    {
        id: 'blue',
        name: '深海蓝',
        gradient: 'from-slate-900 via-blue-900 to-slate-900',
        accent: 'blue',
        cardBg: 'bg-white/5',
        buttonGradient: 'from-blue-500 to-blue-600',
        shadowColor: 'shadow-blue-500/20',
        tabActive: 'bg-blue-500/20 text-blue-300',
        badgeBg: 'bg-blue-500/20 text-blue-300',
        textAccent: 'text-blue-400',
        textPrimary: 'text-white',
        textSecondary: 'text-white/70',
        textMuted: 'text-white/40',
        borderColor: 'border-blue-500/30',
        searchBg: 'bg-white/10',
        hex: '#3b82f6'
    },
    {
        id: 'purple',
        name: '梦幻紫',
        gradient: 'from-purple-900 via-violet-900 to-purple-900',
        accent: 'purple',
        cardBg: 'bg-white/5',
        buttonGradient: 'from-purple-500 to-violet-600',
        shadowColor: 'shadow-purple-500/20',
        tabActive: 'bg-purple-500/20 text-purple-300',
        badgeBg: 'bg-purple-500/20 text-purple-300',
        textAccent: 'text-purple-400',
        textPrimary: 'text-white',
        textSecondary: 'text-white/70',
        textMuted: 'text-white/40',
        borderColor: 'border-purple-500/30',
        searchBg: 'bg-white/10',
        hex: '#a855f7'
    },
    {
        id: 'pink',
        name: '樱花粉',
        gradient: 'from-[#FFECF0] via-[#FFF0F4] to-[#FFECF0]',
        accent: 'pink',
        cardBg: 'bg-white/60',
        buttonGradient: 'from-pink-300 to-rose-300',
        shadowColor: 'shadow-pink-300/20',
        tabActive: 'bg-pink-100 text-pink-600',
        badgeBg: 'bg-pink-50 text-pink-600',
        textAccent: 'text-pink-600',
        textPrimary: 'text-slate-800',
        textSecondary: 'text-slate-600',
        textMuted: 'text-slate-400',
        borderColor: 'border-pink-200/50',
        searchBg: 'bg-white/40',
        hex: '#ec4899'
    },
    {
        id: 'green',
        name: '薄荷绿',
        gradient: 'from-emerald-900 via-teal-900 to-emerald-900',
        accent: 'emerald',
        cardBg: 'bg-white/5',
        buttonGradient: 'from-emerald-500 to-teal-500',
        shadowColor: 'shadow-emerald-500/20',
        tabActive: 'bg-emerald-500/20 text-emerald-300',
        badgeBg: 'bg-emerald-500/20 text-emerald-300',
        textAccent: 'text-emerald-400',
        textPrimary: 'text-white',
        textSecondary: 'text-white/70',
        textMuted: 'text-white/40',
        borderColor: 'border-emerald-500/30',
        searchBg: 'bg-white/10',
        hex: '#10b981'
    },
    {
        id: 'gray',
        name: '极简灰',
        gradient: 'from-gray-900 via-slate-800 to-gray-900',
        accent: 'gray',
        cardBg: 'bg-white/5',
        buttonGradient: 'from-gray-500 to-slate-600',
        shadowColor: 'shadow-gray-500/20',
        tabActive: 'bg-gray-500/20 text-gray-300',
        badgeBg: 'bg-gray-500/20 text-gray-300',
        textAccent: 'text-gray-400',
        textPrimary: 'text-white',
        textSecondary: 'text-white/70',
        textMuted: 'text-white/40',
        borderColor: 'border-gray-500/30',
        searchBg: 'bg-white/10',
        hex: '#6b7280'
    },
    {
        id: 'orange',
        name: '暖阳橙',
        gradient: 'from-[#fff3e0] via-[#ffe0b2] to-[#fff3e0]',
        accent: 'orange',
        cardBg: 'bg-white/30',
        buttonGradient: 'from-orange-400 to-amber-400',
        shadowColor: 'shadow-orange-400/20',
        tabActive: 'bg-orange-100 text-orange-700',
        badgeBg: 'bg-orange-100 text-orange-800',
        textAccent: 'text-orange-700',
        textPrimary: 'text-slate-800',
        textSecondary: 'text-slate-700',
        textMuted: 'text-slate-500',
        borderColor: 'border-orange-200/50',
        searchBg: 'bg-white/40',
        hex: '#f97316'
    },
    {
        id: 'white',
        name: '茶白',
        gradient: 'from-[#f8fcf8] via-[#ffffff] to-[#f8fcf8]',
        accent: 'slate',
        cardBg: 'bg-white',
        buttonGradient: 'from-slate-100 to-white',
        shadowColor: 'shadow-slate-200/50',
        tabActive: 'bg-slate-100 text-slate-900',
        badgeBg: 'bg-slate-50 text-slate-600',
        textAccent: 'text-slate-700',
        textPrimary: 'text-slate-900',
        textSecondary: 'text-slate-600',
        textMuted: 'text-slate-400',
        borderColor: 'border-slate-100',
        searchBg: 'bg-slate-50',
        hex: '#64748b'
    }
]


const THEME_STORAGE_KEY = 'better-xju-theme'

export function getStoredTheme(): string {
    return localStorage.getItem(THEME_STORAGE_KEY) || 'blue'
}

export function setStoredTheme(themeId: string): void {
    localStorage.setItem(THEME_STORAGE_KEY, themeId)
}


export function getThemeById(id: string): ThemeConfig {
    return themes.find(t => t.id === id) || themes[0]
}
