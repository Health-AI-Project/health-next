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

const MOCK_RESPONSES: NutritionData[][] = [
    [
        { id: "1", name: "Poulet grillé", calories: 165, proteins: 31, carbs: 0, fats: 3.6 },
        { id: "2", name: "Riz complet", calories: 216, proteins: 5, carbs: 45, fats: 1.8 },
        { id: "3", name: "Brocoli vapeur", calories: 55, proteins: 3.7, carbs: 11, fats: 0.6 },
    ],
    [
        { id: "1", name: "Salade César", calories: 184, proteins: 8.5, carbs: 8, fats: 14 },
        { id: "2", name: "Croûtons", calories: 122, proteins: 3, carbs: 22, fats: 2 },
        { id: "3", name: "Parmesan", calories: 110, proteins: 10, carbs: 1, fats: 7 },
    ],
    [
        { id: "1", name: "Steak haché", calories: 250, proteins: 26, carbs: 0, fats: 17 },
        { id: "2", name: "Frites", calories: 312, proteins: 3.4, carbs: 41, fats: 15 },
        { id: "3", name: "Ketchup", calories: 20, proteins: 0.2, carbs: 5, fats: 0 },
    ],
    [
        { id: "1", name: "Saumon grillé", calories: 208, proteins: 20, carbs: 0, fats: 13 },
        { id: "2", name: "Quinoa", calories: 222, proteins: 8, carbs: 39, fats: 3.5 },
        { id: "3", name: "Asperges", calories: 27, proteins: 2.9, carbs: 5, fats: 0.2 },
    ],
];

export async function analyzeImage(): Promise<NutritionData[]> {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const randomIndex = Math.floor(Math.random() * MOCK_RESPONSES.length);
    return MOCK_RESPONSES[randomIndex].map((item) => ({
        ...item,
        id: `${Date.now()}-${item.id}`,
    }));
}

export async function saveNutritionData(data: NutritionData[]): Promise<{ success: boolean }> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Données nutritionnelles sauvegardées:", data);
    return { success: true };
}
