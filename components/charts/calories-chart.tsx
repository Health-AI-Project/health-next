"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Cell,
} from "recharts";
import { useChartColors } from "@/components/providers/dynamic-theme-provider";
import { ChartCard, getChartTooltipStyle } from "@/components/charts/chart-card";

const caloriesData: any[] = [];

export function CaloriesChart() {
    const colors = useChartColors();

    return (
        <ChartCard
            title="Calories journalières"
            description="Consommation vs objectif cette semaine"
            className="h-full"
        >
            <div className="h-[300px] min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                    <BarChart
                        data={caloriesData}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={colors.grid}
                            vertical={false}
                        />
                        <XAxis
                            dataKey="jour"
                            tick={{ fill: colors.text, fontSize: 12 }}
                            tickLine={{ stroke: colors.grid }}
                            axisLine={{ stroke: colors.grid }}
                        />
                        <YAxis
                            tick={{ fill: colors.text, fontSize: 12 }}
                            tickLine={{ stroke: colors.grid }}
                            axisLine={{ stroke: colors.grid }}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                            {...getChartTooltipStyle(colors)}
                            formatter={(value) => [`${value} kcal`, "Calories"]}
                        />
                        <ReferenceLine
                            y={2000}
                            stroke={colors.secondary}
                            strokeDasharray="5 5"
                            label={{
                                value: "Objectif: 2000 kcal",
                                position: "insideTopRight",
                                fill: colors.text,
                                fontSize: 11,
                            }}
                        />
                        <Bar dataKey="calories" radius={[4, 4, 0, 0]} maxBarSize={50}>
                            {caloriesData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        entry.calories > entry.objectif
                                            ? colors.tertiary
                                            : colors.primary
                                    }
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </ChartCard>
    );
}
