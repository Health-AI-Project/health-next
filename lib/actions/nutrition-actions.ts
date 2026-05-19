import { apiFetch, ApiError } from "../api";

export interface NutritionData {
    id: string;
    name: string;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
}

export async function analyzeImage(file: File): Promise<NutritionData[]> {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiFetch<{
            data: {
                prediction_id: string;
                top_prediction: { class_name: string };
                calories: { top1: { estimated_kcal: number } };
            };
        }>('/api/v1/predictions/upload', {
            method: 'POST',
            body: formData,
        });

        const calories = response.data.calories.top1.estimated_kcal;
        return [
            {
                id: response.data.prediction_id,
                name: response.data.top_prediction.class_name || "Analyse IA",
                calories,
                proteins: Math.round(calories * 0.18 / 4),
                carbs: Math.round(calories * 0.48 / 4),
                fats: Math.round(calories * 0.34 / 9)
            }
        ];
    } catch (err) {
        if (err instanceof ApiError && err.status === 403) {
            throw new Error("Cette fonctionnalite necessite un abonnement Premium.");
        }
        throw new Error(err instanceof Error ? err.message : "Erreur lors de l'analyse de l'image");
    }
}

export async function saveNutritionData(id: string, data: Partial<NutritionData>): Promise<{ success: boolean }> {
    try {
        await apiFetch(`/api/v1/nutrition/entries/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        return { success: true };
    } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
    }
}
