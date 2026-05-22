"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, Database, RefreshCw, X } from "lucide-react";

import { apiFetch, invalidateCache } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type QueueStatus = "PENDING" | "VALIDATED" | "REJECTED" | "ALL";

interface ApiList<T> {
    data: T[];
    meta?: { count?: number };
}

interface EtlRun {
    run_id: number;
    source_type: string;
    source_name: string;
    status: string;
    rows_inserted: number;
    rows_rejected: number;
    started_at?: string;
}

interface RejectedRow {
    id: number;
    source_file: string;
    reason: string;
    created_at?: string;
}

interface ValidationItem {
    id: number;
    entity_type: string;
    entity_id: string;
    status: "PENDING" | "VALIDATED" | "REJECTED";
    payload: Record<string, unknown>;
    reviewed_by?: string | null;
    created_at?: string;
}

const DEMO_RUNS: EtlRun[] = [
    {
        run_id: 1,
        source_type: "nutrition",
        source_name: "nutrition_sample.csv",
        status: "success",
        rows_inserted: 18,
        rows_rejected: 2,
    },
];

const DEMO_REJECTED_ROWS: RejectedRow[] = [
    { id: 1, source_file: "nutrition_sample.csv", reason: "invalid_calories" },
    { id: 2, source_file: "biometrics_sample.xlsx", reason: "missing_date" },
];

const DEMO_QUEUE: ValidationItem[] = [
    {
        id: 1,
        entity_type: "etl_rejected_row",
        entity_id: "1",
        status: "PENDING",
        payload: { source_file: "nutrition_sample.csv", reason: "invalid_calories" },
    },
    {
        id: 2,
        entity_type: "etl_rejected_row",
        entity_id: "2",
        status: "PENDING",
        payload: { source_file: "biometrics_sample.xlsx", reason: "missing_date" },
    },
];

function statusBadgeVariant(status: string) {
    if (status === "REJECTED" || status === "failed") return "destructive" as const;
    if (status === "VALIDATED" || status === "success") return "default" as const;
    return "outline" as const;
}

function payloadLabel(payload: Record<string, unknown>) {
    const sourceFile = payload.source_file ? String(payload.source_file) : null;
    const reason = payload.reason ? String(payload.reason) : null;
    if (sourceFile && reason) return `${sourceFile} - ${reason}`;
    return JSON.stringify(payload);
}

