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

        const response = await apiFetch<{ id?: string; macros: { calories: number; protein: number; carbs: number; fat: number } }>('/api/nutrition/upload', {
            method: 'POST',
            body: formData,
        });

        return [
            {
                id: response.id || 'new_meal',
                name: "Analyse IA",
                calories: response.macros.calories,
                proteins: response.macros.protein,
                carbs: response.macros.carbs,
                fats: response.macros.fat
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
        await apiFetch(`/api/nutrition/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        return { success: true };
    } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
    }
}
