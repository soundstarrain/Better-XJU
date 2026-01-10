import { useState, useEffect } from 'react'
import { authService, AuthStatus } from '../services/AuthService'

/**
 * 认证守卫 Hook
 * 检测用户登录状态
 */
export function useAuth() {
    const [authStatus, setAuthStatus] = useState<AuthStatus>({
        isAuthenticated: false,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        setLoading(true)
        try {
            const status = await authService.checkAuthStatus()
            setAuthStatus(status)
        } catch (error) {
            console.error('认证检查失败:', error)
            setAuthStatus({
                isAuthenticated: false,
                error: '无法检测登录状态',
            })
        } finally {
            setLoading(false)
        }
    }

    return {
        ...authStatus,
        loading,
        refresh: checkAuth,
    }
}
