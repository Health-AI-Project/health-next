"use client";

import { WeightEvolutionChart } from "@/components/charts/weight-evolution-chart";
import { CaloriesChart } from "@/components/charts/calories-chart";
import { MacrosChart } from "@/components/charts/macros-chart";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PremiumGuard } from "@/components/premium/premium-guard";
import { Utensils, Dumbbell, Flame, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { cachedFetch } from "@/lib/api";

interface AnalyticsData {
    stats?: {
        calories?: number;
        protein?: number;
        workouts_count?: number;
    };
    user?: {
        weight?: number;
    };
}

const DEMO_DATA: AnalyticsData = {
    stats: { calories: 1850, protein: 95, workouts_count: 4 },
    user: { weight: 74.5 },
};

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await cachedFetch<{ data: AnalyticsData }>("/api/home");
                setData(response.data);
            } catch {
                setData(DEMO_DATA);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="space-y-8">
                <div>
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-28" />
                    ))}
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                    <Skeleton className="h-[400px]" />
                    <Skeleton className="h-[400px]" />
                </div>
            </div>
        );
    }

    const summaryStats = [
        {
            label: "Calories moyennes",
            value: data?.stats?.calories ? `${Math.round(data.stats.calories)}` : "0",
            unit: "kcal/jour",
            icon: Flame,
        },
        {
            label: "Proteines moyennes",
            value: data?.stats?.protein ? `${Math.round(data.stats.protein)}` : "0",
            unit: "g/jour",
            icon: Utensils,
        },
        {
            label: "Seances effectuees",
            value: data?.stats?.workouts_count !== undefined ? `${data.stats.workouts_count}` : "0",
            unit: "cette semaine",
            icon: Dumbbell,
        },
        {
            label: "Poids actuel",
            value: data?.user?.weight ? `${data.user.weight}` : "N/A",
            unit: "kg",
            icon: TrendingUp,
        },
    ];

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                <p className="text-muted-foreground mt-1">
                    Suivez vos tendances et analysez vos progres
                </p>
            </header>

            <section aria-labelledby="summary-heading">
                <h2 id="summary-heading" className="sr-only">
                    Resume des statistiques
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {summaryStats.map((stat) => (
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
                                <p className="text-xs text-muted-foreground">{stat.unit}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <section aria-labelledby="charts-heading">
                <h2 id="charts-heading" className="sr-only">
                    Graphiques detailles
                </h2>
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
                        <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                        <TabsTrigger value="weight">Poids</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                            <WeightEvolutionChart />
                            <CaloriesChart />
                        </div>
                        <PremiumGuard feature="Repartition des macronutriments">
                            <MacrosChart />
                        </PremiumGuard>
                    </TabsContent>

                    <TabsContent value="nutrition" className="space-y-6">
                        <CaloriesChart />
                        <PremiumGuard feature="Analyse detaillee des macronutriments">
                            <MacrosChart />
                        </PremiumGuard>
                    </TabsContent>

                    <TabsContent value="weight" className="space-y-6">
                        <WeightEvolutionChart />
                    </TabsContent>
                </Tabs>
            </section>
        </div>
    );
}
