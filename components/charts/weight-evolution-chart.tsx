"use client";

import { useEffect, useState } from "react";
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
import { ChartCard, getChartTooltipStyle } from "@/components/charts/chart-card";
import { apiFetch } from "@/lib/api";

const DEMO_DATA: Record<string, number | string>[] = [
    { date: "01/03", poids: 76.2, objectif: 74 },
    { date: "05/03", poids: 75.8, objectif: 74 },
    { date: "10/03", poids: 75.5, objectif: 74 },
    { date: "15/03", poids: 75.1, objectif: 74 },
    { date: "20/03", poids: 74.9, objectif: 74 },
    { date: "25/03", poids: 74.7, objectif: 74 },
    { date: "30/03", poids: 74.5, objectif: 74 },
];

export function WeightEvolutionChart() {
    const colors = useChartColors();
    const [weightData, setWeightData] = useState<Record<string, number | string>[]>(DEMO_DATA);
    const [isDemo, setIsDemo] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await apiFetch<{ data: Record<string, number | string>[] }>('/api/stats/weight-history?days=30');
                if (res.data && res.data.length > 0) {
                    setWeightData(res.data);
                    setIsDemo(false);
                }
            } catch {
                // keep demo data
            }
        }
        fetchData();
    }, []);

    return (
        <ChartCard
            title="Évolution du poids"
            description={isDemo ? "Donnees de demonstration" : "Suivi sur les 30 derniers jours"}
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
                            {...getChartTooltipStyle(colors)}
                            formatter={(value) => [`${value} kg`, "Poids"]}
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
