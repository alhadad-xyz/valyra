"use client";

import { useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '@/utils/format';

interface RevenueChartProps {
    data: any[];
}

export function RevenueChart({ data }: RevenueChartProps) {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];
        return data.map((item: any) => ({
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            revenue: Number(item.revenue),
            expenses: Number(item.expenses || 0),
            profit: Number(item.revenue) - Number(item.expenses || 0)
        }));
    }, [data]);

    if (!chartData.length) {
        return (
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed border-gray-200 dark:border-gray-800">
                <p className="text-gray-400 text-sm">No revenue data available</p>
            </div>
        );
    }

    return (
        <div className="h-72 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={chartData}
                    margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0052FF" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#0052FF" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            borderRadius: '12px',
                            border: '1px solid #e6e6db',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        itemStyle={{ fontSize: '12px' }}
                        formatter={(value: any) => [formatCurrency(value), '']}
                    />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#0052FF"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        name="Revenue"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
