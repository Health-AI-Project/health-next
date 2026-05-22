"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Users, Trash2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { fetchUsers, updateUserSubscription, deleteUser } from "@/lib/api/admin";
import type { AdminUser } from "@/types/admin";

const SUBSCRIPTION_LABELS: Record<AdminUser["subscription_status"], string> = {
    FREE: "Freemium",
    PREMIUM: "Premium",
    PREMIUM_PLUS: "Premium+ (admin)",
    B2B: "B2B",
};

const SUBSCRIPTION_COLORS: Record<AdminUser["subscription_status"], string> = {
    FREE: "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-200",
    PREMIUM: "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200",
    PREMIUM_PLUS: "bg-purple-100 text-purple-900 dark:bg-purple-900/30 dark:text-purple-200",
    B2B: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200",
};

function formatDate(iso: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function UsersAdminPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = async () => {
        const data = await fetchUsers();
        setUsers(data);
    };

    useEffect(() => {
        let cancelled = false;
        refresh().finally(() => {
            if (!cancelled) setLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    const handleSubscriptionChange = async (userId: string, newStatus: AdminUser["subscription_status"]) => {
        const updated = await updateUserSubscription(userId, newStatus);
        if (updated) {
            setUsers((current) =>
                current.map((u) => (u.id === userId ? { ...u, subscription_status: newStatus } : u)),
            );
            toast.success(`Abonnement modifié → ${SUBSCRIPTION_LABELS[newStatus]}`);
        } else {
            toast.error("Échec mise à jour");
        }
    };

    const handleDelete = async (userId: string, email: string) => {
        if (!confirm(`Supprimer définitivement ${email} et toutes ses données ?`)) return;
        const ok = await deleteUser(userId);
        if (ok) {
            setUsers((current) => current.filter((u) => u.id !== userId));
            toast.success("Utilisateur supprimé");
        } else {
            toast.error("Échec suppression (peut-être votre propre compte)");
        }
    };

    const stats = {
        total: users.length,
        free: users.filter((u) => u.subscription_status === "FREE").length,
        premium: users.filter((u) => u.subscription_status === "PREMIUM").length,
        premium_plus: users.filter((u) => u.subscription_status === "PREMIUM_PLUS").length,
        b2b: users.filter((u) => u.subscription_status === "B2B").length,
    };

    const columns: DataTableColumn<AdminUser>[] = [
        {
            key: "name",
            header: "Nom",
            accessor: (u) => (
                <div>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
            ),
            sortValue: (u) => u.name,
        },
        {
            key: "age",
            header: "Âge",
            accessor: (u) => (u.age == null ? "—" : `${u.age} ans`),
            sortValue: (u) => u.age ?? 0,
        },
        {
            key: "subscription_status",
            header: "Abonnement",
            accessor: (u) => (
                <Badge className={SUBSCRIPTION_COLORS[u.subscription_status]}>
                    {SUBSCRIPTION_LABELS[u.subscription_status]}
                </Badge>
            ),
        },
        {
            key: "email_verified",
            header: "Vérifié",
            accessor: (u) =>
                u.email_verified ? (
                    <ShieldCheck className="h-4 w-4 text-emerald-600" aria-label="Email vérifié" />
                ) : (
                    <span className="text-xs text-muted-foreground">non</span>
                ),
            sortValue: (u) => (u.email_verified ? 1 : 0),
        },
        {
            key: "created_at",
            header: "Créé le",
            accessor: (u) => <span className="text-xs">{formatDate(u.created_at)}</span>,
            sortValue: (u) => new Date(u.created_at).getTime(),
        },
        {
            key: "actions",
            header: "Actions",
            sortable: false,
            accessor: (u) => (
                <div className="flex items-center gap-2">
                    <Select
                        value={u.subscription_status}
                        onValueChange={(v) => handleSubscriptionChange(u.id, v as AdminUser["subscription_status"])}
                    >
                        <SelectTrigger className="w-40 h-8 text-xs" aria-label={`Changer l'abonnement de ${u.email}`}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="FREE">Freemium</SelectItem>
                            <SelectItem value="PREMIUM">Premium</SelectItem>
                            <SelectItem value="PREMIUM_PLUS">Premium+ (admin)</SelectItem>
                            <SelectItem value="B2B">B2B</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-rose-700 hover:text-rose-900 hover:bg-rose-50 dark:text-rose-300"
                        onClick={() => handleDelete(u.id, u.email)}
                        aria-label={`Supprimer ${u.email}`}
                    >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                </div>
            ),
            className: "w-60",
        },
    ];

    if (loading) {
        return (
            <div className="space-y-8">
                <header>
                    <h1 className="text-3xl font-bold tracking-tight">Utilisateurs</h1>
                    <p className="text-muted-foreground">Chargement...</p>
                </header>
                <Skeleton className="h-96" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Utilisateurs</h1>
                <p className="text-muted-foreground">
                    Gestion des comptes utilisateurs : promotion en admin (PREMIUM_PLUS), changement de tier, suppression.
                </p>
            </header>

            <section aria-labelledby="users-kpis">
                <h2 id="users-kpis" className="sr-only">Statistiques</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs font-medium text-muted-foreground">Total</p>
                            <p className="text-2xl font-bold tabular-nums">{stats.total}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs font-medium text-muted-foreground">Freemium</p>
                            <p className="text-2xl font-bold tabular-nums">{stats.free}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs font-medium text-muted-foreground">Premium</p>
                            <p className="text-2xl font-bold tabular-nums">{stats.premium}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs font-medium text-muted-foreground">Premium+ / Admin</p>
                            <p className="text-2xl font-bold tabular-nums">{stats.premium_plus}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs font-medium text-muted-foreground">B2B</p>
                            <p className="text-2xl font-bold tabular-nums">{stats.b2b}</p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-4 w-4" aria-hidden="true" />
                        Liste des utilisateurs
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={users}
                        rowId={(u) => u.id}
                        pageSize={20}
                        searchableKeys={["name", "email"]}
                        searchPlaceholder="Rechercher par nom ou email..."
                        emptyMessage="Aucun utilisateur"
                        caption="Liste de tous les utilisateurs avec leur abonnement et actions admin"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
