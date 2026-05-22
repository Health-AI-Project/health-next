"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sliders, Database, CheckCircle2, BarChart3, Workflow, Users } from "lucide-react";

const sections = [
    {
        href: "/dashboard/admin/data-quality",
        label: "Qualité des données",
        description: "Tableau de bord en temps réel : volumétrie, taux d'erreur, statut des runs ETL.",
        icon: Sliders,
    },
    {
        href: "/dashboard/admin/sources",
        label: "Sources",
        description: "Registre dynamique des sources : ajout, modification, désactivation.",
        icon: Database,
    },
    {
        href: "/dashboard/admin/datasets",
        label: "Datasets",
        description: "Inspection et nettoyage interactif des sources : profils, nutrition, exercices, biométrie.",
        icon: Database,
    },
    {
        href: "/dashboard/admin/validation",
        label: "Workflow de validation",
        description: "File d'attente des lots à approuver. Diff avant/après nettoyage et historique des décisions.",
        icon: CheckCircle2,
    },
    {
        href: "/dashboard/admin/analytics",
        label: "Analytics business",
        description: "Indicateurs métier : démographie, tendances nutrition, top exercices, KPIs business.",
        icon: BarChart3,
    },
    {
        href: "/dashboard/admin/users",
        label: "Utilisateurs",
        description: "Gestion des comptes : promotion en admin, changement de tier, suppression.",
        icon: Users,
    },
    {
        href: "/dashboard/admin/flow",
        label: "Flux de données",
        description: "Cartographie visuelle de bout en bout : sources → ETL → BDD → API → consommateurs.",
        icon: Workflow,
    },
];

export default function AdminHomePage() {
    return (
        <div className="space-y-8">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Administration HealthAI Coach</h1>
                <p className="text-muted-foreground">
                    Interface destinée aux équipes internes pour superviser les flux de données, valider les anomalies
                    et accéder aux indicateurs métier.
                </p>
            </header>

            <section aria-labelledby="sections-title" className="space-y-4">
                <h2 id="sections-title" className="sr-only">
                    Sections disponibles
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {sections.map((section) => (
                        <Link
                            key={section.href}
                            href={section.href}
                            className="group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <Card className="h-full transition-colors group-hover:border-primary">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-md bg-primary/10 p-2">
                                            <section.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                                        </div>
                                        <CardTitle className="text-base">{section.label}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>{section.description}</CardDescription>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
