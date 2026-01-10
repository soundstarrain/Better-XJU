/**
 * 一张表数据服务
 */

const TEMPLATE_CODE = "1815938902176546816";

// 组件 ID 映射表
const WIDGET_IDS = {
    TOTAL_COURSES: "1746764562834_86369",   // 已修课程总数
    FAILED_COURSES: "1736912356911_96978",  // 上学年不及格
    PASSED_LAST_YEAR: "1736912356663_80606", // 上学年及格
    CARD_CHART: "1724725875927_7840",       // 近7天一卡通消费
    LIBRARY_CHART: "1724727763544_34695",   // 图书借阅趋势
    LIBRARY_ENTRY: "1746764772290_90238"    // 本年度出入图书馆次数
};

/**
 * 通用获取组件数据函数
 */
async function fetchWidgetData(moduleKey: string) {
    const url = `https://ot.xju.edu.cn/prod-api/onetable/b/ottemplate/handleData?templateCode=${TEMPLATE_CODE}&moduleKey=${moduleKey}&_t=${Date.now()}`;

    const response = await chrome.runtime.sendMessage({
        type: 'PROXY_FETCH_JSON',
        payload: { url: url, method: 'GET' }
    });

    if (response?.data?.code === 401 || response?.data?.code === 403) {
        return null;
    }

    if (response && response.ok && response.data?.data) {
        return response.data.data;
    }

    return null;
}

/**
 * 获取学业统计数据 (用于填充个人概览卡片)
 */
export async function fetchAcademicStats() {
    try {
        const [total, failed] = await Promise.all([
            fetchWidgetData(WIDGET_IDS.TOTAL_COURSES),
            fetchWidgetData(WIDGET_IDS.FAILED_COURSES)
        ]);

        return {
            totalCourses: total?.sum || 0,
            failedCourses: failed?.sum || total?.failed_count || 0
        };
    } catch (e) {
        return { totalCourses: 0, failedCourses: 0 };
    }
}

/**
 * 获取一卡通消费数据
 * 返回: { total: 消费金额, count: 消费次数, chartData: [{name, value}] }
 */
export async function fetchCampusCardData() {
    try {
        const data = await fetchWidgetData(WIDGET_IDS.CARD_CHART);
        if (!data) return null;

        const rawList = data.list?.[0] || [];
        const chartData = rawList.map((item: any) => {
            const dateStr = item.consume_date || '';
            const name = dateStr.length > 5 ? dateStr.substring(5) : dateStr;
            return {
                name: name || 'N/A',
                value: parseFloat(item.sum || 0)
            };
        });

        return {
            total: parseFloat(data.sum || 0),
            count: parseInt(data.num || rawList.length || 0),
            chartData
        };
    } catch (e) {
        return null;
    }
}

/**
 * 获取图书馆借阅数据 + 入馆次数
 * 返回: { borrowTotal: 借阅本数, entryCount: 入馆次数, chartData: [{name, value}] }
 */
export async function fetchLibraryData() {
    try {
        const [borrowData, entryData] = await Promise.all([
            fetchWidgetData(WIDGET_IDS.LIBRARY_CHART),
            fetchWidgetData(WIDGET_IDS.LIBRARY_ENTRY)
        ]);

        const rawList = borrowData?.list?.[0] || [];
        const chartData = rawList.map((item: any) => ({
            name: item.month || 'N/A',
            value: parseInt(item.month_sum || 0)
        }));

        return {
            borrowTotal: parseInt(borrowData?.year_sum || 0),
            entryCount: parseInt(entryData?.sum || 0),
            chartData
        };
    } catch (e) {
        return null;
    }
}

export const ehallService = {
    fetchAcademicStats,
    fetchCampusCardData,
    fetchLibraryData
};
