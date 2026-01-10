/**
 * 日期工具函数
 */

/**
 * 动态计算当前的学年和学期
 * 遵循“8月/2月分界法则”
 * @returns { xn: string, xq: string }
 * 例如：2026年1月10日 -> { xn: "2025", xq: "0" }
 */
export function getCurrentAcademicContext(date?: Date) {
    const now = date || new Date();
    const year = now.getFullYear(); // 例如 2026
    const month = now.getMonth() + 1; // 1-12

    let xn = year;
    let xq = '0'; // 默认 0 (第一学期)

    // 逻辑分界线：
    // 第一学期：8月1日 - 次年1月31日 (大致范围) -> xn = year, xq = 0 (1月为 year-1, xq=0)
    // 第二学期：2月1日 - 7月31日 -> xn = year-1, xq = 1

    if (month >= 8) {
        // [8, 9, 10, 11, 12]月
        // 刚开学，属于当前年份的第一学期
        xn = year;
        xq = '0';
    } else if (month < 2) {
        // [1]月
        // 还是寒假前，属于去年的第一学期
        xn = year - 1;
        xq = '0';
    } else {
        // [2, 3, 4, 5, 6, 7]月
        // 春季开学了，属于去年的第二学期
        xn = year - 1;
        xq = '1';
    }

    return {
        xn: String(xn),
        xq: xq
    };
}
