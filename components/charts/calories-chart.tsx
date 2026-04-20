"use client";

import { useEffect, useState } from "react";
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
import { apiFetch } from "@/lib/api";

const DEMO_DATA: Record<string, number | string>[] = [
    { jour: "Lun", calories: 1850, objectif: 2000 },
    { jour: "Mar", calories: 2100, objectif: 2000 },
    { jour: "Mer", calories: 1750, objectif: 2000 },
    { jour: "Jeu", calories: 1950, objectif: 2000 },
    { jour: "Ven", calories: 2200, objectif: 2000 },
    { jour: "Sam", calories: 1600, objectif: 2000 },
    { jour: "Dim", calories: 1900, objectif: 2000 },
];

export function CaloriesChart() {
    const colors = useChartColors();
    const [caloriesData, setCaloriesData] = useState<Record<string, number | string>[]>(DEMO_DATA);
    const [isDemo, setIsDemo] = useState(true);
    const [objectif, setObjectif] = useState(2000);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await apiFetch<{ data: Record<string, number | string>[] }>('/api/stats/calories-history?days=7');
                if (res.data && res.data.length > 0) {
                    setCaloriesData(res.data);
                    setIsDemo(false);
                    const firstObjectif = res.data[0]?.objectif;
                    if (typeof firstObjectif === 'number') {
                        setObjectif(firstObjectif);
                    }
                }
            } catch {
                // keep demo data
            }
        }
        fetchData();
    }, []);

    return (
        <ChartCard
            title="Calories journalières"
            description={isDemo ? "Donnees de demonstration" : "Consommation vs objectif cette semaine"}
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
                            y={objectif}
                            stroke={colors.secondary}
                            strokeDasharray="5 5"
                            label={{
                                value: `Objectif: ${objectif} kcal`,
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
                                        Number(entry.calories) > Number(entry.objectif)
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