export default function DataQualityPage() {
    const [runs, setRuns] = useState<EtlRun[]>([]);
    const [rejectedRows, setRejectedRows] = useState<RejectedRow[]>([]);
    const [queue, setQueue] = useState<ValidationItem[]>([]);
    const [status, setStatus] = useState<QueueStatus>("PENDING");
    const [loading, setLoading] = useState(true);
    const [demoMode, setDemoMode] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    async function loadQualityData(selectedStatus: QueueStatus = status) {
        setLoading(true);
        try {
            const [runsResponse, rejectedResponse, queueResponse] = await Promise.all([
                apiFetch<ApiList<EtlRun>>("/api/v1/etl/runs"),
                apiFetch<ApiList<RejectedRow>>("/api/v1/etl/rejected-rows"),
                apiFetch<ApiList<ValidationItem>>(`/api/v1/etl/validation-queue?status=${selectedStatus}`),
            ]);
            setRuns(runsResponse.data);
            setRejectedRows(rejectedResponse.data);
            setQueue(queueResponse.data);
            setDemoMode(false);
        } catch {
            setRuns(DEMO_RUNS);
            setRejectedRows(DEMO_REJECTED_ROWS);
            setQueue(selectedStatus === "ALL" ? DEMO_QUEUE : DEMO_QUEUE.filter((item) => item.status === selectedStatus));
            setDemoMode(true);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadQualityData(status);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    const totals = useMemo(() => {
        return runs.reduce(
            (acc, run) => ({
                inserted: acc.inserted + Number(run.rows_inserted || 0),
                rejected: acc.rejected + Number(run.rows_rejected || 0),
            }),
            { inserted: 0, rejected: 0 },
        );
    }, [runs]);

    async function reviewItem(itemId: number, nextStatus: "VALIDATED" | "REJECTED") {
        if (demoMode) {
            setQueue((items) => items.map((item) => (item.id === itemId ? { ...item, status: nextStatus } : item)));
            setMessage(`Element marque ${nextStatus} en mode demonstration.`);
            return;
        }

        await apiFetch<{ data: ValidationItem }>(`/api/v1/etl/validation-queue/${itemId}`, {
            method: "PATCH",
            body: JSON.stringify({ status: nextStatus, reviewed_by: "admin@healthai.local" }),
        });
        invalidateCache();
        setMessage(`Element marque ${nextStatus}.`);
        await loadQualityData(status);
    }

    return (
        <div className="space-y-8">
            <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Qualite des donnees</h1>
                    <p className="mt-1 text-muted-foreground">
                        Controle des imports ETL, des rejets et du workflow de validation.
                    </p>
                </div>
                <Button variant="outline" onClick={() => loadQualityData(status)} disabled={loading}>
                    <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                    Actualiser
                </Button>
            </header>

            {demoMode && (
                <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <p>
                        Donnees de demonstration : l&apos;API FastAPI qualite n&apos;est pas disponible ou a retourne une erreur.
                    </p>
                </div>
            )}

            {message && (
                <div className="rounded-lg border bg-muted p-3 text-sm" role="status">
                    {message}
                </div>
            )}

            <section className="grid gap-4 md:grid-cols-3" aria-label="Indicateurs qualite">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Runs ETL</CardTitle>
                        <Database className="h-4 w-4 text-primary" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{runs.length}</div>
                        <p className="text-xs text-muted-foreground">dernieres executions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Lignes inserees</CardTitle>
                        <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totals.inserted}</div>
                        <p className="text-xs text-muted-foreground">sur les imports recents</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Rejets</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-primary" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totals.rejected || rejectedRows.length}</div>
                        <p className="text-xs text-muted-foreground">a analyser avant production</p>
                    </CardContent>
                </Card>
            </section>

            <section className="space-y-4" aria-labelledby="queue-heading">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h2 id="queue-heading" className="text-xl font-semibold">
                            File de validation
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Les lignes rejetees restent bloquees tant qu&apos;elles ne sont pas validees ou rejetees.
                        </p>
                    </div>
                    <div className="w-full md:w-56">
                        <Select value={status} onValueChange={(value) => setStatus(value as QueueStatus)}>
                            <SelectTrigger aria-label="Filtrer par statut">
                                <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PENDING">PENDING</SelectItem>
                                <SelectItem value="VALIDATED">VALIDATED</SelectItem>
                                <SelectItem value="REJECTED">REJECTED</SelectItem>
                                <SelectItem value="ALL">Tous</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Elements a controler</CardTitle>
                        <CardDescription>Actions disponibles sur les items issus de `data_validation_queue`.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Objet</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Payload</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {queue.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.id}</TableCell>
                                        <TableCell>{item.entity_type} #{item.entity_id}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusBadgeVariant(item.status)}>{item.status}</Badge>
                                        </TableCell>
                                        <TableCell className="max-w-[360px] truncate">{payloadLabel(item.payload)}</TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => reviewItem(item.id, "VALIDATED")}
                                                    disabled={item.status === "VALIDATED"}
                                                >
                                                    <Check className="mr-2 h-4 w-4" aria-hidden="true" />
                                                    Valider
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => reviewItem(item.id, "REJECTED")}
                                                    disabled={item.status === "REJECTED"}
                                                >
                                                    <X className="mr-2 h-4 w-4" aria-hidden="true" />
                                                    Rejeter
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!loading && queue.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                                            Aucun element pour ce statut.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </section>

            <section className="space-y-4" aria-labelledby="runs-heading">
                <h2 id="runs-heading" className="text-xl font-semibold">
                    Historique ETL recent
                </h2>
                <Card>
                    <CardContent className="pt-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Run</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead className="text-right">Inserees</TableHead>
                                    <TableHead className="text-right">Rejetees</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {runs.map((run) => (
                                    <TableRow key={run.run_id}>
                                        <TableCell>{run.run_id}</TableCell>
                                        <TableCell>{run.source_name}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusBadgeVariant(run.status)}>{run.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">{run.rows_inserted}</TableCell>
                                        <TableCell className="text-right">{run.rows_rejected}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
