import { HashRouter, Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import LoginGuard from './components/LoginGuard'
import Dashboard from './pages/Dashboard'

/**
 * Better-XJU 主应用
 */
function App() {
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-white mb-4"></div>
                    <p className="text-white text-xl font-medium">正在加载...</p>
                    <p className="text-white/70 text-sm mt-2">Better-XJU 正在初始化</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <LoginGuard />
    }

    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Dashboard />} />
            </Routes>
        </HashRouter>
    )
}

export default App
