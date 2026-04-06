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
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, Crown, TrendingUp, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { usePremiumStatus } from "@/lib/hooks/use-premium-status";

interface Client {
    id: string;
    name: string;
    email: string;
    subscription_tier: "free" | "premium" | "premium_plus";
    last_active: string;
    joined: string;
    calories_avg: number;
    workouts_count: number;
}

const DEMO_CLIENTS: Client[] = [
    { id: "1", name: "Marie Dupont", email: "marie.dupont@email.com", subscription_tier: "premium", last_active: "2026-04-06", joined: "2025-11-15", calories_avg: 1920, workouts_count: 12 },
    { id: "2", name: "Thomas Martin", email: "t.martin@email.com", subscription_tier: "free", last_active: "2026-04-05", joined: "2026-01-08", calories_avg: 2150, workouts_count: 3 },
    { id: "3", name: "Sophie Bernard", email: "sophie.b@email.com", subscription_tier: "premium_plus", last_active: "2026-04-06", joined: "2025-09-22", calories_avg: 1780, workouts_count: 18 },
    { id: "4", name: "Lucas Petit", email: "lucas.petit@email.com", subscription_tier: "premium", last_active: "2026-04-04", joined: "2026-02-14", calories_avg: 2300, workouts_count: 8 },
    { id: "5", name: "Emma Leroy", email: "emma.leroy@email.com", subscription_tier: "free", last_active: "2026-04-01", joined: "2026-03-20", calories_avg: 1650, workouts_count: 1 },
    { id: "6", name: "Hugo Moreau", email: "h.moreau@email.com", subscription_tier: "premium", last_active: "2026-04-06", joined: "2025-12-01", calories_avg: 2050, workouts_count: 15 },
    { id: "7", name: "Lea Fournier", email: "lea.f@email.com", subscription_tier: "free", last_active: "2026-03-28", joined: "2026-03-10", calories_avg: 1900, workouts_count: 0 },
    { id: "8", name: "Nathan Girard", email: "nathan.g@email.com", subscription_tier: "premium_plus", last_active: "2026-04-06", joined: "2025-10-05", calories_avg: 1850, workouts_count: 22 },
];

function isActiveRecently(dateStr: string): boolean {
    const diff = Date.now() - new Date(dateStr).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000; // 7 jours
}

export default function ClientsPage() {
    const { isPremiumPlus, isLoading: tierLoading } = usePremiumStatus();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchClients() {
            try {
                const response = await apiFetch<{ data: Client[] }>("/api/clients");
                setClients(response.data);
            } catch {
                setClients(DEMO_CLIENTS);
            } finally {
                setLoading(false);
            }
        }
        fetchClients();
    }, []);

    if (loading || tierLoading) {
        return (
            <div className="space-y-8">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-80" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-28" />
                    ))}
                </div>
                <Skeleton className="h-[400px]" />
            </div>
        );
    }

    if (!isPremiumPlus) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <ShieldCheck className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                </div>
                <h1 className="text-2xl font-bold">Acces reserve</h1>
                <p className="text-muted-foreground max-w-md">
                    La gestion des clients est reservee aux comptes B2B et partenaires.
                    Contactez votre administrateur ou passez a l&apos;offre Premium+ pour acceder a cette fonctionnalite.
                </p>
                <Button variant="premium" className="gap-2" asChild>
                    <a href="/dashboard/settings">
                        <Crown className="h-4 w-4" aria-hidden="true" />
                        Voir les offres
                    </a>
                </Button>
            </div>
        );
    }

    const totalClients = clients.length;
    const activeClients = clients.filter((c) => isActiveRecently(c.last_active)).length;
    const premiumClients = clients.filter((c) => c.subscription_tier !== "free").length;
    const premiumRate = totalClients > 0 ? Math.round((premiumClients / totalClients) * 100) : 0;
    const avgCalories = totalClients > 0 ? Math.round(clients.reduce((sum, c) => sum + c.calories_avg, 0) / totalClients) : 0;

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
                <p className="text-muted-foreground mt-1">
                    Gerez et suivez les utilisateurs de votre plateforme
                </p>
            </header>

            <section aria-labelledby="clients-stats-heading">
                <h2 id="clients-stats-heading" className="sr-only">Statistiques clients</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total clients</CardTitle>
                            <Users className="h-4 w-4 text-primary" aria-hidden="true" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalClients}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Actifs (7j)</CardTitle>
                            <UserCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activeClients}</div>
                            <p className="text-xs text-muted-foreground">sur {totalClients}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Taux Premium</CardTitle>
                            <Crown className="h-4 w-4 text-primary" aria-hidden="true" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{premiumRate}%</div>
                            <p className="text-xs text-muted-foreground">{premiumClients} abonnes</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Calories moy.</CardTitle>
                            <TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{avgCalories}</div>
                            <p className="text-xs text-muted-foreground">kcal/jour</p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <section aria-labelledby="clients-table-heading">
                <h2 id="clients-table-heading" className="sr-only">Liste des clients</h2>
                <Card>
                    <CardHeader>
                        <CardTitle>Liste des clients</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 relative">
                        <div className="pointer-events-none select-none blur-[6px]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nom</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Abonnement</TableHead>
                                        <TableHead>Inscription</TableHead>
                                        <TableHead className="text-right">Cal. moy.</TableHead>
                                        <TableHead className="text-right">Seances</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {clients.map((client) => (
                                        <TableRow key={client.id}>
                                            <TableCell className="font-medium">{client.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{client.email}</TableCell>
                                            <TableCell><Badge variant="secondary">***</Badge></TableCell>
                                            <TableCell className="text-sm">** *** ****</TableCell>
                                            <TableCell className="text-right">****</TableCell>
                                            <TableCell className="text-right">**</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background border">
                                <ShieldCheck className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                            </div>
                            <p className="text-sm font-medium">Donnees protegees</p>
                            <p className="text-xs text-muted-foreground">Connectez-vous en tant qu&apos;administrateur</p>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
