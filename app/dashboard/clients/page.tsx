"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Users,
    UserCheck,
    Crown,
    TrendingUp,
    ShieldCheck,
    Shield,
    UserCog,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePremiumStatus, type SubscriptionTier } from "@/lib/hooks/use-premium-status";
import { useUserRole, setDemoAdmin } from "@/lib/hooks/use-user-role";

type ClientRole = "user" | "admin";

interface Client {
    id: string;
    name: string;
    email: string;
    subscription_tier: SubscriptionTier;
    role: ClientRole;
    last_active: string;
    joined: string;
    calories_avg: number;
    workouts_count: number;
}

const DEMO_CLIENTS: Client[] = [
    { id: "1", name: "Marie Dupont", email: "marie.dupont@email.com", subscription_tier: "premium", role: "user", last_active: "2026-04-06", joined: "2025-11-15", calories_avg: 1920, workouts_count: 12 },
    { id: "2", name: "Thomas Martin", email: "t.martin@email.com", subscription_tier: "free", role: "user", last_active: "2026-04-05", joined: "2026-01-08", calories_avg: 2150, workouts_count: 3 },
    { id: "3", name: "Sophie Bernard", email: "sophie.b@email.com", subscription_tier: "premium_plus", role: "admin", last_active: "2026-04-06", joined: "2025-09-22", calories_avg: 1780, workouts_count: 18 },
    { id: "4", name: "Lucas Petit", email: "lucas.petit@email.com", subscription_tier: "premium", role: "user", last_active: "2026-04-04", joined: "2026-02-14", calories_avg: 2300, workouts_count: 8 },
    { id: "5", name: "Emma Leroy", email: "emma.leroy@email.com", subscription_tier: "free", role: "user", last_active: "2026-04-01", joined: "2026-03-20", calories_avg: 1650, workouts_count: 1 },
    { id: "6", name: "Hugo Moreau", email: "h.moreau@email.com", subscription_tier: "premium", role: "user", last_active: "2026-04-06", joined: "2025-12-01", calories_avg: 2050, workouts_count: 15 },
    { id: "7", name: "Lea Fournier", email: "lea.f@email.com", subscription_tier: "free", role: "user", last_active: "2026-03-28", joined: "2026-03-10", calories_avg: 1900, workouts_count: 0 },
    { id: "8", name: "Nathan Girard", email: "nathan.g@email.com", subscription_tier: "premium_plus", role: "user", last_active: "2026-04-06", joined: "2025-10-05", calories_avg: 1850, workouts_count: 22 },
];

function isActiveRecently(dateStr: string): boolean {
    const diff = Date.now() - new Date(dateStr).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
}

function tierLabel(tier: SubscriptionTier): string {
    if (tier === "premium_plus") return "Premium+";
    if (tier === "premium") return "Premium";
    return "Free";
}

function tierBadgeVariant(tier: SubscriptionTier): "default" | "secondary" | "outline" {
    if (tier === "premium_plus") return "default";
    if (tier === "premium") return "secondary";
    return "outline";
}

