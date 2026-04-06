"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Scale } from "lucide-react";

interface BmiCardProps {
    weight?: number;
    height?: number;
}

function getBmiCategory(bmi: number): {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    className: string;
    color: string;
} {
    if (bmi < 18.5) {
        return { label: "Insuffisance ponderale", variant: "outline", className: "border-blue-500 text-blue-500", color: "text-blue-500" };
    }
    if (bmi < 25) {
        return { label: "Poids normal", variant: "outline", className: "border-green-500 text-green-500", color: "text-green-500" };
    }
    if (bmi < 30) {
        return { label: "Surpoids", variant: "outline", className: "border-orange-500 text-orange-500", color: "text-orange-500" };
    }
    return { label: "Obesite", variant: "destructive", className: "", color: "text-red-500" };
}

function getBmiProgress(bmi: number): number {
    // Map BMI 15-40 to 0-100%
    return Math.min(100, Math.max(0, ((bmi - 15) / 25) * 100));
}

export function BmiCard({ weight, height }: BmiCardProps) {
    if (!weight || !height) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">IMC</CardTitle>
                    <Scale className="h-4 w-4 text-primary" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-muted-foreground">N/A</div>
                    <p className="text-xs text-muted-foreground">Renseignez poids et taille</p>
                </CardContent>
            </Card>
        );
    }

    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    const category = getBmiCategory(bmi);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    Indice de Masse Corporelle
                </CardTitle>
                <Scale className="h-4 w-4 text-primary" aria-hidden="true" />
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className={`text-2xl font-bold ${category.color}`}>
                        {bmi.toFixed(1)}
                    </span>
                    <Badge variant={category.variant} className={category.className}>
                        {category.label}
                    </Badge>
                </div>
                <Progress value={getBmiProgress(bmi)} className="h-2" />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Maigre</span>
                    <span>Normal</span>
                    <span>Surpoids</span>
                    <span>Obesite</span>
                </div>
            </CardContent>
        </Card>
    );
}
