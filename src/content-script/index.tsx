import { createRoot } from 'react-dom/client'
import App from '../App'
import styles from '../index.css?inline'
import { appCacheService } from '../services/AppCacheService'
import { userInfoService } from '../services/UserInfoService'

/**
 * Better-XJU Content Script v1.0.0
 */

// 启动用户信息监听器
userInfoService.initListener()

// 注入 Favicon (XJU Blue Logo)
const injectFavicon = () => {
    try {
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link')
        // @ts-ignore
        link.type = 'image/png'
        // @ts-ignore
        link.rel = 'shortcut icon'
        // @ts-ignore
        link.href = chrome.runtime.getURL('icon-48.png')
        document.head.appendChild(link)
    } catch (e) {
        // Ignore
    }
}
if (window.location.hostname.includes('xju.edu.cn')) {
    injectFavicon()
}

// 防御性样式注入
if (
    (window.location.hostname === 'ehall.xju.edu.cn' || window.location.hostname.includes('ehall.')) &&
    window.location.pathname.includes('/new/index.html')
) {
    try {
        const defensiveStyle = document.createElement('style')
        defensiveStyle.id = 'better-xju-defensive-lock'
        defensiveStyle.textContent = `
            html, body {
                zoom: 1 !important;
                transform: none !important;
                -webkit-text-size-adjust: 100% !important;
                min-width: 100vw !important;
                max-width: 100vw !important;
                overflow: hidden !important;
                background-color: #0f172a !important;
            }
        `
        if (document.head) {
            document.head.appendChild(defensiveStyle)
        } else {
            document.documentElement.appendChild(defensiveStyle)
        }

        const styleObserver = new MutationObserver(() => {
            const docEl = document.documentElement
            if (docEl.style.zoom && docEl.style.zoom !== '1') {
                docEl.style.setProperty('zoom', '1', 'important')
            }
            if (document.body && document.body.style.zoom && document.body.style.zoom !== '1') {
                document.body.style.setProperty('zoom', '1', 'important')
            }
        })
        styleObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] })
    } catch (e) {
        // Ignore style injection errors
    }
}

// 紧急禁用开关
const KILL_SWITCH_KEY = 'better-xju-disabled'

function isKillSwitchEnabled(): boolean {
    return sessionStorage.getItem(KILL_SWITCH_KEY) === 'true'
}

// 域名过滤与拦截策略
async function shouldInject(): Promise<boolean> {
    const hostname = window.location.hostname
    const pathname = window.location.pathname
    const search = window.location.search

    // 0. 检查 Bypass 参数 (防止无限重定向)
    if (search.includes('bypass=true')) {
        return false
    }

    // 1. 检查是否临时禁用插件 (退出登录时使用)
    try {
        const storage = await chrome.storage.local.get('PLUGIN_DISABLED')
        if (storage.PLUGIN_DISABLED === true) {
            chrome.storage.local.remove('PLUGIN_DISABLED')
            return false
        }
    } catch (e) {
        // Storage access error, ignore
    }

    // 1.5 拦截个人信息页 -> 重定向到办事大厅
    if (hostname === 'authserver.xju.edu.cn' && pathname.startsWith('/personalInfo/')) {
        window.location.replace('https://ehall.xju.edu.cn/new/index.html')
        return false
    }


    // 3. 登录页拦截 (LoginGuard)
    const isEhallHome = (hostname === 'ehall.xju.edu.cn' || hostname.includes('ehall.')) && pathname.includes('/new/index.html')
    const isAuthServer = hostname === 'authserver.xju.edu.cn' && pathname.startsWith('/authserver/')

    if (isEhallHome || isAuthServer) {
        // 返回 true 以便 main() 函数注入 React 应用 (LoginGuard/Dashboard)
        // 不要重定向到 index.html，因为这是一个 Content Script 注入型应用
        return true
    }

    // 4. 其他页面 -> 不注入
    return false
}


/**
 * 在非大厅页面注入悬浮返回按钮
 */
