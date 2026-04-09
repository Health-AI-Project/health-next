"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PremiumGuard } from "@/components/premium/premium-guard";
import { apiFetch } from "@/lib/api";
import { Utensils, Coffee, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Meal {
    name: string;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    ingredients: string[];
}

interface DayPlan {
    day: string;
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snack?: Meal;
}

const DEMO_MEAL_PLAN: DayPlan[] = [
    {
        day: "Lundi",
        breakfast: { name: "Bowl proteine", calories: 420, proteins: 25, carbs: 50, fats: 12, ingredients: ["Flocons d'avoine", "Whey", "Banane", "Amandes"] },
        lunch: { name: "Poulet grille", calories: 650, proteins: 45, carbs: 60, fats: 18, ingredients: ["Blanc de poulet", "Riz basmati", "Brocolis", "Huile d'olive"] },
        dinner: { name: "Saumon en papillote", calories: 550, proteins: 35, carbs: 40, fats: 22, ingredients: ["Pave de saumon", "Quinoa", "Courgettes", "Citron"] },
        snack: { name: "Collation", calories: 180, proteins: 10, carbs: 20, fats: 6, ingredients: ["Yaourt grec", "Fruits rouges"] },
    },
    {
        day: "Mardi",
        breakfast: { name: "Tartines completes", calories: 380, proteins: 15, carbs: 55, fats: 10, ingredients: ["Pain complet", "Avocat", "Oeuf poché", "Tomate"] },
        lunch: { name: "Salade composee", calories: 520, proteins: 30, carbs: 45, fats: 20, ingredients: ["Thon", "Haricots verts", "Pommes de terre", "Vinaigrette"] },
        dinner: { name: "Risotto legumes", calories: 480, proteins: 12, carbs: 70, fats: 14, ingredients: ["Riz arborio", "Champignons", "Parmesan", "Bouillon"] },
    },
    {
        day: "Mercredi",
        breakfast: { name: "Smoothie bowl", calories: 350, proteins: 18, carbs: 48, fats: 8, ingredients: ["Banane", "Epinards", "Proteine vegetale", "Granola"] },
        lunch: { name: "Wrap dinde", calories: 580, proteins: 38, carbs: 55, fats: 16, ingredients: ["Tortilla complete", "Dinde", "Avocat", "Crudites"] },
        dinner: { name: "Soupe et tartines", calories: 420, proteins: 18, carbs: 58, fats: 12, ingredients: ["Soupe de lentilles", "Pain au levain", "Fromage frais"] },
        snack: { name: "Collation", calories: 150, proteins: 8, carbs: 18, fats: 4, ingredients: ["Pomme", "Beurre de cacahuete"] },
    },
    {
        day: "Jeudi",
        breakfast: { name: "Pancakes proteines", calories: 450, proteins: 28, carbs: 52, fats: 14, ingredients: ["Farine complete", "Oeufs", "Whey", "Myrtilles"] },
        lunch: { name: "Buddha bowl", calories: 600, proteins: 25, carbs: 68, fats: 22, ingredients: ["Pois chiches", "Patate douce", "Kale", "Tahini"] },
        dinner: { name: "Pates bolognaise", calories: 580, proteins: 32, carbs: 65, fats: 18, ingredients: ["Pates completes", "Boeuf hache 5%", "Sauce tomate", "Basilic"] },
    },
    {
        day: "Vendredi",
        breakfast: { name: "Muesli maison", calories: 400, proteins: 14, carbs: 58, fats: 12, ingredients: ["Muesli", "Lait d'amande", "Fruits secs", "Miel"] },
        lunch: { name: "Poke bowl", calories: 550, proteins: 35, carbs: 55, fats: 16, ingredients: ["Saumon cru", "Riz vinaigre", "Edamame", "Avocat", "Algues"] },
        dinner: { name: "Omelette garnie", calories: 480, proteins: 30, carbs: 25, fats: 28, ingredients: ["Oeufs", "Champignons", "Chevre", "Salade verte"] },
        snack: { name: "Collation", calories: 160, proteins: 6, carbs: 22, fats: 5, ingredients: ["Carres de chocolat noir", "Noix"] },
    },
];

const MEAL_ICONS = {
    breakfast: Coffee,
    lunch: Sun,
    dinner: Moon,
    snack: Utensils,
};

function MealCard({ meal, type }: { meal: Meal; type: keyof typeof MEAL_ICONS }) {
    const Icon = MEAL_ICONS[type];
    const labels = { breakfast: "Petit-dejeuner", lunch: "Dejeuner", dinner: "Diner", snack: "Collation" };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                        {labels[type]}
                    </CardTitle>
                    <Badge variant="outline">{meal.calories} kcal</Badge>
                </div>
                <CardDescription>{meal.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>P: {meal.proteins}g</span>
                    <span>G: {meal.carbs}g</span>
                    <span>L: {meal.fats}g</span>
                </div>
                <div className="flex flex-wrap gap-1">
                    {meal.ingredients.map((ing) => (
                        <Badge key={ing} variant="secondary" className="text-xs">
                            {ing}
                        </Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default function MealPlanPage() {
    const [plan, setPlan] = useState<DayPlan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPlan() {
            try {
                const response = await apiFetch<{ data: DayPlan[] }>("/api/nutrition/meal-plan");
                setPlan(response.data);
            } catch {
                setPlan(DEMO_MEAL_PLAN);
            } finally {
                setLoading(false);
            }
        }
        fetchPlan();
    }, []);

    if (loading) {
        return (
            <div className="space-y-8">
                <div>
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-10 w-full max-w-lg" />
                <div className="grid gap-4 md:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-48" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Plan de repas</h1>
                    <p className="text-muted-foreground mt-1">
                        Votre plan nutritionnel personnalise par l&apos;IA
                    </p>
                </div>
                <Link href="/dashboard/nutrition">
                    <Button variant="outline" className="gap-2">
                        <Utensils className="h-4 w-4" aria-hidden="true" />
                        Analyser un repas
                    </Button>
                </Link>
            </header>

            <PremiumGuard feature="Plans de repas personnalises">
                <Tabs defaultValue={plan[0]?.day || "Lundi"} className="space-y-6">
                    <TabsList className="flex-wrap h-auto gap-1">
                        {plan.map((day) => (
                            <TabsTrigger key={day.day} value={day.day}>
                                {day.day}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {plan.map((day) => {
                        const dayTotal = [day.breakfast, day.lunch, day.dinner, day.snack]
                            .filter(Boolean)
                            .reduce((sum, m) => sum + (m?.calories || 0), 0);

                        return (
                            <TabsContent key={day.day} value={day.day} className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold">{day.day}</h2>
                                    <Badge className="text-sm">{dayTotal} kcal total</Badge>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <MealCard meal={day.breakfast} type="breakfast" />
                                    <MealCard meal={day.lunch} type="lunch" />
                                    <MealCard meal={day.dinner} type="dinner" />
                                    {day.snack && <MealCard meal={day.snack} type="snack" />}
                                </div>
                            </TabsContent>
                        );
                    })}
                </Tabs>
            </PremiumGuard>
        </div>
    );
}
