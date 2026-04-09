"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toaster";
import { GOALS_OPTIONS, ALLERGIES_OPTIONS } from "@/lib/schemas/wizard-schemas";
import { apiFetch } from "@/lib/api";
import { Save, User, Target, CreditCard, Crown, Gem } from "lucide-react";
import { useEffect, useState } from "react";

type SubscriptionTier = "free" | "premium" | "premium_plus";

interface UserSettings {
    email?: string;
    age?: number;
    weight?: number;
    is_premium?: boolean;
    subscription_tier?: SubscriptionTier;
    goals?: string[];
    allergies?: string[];
}

const DEMO_SETTINGS: UserSettings = {
    email: "utilisateur@example.com",
    age: 28,
    weight: 74.5,
    is_premium: false,
    subscription_tier: "free",
    goals: ["weight-loss", "wellness"],
    allergies: ["none"],
};

export default function SettingsPage() {
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function fetchSettings() {
            try {
                const response = await apiFetch<{ data: { user: UserSettings } }>("/api/home");
                setSettings(response.data.user);
            } catch {
                setSettings(DEMO_SETTINGS);
            } finally {
                setLoading(false);
            }
        }
        fetchSettings();
    }, []);

    async function handleSaveProfile() {
        setSaving(true);
        try {
            await apiFetch("/api/user/profile", {
                method: "PUT",
                body: JSON.stringify({
                    age: settings?.age,
                    weight: settings?.weight,
                }),
            });
            toast.success("Profil mis a jour");
        } catch {
            toast.error("Impossible de sauvegarder (backend non disponible)");
        } finally {
            setSaving(false);
        }
    }

    async function handleSaveGoals() {
        setSaving(true);
        try {
            await apiFetch("/api/user/goals", {
                method: "PUT",
                body: JSON.stringify({
                    goals: settings?.goals,
                    allergies: settings?.allergies,
                }),
            });
            toast.success("Objectifs mis a jour");
        } catch {
            toast.error("Impossible de sauvegarder (backend non disponible)");
        } finally {
            setSaving(false);
        }
    }

    function toggleGoal(goalId: string) {
        setSettings((prev) => {
            if (!prev) return prev;
            const goals = prev.goals || [];
            return {
                ...prev,
                goals: goals.includes(goalId)
                    ? goals.filter((g) => g !== goalId)
                    : [...goals, goalId],
            };
        });
    }

    function toggleAllergy(allergyId: string) {
        setSettings((prev) => {
            if (!prev) return prev;
            const allergies = prev.allergies || [];
            if (allergyId === "none") {
                return { ...prev, allergies: ["none"] };
            }
            const filtered = allergies.filter((a) => a !== "none");
            return {
                ...prev,
                allergies: filtered.includes(allergyId)
                    ? filtered.filter((a) => a !== allergyId)
                    : [...filtered, allergyId],
            };
        });
    }

    if (loading) {
        return (
            <div className="space-y-8">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-80" />
                </div>
                <Skeleton className="h-10 w-96" />
                <Skeleton className="h-[400px]" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Parametres</h1>
                <p className="text-muted-foreground mt-1">
                    Gerez votre profil, vos objectifs et votre abonnement
                </p>
            </header>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="profile" className="gap-2">
                        <User className="h-4 w-4" aria-hidden="true" />
                        Profil
                    </TabsTrigger>
                    <TabsTrigger value="goals" className="gap-2">
                        <Target className="h-4 w-4" aria-hidden="true" />
                        Objectifs
                    </TabsTrigger>
                    <TabsTrigger value="subscription" className="gap-2">
                        <CreditCard className="h-4 w-4" aria-hidden="true" />
                        Abonnement
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations personnelles</CardTitle>
                            <CardDescription>
                                Modifiez vos informations de profil
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={settings?.email || ""}
                                    disabled
                                    className="max-w-md"
                                />
                                <p className="text-xs text-muted-foreground">
                                    L&apos;email ne peut pas etre modifie
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="age">Age</Label>
                                <Input
                                    id="age"
                                    type="number"
                                    min={18}
                                    max={120}
                                    value={settings?.age || ""}
                                    onChange={(e) =>
                                        setSettings((prev) =>
                                            prev ? { ...prev, age: Number(e.target.value) } : prev
                                        )
                                    }
                                    className="max-w-md"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="weight">Poids (kg)</Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    min={30}
                                    max={300}
                                    step={0.1}
                                    value={settings?.weight || ""}
                                    onChange={(e) =>
                                        setSettings((prev) =>
                                            prev ? { ...prev, weight: Number(e.target.value) } : prev
                                        )
                                    }
                                    className="max-w-md"
                                />
                            </div>

                            <Button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="gap-2"
                            >
                                <Save className="h-4 w-4" aria-hidden="true" />
                                {saving ? "Sauvegarde..." : "Sauvegarder"}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="goals">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Objectifs</CardTitle>
                                <CardDescription>
                                    Selectionnez vos objectifs de sante
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {GOALS_OPTIONS.map((goal) => (
                                        <div
                                            key={goal.id}
                                            className="flex items-center space-x-3"
                                        >
                                            <Checkbox
                                                id={`goal-${goal.id}`}
                                                checked={settings?.goals?.includes(goal.id)}
                                                onCheckedChange={() => toggleGoal(goal.id)}
                                            />
                                            <Label
                                                htmlFor={`goal-${goal.id}`}
                                                className="cursor-pointer"
                                            >
                                                {goal.label}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Allergies et restrictions</CardTitle>
                                <CardDescription>
                                    Indiquez vos allergies alimentaires
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {ALLERGIES_OPTIONS.map((allergy) => (
                                        <div
                                            key={allergy.id}
                                            className="flex items-center space-x-3"
                                        >
                                            <Checkbox
                                                id={`allergy-${allergy.id}`}
                                                checked={settings?.allergies?.includes(allergy.id)}
                                                onCheckedChange={() => toggleAllergy(allergy.id)}
                                            />
                                            <Label
                                                htmlFor={`allergy-${allergy.id}`}
                                                className="cursor-pointer"
                                            >
                                                {allergy.label}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Button
                            onClick={handleSaveGoals}
                            disabled={saving}
                            className="gap-2"
                        >
                            <Save className="h-4 w-4" aria-hidden="true" />
                            {saving ? "Sauvegarde..." : "Sauvegarder"}
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="subscription">
                    <Card>
                        <CardHeader>
                            <CardTitle>Abonnement</CardTitle>
                            <CardDescription>
                                Gerez votre plan d&apos;abonnement
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium">Statut actuel :</span>
                                {settings?.subscription_tier === "premium_plus" ? (
                                    <Badge className="gap-1"><Gem className="h-3 w-3" aria-hidden="true" />Premium+</Badge>
                                ) : settings?.subscription_tier === "premium" || settings?.is_premium ? (
                                    <Badge className="gap-1"><Crown className="h-3 w-3" aria-hidden="true" />Premium</Badge>
                                ) : (
                                    <Badge variant="secondary">Freemium</Badge>
                                )}
                            </div>

                            {(!settings?.subscription_tier || settings.subscription_tier === "free") && !settings?.is_premium && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-lg border p-6 space-y-4">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <Crown className="h-5 w-5 text-primary" aria-hidden="true" />
                                            Premium
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Recommandations IA, plans nutritionnels et sportifs detailles, suivi fin des objectifs.
                                        </p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-bold">9,99€</span>
                                            <span className="text-muted-foreground">/mois</span>
                                        </div>
                                        <Button variant="premium" className="w-full gap-2">
                                            <Crown className="h-4 w-4" aria-hidden="true" />
                                            Passer a Premium
                                        </Button>
                                    </div>
                                    <div className="rounded-lg border border-primary p-6 space-y-4 bg-primary/5">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <Gem className="h-5 w-5 text-primary" aria-hidden="true" />
                                            Premium+
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Tout Premium + integration biometrique, objets connectes et consultations nutritionnistes.
                                        </p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-bold">19,99€</span>
                                            <span className="text-muted-foreground">/mois</span>
                                        </div>
                                        <Button variant="premium" className="w-full gap-2">
                                            <Gem className="h-4 w-4" aria-hidden="true" />
                                            Passer a Premium+
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {(settings?.subscription_tier === "premium" || (settings?.is_premium && settings?.subscription_tier !== "premium_plus")) && (
                                <div className="space-y-4">
                                    <div className="rounded-lg border border-primary/50 bg-primary/5 p-6 space-y-2">
                                        <h3 className="text-lg font-semibold">Vous etes Premium</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Vous avez acces aux recommandations IA, plans nutritionnels et sportifs.
                                        </p>
                                    </div>
                                    <div className="rounded-lg border border-primary p-6 space-y-4">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <Gem className="h-5 w-5 text-primary" aria-hidden="true" />
                                            Passez a Premium+
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Debloquez l&apos;integration biometrique, la connexion objets connectes et les consultations nutritionnistes.
                                        </p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-bold">19,99€</span>
                                            <span className="text-muted-foreground">/mois</span>
                                        </div>
                                        <Button variant="premium" className="gap-2">
                                            <Gem className="h-4 w-4" aria-hidden="true" />
                                            Passer a Premium+
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {settings?.subscription_tier === "premium_plus" && (
                                <div className="rounded-lg border border-primary/50 bg-primary/5 p-6 space-y-2">
                                    <h3 className="text-lg font-semibold">Vous etes Premium+</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Vous avez acces a toutes les fonctionnalites, y compris l&apos;integration biometrique et les consultations nutritionnistes.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
