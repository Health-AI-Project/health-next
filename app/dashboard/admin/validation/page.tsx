"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KpiCard } from "@/components/ui/kpi-card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, Clock, AlertTriangle, Eye } from "lucide-react";
import { DATASET_LABELS, STATUS_LABELS } from "@/lib/mocks/admin";
import {
    approveValidationItem,
    fetchValidationQueue,
    rejectValidationItem,
} from "@/lib/api/admin";
import type { ValidationItem, ValidationStatus } from "@/types/admin";
import { toast } from "sonner";

function StatusBadge({ status }: { status: ValidationStatus }) {
    if (status === "VALIDATED") {
        return (
            <Badge className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-200 gap-1">
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                {STATUS_LABELS.VALIDATED}
            </Badge>
        );
    }
    if (status === "REJECTED") {
        return (
            <Badge variant="destructive" className="gap-1">
                <XCircle className="h-3 w-3" aria-hidden="true" />
                {STATUS_LABELS.REJECTED}
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="border-amber-500 text-amber-900 dark:text-amber-200 gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {STATUS_LABELS.PENDING}
        </Badge>
    );
}

function formatRelative(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const hours = diff / 3600000;
    if (hours < 1) return `il y a ${Math.round(diff / 60000)} min`;
    if (hours < 24) return `il y a ${Math.round(hours)} h`;
    return `il y a ${Math.round(hours / 24)} j`;
}

interface DiffViewProps {
    item: ValidationItem;
}

function DiffView({ item }: DiffViewProps) {
    const suggested = (item.payload.suggested_fix ?? {}) as Record<string, unknown>;
    const anomalyField = Object.keys(suggested)[0];
    const currentValue = anomalyField ? item.payload[anomalyField] : null;
    const suggestedValue = anomalyField ? suggested[anomalyField] : null;

    return (
        <div className="space-y-3">
            <div className="rounded-md border bg-muted/50 p-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Payload original</p>
                <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(item.payload, null, 2)}
                </pre>
            </div>

            {anomalyField && suggestedValue != null && (
                <div className="rounded-md border border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-3">
                    <p className="text-xs font-medium text-emerald-900 dark:text-emerald-200 mb-2 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                        Correction suggérée par le pipeline
                    </p>
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center text-sm font-mono">
                        <div>
                            <span className="text-xs text-muted-foreground">{anomalyField} actuel</span>
                            <p className="text-rose-700 dark:text-rose-400 line-through">
                                {String(currentValue)}
                            </p>
                        </div>
                        <span aria-hidden="true">→</span>
                        <div>
                            <span className="text-xs text-muted-foreground">proposé</span>
                            <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                                {String(suggestedValue)}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ValidationPage() {
    const [items, setItems] = useState<ValidationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewing, setViewing] = useState<ValidationItem | null>(null);
    const [viewOpen, setViewOpen] = useState(false);

    useEffect(() => {
        let cancelled = false;
        fetchValidationQueue()
            .then((data) => {
                if (!cancelled) setItems(data);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const pending = useMemo(() => items.filter((i) => i.status === "PENDING"), [items]);
    const history = useMemo(() => items.filter((i) => i.status !== "PENDING"), [items]);

    const stats = {
        pending: pending.length,
        validated_24h: history.filter(
            (i) => i.reviewed_at && Date.now() - new Date(i.reviewed_at).getTime() < 86400000 && i.status === "VALIDATED",
        ).length,
        rejected_24h: history.filter(
            (i) => i.reviewed_at && Date.now() - new Date(i.reviewed_at).getTime() < 86400000 && i.status === "REJECTED",
        ).length,
    };

    const handleApprove = async (id: number) => {
        const result = await approveValidationItem(id);
        setItems((current) =>
            current.map((i) =>
                i.id === id
                    ? result ?? {
                        ...i,
                        status: "VALIDATED",
                        reviewed_by: "admin@healthai.coach",
                        reviewed_at: new Date().toISOString(),
                    }
                    : i,
            ),
        );
        toast.success("Lot approuvé — passage en production");
    };

    const handleReject = async (id: number) => {
        const result = await rejectValidationItem(id);
        setItems((current) =>
            current.map((i) =>
                i.id === id
                    ? result ?? {
                        ...i,
                        status: "REJECTED",
                        reviewed_by: "admin@healthai.coach",
                        reviewed_at: new Date().toISOString(),
                    }
                    : i,
            ),
        );
        toast.success("Lot rejeté — retour à l'ingestion");
    };

    const handleView = (item: ValidationItem) => {
        setViewing(item);
        setViewOpen(true);
    };

    const pendingColumns: DataTableColumn<ValidationItem>[] = [
        {
            key: "id",
            header: "Lot",
            accessor: (i) => <span className="font-mono text-xs">#{i.id}</span>,
            sortValue: (i) => i.id,
        },
        {
            key: "entity_type",
            header: "Source",
            accessor: (i) => DATASET_LABELS[i.entity_type] ?? i.entity_type,
        },
        {
            key: "entity_id",
            header: "Entité",
            accessor: (i) => <span className="font-mono text-xs">{i.entity_id}</span>,
        },
        {
            key: "anomaly",
            header: "Anomalie",
            sortable: false,
            accessor: (i) => {
                const anomaly = i.payload.anomaly as string | undefined;
                return anomaly ? (
                    <Badge variant="outline" className="text-xs">
                        {anomaly}
                    </Badge>
                ) : (
                    "—"
                );
            },
        },
        {
            key: "created_at",
            header: "Soumis",
            accessor: (i) => <span className="text-xs text-muted-foreground">{formatRelative(i.created_at)}</span>,
            sortValue: (i) => new Date(i.created_at).getTime(),
        },
        {
            key: "actions",
            header: "Actions",
            sortable: false,
            accessor: (i) => (
                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleView(i);
                        }}
                        aria-label={`Examiner le lot ${i.id}`}
                    >
                        <Eye className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-emerald-500 text-emerald-900 hover:bg-emerald-50 dark:text-emerald-200 dark:hover:bg-emerald-950/30"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(i.id);
                        }}
                        aria-label={`Approuver le lot ${i.id}`}
                    >
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        Approuver
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-rose-500 text-rose-900 hover:bg-rose-50 dark:text-rose-200 dark:hover:bg-rose-950/30"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleReject(i.id);
                        }}
                        aria-label={`Rejeter le lot ${i.id}`}
                    >
                        <XCircle className="h-4 w-4" aria-hidden="true" />
                        Rejeter
                    </Button>
                </div>
            ),
            className: "w-72",
        },
    ];

    const historyColumns: DataTableColumn<ValidationItem>[] = [
        {
            key: "id",
            header: "Lot",
            accessor: (i) => <span className="font-mono text-xs">#{i.id}</span>,
            sortValue: (i) => i.id,
        },
        {
            key: "entity_type",
            header: "Source",
            accessor: (i) => DATASET_LABELS[i.entity_type] ?? i.entity_type,
        },
        {
            key: "status",
            header: "Décision",
            accessor: (i) => <StatusBadge status={i.status} />,
        },
        {
            key: "reviewed_by",
            header: "Décideur",
            accessor: (i) => i.reviewed_by ?? "—",
        },
        {
            key: "reviewed_at",
            header: "Date",
            accessor: (i) =>
                i.reviewed_at ? (
                    <span className="text-xs text-muted-foreground">{formatRelative(i.reviewed_at)}</span>
                ) : (
                    "—"
                ),
            sortValue: (i) => (i.reviewed_at ? new Date(i.reviewed_at).getTime() : 0),
        },
        {
            key: "actions",
            header: "",
            sortable: false,
            accessor: (i) => (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleView(i);
                    }}
                    aria-label={`Examiner le lot ${i.id}`}
                >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    Détails
                </Button>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="space-y-8">
                <header className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Validation</h1>
                    <p className="text-muted-foreground">Chargement de la file d&apos;attente...</p>
                </header>
                <div className="grid gap-4 sm:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <Skeleton className="h-96" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Validation</h1>
                <p className="text-muted-foreground">
                    File d&apos;attente des lots de données importés. Vérifiez le diff avant/après nettoyage, puis approuvez
                    ou rejetez chaque lot.
                </p>
            </header>

            <section aria-labelledby="val-kpis">
                <h2 id="val-kpis" className="sr-only">Statistiques de validation</h2>
                <div className="grid gap-4 sm:grid-cols-3">
                    <KpiCard label="En attente" value={stats.pending} icon={Clock} />
                    <KpiCard label="Validés (24h)" value={stats.validated_24h} icon={CheckCircle2} />
                    <KpiCard label="Rejetés (24h)" value={stats.rejected_24h} icon={XCircle} />
                </div>
            </section>

            <Tabs defaultValue="pending">
                <TabsList>
                    <TabsTrigger value="pending">
                        En attente
                        {pending.length > 0 && (
                            <Badge variant="secondary" className="ml-2">
                                {pending.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="history">Historique</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                                Lots à examiner
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                columns={pendingColumns}
                                data={pending}
                                rowId={(i) => String(i.id)}
                                pageSize={10}
                                emptyMessage="Aucun lot en attente de validation 🎉"
                                caption="Lots de données en attente d'approbation par un administrateur"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historique des décisions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                columns={historyColumns}
                                data={history}
                                rowId={(i) => String(i.id)}
                                pageSize={10}
                                emptyMessage="Aucune décision dans l'historique"
                                caption="Lots déjà validés ou rejetés avec auteur et timestamp"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={viewOpen} onOpenChange={setViewOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Détails du lot {viewing?.id}</DialogTitle>
                        <DialogDescription>
                            {viewing && DATASET_LABELS[viewing.entity_type]} — entité <span className="font-mono">{viewing?.entity_id}</span>
                        </DialogDescription>
                    </DialogHeader>

                    {viewing && (
                        <>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Statut :</span>
                                <StatusBadge status={viewing.status} />
                            </div>

                            <DiffView item={viewing} />

                            {viewing.reviewed_by && (
                                <div className="rounded-md border bg-muted/30 p-3 text-sm">
                                    <p>
                                        <span className="text-muted-foreground">Décideur : </span>
                                        <span className="font-medium">{viewing.reviewed_by}</span>
                                    </p>
                                    {viewing.reviewed_at && (
                                        <p>
                                            <span className="text-muted-foreground">Date : </span>
                                            <time dateTime={viewing.reviewed_at}>
                                                {new Date(viewing.reviewed_at).toLocaleString("fr-FR")}
                                            </time>
                                        </p>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    <DialogFooter className="gap-2">
                        {viewing?.status === "PENDING" && (
                            <>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => {
                                        if (viewing) handleReject(viewing.id);
                                        setViewOpen(false);
                                    }}
                                >
                                    <XCircle className="h-4 w-4" aria-hidden="true" />
                                    Rejeter le lot
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        if (viewing) handleApprove(viewing.id);
                                        setViewOpen(false);
                                    }}
                                >
                                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                                    Approuver le lot
                                </Button>
                            </>
                        )}
                        {viewing?.status !== "PENDING" && (
                            <Button type="button" variant="outline" onClick={() => setViewOpen(false)}>
                                Fermer
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
