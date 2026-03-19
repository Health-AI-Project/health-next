"use client";

import { useState } from "react";
import { MealUploader } from "@/components/nutrition/meal-uploader";
import { NutritionResultTable } from "@/components/nutrition/nutrition-result-table";
import { analyzeImage, NutritionData } from "@/lib/actions/nutrition-actions";
import { toast } from "sonner";
import { Utensils } from "lucide-react";

export function NutritionTracker() {
    const [nutritionData, setNutritionData] = useState<NutritionData[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [hasAnalyzed, setHasAnalyzed] = useState(false);

    const handleUpload = async (file: File) => {
        setIsAnalyzing(true);
        setHasAnalyzed(true);

        toast.info("Analyse en cours", {
            description: `Traitement de ${file.name}...`,
        });

        try {
            const result = await analyzeImage(file);
            setNutritionData(result);
            toast.success("Analyse terminée", {
                description: `${result.length} aliments détectés dans votre repas.`,
            });
        } catch {
            toast.error("Erreur d'analyse", {
                description: "Impossible d'analyser l'image. Veuillez réessayer.",
            });
            setHasAnalyzed(false);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleDataUpdate = (updatedData: NutritionData[]) => {
        setNutritionData(updatedData);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Utensils className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold">Nutrition Tracker</h2>
                    <p className="text-sm text-muted-foreground">
                        Uploadez une photo de votre repas pour analyse nutritionnelle
                    </p>
                </div>
            </div>

            <MealUploader onUpload={handleUpload} isLoading={isAnalyzing} />

            {hasAnalyzed && (
                <NutritionResultTable
                    data={nutritionData}
                    onDataUpdate={handleDataUpdate}
                    isLoading={isAnalyzing}
                />
            )}
        </div>
    );
}
