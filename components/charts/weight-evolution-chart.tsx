"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { useChartColors } from "@/components/providers/dynamic-theme-provider";
import { ChartCard } from "@/components/charts/chart-card";

const weightData: any[] = [];

export function WeightEvolutionChart() {
    const colors = useChartColors();

    return (
        <ChartCard
            title="Évolution du poids"
            description="Suivi sur les 30 derniers jours"
            className="h-full"
        >
            <div className="h-[300px] min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                    <LineChart
                        data={weightData}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={colors.grid}
                            vertical={false}
                        />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: colors.text, fontSize: 12 }}
                            tickLine={{ stroke: colors.grid }}
                            axisLine={{ stroke: colors.grid }}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            domain={["dataMin - 1", "dataMax + 1"]}
                            tick={{ fill: colors.text, fontSize: 12 }}
                            tickLine={{ stroke: colors.grid }}
                            axisLine={{ stroke: colors.grid }}
                            tickFormatter={(value) => `${value} kg`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: colors.background,
                                border: `1px solid ${colors.grid}`,
                                borderRadius: "8px",
                                color: colors.text,
                            }}
                            formatter={(value) => [`${value} kg`, "Poids"]}
                            labelStyle={{ color: colors.text }}
                        />
                        <Legend
                            wrapperStyle={{ color: colors.text }}
                            formatter={(value) =>
                                value === "poids" ? "Poids actuel" : "Objectif"
                            }
                        />
                        <Line
                            type="monotone"
                            dataKey="poids"
                            stroke={colors.primary}
                            strokeWidth={2}
                            dot={{ fill: colors.primary, strokeWidth: 0, r: 3 }}
                            activeDot={{ r: 6, fill: colors.primary }}
                            name="poids"
                        />
                        <Line
                            type="monotone"
                            dataKey="objectif"
                            stroke={colors.secondary}
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            name="objectif"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </ChartCard>
    );
}
