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
import { apiFetch } from "@/lib/api";

const DEMO_DATA = [
    { name: "Proteines", value: 30 },
    { name: "Glucides", value: 50 },
    { name: "Lipides", value: 20 },
];

export function MacrosChart() {
    const colors = useChartColors();
    const [macrosData, setMacrosData] = useState(DEMO_DATA);
    const [isDemo, setIsDemo] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await apiFetch<{ data: { name: string; value: number }[] | null }>('/api/stats/macros');
                if (res.data && res.data.length > 0) {
                    setMacrosData(res.data);
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
