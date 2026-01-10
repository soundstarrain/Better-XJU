import React from 'react';
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, Tooltip, ResponsiveContainer,
    Cell
} from 'recharts';
import { CreditCard, BookOpen, AlertCircle, DoorOpen } from 'lucide-react';

import { ThemeConfig } from '../../utils/themes';

interface ChartData {
    name: string;
    value: number;
}

interface LifeServiceRowProps {
    cardData: { total: number; count: number; chartData: ChartData[] } | null;
    libraryData: { borrowTotal: number; entryCount: number; chartData: ChartData[] } | null;
    loading: boolean;
    theme: ThemeConfig;
}

const CustomTooltip = ({ active, payload, label, unit, theme }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className={`backdrop-blur-md border ${theme.borderColor} p-3 rounded-xl shadow-2xl ${theme.cardBg} ${theme.textPrimary}`}>
                <p className={`text-[10px] ${theme.textMuted} mb-1 uppercase tracking-wider font-bold`}>{label}</p>
                <p className={`text-sm font-mono ${theme.textPrimary}`}>
                    {unit === '元' ? '¥' : ''}{payload[0].value} <span className={`text-[10px] ${theme.textSecondary}`}>{unit}</span>
                </p>
            </div>
        );
    }
    return null;
};

export const LifeServiceRow: React.FC<LifeServiceRowProps> = ({ cardData, libraryData, loading, theme }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {[1, 2].map((i) => (
                    <div key={i} className={`${theme.cardBg} backdrop-blur-xl border ${theme.borderColor} rounded-3xl p-6 h-64 animate-pulse`}>
                        <div className={`h-6 w-32 ${theme.searchBg} rounded mb-4`}></div>
                        <div className={`h-10 w-24 ${theme.searchBg} rounded mb-8`}></div>
                        <div className={`h-24 w-full ${theme.searchBg} rounded-2xl`}></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* 💳 校园卡消费 */}
            <div className={`${theme.cardBg} backdrop-blur-xl border ${theme.borderColor} rounded-3xl p-6 h-64 flex flex-col group hover:opacity-95 transition-all duration-500 hover:border-orange-500/20`}>
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-orange-500/20 text-orange-400 group-hover:scale-110 transition-transform duration-500">
                            <CreditCard className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className={`text-base font-medium ${theme.textSecondary}`}>近7天消费</h3>
                            <div className="flex items-baseline gap-1.5 mt-1">
                                <span className="text-sm text-orange-400 font-bold">¥</span>
                                <span className={`text-4xl font-bold font-mono ${theme.textPrimary} tracking-tighter`}>
                                    {cardData?.total?.toFixed(2) || '0.00'}
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Count Badge - Unified Position */}
                    <div className={`flex items-center gap-2 ${theme.textSecondary} text-sm ${theme.searchBg} px-3 py-1.5 rounded-full`}>
                        <span>{cardData?.count || 0} 次消费</span>
                    </div>
                </div>

                <div className="flex-1 w-full mt-3 min-h-0 relative">
                    {!cardData || cardData.chartData.length === 0 ? (
                        <div className={`absolute inset-0 flex flex-col items-center justify-center ${theme.textMuted} gap-3`}>
                            <AlertCircle className="w-12 h-12 opacity-20" />
                            <span className="text-sm font-medium tracking-widest uppercase">暂无消费数据</span>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={cardData.chartData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={theme.hex || '#f97316'} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={theme.hex || '#f97316'} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" hide />
                                <YAxis hide domain={['auto', 'auto']} />
                                <Tooltip content={<CustomTooltip unit="元" theme={theme} />} />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={theme.hex || '#f97316'}
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* 📚 图书馆 */}
            <div className={`${theme.cardBg} backdrop-blur-xl border ${theme.borderColor} rounded-3xl p-6 h-64 flex flex-col group hover:opacity-95 transition-all duration-500 hover:border-cyan-500/20`}>
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform duration-500">
                            <BookOpen className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className={`text-base font-medium ${theme.textSecondary}`}>近一年借阅</h3>
                            <div className="flex items-baseline gap-1.5 mt-1">
                                <span className={`text-4xl font-bold font-mono ${theme.textPrimary} tracking-tighter`}>
                                    {libraryData?.borrowTotal || 0}
                                </span>
                                <span className="text-sm text-cyan-400 font-bold">本</span>
                            </div>
                        </div>
                    </div>
                    {/* Entry Count Badge - Unified Position */}
                    <div className={`flex items-center gap-2 ${theme.textSecondary} text-sm ${theme.searchBg} px-3 py-1.5 rounded-full`}>
                        <DoorOpen className="w-4 h-4" />
                        <span>{libraryData?.entryCount || 0} 次入馆</span>
                    </div>
                </div>

                <div className="flex-1 w-full mt-3 min-h-0 relative">
                    {/* 检查是否真正没有借阅数据 (空数组或所有值为0) */}
                    {!libraryData || libraryData.chartData.length === 0 || libraryData.chartData.every(d => d.value === 0) ? (
                        <div className={`absolute inset-0 flex flex-col items-center justify-center ${theme.textMuted} gap-3`}>
                            <AlertCircle className="w-12 h-12 opacity-20" />
                            <span className="text-sm font-medium tracking-widest uppercase">暂无借阅记录</span>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={libraryData.chartData}>
                                <XAxis dataKey="name" hide />
                                <YAxis hide />
                                <Tooltip content={<CustomTooltip unit="本" theme={theme} />} />
                                <Bar
                                    dataKey="value"
                                    fill={theme.hex || '#06b6d4'}
                                    radius={[6, 6, 0, 0]}
                                    animationDuration={1500}
                                >
                                    {libraryData.chartData.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={theme.hex || (index === libraryData.chartData.length - 1 ? '#22d3ee' : '#0891b2')}
                                            className="hover:opacity-80 transition-opacity duration-300"
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
};
