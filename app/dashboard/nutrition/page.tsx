import { Metadata } from "next";
import { NutritionTracker } from "@/components/nutrition/nutrition-tracker";

export const metadata: Metadata = {
    title: "Nutrition Tracker | HealthNext",
    description: "Analysez vos repas et suivez votre nutrition",
};

export default function NutritionPage() {
    return <NutritionTracker />;
}
