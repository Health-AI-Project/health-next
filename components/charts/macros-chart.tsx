"use client";

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

const macrosData = [
    { name: "Proteines", value: 30, unit: "g" },
    { name: "Glucides", value: 50, unit: "g" },
    { name: "Lipides", value: 20, unit: "g" },
];

export function MacrosChart() {
    const colors = useChartColors();

    const pieColors = [colors.primary, colors.secondary, colors.tertiary];

    return (
        <ChartCard
            title="Repartition des macronutriments"
            description="Proteines, glucides et lipides"
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
