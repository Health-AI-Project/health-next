"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KpiCard } from "@/components/ui/kpi-card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import {
    Users,
    Utensils,
    Dumbbell,
    TrendingUp,
} from "lucide-react";
import {
    mockUserDemographics,
    mockNutritionTrends,
    mockFitnessStats,
    mockBusinessKpis,
} from "@/lib/mocks/admin";
import type { FitnessStat } from "@/types/admin";

const TIER_COLORS: Record<string, string> = {
    FREE: "hsl(217, 91%, 60%)",
    PREMIUM: "hsl(258, 90%, 66%)",
    PREMIUM_PLUS: "hsl(45, 93%, 47%)",
    B2B: "hsl(142, 76%, 36%)",
};

export default function AnalyticsAdminPage() {
    const ageDistribution = useMemo(() => {
        const buckets: Record<string, Record<string, number>> = {};
        for (const d of mockUserDemographics) {
            buckets[d.age_bucket] = buckets[d.age_bucket] ?? {};
            buckets[d.age_bucket][d.subscription_status] = d.user_count;
        }
        return Object.entries(buckets).map(([age_bucket, tiers]) => ({
            age_bucket,
            FREE: tiers.FREE ?? 0,
            PREMIUM: tiers.PREMIUM ?? 0,
            PREMIUM_PLUS: tiers.PREMIUM_PLUS ?? 0,
            B2B: tiers.B2B ?? 0,
        }));
    }, []);

    const tierDistribution = useMemo(() => {
        const tiers: Record<string, number> = {};
        for (const d of mockUserDemographics) {
            tiers[d.subscription_status] = (tiers[d.subscription_status] ?? 0) + d.user_count;
        }
        return Object.entries(tiers).map(([name, value]) => ({ name, value }));
    }, []);

    const totalUsers = useMemo(() => tierDistribution.reduce((s, t) => s + t.value, 0), [tierDistribution]);

    const nutritionData = useMemo(
        () =>
            mockNutritionTrends.map((d) => ({
                date: d.date.slice(5),
                calories: d.avg_calories,
                protein: d.avg_protein_g,
                carbs: d.avg_carbs_g,
                fat: d.avg_fat_g,
            })),
        [],
    );

    const fitnessColumns: DataTableColumn<FitnessStat>[] = [
        {
            key: "exercise_name",
            header: "Exercice",
        },
        {
            key: "exercise_type",
            header: "Type",
            accessor: (s) => (
                <Badge variant="outline" className="text-xs">
                    {s.exercise_type}
                </Badge>
            ),
        },
        {
            key: "sessions_count",
            header: "Sessions",
            accessor: (s) => <span className="tabular-nums">{s.sessions_count.toLocaleString("fr-FR")}</span>,
            sortValue: (s) => s.sessions_count,
            className: "text-right",
            headerClassName: "text-right",
        },
        {
            key: "avg_intensity",
            header: "Intensité",
            accessor: (s) => {
                const color =
                    s.avg_intensity === "high"
                        ? "bg-rose-100 text-rose-900 dark:bg-rose-900/30 dark:text-rose-200"
                        : s.avg_intensity === "moderate"
                            ? "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200"
                            : "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200";
                return <Badge className={`${color} hover:${color}`}>{s.avg_intensity}</Badge>;
            },
        },
        {
            key: "avg_duration_min",
            header: "Durée moy.",
            accessor: (s) => <span className="tabular-nums">{s.avg_duration_min} min</span>,
            sortValue: (s) => s.avg_duration_min,
            className: "text-right",
            headerClassName: "text-right",
        },
    ];

    return (
        <div className="space-y-8">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Analytics business</h1>
                <p className="text-muted-foreground">
                    Indicateurs métier consolidés pour HealthAI Coach : démographie utilisateurs, tendances
                    nutritionnelles, statistiques fitness et KPIs business.
                </p>
            </header>

            <section aria-labelledby="biz-kpis">
                <h2 id="biz-kpis" className="sr-only">KPIs business</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {mockBusinessKpis.map((kpi) => (
                        <KpiCard
                            key={kpi.label}
                            label={kpi.label}
                            value={kpi.value}
                            unit={kpi.unit}
                            trend={kpi.trend_pct}
                            description={`sur ${kpi.period}`}
                            icon={TrendingUp}
                        />
                    ))}
                </div>
            </section>

            <Tabs defaultValue="users">
                <TabsList>
                    <TabsTrigger value="users">
                        <Users className="h-4 w-4 mr-1" aria-hidden="true" />
                        Utilisateurs
                    </TabsTrigger>
                    <TabsTrigger value="nutrition">
                        <Utensils className="h-4 w-4 mr-1" aria-hidden="true" />
                        Nutrition
                    </TabsTrigger>
                    <TabsTrigger value="fitness">
                        <Dumbbell className="h-4 w-4 mr-1" aria-hidden="true" />
                        Fitness
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="mt-4 space-y-4">
                    <div className="grid gap-4 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle id="age-chart-title">Répartition par tranche d&apos;âge et abonnement</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className="h-72"
                                    role="img"
                                    aria-label="Histogramme empilé : utilisateurs par tranche d'âge et tier d'abonnement"
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={ageDistribution}>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                            <XAxis dataKey="age_bucket" tick={{ fontSize: 12 }} />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip
                                                formatter={(value: number | undefined) => (value ?? 0).toLocaleString("fr-FR")}
                                            />
                                            <Legend />
                                            <Bar dataKey="FREE" stackId="a" fill={TIER_COLORS.FREE} name="Freemium" />
                                            <Bar dataKey="PREMIUM" stackId="a" fill={TIER_COLORS.PREMIUM} name="Premium" />
                                            <Bar dataKey="PREMIUM_PLUS" stackId="a" fill={TIER_COLORS.PREMIUM_PLUS} name="Premium+" />
                                            <Bar dataKey="B2B" stackId="a" fill={TIER_COLORS.B2B} name="B2B" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle id="tier-chart-title">Répartition par tier</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className="h-72"
                                    role="img"
                                    aria-label={`Diagramme circulaire : ${tierDistribution.map((t) => `${t.name} ${Math.round((t.value / totalUsers) * 100)}%`).join(", ")}`}
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={tierDistribution}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={90}
                                                label={(entry) => `${entry.name} (${Math.round(((entry.value as number) / totalUsers) * 100)}%)`}
                                            >
                                                {tierDistribution.map((entry) => (
                                                    <Cell key={entry.name} fill={TIER_COLORS[entry.name] ?? "hsl(217, 91%, 60%)"} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: number | undefined) => (value ?? 0).toLocaleString("fr-FR")} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Tableau démographique</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <caption className="sr-only">
                                    Répartition détaillée des utilisateurs par tranche d&apos;âge et tier d&apos;abonnement
                                </caption>
                                <thead>
                                    <tr className="border-b">
                                        <th scope="col" className="py-2 text-left font-medium">Tranche d&apos;âge</th>
                                        <th scope="col" className="py-2 text-right font-medium">Freemium</th>
                                        <th scope="col" className="py-2 text-right font-medium">Premium</th>
                                        <th scope="col" className="py-2 text-right font-medium">Premium+</th>
                                        <th scope="col" className="py-2 text-right font-medium">B2B</th>
                                        <th scope="col" className="py-2 text-right font-medium">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ageDistribution.map((row) => {
                                        const total = row.FREE + row.PREMIUM + row.PREMIUM_PLUS + row.B2B;
                                        return (
                                            <tr key={row.age_bucket} className="border-b">
                                                <td className="py-2">{row.age_bucket}</td>
                                                <td className="py-2 text-right tabular-nums">{row.FREE.toLocaleString("fr-FR")}</td>
                                                <td className="py-2 text-right tabular-nums">{row.PREMIUM.toLocaleString("fr-FR")}</td>
                                                <td className="py-2 text-right tabular-nums">{row.PREMIUM_PLUS.toLocaleString("fr-FR")}</td>
                                                <td className="py-2 text-right tabular-nums">{row.B2B.toLocaleString("fr-FR")}</td>
                                                <td className="py-2 text-right tabular-nums font-medium">{total.toLocaleString("fr-FR")}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="nutrition" className="mt-4 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tendances nutritionnelles (30 jours)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                className="h-80"
                                role="img"
                                aria-label="Courbe d'évolution des apports moyens en calories sur 30 jours"
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={nutritionData}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="calories" stroke="hsl(38, 92%, 50%)" name="Calories (kcal)" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-4 lg:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Protéines moyennes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-48" role="img" aria-label="Évolution protéines">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={nutritionData}>
                                            <XAxis dataKey="date" tick={{ fontSize: 10 }} hide />
                                            <YAxis tick={{ fontSize: 10 }} />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="protein" stroke="hsl(258, 90%, 66%)" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Glucides moyens</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-48" role="img" aria-label="Évolution glucides">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={nutritionData}>
                                            <XAxis dataKey="date" tick={{ fontSize: 10 }} hide />
                                            <YAxis tick={{ fontSize: 10 }} />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="carbs" stroke="hsl(217, 91%, 60%)" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Lipides moyens</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-48" role="img" aria-label="Évolution lipides">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={nutritionData}>
                                            <XAxis dataKey="date" tick={{ fontSize: 10 }} hide />
                                            <YAxis tick={{ fontSize: 10 }} />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="fat" stroke="hsl(142, 76%, 36%)" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="fitness" className="mt-4 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top 10 exercices les plus pratiqués</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                columns={fitnessColumns}
                                data={mockFitnessStats}
                                rowId={(s) => s.exercise_name}
                                pageSize={10}
                                searchableKeys={["exercise_name", "exercise_type"]}
                                searchPlaceholder="Rechercher un exercice..."
                                caption="Statistiques d'utilisation des exercices : nombre de sessions, intensité moyenne et durée"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
