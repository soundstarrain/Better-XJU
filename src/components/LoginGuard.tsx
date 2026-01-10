import { authService } from '../services/AuthService'

export default function LoginGuard() {
    const handleGoToLogin = () => {
        window.location.href = authService.getLoginUrl()
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            <div className="max-w-md w-full m-4">
                {/* 主卡片 */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                            <span className="text-white font-bold text-3xl">XJU</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Better-XJU</h1>
                        <p className="text-white/60">现代化的新疆大学学生后台体验</p>
                    </div>

                    {/* 提示信息 */}
                    <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-4 mb-6">
                        <div className="flex items-start">
                            <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h3 className="text-sm font-medium text-blue-300 mb-1">需要登录</h3>
                                <p className="text-sm text-white/60">
                                    请先通过新疆大学统一认证平台登录，然后返回此页面。
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 操作按钮 */}
                    <button
                        onClick={handleGoToLogin}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:-translate-y-0.5"
                    >
                        前往登录
                    </button>

                    {/* 说明文字 */}
                    <div className="mt-6 text-center text-xs text-white/40 space-y-1">
                        <p>Better-XJU 依赖浏览器 Cookie 进行认证</p>
                        <p>我们不会收集或存储您的登录信息</p>
                    </div>
                </div>

                {/* 页脚 */}
                <div className="mt-10 text-center">
                    <p className="text-xs text-white/30">
                        Made with ❤️ by{' '}
                        <a
                            href="https://github.com/soundstarrain/Better-XJU"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/50 hover:text-white/70 transition-colors"
                        >
                            Better-XJU
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}
