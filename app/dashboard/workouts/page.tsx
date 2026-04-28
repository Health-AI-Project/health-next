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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { PremiumGuard } from "@/components/premium/premium-guard";
import { apiFetch } from "@/lib/api";
import { toast } from "@/components/ui/toaster";
import { Dumbbell, Clock, Flame, Target, Trophy, RefreshCw, Loader2, Settings2 } from "lucide-react";
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

interface BackendExercise {
    name: string;
    duration: number;
    type: string;
}

interface BackendStructuredExercise {
    name: string;
    muscle: string;
    sets: number;
    reps: string;
    rest: string;
}

interface BackendDay {
    day: string;
    focus: string;
    difficulty: "Debutant" | "Intermediaire" | "Avance";
    duration_minutes: number;
    calories: number;
    exercises: BackendStructuredExercise[];
}

interface BackendWorkoutPlan {
    exercises?: BackendExercise[];
    days?: BackendDay[];
    total_duration?: number;
}

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

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

function backendToDayWorkouts(plan: BackendWorkoutPlan): DayWorkout[] {
    // Format structure (preferable) : un programme par jour avec sets/reps/rest reels
    if (Array.isArray(plan.days) && plan.days.length > 0) {
        return plan.days.map((d) => ({
            day: d.day,
            focus: d.focus,
            duration: `${d.duration_minutes} min`,
            calories: d.calories,
            difficulty: d.difficulty,
            exercises: d.exercises.map((e) => ({
                name: e.name,
                sets: e.sets,
                reps: e.reps,
                rest: e.rest,
                muscle: e.muscle,
            })),
        }));
    }

    // Fallback ancien format (durees en secondes) : on convertit en minutes,
    // on repartit equitablement sur les 5 jours.
    const exercises = plan.exercises || [];
    if (exercises.length === 0) return [];
    const perDay = Math.max(1, Math.ceil(exercises.length / DAYS.length));
    const days: DayWorkout[] = [];

    for (let i = 0; i < DAYS.length && i * perDay < exercises.length; i++) {
        const dayExercises = exercises.slice(i * perDay, (i + 1) * perDay);
        const dayDurationSec = dayExercises.reduce((sum, e) => sum + e.duration, 0);
        const dayDurationMin = Math.round(dayDurationSec / 60);
        days.push({
            day: DAYS[i],
            focus: dayExercises[0]?.type || "Entrainement",
            duration: `${dayDurationMin} min`,
            calories: Math.round(dayDurationMin * 7),
            difficulty: "Intermediaire",
            exercises: dayExercises.map((e) => ({
                name: e.name,
                sets: 3,
                reps: "10-12",
                rest: "60s",
                muscle: e.type,
            })),
        });
    }

    return days;
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
    const config: Record<string, { variant: "default" | "secondary" | "destructive"; className: string }> = {
        Debutant: { variant: "secondary", className: "" },
        Intermediaire: { variant: "default", className: "" },
        Avance: { variant: "destructive", className: "" },
    };
    const c = config[difficulty] || config.Intermediaire;
    return <Badge variant={c.variant} className={c.className}>{difficulty}</Badge>;
}

const MUSCLE_OPTIONS = [
    { id: "pectoraux", label: "Pectoraux" },
    { id: "dos", label: "Dos" },
    { id: "epaules", label: "Epaules" },
    { id: "bras", label: "Bras (biceps/triceps)" },
    { id: "jambes", label: "Jambes" },
    { id: "abdominaux", label: "Abdominaux" },
    { id: "cardio", label: "Cardio" },
];

interface WorkoutParams {
    sessions_per_week: number;
    duration: number;
    level: "Debutant" | "Intermediaire" | "Avance";
    equipment: "GYM" | "NONE";
    target_muscles: string[];
    injuries: string[];
}

const DEFAULT_PARAMS: WorkoutParams = {
    sessions_per_week: 4,
    duration: 50,
    level: "Intermediaire",
    equipment: "GYM",
    target_muscles: ["pectoraux", "dos", "jambes"],
    injuries: [],
};

