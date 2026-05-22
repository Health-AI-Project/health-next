"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Database } from "lucide-react";
import { mockDatasetsBySource, DATASET_LABELS } from "@/lib/mocks/admin";
import type { DatasetSource } from "@/types/admin";

const SOURCE_DESCRIPTIONS: Record<DatasetSource, string> = {
    daily_food_nutrition: "Apports quotidiens, valeurs nutritionnelles, tracking santé (CSV)",
    diet_recommendations: "Profils santé et recommandations diététiques (CSV)",
    exercisedb: "Catalogue 1 300+ exercices avec instructions et médias (JSON)",
    gym_members: "Profils sportifs avec mesures biométriques (CSV)",
    fitness_tracker: "Données d'activité quotidienne — pas, sommeil, FC (XLSX)",
};

export default function DatasetsIndexPage() {
    const sources = Object.keys(mockDatasetsBySource) as DatasetSource[];

    return (
        <div className="space-y-8">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Datasets</h1>
                <p className="text-muted-foreground">
                    Inspection et nettoyage interactif des sources de données. Sélectionnez un dataset pour visualiser
                    son contenu, corriger les anomalies et marquer les lignes à valider.
                </p>
            </header>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sources.map((source) => {
                    const rows = mockDatasetsBySource[source];
                    const anomalies = rows.filter((r) => r.anomalies.length > 0).length;
                    const pending = rows.filter((r) => r.validation_status === "PENDING").length;
                    return (
                        <Link
                            key={source}
                            href={`/dashboard/admin/datasets/${source}`}
                            className="group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <Card className="h-full transition-colors group-hover:border-primary">
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-md bg-primary/10 p-2">
                                                <Database className="h-5 w-5 text-primary" aria-hidden="true" />
                                            </div>
                                            <CardTitle className="text-base">{DATASET_LABELS[source]}</CardTitle>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden="true" />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <CardDescription>{SOURCE_DESCRIPTIONS[source]}</CardDescription>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="secondary">{rows.length} lignes</Badge>
                                        {anomalies > 0 && (
                                            <Badge variant="outline" className="border-amber-500 text-amber-900 dark:text-amber-200">
                                                {anomalies} anomalie{anomalies > 1 ? "s" : ""}
                                            </Badge>
                                        )}
                                        {pending > 0 && (
                                            <Badge variant="outline">
                                                {pending} à valider
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
