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

    const response = await apiFetch<{
        success: boolean;
        message: string;
        id?: string;
        food_name?: string;
        confidence?: number;
        macros: { calories: number; protein: number; carbs: number; fat: number };
    }>('/api/nutrition/upload', {
        method: 'POST',
        body: formData,
    });

    if (!response.success) {
        throw new Error(response.message || 'AI analysis failed');
    }

    // Format the food name for display (replace underscores, capitalize)
    const displayName = response.food_name
        ? response.food_name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        : 'Analyse IA';

    return [
        {
            id: response.id || 'new_meal',
            name: displayName,
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