export default function WorkoutsPage() {
    const [plan, setPlan] = useState<DayWorkout[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [isDemo, setIsDemo] = useState(false);
    const [paramsOpen, setParamsOpen] = useState(false);
    const [params, setParams] = useState<WorkoutParams>(DEFAULT_PARAMS);
    const [draftParams, setDraftParams] = useState<WorkoutParams>(DEFAULT_PARAMS);

    async function fetchPlan() {
        try {
            const response = await apiFetch<{ plan: BackendWorkoutPlan | null; params?: WorkoutParams }>(
                "/api/workout/current",
            );
            if (response?.plan) {
                const days = backendToDayWorkouts(response.plan);
                if (days.length > 0) {
                    setPlan(days);
                    setIsDemo(false);
                    if (response.params) setParams(response.params);
                } else {
                    setPlan(DEMO_WORKOUT_PLAN);
                    setIsDemo(true);
                }
            } else {
                setPlan(DEMO_WORKOUT_PLAN);
                setIsDemo(true);
            }
        } catch {
            setPlan(DEMO_WORKOUT_PLAN);
            setIsDemo(true);
        } finally {
            setLoading(false);
        }
    }

    async function handleGenerate(custom?: WorkoutParams) {
        const p = custom ?? params;
        setGenerating(true);
        try {
            const response = await apiFetch<BackendWorkoutPlan>("/api/workout/generate", {
                method: "POST",
                body: JSON.stringify(p),
            });
            const days = backendToDayWorkouts(response);
            if (days.length > 0) {
                setPlan(days);
                setIsDemo(false);
                setParams(p);
                toast.success("Programme genere !");
                setParamsOpen(false);
            } else {
                toast.error("Aucun exercice retourne par le serveur");
            }
        } catch {
            toast.error("Impossible de generer le programme");
        } finally {
            setGenerating(false);
        }
    }

    function toggleMuscle(id: string) {
        setDraftParams((prev) => ({
            ...prev,
            target_muscles: prev.target_muscles.includes(id)
                ? prev.target_muscles.filter((m) => m !== id)
                : [...prev.target_muscles, id],
        }));
    }

    function openParams() {
        setDraftParams(params);
        setParamsOpen(true);
    }

    useEffect(() => {
        fetchPlan();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const weeklyCalories = plan.reduce((sum, d) => sum + d.calories, 0);
    const totalExercises = plan.reduce((sum, d) => sum + d.exercises.length, 0);

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

    return (
        <div className="space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Entrainement</h1>
                    <p className="text-muted-foreground mt-1">
                        Votre programme d&apos;entrainement personnalise par l&apos;IA
                    </p>
                </div>
                <Dialog open={paramsOpen} onOpenChange={setParamsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="default" className="gap-2" onClick={openParams} disabled={generating}>
                            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings2 className="h-4 w-4" aria-hidden="true" />}
                            {generating ? "Generation..." : "Generer un programme"}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Parametrer votre programme</DialogTitle>
                            <DialogDescription>
                                Ajustez seances, duree, niveau et muscles cibles avant de generer.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-2">
                            <div className="grid gap-2">
                                <Label htmlFor="sessions">Seances par semaine</Label>
                                <Input
                                    id="sessions"
                                    type="number"
                                    min={1}
                                    max={7}
                                    value={draftParams.sessions_per_week}
                                    onChange={(e) =>
                                        setDraftParams({ ...draftParams, sessions_per_week: Math.min(7, Math.max(1, Number(e.target.value) || 1)) })
                                    }
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="duration">Duree par seance (minutes)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    min={20}
                                    max={120}
                                    step={5}
                                    value={draftParams.duration}
                                    onChange={(e) =>
                                        setDraftParams({ ...draftParams, duration: Math.min(120, Math.max(20, Number(e.target.value) || 30)) })
                                    }
                                />
                            </div>

                            <div className="grid gap-2 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="level">Niveau</Label>
                                    <Select
                                        value={draftParams.level}
                                        onValueChange={(v) => setDraftParams({ ...draftParams, level: v as WorkoutParams["level"] })}
                                    >
                                        <SelectTrigger id="level" aria-label="Niveau">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Debutant">Debutant</SelectItem>
                                            <SelectItem value="Intermediaire">Intermediaire</SelectItem>
                                            <SelectItem value="Avance">Avance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="equipment">Equipement</Label>
                                    <Select
                                        value={draftParams.equipment}
                                        onValueChange={(v) => setDraftParams({ ...draftParams, equipment: v as WorkoutParams["equipment"] })}
                                    >
                                        <SelectTrigger id="equipment" aria-label="Equipement">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="GYM">Salle de sport</SelectItem>
                                            <SelectItem value="NONE">A la maison (sans materiel)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Muscles cibles</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {MUSCLE_OPTIONS.map((m) => {
                                        const checked = draftParams.target_muscles.includes(m.id);
                                        return (
                                            <label
                                                key={m.id}
                                                className="flex items-center gap-2 rounded-md border border-border bg-card p-2 text-sm cursor-pointer hover:bg-accent"
                                            >
                                                <Checkbox
                                                    checked={checked}
                                                    onCheckedChange={() => toggleMuscle(m.id)}
                                                    aria-label={m.label}
                                                />
                                                {m.label}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setParamsOpen(false)} disabled={generating}>
                                Annuler
                            </Button>
                            <Button onClick={() => handleGenerate(draftParams)} disabled={generating} className="gap-2">
                                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                {generating ? "Generation..." : "Generer"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </header>

            {isDemo && (
                <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 text-sm text-yellow-700 dark:text-yellow-400">
                    Donnees de demonstration. Cliquez &quot;Generer un programme&quot; pour obtenir un plan personnalise.
                </div>
            )}

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
