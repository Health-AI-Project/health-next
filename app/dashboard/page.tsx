"use client";

import { useTheme } from "@/components/providers/dynamic-theme-provider";
import { WeightEvolutionChart } from "@/components/charts/weight-evolution-chart";
import { CaloriesChart } from "@/components/charts/calories-chart";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { TrendingDown, Flame, Target, Activity } from "lucide-react";

const stats = [
    {
        label: "Poids actuel",
        value: "76.2 kg",
        change: "-1.8 kg",
        trend: "down",
        icon: TrendingDown,
    },
    {
        label: "Calories aujourd'hui",
        value: "1,850",
        change: "kcal",
        trend: "neutral",
        icon: Flame,
    },
    {
        label: "Objectif atteint",
        value: "72%",
        change: "+5%",
        trend: "up",
        icon: Target,
    },
    {
        label: "Activité",
        value: "6,420",
        change: "pas",
        trend: "neutral",
        icon: Activity,
    },
];

export default function DashboardPage() {
    const { currentTheme } = useTheme();

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">
                    Bienvenue sur {currentTheme.name}
                </h1>
                <p className="text-muted-foreground mt-1">
                    Voici un aperçu de vos statistiques de santé
                </p>
            </header>

            <section aria-labelledby="stats-heading">
                <h2 id="stats-heading" className="sr-only">
                    Statistiques clés
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <Card key={stat.label}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.label}
                                </CardTitle>
                                <stat.icon
                                    className="h-4 w-4 text-primary"
                                    aria-hidden="true"
                                />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">{stat.change}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <section aria-labelledby="charts-heading">
                <h2 id="charts-heading" className="sr-only">
                    Graphiques
                </h2>
                <div className="grid gap-6 lg:grid-cols-2">
                    <WeightEvolutionChart />
                    <CaloriesChart />
                </div>
            </section>
        </div>
    );
}
