"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/ui/kpi-card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend,
} from "recharts";
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Database,
    XCircle,
    Clock,
} from "lucide-react";
import { DATASET_LABELS, STATUS_LABELS } from "@/lib/mocks/admin";
import { fetchDataQualityMetrics, fetchEtlRuns } from "@/lib/api/admin";
import type {
    DataQualityMetrics,
    EtlRun,
    EtlRunStatus,
} from "@/types/admin";

function StatusBadge({ status }: { status: EtlRunStatus }) {
    const config: Record<EtlRunStatus, { variant: "default" | "outline" | "destructive" | "secondary"; className: string }> = {
        success: { variant: "default", className: "bg-emerald-100 text-emerald-900 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-200" },
        failed: { variant: "destructive", className: "" },
        partial: { variant: "outline", className: "border-amber-500 text-amber-900 dark:text-amber-200" },
        running: { variant: "secondary", className: "" },
        pending: { variant: "outline", className: "" },
    };
    const c = config[status];
    return (
        <Badge variant={c.variant} className={c.className}>
            {STATUS_LABELS[status] ?? status}
        </Badge>
    );
}

function formatDuration(startIso: string, endIso: string | null): string {
    if (!endIso) return "—";
    const seconds = Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

function formatRelative(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const hours = diff / 3600000;
    if (hours < 1) return `il y a ${Math.round(diff / 60000)} min`;
    if (hours < 24) return `il y a ${Math.round(hours)} h`;
    return `il y a ${Math.round(hours / 24)} j`;
}

export default function DataQualityPage() {
    const [metrics, setMetrics] = useState<DataQualityMetrics | null>(null);
    const [runs, setRuns] = useState<EtlRun[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        Promise.all([fetchDataQualityMetrics(), fetchEtlRuns(50)])
            .then(([m, r]) => {
                if (!cancelled) {
                    setMetrics(m);
                    setRuns(r);
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const successRate = useMemo(() => {
        if (!metrics || metrics.total_runs_24h === 0) return 0;
        return (metrics.successful_runs_24h / metrics.total_runs_24h) * 100;
    }, [metrics]);

    if (loading || !metrics) {
        return (
            <div className="space-y-8">
                <header className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Qualité des données</h1>
                    <p className="text-muted-foreground">Chargement des métriques...</p>
                </header>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <Skeleton className="h-80" />
                <Skeleton className="h-96" />
            </div>
        );
    }

    const sourceChartData = metrics.by_source.map((s) => ({
        source: DATASET_LABELS[s.source] ?? s.source,
        inserted: s.rows_inserted,
        rejected: s.rows_rejected,
    }));

    const runColumns: DataTableColumn<EtlRun>[] = [
        {
            key: "id",
            header: "Run",
            accessor: (r) => <span className="font-mono text-xs">#{r.id}</span>,
            sortValue: (r) => r.id,
        },
        {
            key: "source_name",
            header: "Source",
            accessor: (r) => (
                <span>
                    {DATASET_LABELS[r.source_name] ?? r.source_name}
                    <span className="ml-2 text-xs uppercase text-muted-foreground">{r.source_type}</span>
                </span>
            ),
        },
        {
            key: "status",
            header: "Statut",
            accessor: (r) => <StatusBadge status={r.status} />,
        },
        {
            key: "rows_inserted",
            header: "Insérées",
            accessor: (r) => <span className="tabular-nums">{r.rows_inserted.toLocaleString("fr-FR")}</span>,
            sortValue: (r) => r.rows_inserted,
            className: "text-right",
            headerClassName: "text-right",
        },
        {
            key: "rows_rejected",
            header: "Rejetées",
            accessor: (r) => (
                <span className={`tabular-nums ${r.rows_rejected > 0 ? "text-amber-700 dark:text-amber-400 font-medium" : ""}`}>
                    {r.rows_rejected.toLocaleString("fr-FR")}
                </span>
            ),
            sortValue: (r) => r.rows_rejected,
            className: "text-right",
            headerClassName: "text-right",
        },
        {
            key: "duration",
            header: "Durée",
            accessor: (r) => <span className="font-mono text-xs">{formatDuration(r.started_at, r.finished_at)}</span>,
            sortValue: (r) =>
                r.finished_at ? new Date(r.finished_at).getTime() - new Date(r.started_at).getTime() : 0,
            className: "text-right",
            headerClassName: "text-right",
        },
        {
            key: "started_at",
            header: "Démarré",
            accessor: (r) => <span className="text-xs text-muted-foreground">{formatRelative(r.started_at)}</span>,
            sortValue: (r) => new Date(r.started_at).getTime(),
        },
    ];

    const failedRuns = runs.filter((r) => r.status === "failed");
    const partialRuns = runs.filter((r) => r.status === "partial");

    return (
        <div className="space-y-8">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Qualité des données</h1>
                <p className="text-muted-foreground">
                    Dashboard de pilotage en temps réel des pipelines ETL. Métriques calculées sur les 24 dernières
                    heures.
                </p>
            </header>

            <section aria-labelledby="kpis-title">
                <h2 id="kpis-title" className="sr-only">
                    Indicateurs clés
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <KpiCard
                        label="Lignes ingérées (24h)"
                        value={metrics.rows_ingested_24h}
                        unit="lignes"
                        icon={Database}
                    />
                    <KpiCard
                        label="Taux de rejet"
                        value={metrics.rejection_rate_pct.toFixed(2)}
                        unit="%"
                        icon={AlertTriangle}
                        description={`${metrics.rows_rejected_24h.toLocaleString("fr-FR")} rejetées`}
                    />
                    <KpiCard
                        label="Taux de succès"
                        value={successRate.toFixed(1)}
                        unit="%"
                        icon={CheckCircle2}
                        description={`${metrics.successful_runs_24h}/${metrics.total_runs_24h} runs`}
                    />
                    <KpiCard
                        label="Durée moyenne run"
                        value={Math.round(metrics.avg_duration_seconds)}
                        unit="s"
                        icon={Clock}
                    />
                </div>
            </section>

            {(failedRuns.length > 0 || partialRuns.length > 0) && (
                <section aria-labelledby="alerts-title">
                    <h2 id="alerts-title" className="sr-only">
                        Alertes
                    </h2>
                    <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                                Anomalies récentes ({failedRuns.length + partialRuns.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {failedRuns.map((r) => (
                                <div key={r.id} className="flex items-start gap-2 text-sm">
                                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
                                    <div>
                                        <p className="font-medium">
                                            {DATASET_LABELS[r.source_name]} — Run #{r.id}
                                        </p>
                                        <p className="text-muted-foreground">{r.error_message}</p>
                                    </div>
                                </div>
                            ))}
                            {partialRuns.map((r) => (
                                <div key={r.id} className="flex items-start gap-2 text-sm">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                                    <div>
                                        <p className="font-medium">
                                            {DATASET_LABELS[r.source_name]} — Run #{r.id}
                                        </p>
                                        <p className="text-muted-foreground">{r.error_message}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </section>
            )}

            <section aria-labelledby="chart-title">
                <Card>
                    <CardHeader>
                        <CardTitle id="chart-title">Ingestion par source (24h)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-72" role="img" aria-label="Graphique en barres comparant lignes insérées et rejetées par source de données">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sourceChartData}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="source" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={70} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        formatter={(value: number | undefined) => (value ?? 0).toLocaleString("fr-FR")}
                                        contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
                                    />
                                    <Legend />
                                    <Bar dataKey="inserted" fill="hsl(142, 76%, 36%)" name="Insérées" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="rejected" fill="hsl(38, 92%, 50%)" name="Rejetées" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <details className="mt-4">
                            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                                Voir les données du graphique
                            </summary>
                            <table className="mt-2 w-full text-sm">
                                <caption className="sr-only">Données détaillées du graphique d&apos;ingestion par source</caption>
                                <thead>
                                    <tr className="border-b">
                                        <th scope="col" className="py-2 text-left font-medium">Source</th>
                                        <th scope="col" className="py-2 text-right font-medium">Insérées</th>
                                        <th scope="col" className="py-2 text-right font-medium">Rejetées</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sourceChartData.map((d) => (
                                        <tr key={d.source} className="border-b">
                                            <td className="py-2">{d.source}</td>
                                            <td className="py-2 text-right tabular-nums">{d.inserted.toLocaleString("fr-FR")}</td>
                                            <td className="py-2 text-right tabular-nums">{d.rejected.toLocaleString("fr-FR")}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </details>
                    </CardContent>
                </Card>
            </section>

            <section aria-labelledby="runs-title">
                <Card>
                    <CardHeader>
                        <CardTitle id="runs-title" className="flex items-center gap-2">
                            <Activity className="h-4 w-4" aria-hidden="true" />
                            Historique des runs ETL
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={runColumns}
                            data={runs}
                            rowId={(r) => String(r.id)}
                            pageSize={10}
                            caption="Liste des exécutions du pipeline ETL avec leur statut, volume et durée"
                        />
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
