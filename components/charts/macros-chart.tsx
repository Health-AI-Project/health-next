"use client";

import { useEffect, useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts";
import { useChartColors } from "@/components/providers/dynamic-theme-provider";
import { ChartCard, getChartTooltipStyle } from "@/components/charts/chart-card";
import { cachedFetch } from "@/lib/api";

const DEMO_DATA = [
    { name: "Proteines", value: 30 },
    { name: "Glucides", value: 50 },
    { name: "Lipides", value: 20 },
];

interface ApiNutritionEntry {
    protein_g?: number | string;
    carbs_g?: number | string;
    fat_g?: number | string;
}

export function MacrosChart() {
    const colors = useChartColors();
    const [macrosData, setMacrosData] = useState(DEMO_DATA);
    const [isDemo, setIsDemo] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await cachedFetch<{ data: ApiNutritionEntry[] }>('/api/v1/analytics/nutrition');
                if (res.data && res.data.length > 0) {
                    const totals = res.data.reduce(
                        (acc, entry) => ({
                            protein: acc.protein + Number(entry.protein_g || 0),
                            carbs: acc.carbs + Number(entry.carbs_g || 0),
                            fat: acc.fat + Number(entry.fat_g || 0),
                        }),
                        { protein: 0, carbs: 0, fat: 0 },
                    );
                    const total = totals.protein + totals.carbs + totals.fat;
                    if (total > 0) {
                        setMacrosData([
                            { name: "Proteines", value: Math.round((totals.protein / total) * 100) },
                            { name: "Glucides", value: Math.round((totals.carbs / total) * 100) },
                            { name: "Lipides", value: Math.round((totals.fat / total) * 100) },
                        ]);
                    }
                    setIsDemo(false);
                }
            } catch {
                // keep demo data
            }
        }
        fetchData();
    }, []);

    const pieColors = [colors.primary, colors.secondary, colors.tertiary];

    return (
        <ChartCard
            title="Repartition des macronutriments"
            description={isDemo ? "Donnees de demonstration" : "Proteines, glucides et lipides"}
        >
            <div className="h-[300px] min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                    <PieChart>
                        <Pie
                            data={macrosData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={4}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}%`}
                        >
                            {macrosData.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={pieColors[index % pieColors.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            {...getChartTooltipStyle(colors)}
                            formatter={(value, name) => [`${value}%`, name]}
                        />
                        <Legend wrapperStyle={{ color: colors.text }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </ChartCard>
    );
}
