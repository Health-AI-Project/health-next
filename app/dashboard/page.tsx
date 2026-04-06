"use client";

import { WeightEvolutionChart } from "@/components/charts/weight-evolution-chart";
import { CaloriesChart } from "@/components/charts/calories-chart";
import { BmiCard } from "@/components/dashboard/bmi-card";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { TrendingDown, Flame, Target, Activity, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface DashboardData {
    user?: {
        email?: string;
        weight?: number;
        height?: number;
        is_premium?: boolean;
    };
    stats?: {
        calories?: number;
        protein?: number;
        workouts_count?: number;
    };
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await apiFetch<{ data: DashboardData }>('/api/home');
                setData(response.data);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Erreur inconnue";
                console.error("Dashboard fetch error:", err);
                setError(message);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500">
                Erreur de chargement: {error}
            </div>
        );
    }

    const stats = [
        {
            label: "Poids actuel",
            value: data?.user?.weight ? `${data.user.weight} kg` : "N/A",
            change: data?.user?.is_premium ? "Premium" : "Standard",
            trend: "neutral",
            icon: TrendingDown,
        },
        {
            label: "Calories aujourd'hui",
            value: data?.stats?.calories ? Math.round(data.stats.calories).toLocaleString() : "0",
            change: "kcal",
            trend: "neutral",
            icon: Flame,
        },
        {
            label: "Protéines",
            value: data?.stats?.protein ? `${Math.round(data.stats.protein)} g` : "0 g",
            change: "Objectif atteint",
            trend: "up",
            icon: Target,
        },
        {
            label: "Activité",
            value: data?.stats?.workouts_count !== undefined ? `${data.stats.workouts_count}` : "0",
            change: "séances",
            trend: "neutral",
            icon: Activity,
        },
    ];


    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">
                    Bienvenue, {data?.user?.email?.split('@')[0] || 'Utilisateur'}
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

            <section aria-labelledby="bmi-heading">
                <h2 id="bmi-heading" className="sr-only">Indice de Masse Corporelle</h2>
                <BmiCard weight={data?.user?.weight} height={data?.user?.height} />
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

