(function () {
    console.log("[Better-XJU] 双重搜索中 (Session + Local)...");

    let attempts = 0;
    const maxAttempts = 60; // 30秒超时

    function checkToken() {
        attempts++;
        try {
            // 核心修改：同时检查 SessionStorage 和 LocalStorage
            const sessionData = sessionStorage.getItem('OnetableToken');
            const localData = localStorage.getItem('OnetableToken');

            // 只要有一个有值，就拿来用
            const raw = sessionData || localData;

            if (raw) {
                const source = sessionData ? "SessionStorage" : "LocalStorage";
                console.log("[Better-XJU] 成功捕获 Token，来源: " + source);

                // 发送给 Content Script
                window.postMessage({ type: "BETTER_XJU_TOKEN", data: raw }, "*");
            } else {
                if (attempts < maxAttempts) {
                    // 还没出现，继续蹲守
                    if (attempts % 5 === 0) console.log("⏳ [Better-XJU] 搜索中...");
                    setTimeout(checkToken, 500);
                } else {
                    console.error("❌ [Better-XJU] 超时，两个仓库都是空的。");
                }
            }
        } catch (e) {
            console.error("❌ [Better-XJU] 读取出错:", e);
        }
    }

    // 立即开始
    setTimeout(checkToken, 500);
})();
