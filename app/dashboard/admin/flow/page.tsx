"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Database,
    FileText,
    Filter,
    Workflow,
    Cloud,
    Server,
    Globe,
    Smartphone,
    AlertTriangle,
    type LucideIcon,
} from "lucide-react";
import { mockEtlRuns, DATASET_LABELS } from "@/lib/mocks/admin";
import type { EtlRunStatus } from "@/types/admin";
import { cn } from "@/lib/utils";

interface FlowNode {
    id: string;
    title: string;
    subtitle: string;
    icon: LucideIcon;
    layer: "source" | "etl" | "store" | "api" | "client";
    status?: EtlRunStatus;
    stats?: { label: string; value: string }[];
}

const LAYER_LABELS: Record<FlowNode["layer"], string> = {
    source: "Sources",
    etl: "Pipeline ETL",
    store: "Stockage",
    api: "Couche API",
    client: "Consommateurs",
};

const LAYER_COLORS: Record<FlowNode["layer"], string> = {
    source: "bg-amber-50 border-amber-300 dark:bg-amber-950/20 dark:border-amber-800",
    etl: "bg-blue-50 border-blue-300 dark:bg-blue-950/20 dark:border-blue-800",
    store: "bg-emerald-50 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-800",
    api: "bg-pink-50 border-pink-300 dark:bg-pink-950/20 dark:border-pink-800",
    client: "bg-purple-50 border-purple-300 dark:bg-purple-950/20 dark:border-purple-800",
};

function buildNodes(): FlowNode[] {
    const sources: FlowNode[] = (Object.keys(DATASET_LABELS) as Array<keyof typeof DATASET_LABELS>).map((src) => {
        const lastRun = mockEtlRuns.find((r) => r.source_name === src);
        return {
            id: `src-${src}`,
            title: DATASET_LABELS[src],
            subtitle: lastRun?.source_type.toUpperCase() ?? "—",
            icon: FileText,
            layer: "source",
            status: lastRun?.status,
        };
    });

    return [
        ...sources,
        {
            id: "etl-ingest",
            title: "Ingestion",
            subtitle: "ia-python · pandas / openpyxl",
            icon: Cloud,
            layer: "etl",
            stats: [{ label: "Runs 24h", value: "12" }],
        },
        {
            id: "etl-validate",
            title: "Validation",
            subtitle: "Schémas Pydantic",
            icon: Filter,
            layer: "etl",
            stats: [{ label: "Taux rejet", value: "1.17%" }],
        },
        {
            id: "etl-clean",
            title: "Nettoyage",
            subtitle: "Dédup, normalisation, dérivations",
            icon: Workflow,
            layer: "etl",
        },
        {
            id: "store-pg",
            title: "PostgreSQL",
            subtitle: "28 tables · vues agrégées",
            icon: Database,
            layer: "store",
            stats: [{ label: "Lignes 24h", value: "30 253" }],
        },
        {
            id: "store-exports",
            title: "Exports",
            subtitle: "JSON · CSV à la demande",
            icon: FileText,
            layer: "store",
        },
        {
            id: "api-fastapi",
            title: "FastAPI",
            subtitle: "ia-python :8000 · OpenAPI",
            icon: Server,
            layer: "api",
        },
        {
            id: "api-engine",
            title: "engine-go",
            subtitle: "gRPC :50051",
            icon: Server,
            layer: "api",
        },
        {
            id: "api-hono",
            title: "backend-hono",
            subtitle: ":3002 · gateway BFF",
            icon: Server,
            layer: "api",
        },
        {
            id: "client-web",
            title: "health-next",
            subtitle: ":3000 · admin web",
            icon: Globe,
            layer: "client",
        },
        {
            id: "client-mobile",
            title: "flutter-ai",
            subtitle: "iOS · Android",
            icon: Smartphone,
            layer: "client",
        },
    ];
}

function FlowNodeCard({ node, onClick, isActive }: { node: FlowNode; onClick: () => void; isActive: boolean }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "w-full rounded-lg border-2 p-3 text-left transition-all",
                LAYER_COLORS[node.layer],
                "hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive && "ring-2 ring-primary ring-offset-2",
            )}
            aria-pressed={isActive}
        >
            <div className="flex items-start gap-2">
                <node.icon className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate">{node.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{node.subtitle}</p>
                </div>
                {node.status === "failed" && (
                    <AlertTriangle className="h-3 w-3 text-rose-600 shrink-0" aria-label="Erreur" />
                )}
                {node.status === "partial" && (
                    <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0" aria-label="Partiel" />
                )}
            </div>
        </button>
    );
}

