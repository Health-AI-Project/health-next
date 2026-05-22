import * as React from "react";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
    label: string;
    value: string | number;
    unit?: string;
    trend?: number | null;
    icon?: LucideIcon;
    description?: string;
    className?: string;
    loading?: boolean;
}

export const KpiCard = React.forwardRef<HTMLDivElement, KpiCardProps>(
    ({ label, value, unit, trend, icon: Icon, description, className, loading }, ref) => {
        const trendDirection = trend == null ? "neutral" : trend > 0 ? "up" : trend < 0 ? "down" : "neutral";
        const TrendIcon = trendDirection === "up" ? TrendingUp : trendDirection === "down" ? TrendingDown : Minus;
        const trendColor =
            trendDirection === "up"
                ? "text-emerald-600 dark:text-emerald-400"
                : trendDirection === "down"
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-muted-foreground";

        return (
            <Card
                ref={ref}
                className={cn("relative overflow-hidden", className)}
                aria-busy={loading}
            >
                <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground" id={`kpi-${label.replace(/\s+/g, "-").toLowerCase()}-label`}>
                                {label}
                            </p>
                            <p
                                className="text-3xl font-bold tracking-tight tabular-nums"
                                aria-labelledby={`kpi-${label.replace(/\s+/g, "-").toLowerCase()}-label`}
                            >
                                {loading ? (
                                    <span className="inline-block h-9 w-24 animate-pulse rounded bg-muted" aria-label="Chargement" />
                                ) : (
                                    <>
                                        {typeof value === "number" ? value.toLocaleString("fr-FR") : value}
                                        {unit && <span className="ml-1 text-base font-normal text-muted-foreground">{unit}</span>}
                                    </>
                                )}
                            </p>
                        </div>
                        {Icon && (
                            <div className="rounded-md bg-primary/10 p-2" aria-hidden="true">
                                <Icon className="h-5 w-5 text-primary" />
                            </div>
                        )}
                    </div>
                    {(trend != null || description) && (
                        <div className="mt-4 flex items-center gap-1 text-xs">
                            {trend != null && (
                                <span className={cn("inline-flex items-center gap-0.5 font-medium", trendColor)}>
                                    <TrendIcon className="h-3 w-3" aria-hidden="true" />
                                    <span>
                                        {trend > 0 ? "+" : ""}
                                        {trend.toFixed(1)}%
                                    </span>
                                    <span className="sr-only">
                                        {trendDirection === "up" ? "en hausse" : trendDirection === "down" ? "en baisse" : "stable"}
                                    </span>
                                </span>
                            )}
                            {description && <span className="text-muted-foreground">{description}</span>}
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    },
);
KpiCard.displayName = "KpiCard";
