"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { CSSProperties, ReactNode } from "react";

export function getChartTooltipStyle(colors: {
    background: string;
    grid: string;
    text: string;
}): { contentStyle: CSSProperties; labelStyle: CSSProperties } {
    return {
        contentStyle: {
            backgroundColor: colors.background,
            border: `1px solid ${colors.grid}`,
            borderRadius: "8px",
            color: colors.text,
        },
        labelStyle: { color: colors.text },
    };
}

interface ChartCardProps {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
}

export function ChartCard({
    title,
    description,
    children,
    className,
}: ChartCardProps) {
    return (
        <Card className={className}>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">{title}</CardTitle>
                {description && (
                    <CardDescription>{description}</CardDescription>
                )}
            </CardHeader>
            <CardContent className="pt-4">{children}</CardContent>
        </Card>
    );
}