export default function ClientsPage() {
    const { isPremiumPlus, isLoading: tierLoading } = usePremiumStatus();
    const { isAdmin, isLoading: roleLoading } = useUserRole();
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

    const stats = useMemo(() => {
        const total = clients.length;
        const active = clients.filter((c) => isActiveRecently(c.last_active)).length;
        const premium = clients.filter((c) => c.subscription_tier !== "free").length;
        const admins = clients.filter((c) => c.role === "admin").length;
        const premiumRate = total > 0 ? Math.round((premium / total) * 100) : 0;
        const avgCalories = total > 0 ? Math.round(clients.reduce((sum, c) => sum + c.calories_avg, 0) / total) : 0;
        return { total, active, premium, premiumRate, avgCalories, admins };
    }, [clients]);

    function updateClientTier(id: string, tier: SubscriptionTier) {
        setClients((prev) => prev.map((c) => (c.id === id ? { ...c, subscription_tier: tier } : c)));
        apiFetch(`/api/clients/${id}/tier`, {
            method: "PATCH",
            body: JSON.stringify({ subscription_tier: tier }),
        }).catch(() => {
            // demo mode : la mutation reste locale
        });
    }

    function updateClientRole(id: string, role: ClientRole) {
        setClients((prev) => prev.map((c) => (c.id === id ? { ...c, role } : c)));
        apiFetch(`/api/clients/${id}/role`, {
            method: "PATCH",
            body: JSON.stringify({ role }),
        }).catch(() => {
            // demo mode : la mutation reste locale
        });
    }

    if (loading || tierLoading || roleLoading) {
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

    if (!isPremiumPlus && !isAdmin) {
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
                <div className="pt-6 border-t border-border w-full max-w-md mt-4">
                    <p className="text-xs text-muted-foreground mb-2">Mode demonstration</p>
                    <Button variant="outline" size="sm" onClick={() => setDemoAdmin(true)} className="gap-2">
                        <Shield className="h-4 w-4" aria-hidden="true" />
                        Activer le role admin (demo)
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
                        {isAdmin && (
                            <Badge variant="default" className="gap-1">
                                <Shield className="h-3 w-3" aria-hidden="true" />
                                Administrateur
                            </Badge>
                        )}
                    </div>
                    <p className="text-muted-foreground mt-1">
                        {isAdmin
                            ? "Gerez les roles et les abonnements des utilisateurs de la plateforme"
                            : "Suivez les statistiques agregees de vos clients"}
                    </p>
                </div>
                {isAdmin && (
                    <Button variant="outline" size="sm" onClick={() => setDemoAdmin(false)} className="gap-2">
                        <UserCog className="h-4 w-4" aria-hidden="true" />
                        Quitter le mode admin (demo)
                    </Button>
                )}
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
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Actifs (7j)</CardTitle>
                            <UserCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active}</div>
                            <p className="text-xs text-muted-foreground">sur {stats.total}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Taux Premium</CardTitle>
                            <Crown className="h-4 w-4 text-primary" aria-hidden="true" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.premiumRate}%</div>
                            <p className="text-xs text-muted-foreground">{stats.premium} abonnes</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {isAdmin ? "Administrateurs" : "Calories moy."}
                            </CardTitle>
                            {isAdmin ? (
                                <Shield className="h-4 w-4 text-primary" aria-hidden="true" />
                            ) : (
                                <TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" />
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{isAdmin ? stats.admins : stats.avgCalories}</div>
                            <p className="text-xs text-muted-foreground">{isAdmin ? "comptes admins" : "kcal/jour"}</p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {isAdmin ? (
                <section aria-labelledby="clients-management-heading">
                    <Card>
                        <CardHeader>
                            <CardTitle id="clients-management-heading" className="flex items-center gap-2">
                                <UserCog className="h-5 w-5 text-primary" aria-hidden="true" />
                                Gestion des utilisateurs
                            </CardTitle>
                            <CardDescription>
                                Modifiez le role et l&apos;abonnement de chaque utilisateur.
                                Les changements de role admin doivent etre faits avec precaution.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nom</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Abonnement</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">Inscription</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {clients.map((client) => {
                                        const active = isActiveRecently(client.last_active);
                                        return (
                                            <TableRow key={client.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        {client.name}
                                                        {client.role === "admin" && (
                                                            <Shield className="h-3.5 w-3.5 text-primary" aria-label="Administrateur" />
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{client.email}</TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={client.subscription_tier}
                                                        onValueChange={(v) => updateClientTier(client.id, v as SubscriptionTier)}
                                                    >
                                                        <SelectTrigger className="w-[140px]" aria-label={`Abonnement de ${client.name}`}>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="free">Free</SelectItem>
                                                            <SelectItem value="premium">Premium</SelectItem>
                                                            <SelectItem value="premium_plus">Premium+</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={client.role}
                                                        onValueChange={(v) => updateClientRole(client.id, v as ClientRole)}
                                                    >
                                                        <SelectTrigger className="w-[120px]" aria-label={`Role de ${client.name}`}>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="user">Utilisateur</SelectItem>
                                                            <SelectItem value="admin">Admin</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={active ? "border-green-500 text-green-600" : "border-orange-500 text-orange-600"}
                                                    >
                                                        {active ? "Actif" : "Inactif"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right text-sm text-muted-foreground">
                                                    {new Date(client.joined).toLocaleDateString("fr-FR")}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </section>
            ) : (
                <section aria-labelledby="clients-tiers-heading">
                    <Card>
                        <CardHeader>
                            <CardTitle id="clients-tiers-heading" className="flex items-center gap-2">
                                <Crown className="h-5 w-5 text-primary" aria-hidden="true" />
                                Repartition par abonnement
                            </CardTitle>
                            <CardDescription>
                                Vue agregee anonyme. Seuls les administrateurs peuvent voir les donnees nominatives.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {(["premium_plus", "premium", "free"] as SubscriptionTier[]).map((tier) => {
                                const count = clients.filter((c) => c.subscription_tier === tier).length;
                                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                                return (
                                    <div key={tier} className="flex items-center gap-3">
                                        <Badge variant={tierBadgeVariant(tier)} className="w-24 justify-center">
                                            {tierLabel(tier)}
                                        </Badge>
                                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                            <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className="text-sm text-muted-foreground w-20 text-right">
                                            {count} ({pct}%)
                                        </span>
                                    </div>
                                );
                            })}
                            <div className="pt-4 border-t">
                                <Button variant="outline" size="sm" onClick={() => setDemoAdmin(true)} className="gap-2">
                                    <Shield className="h-4 w-4" aria-hidden="true" />
                                    Activer le role admin (demo)
                                </Button>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Le mode admin permet de visualiser et modifier les utilisateurs nominativement.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            )}
        </div>
    );
}
