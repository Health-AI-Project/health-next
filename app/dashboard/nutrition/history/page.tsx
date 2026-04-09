"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { Utensils, Calendar, Flame, ArrowUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface MealHistoryItem {
    id: string;
    date: string;
    name: string;
    items: string[];
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
}

const DEMO_HISTORY: MealHistoryItem[] = [
    {
        id: "1",
        date: "2026-04-06",
        name: "Dejeuner",
        items: ["Poulet grille", "Riz basmati", "Brocolis"],
        calories: 650,
        proteins: 45,
        carbs: 70,
        fats: 15,
    },
    {
        id: "2",
        date: "2026-04-06",
        name: "Petit-dejeuner",
        items: ["Flocons d'avoine", "Banane", "Lait d'amande"],
        calories: 420,
        proteins: 12,
        carbs: 65,
        fats: 10,
    },
    {
        id: "3",
        date: "2026-04-05",
        name: "Diner",
        items: ["Saumon", "Quinoa", "Salade verte"],
        calories: 580,
        proteins: 38,
        carbs: 45,
        fats: 22,
    },
    {
        id: "4",
        date: "2026-04-05",
        name: "Dejeuner",
        items: ["Pates completes", "Sauce tomate", "Parmesan"],
        calories: 520,
        proteins: 18,
        carbs: 78,
        fats: 14,
    },
    {
        id: "5",
        date: "2026-04-04",
        name: "Dejeuner",
        items: ["Salade Caesar", "Poulet", "Croutons"],
        calories: 480,
        proteins: 32,
        carbs: 30,
        fats: 24,
    },
    {
        id: "6",
        date: "2026-04-03",
        name: "Diner",
        items: ["Soupe de lentilles", "Pain complet"],
        calories: 380,
        proteins: 22,
        carbs: 55,
        fats: 8,
    },
];

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
    });
}

function filterByPeriod(meals: MealHistoryItem[], period: string): MealHistoryItem[] {
    const now = new Date();
    const cutoff = new Date();

    switch (period) {
        case "today":
            cutoff.setHours(0, 0, 0, 0);
            break;
        case "week":
            cutoff.setDate(now.getDate() - 7);
            break;
        case "month":
            cutoff.setMonth(now.getMonth() - 1);
            break;
        default:
            return meals;
    }

    return meals.filter((m) => new Date(m.date) >= cutoff);
}

export default function MealHistoryPage() {
    const [meals, setMeals] = useState<MealHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortAsc, setSortAsc] = useState(false);

    useEffect(() => {
        async function fetchHistory() {
            try {
                const response = await apiFetch<{ data: MealHistoryItem[] }>("/api/nutrition/history");
                setMeals(response.data);
            } catch {
                setMeals(DEMO_HISTORY);
            } finally {
                setLoading(false);
            }
        }
        fetchHistory();
    }, []);

    const sortedMeals = [...meals].sort((a, b) => {
        const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
        return sortAsc ? diff : -diff;
    });

    const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
    const totalMeals = meals.length;
    const avgCalories = totalMeals > 0 ? Math.round(totalCalories / totalMeals) : 0;

    if (loading) {
        return (
            <div className="space-y-8">
                <div>
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-28" />
                    ))}
                </div>
                <Skeleton className="h-[400px]" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Journal alimentaire</h1>
                    <p className="text-muted-foreground mt-1">
                        Consultez l&apos;historique de vos repas analyses
                    </p>
                </div>
                <Link href="/dashboard/nutrition">
                    <Button variant="outline" className="gap-2">
                        <Utensils className="h-4 w-4" aria-hidden="true" />
                        Analyser un repas
                    </Button>
                </Link>
            </header>

            <section aria-labelledby="summary-heading">
                <h2 id="summary-heading" className="sr-only">Resume</h2>
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Repas enregistres
                            </CardTitle>
                            <Utensils className="h-4 w-4 text-primary" aria-hidden="true" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalMeals}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Calories totales
                            </CardTitle>
                            <Flame className="h-4 w-4 text-primary" aria-hidden="true" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalCalories.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">kcal</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Moyenne par repas
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{avgCalories}</div>
                            <p className="text-xs text-muted-foreground">kcal/repas</p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <section aria-labelledby="history-heading">
                <h2 id="history-heading" className="sr-only">Historique des repas</h2>
                <Tabs defaultValue="all" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <TabsList>
                            <TabsTrigger value="all">Tout</TabsTrigger>
                            <TabsTrigger value="today">Aujourd&apos;hui</TabsTrigger>
                            <TabsTrigger value="week">7 jours</TabsTrigger>
                            <TabsTrigger value="month">30 jours</TabsTrigger>
                        </TabsList>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSortAsc(!sortAsc)}
                            className="gap-2"
                        >
                            <ArrowUpDown className="h-4 w-4" aria-hidden="true" />
                            {sortAsc ? "Plus ancien" : "Plus recent"}
                        </Button>
                    </div>

                    {["all", "today", "week", "month"].map((period) => (
                        <TabsContent key={period} value={period}>
                            <Card>
                                <CardContent className="p-0">
                                    <MealTable meals={filterByPeriod(sortedMeals, period)} />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    ))}
                </Tabs>
            </section>
        </div>
    );
}

function MealTable({ meals }: { meals: MealHistoryItem[] }) {
    if (meals.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Aucun repas pour cette periode
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Repas</TableHead>
                    <TableHead>Aliments</TableHead>
                    <TableHead className="text-right">Calories</TableHead>
                    <TableHead className="text-right">P</TableHead>
                    <TableHead className="text-right">G</TableHead>
                    <TableHead className="text-right">L</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {meals.map((meal) => (
                    <TableRow key={meal.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                            {formatDate(meal.date)}
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline">{meal.name}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                            {meal.items.join(", ")}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                            {meal.calories}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                            {meal.proteins}g
                        </TableCell>
                        <TableCell className="text-right text-sm">
                            {meal.carbs}g
                        </TableCell>
                        <TableCell className="text-right text-sm">
                            {meal.fats}g
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
