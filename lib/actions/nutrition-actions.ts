import { apiFetch } from "../api";

export interface NutritionData {
    id: string;
    name: string;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
}

export interface MealAnalysis {
    imageUrl: string;
    items: NutritionData[];
    totalCalories: number;
    analyzedAt: Date;
}

export async function analyzeImage(file: File): Promise<NutritionData[]> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiFetch<any>('/api/nutrition/upload', {
        method: 'POST',
        body: formData,
        // Let the browser set the Content-Type for FormData
        headers: {
            'Content-Type': undefined as any,
        }
    });

    // Handle case where apiFetch might set Content-Type to application/json by default
    // Our apiFetch needs a small adjustment to handle FormData

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
}

export async function saveNutritionData(id: string, data: Partial<NutritionData>): Promise<{ success: boolean }> {
    await apiFetch(`/api/nutrition/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
    return { success: true };
}