function injectFloatingButton() {
    // 创建悬浮按钮容器
    const buttonContainer = document.createElement('div')
    buttonContainer.id = 'better-xju-floating-button'

    // 创建按钮
    const button = document.createElement('button')
    button.innerHTML = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
        </svg>
    `
    button.title = '返回 Better-XJU 主页'
    button.onclick = () => {
        window.location.href = 'https://ehall.xju.edu.cn/new/index.html'
    }

    // 设置样式（使用 setAttribute 确保最高优先级）
    button.setAttribute('style', `
        position: fixed !important;
        bottom: 24px !important;
        right: 24px !important;
        z-index: 2147483647 !important;
        width: 56px !important;
        height: 56px !important;
        border-radius: 50% !important;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        color: white !important;
        border: none !important;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4) !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        transition: all 0.3s ease !important;
        padding: 0 !important;
    `)

    // 悬停效果
    button.onmouseenter = () => {
        button.style.transform = 'scale(1.1)'
        button.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)'
    }
    button.onmouseleave = () => {
        button.style.transform = 'scale(1)'
        button.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)'
    }

    buttonContainer.appendChild(button)
    document.body.appendChild(buttonContainer)
}

// Token 获取器
function runTokenHarvester() {
    if (window.location.hostname !== 'ot.xju.edu.cn') return

    window.addEventListener("message", (event) => {
        if (event.source !== window) return

        if (event.data.type && event.data.type === "BETTER_XJU_TOKEN") {
            const rawData = event.data.data
            try {
                const data = JSON.parse(rawData)
                const token = data.token
                if (token) {
                    chrome.storage.local.set({
                        'OT_TOKEN': token,
                        'OT_TOKEN_TIME': Date.now()
                    }, () => {
                        chrome.runtime.sendMessage({ type: 'TOKEN_HARVESTED_SUCCESS' })

                        if (window.location.search.includes('silent_harvest=true')) {
                            setTimeout(() => window.close(), 500)
                        }
                    })
                }
            } catch (e) {
                // Parse error
            }
        }
    })

    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('injected.js');
    script.onload = function () {
        script.remove();
    };
    (document.head || document.documentElement).appendChild(script);
}

runTokenHarvester()

// 主执行逻辑
async function main() {
    const hostname = window.location.hostname

    if (isKillSwitchEnabled()) {
        return
    }

    const shouldTakeOver = await shouldInject()

    if (!shouldTakeOver) {
        const isXJUDomain = hostname.endsWith('.xju.edu.cn') || hostname === 'xju.edu.cn'
        const isAuthPage = hostname.includes('authserver') || hostname.includes('auth.')

        if (isXJUDomain && !isAuthPage) {
            injectFloatingButton()
        }
        return
    }

    // 注入样式隐藏原页面
    const style = document.createElement('style')
    style.textContent = `
      body > *:not(#better-xju-root) {
        display: none !important;
      }
      html, body {
        background-color: #0f172a !important;
        overflow: hidden !important;
        margin: 0 !important;
        padding: 0 !important;
        height: 100vh !important;
        width: 100vw !important;
        /* 防御性样式：防止原页面修改缩放 */
        zoom: 1 !important;
        transform: none !important;
        -webkit-text-size-adjust: 100% !important;
        min-width: 100vw !important;
        max-width: 100vw !important;
      }
      #better-xju-root {
        display: block !important;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2147483647;
      }
    `
    // 尽早插入样式
    if (document.head) {
        document.head.appendChild(style)
    } else {
        document.documentElement.appendChild(style)
    }

    // 等待 DOM 加载以便获取数据和挂载应用
    await new Promise<void>((resolve) => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => resolve(), { once: true })
        } else {
            resolve()
        }
    })

    // 样式锁定
    const enforceStyles = () => {
        const docEl = document.documentElement
        const targetContent = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'

        if (docEl.style.zoom && docEl.style.zoom !== '1') docEl.style.setProperty('zoom', '1', 'important')

        if (document.body) {
            if (document.body.style.zoom && document.body.style.zoom !== '1') document.body.style.setProperty('zoom', '1', 'important')
        }

        const meta = document.querySelector('meta[name="viewport"]')
        if (meta && meta.getAttribute('content') !== targetContent) {
            meta.setAttribute('content', targetContent)
        } else if (!meta && document.head) {
            const newMeta = document.createElement('meta')
            newMeta.name = 'viewport'
            newMeta.content = targetContent
            document.head.appendChild(newMeta)
        }
    }

    enforceStyles()

    const observer = new MutationObserver(() => enforceStyles())
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] })
    if (document.body) observer.observe(document.body, { attributes: true, attributeFilter: ['style'] })
    if (document.head) observer.observe(document.head, { childList: true, subtree: true }) // 监听 meta 标签变化

    // 调用官方 API 获取应用列表并缓存 (逻辑保持不变)
    try {
        const apiUrl = `https://ehall.xju.edu.cn/jsonp/getUserCategoryAppList.json?_=${Date.now()}`
        const response = await fetch(apiUrl, { credentials: 'include' })

        if (response.ok) {
            const data = await response.json()
            if (data.pcAppCategory && Array.isArray(data.pcAppCategory)) {
                const allApps: any[] = []
                const allCategory = data.pcAppCategory.find((c: any) => c.categoryId === 'all')

                if (allCategory && allCategory.appList && Array.isArray(allCategory.appList)) {
                    allCategory.appList.forEach((app: any) => {
                        const url = `https://ehall.xju.edu.cn/appShow?appId=${app.appId}`
                        allApps.push({
                            appId: app.appId,
                            title: app.appName,
                            url,
                            img: app.middleIcon,
                            category: app.categoryName || '',
                        })
                    })
                }

                if (allApps.length > 0) {
                    await appCacheService.saveApps(allApps)
                }
            }
        }
    } catch (error) {
        // API call failed, will use default menu
    }

    // 注入 React 应用
    const rootContainer = document.createElement('div')
    rootContainer.id = 'better-xju-root'

    const shadowRoot = rootContainer.attachShadow({ mode: 'open' })
    const styleEl = document.createElement('style')
    styleEl.textContent = styles
    shadowRoot.appendChild(styleEl)

    const appContainer = document.createElement('div')
    appContainer.id = 'app'
    appContainer.style.cssText = `
        width: 100%;
        height: 100%;
        overflow: auto;
        background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
    `
    shadowRoot.appendChild(appContainer)

    if (document.body) {
        document.body.prepend(rootContainer)
    } else {
        document.documentElement.appendChild(rootContainer)
    }

    const root = createRoot(appContainer)
    root.render(<App />)

    // 静默预热
    setTimeout(() => {
        chrome.storage.local.get(['OT_TOKEN', 'OT_TOKEN_TIME'], (result) => {
            const now = Date.now()
            const tokenTime = result.OT_TOKEN_TIME || 0
            const isExpired = (now - tokenTime) > 3600 * 1000 // 1小时过期

            if (!result.OT_TOKEN || isExpired) {
                chrome.runtime.sendMessage({
                    type: 'OPEN_SILENT_TAB',
                    url: 'https://ot.xju.edu.cn/?silent_harvest=true'
                })
            }
        })
    }, 2000)
}

// 立即执行
main().catch((error) => {
    console.error('[Better-XJU] 主流程失败:', error)
})
