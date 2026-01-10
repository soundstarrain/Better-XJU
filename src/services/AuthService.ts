/**
 * 认证服务
 */

export interface AuthStatus {
    isAuthenticated: boolean
    username?: string
    error?: string
}

export class AuthService {
    async checkAuthStatus(): Promise<AuthStatus> {
        try {
            const cookies = document.cookie
            const hasCookie = cookies.includes('JSESSIONID') ||
                cookies.includes('MOD_AUTH_CAS') ||
                cookies.includes('iPlanetDirectoryPro')

            if (hasCookie) {
                return {
                    isAuthenticated: true,
                    username: '用户',
                }
            }

            const currentUrl = window.location.href
            const isLoginPage = currentUrl.includes('/login') ||
                currentUrl.includes('/authserver/')

            if (isLoginPage) {
                return {
                    isAuthenticated: false,
                    error: '请先登录',
                }
            }

            const hasLoginForm = document.querySelector('input[type="password"]') !== null

            if (hasLoginForm) {
                return {
                    isAuthenticated: false,
                    error: '请完成登录',
                }
            }

            return {
                isAuthenticated: true,
                username: '用户',
            }
        } catch (error) {
            return {
                isAuthenticated: true,
                username: '用户',
            }
        }
    }

    getLoginUrl(): string {
        // User requested hardcoded redirect URL
        const fixedUrl = 'https://authserver.xju.edu.cn/authserver/login?service=https%3A%2F%2Fehall.xju.edu.cn%3A443%2Flogin%3Fservice%3Dhttps%3A%2F%2Fehall.xju.edu.cn%2Fnew%2Findex.html'
        return `${fixedUrl}&bypass=true`
    }
}

export const authService = new AuthService()