export default function FlowPage() {
    const [activeNode, setActiveNode] = useState<string | null>(null);
    const nodes = buildNodes();
    const byLayer = nodes.reduce(
        (acc, n) => {
            acc[n.layer] = acc[n.layer] ?? [];
            acc[n.layer].push(n);
            return acc;
        },
        {} as Record<FlowNode["layer"], FlowNode[]>,
    );

    const active = nodes.find((n) => n.id === activeNode);

    return (
        <div className="space-y-8">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Flux de données</h1>
                <p className="text-muted-foreground">
                    Cartographie du cheminement complet : sources externes → pipeline ETL → stockage → API → consommateurs.
                    Cliquez sur un nœud pour voir ses détails.
                </p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Vue d&apos;ensemble</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {(Object.keys(LAYER_LABELS) as Array<FlowNode["layer"]>).map((layer) => (
                            <section key={layer} aria-labelledby={`layer-${layer}`}>
                                <h2
                                    id={`layer-${layer}`}
                                    className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 text-center"
                                >
                                    {LAYER_LABELS[layer]}
                                </h2>
                                <div className="space-y-2">
                                    {(byLayer[layer] ?? []).map((node) => (
                                        <FlowNodeCard
                                            key={node.id}
                                            node={node}
                                            onClick={() => setActiveNode(node.id === activeNode ? null : node.id)}
                                            isActive={node.id === activeNode}
                                        />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs">
                        {(Object.keys(LAYER_LABELS) as Array<FlowNode["layer"]>).map((layer) => (
                            <div key={layer} className="flex items-center gap-1.5">
                                <span className={cn("inline-block h-3 w-3 rounded border-2", LAYER_COLORS[layer])} aria-hidden="true" />
                                <span>{LAYER_LABELS[layer]}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {active && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="rounded-md bg-primary/10 p-2">
                                <active.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                            </div>
                            <div>
                                <CardTitle>{active.title}</CardTitle>
                                <CardDescription>{active.subtitle}</CardDescription>
                            </div>
                            <Badge variant="outline" className="ml-auto">
                                {LAYER_LABELS[active.layer]}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {active.stats && active.stats.length > 0 && (
                            <div className="grid gap-3 sm:grid-cols-3">
                                {active.stats.map((s) => (
                                    <div key={s.label} className="rounded-md border p-3">
                                        <p className="text-xs text-muted-foreground">{s.label}</p>
                                        <p className="text-lg font-semibold tabular-nums">{s.value}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {active.status && (
                            <div className="mt-3 text-sm">
                                <span className="text-muted-foreground">Dernier run : </span>
                                <Badge
                                    variant={
                                        active.status === "success"
                                            ? "default"
                                            : active.status === "failed"
                                                ? "destructive"
                                                : "outline"
                                    }
                                >
                                    {active.status}
                                </Badge>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Description textuelle du flux</CardTitle>
                    <CardDescription>
                        Pour les lecteurs d&apos;écran et la documentation.
                    </CardDescription>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                    <ol>
                        <li>
                            <strong>5 sources externes</strong> alimentent le pipeline : 4 Kaggle (CSV/XLSX) + ExerciseDB
                            (JSON). Chaque source a une fréquence et des règles de qualité documentées.
                        </li>
                        <li>
                            Le <strong>pipeline ETL</strong> (ia-python) procède en 3 étapes : ingestion → validation
                            schéma → nettoyage. Les lignes invalides partent en quarantaine.
                        </li>
                        <li>
                            Les données nettoyées sont stockées en <strong>PostgreSQL</strong> (28 tables, vues agrégées
                            pour le dashboard). Exports JSON/CSV disponibles à la demande.
                        </li>
                        <li>
                            La <strong>couche API</strong> expose les données : FastAPI pour les opérations CRUD et
                            l&apos;admin, engine-go (gRPC) pour les requêtes haute performance, backend-hono comme
                            gateway BFF pour le front.
                        </li>
                        <li>
                            Les <strong>consommateurs</strong> sont health-next (admin web) et flutter-ai (mobile).
                            Tous deux passent par le gateway Hono pour bénéficier de l&apos;auth, du caching et de la
                            consolidation des appels.
                        </li>
                    </ol>
                </CardContent>
            </Card>
        </div>
    );
}
