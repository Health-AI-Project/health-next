"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PremiumGuard } from "@/components/premium/premium-guard";
import { apiFetch } from "@/lib/api";
import { Dumbbell, Clock, Flame, Target, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

interface Exercise {
    name: string;
    sets: number;
    reps: string;
    rest: string;
    muscle: string;
}

interface DayWorkout {
    day: string;
    focus: string;
    duration: string;
    calories: number;
    difficulty: "Debutant" | "Intermediaire" | "Avance";
    exercises: Exercise[];
}

const DEMO_WORKOUT_PLAN: DayWorkout[] = [
    {
        day: "Lundi",
        focus: "Haut du corps - Pousser",
        duration: "50 min",
        calories: 350,
        difficulty: "Intermediaire",
        exercises: [
            { name: "Developpe couche", sets: 4, reps: "8-10", rest: "90s", muscle: "Pectoraux" },
            { name: "Developpe militaire", sets: 3, reps: "10-12", rest: "75s", muscle: "Epaules" },
            { name: "Dips", sets: 3, reps: "8-12", rest: "75s", muscle: "Triceps" },
            { name: "Elevations laterales", sets: 3, reps: "12-15", rest: "60s", muscle: "Epaules" },
            { name: "Extensions triceps", sets: 3, reps: "12-15", rest: "60s", muscle: "Triceps" },
        ],
    },
    {
        day: "Mardi",
        focus: "Bas du corps",
        duration: "55 min",
        calories: 420,
        difficulty: "Intermediaire",
        exercises: [
            { name: "Squat", sets: 4, reps: "8-10", rest: "120s", muscle: "Quadriceps" },
            { name: "Fentes marchees", sets: 3, reps: "12/jambe", rest: "75s", muscle: "Quadriceps" },
            { name: "Leg curl", sets: 3, reps: "10-12", rest: "75s", muscle: "Ischio-jambiers" },
            { name: "Mollets debout", sets: 4, reps: "15-20", rest: "60s", muscle: "Mollets" },
            { name: "Gainage planche", sets: 3, reps: "45s", rest: "45s", muscle: "Abdominaux" },
        ],
    },
    {
        day: "Mercredi",
        focus: "Repos actif / Cardio leger",
        duration: "30 min",
        calories: 200,
        difficulty: "Debutant",
        exercises: [
            { name: "Marche rapide", sets: 1, reps: "20 min", rest: "-", muscle: "Cardio" },
            { name: "Etirements dynamiques", sets: 1, reps: "10 min", rest: "-", muscle: "Souplesse" },
        ],
    },
    {
        day: "Jeudi",
        focus: "Haut du corps - Tirer",
        duration: "50 min",
        calories: 340,
        difficulty: "Intermediaire",
        exercises: [
            { name: "Tractions", sets: 4, reps: "6-10", rest: "90s", muscle: "Dos" },
            { name: "Rowing haltere", sets: 3, reps: "10-12", rest: "75s", muscle: "Dos" },
            { name: "Curl biceps", sets: 3, reps: "12-15", rest: "60s", muscle: "Biceps" },
            { name: "Face pull", sets: 3, reps: "15", rest: "60s", muscle: "Epaules arr." },
            { name: "Curl marteau", sets: 3, reps: "12", rest: "60s", muscle: "Biceps" },
        ],
    },
    {
        day: "Vendredi",
        focus: "Full body + HIIT",
        duration: "45 min",
        calories: 450,
        difficulty: "Avance",
        exercises: [
            { name: "Souleve de terre", sets: 4, reps: "6-8", rest: "120s", muscle: "Chaine post." },
            { name: "Pompes", sets: 3, reps: "15-20", rest: "60s", muscle: "Pectoraux" },
            { name: "Kettlebell swing", sets: 3, reps: "15", rest: "60s", muscle: "Full body" },
            { name: "Burpees", sets: 3, reps: "10", rest: "60s", muscle: "Cardio" },
            { name: "Mountain climbers", sets: 3, reps: "30s", rest: "45s", muscle: "Cardio" },
        ],
    },
];

function DifficultyBadge({ difficulty }: { difficulty: string }) {
    const config: Record<string, { variant: "default" | "secondary" | "destructive"; className: string }> = {
        Debutant: { variant: "secondary", className: "" },
        Intermediaire: { variant: "default", className: "" },
        Avance: { variant: "destructive", className: "" },
    };
    const c = config[difficulty] || config.Intermediaire;
    return <Badge variant={c.variant} className={c.className}>{difficulty}</Badge>;
}

export default function WorkoutsPage() {
    const [plan, setPlan] = useState<DayWorkout[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPlan() {
            try {
                const response = await apiFetch<{ data: DayWorkout[] }>("/api/workouts/plan");
                setPlan(response.data);
            } catch {
                setPlan(DEMO_WORKOUT_PLAN);
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
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-24" />
                    ))}
                </div>
            </div>
        );
    }

    const weeklyCalories = plan.reduce((sum, d) => sum + d.calories, 0);
    const totalExercises = plan.reduce((sum, d) => sum + d.exercises.length, 0);

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Entrainement</h1>
                <p className="text-muted-foreground mt-1">
                    Votre programme d&apos;entrainement personnalise par l&apos;IA
                </p>
            </header>

            <section aria-labelledby="workout-stats-heading">
                <h2 id="workout-stats-heading" className="sr-only">Statistiques du programme</h2>
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Seances / semaine</CardTitle>
                            <Trophy className="h-4 w-4 text-primary" aria-hidden="true" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{plan.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Calories / semaine</CardTitle>
                            <Flame className="h-4 w-4 text-primary" aria-hidden="true" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{weeklyCalories.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">kcal brulees</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Exercices</CardTitle>
                            <Dumbbell className="h-4 w-4 text-primary" aria-hidden="true" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalExercises}</div>
                            <p className="text-xs text-muted-foreground">exercices differents</p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <PremiumGuard feature="Programmes d'entrainement personnalises">
                <section aria-labelledby="workout-plan-heading">
                    <h2 id="workout-plan-heading" className="sr-only">Programme hebdomadaire</h2>
                    <Tabs defaultValue={plan[0]?.day || "Lundi"} className="space-y-6">
                        <TabsList className="flex-wrap h-auto gap-1">
                            {plan.map((day) => (
                                <TabsTrigger key={day.day} value={day.day}>
                                    {day.day}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {plan.map((day) => (
                            <TabsContent key={day.day} value={day.day} className="space-y-4">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div>
                                        <h3 className="text-xl font-semibold">{day.focus}</h3>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                                                {day.duration}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Flame className="h-3.5 w-3.5" aria-hidden="true" />
                                                {day.calories} kcal
                                            </span>
                                        </div>
                                    </div>
                                    <DifficultyBadge difficulty={day.difficulty} />
                                </div>

                                <div className="space-y-3">
                                    {day.exercises.map((exercise, index) => (
                                        <Card key={index}>
                                            <CardContent className="flex items-center justify-between p-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{exercise.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {exercise.sets} x {exercise.reps} — repos {exercise.rest}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="hidden sm:inline-flex">
                                                    <Target className="h-3 w-3 mr-1" aria-hidden="true" />
                                                    {exercise.muscle}
                                                </Badge>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </section>
            </PremiumGuard>
        </div>
    );
}
