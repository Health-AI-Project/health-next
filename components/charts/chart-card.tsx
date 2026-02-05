"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ReactNode } from "react";

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
