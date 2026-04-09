"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NutritionData } from "@/lib/actions/nutrition-actions";
import { AlertTriangle, CheckCircle, TrendingDown, TrendingUp, Lightbulb } from "lucide-react";

interface MealSuggestionsProps {
    data: NutritionData[];
}

interface NutrientAnalysis {
    name: string;
    actual: number;
    target: number;
    unit: string;
    status: "deficit" | "equilibre" | "exces";
    suggestion: string;
}

const DAILY_TARGETS = {
    calories: 2000,
    proteins: 60,
    carbs: 250,
    fats: 70,
};

function analyzeNutrients(data: NutritionData[]): NutrientAnalysis[] {
    const totals = data.reduce(
        (acc, item) => ({
            calories: acc.calories + item.calories,
            proteins: acc.proteins + item.proteins,
            carbs: acc.carbs + item.carbs,
            fats: acc.fats + item.fats,
        }),
        { calories: 0, proteins: 0, carbs: 0, fats: 0 }
    );

    const analyses: NutrientAnalysis[] = [
        {
            name: "Calories",
            actual: totals.calories,
            target: DAILY_TARGETS.calories / 3,
            unit: "kcal",
            status: getStatus(totals.calories, DAILY_TARGETS.calories / 3),
            suggestion: getSuggestion("calories", totals.calories, DAILY_TARGETS.calories / 3),
        },
        {
            name: "Proteines",
            actual: totals.proteins,
            target: DAILY_TARGETS.proteins / 3,
            unit: "g",
            status: getStatus(totals.proteins, DAILY_TARGETS.proteins / 3),
            suggestion: getSuggestion("proteins", totals.proteins, DAILY_TARGETS.proteins / 3),
        },
        {
            name: "Glucides",
            actual: totals.carbs,
            target: DAILY_TARGETS.carbs / 3,
            unit: "g",
            status: getStatus(totals.carbs, DAILY_TARGETS.carbs / 3),
            suggestion: getSuggestion("carbs", totals.carbs, DAILY_TARGETS.carbs / 3),
        },
        {
            name: "Lipides",
            actual: totals.fats,
            target: DAILY_TARGETS.fats / 3,
            unit: "g",
            status: getStatus(totals.fats, DAILY_TARGETS.fats / 3),
            suggestion: getSuggestion("fats", totals.fats, DAILY_TARGETS.fats / 3),
        },
    ];

    return analyses;
}

function getStatus(actual: number, target: number): "deficit" | "equilibre" | "exces" {
    const ratio = actual / target;
    if (ratio < 0.8) return "deficit";
    if (ratio > 1.2) return "exces";
    return "equilibre";
}

function getSuggestion(nutrient: string, actual: number, target: number): string {
    const status = getStatus(actual, target);

    if (status === "equilibre") return "Bon equilibre pour ce repas.";

    const suggestions: Record<string, Record<string, string>> = {
        calories: {
            deficit: "Ce repas est leger. Ajoutez une source de glucides complexes (riz, pates, pain complet).",
            exces: "Ce repas est calorique. Reduisez les portions ou privilegiez des aliments moins denses.",
        },
        proteins: {
            deficit: "Ajoutez une source de proteines : poulet, poisson, oeufs, legumineuses ou tofu.",
            exces: "L'apport en proteines est eleve. Equilibrez avec des legumes et des glucides.",
        },
        carbs: {
            deficit: "Ajoutez des glucides complexes : cereales completes, legumineuses ou fruits.",
            exces: "Reduisez les glucides raffines et privilegiez les fibres (legumes, cereales completes).",
        },
        fats: {
            deficit: "Ajoutez des bonnes graisses : huile d'olive, avocat, noix ou poisson gras.",
            exces: "L'apport en lipides est eleve. Reduisez les fritures et les sauces.",
        },
    };

    return suggestions[nutrient]?.[status] || "";
}

function StatusIcon({ status }: { status: "deficit" | "equilibre" | "exces" }) {
    switch (status) {
        case "deficit":
            return <TrendingDown className="h-4 w-4 text-orange-500" aria-hidden="true" />;
        case "exces":
            return <TrendingUp className="h-4 w-4 text-red-500" aria-hidden="true" />;
        case "equilibre":
            return <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />;
    }
}

function StatusBadge({ status }: { status: "deficit" | "equilibre" | "exces" }) {
    const config = {
        deficit: { label: "Deficit", variant: "outline" as const, className: "border-orange-500 text-orange-500" },
        exces: { label: "Exces", variant: "destructive" as const, className: "" },
        equilibre: { label: "Equilibre", variant: "outline" as const, className: "border-green-500 text-green-500" },
    };
    const c = config[status];
    return <Badge variant={c.variant} className={c.className}>{c.label}</Badge>;
}

export function MealSuggestions({ data }: MealSuggestionsProps) {
    if (data.length === 0) return null;

    const analyses = analyzeNutrients(data);
    const hasIssues = analyses.some((a) => a.status !== "equilibre");

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        {hasIssues ? (
                            <AlertTriangle className="h-5 w-5 text-orange-500" aria-hidden="true" />
                        ) : (
                            <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />
                        )}
                        Analyse nutritionnelle
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {analyses.map((a) => (
                            <div
                                key={a.name}
                                className="flex items-start gap-3 rounded-lg border p-3"
                            >
                                <StatusIcon status={a.status} />
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{a.name}</span>
                                        <StatusBadge status={a.status} />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {a.actual} {a.unit} / objectif {Math.round(a.target)} {a.unit} par repas
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {hasIssues && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Lightbulb className="h-5 w-5 text-primary" aria-hidden="true" />
                            Suggestions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {analyses
                                .filter((a) => a.status !== "equilibre")
                                .map((a) => (
                                    <li key={a.name} className="flex items-start gap-3 text-sm">
                                        <StatusIcon status={a.status} />
                                        <div>
                                            <span className="font-medium">{a.name} :</span>{" "}
                                            <span className="text-muted-foreground">{a.suggestion}</span>
                                        </div>
                                    </li>
                                ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
