import { z } from "zod";

export const ageSchema = z.object({
    age: z
        .number({ message: "L'âge est requis et doit être un nombre valide" })
        .min(18, { message: "Vous devez avoir au moins 18 ans" })
        .max(120, { message: "Veuillez entrer un âge valide" }),
});

export const weightSchema = z.object({
    weight: z
        .number({ message: "Le poids est requis et doit être un nombre valide" })
        .min(30, { message: "Le poids minimum est de 30 kg" })
        .max(300, { message: "Le poids maximum est de 300 kg" }),
});

export const goalsSchema = z.object({
    goals: z
        .array(z.string())
        .min(1, { message: "Veuillez sélectionner au moins un objectif" }),
});

export const allergiesSchema = z.object({
    allergies: z.array(z.string()).optional(),
});

export const GOALS_OPTIONS = [
    { id: "weight-loss", label: "Perte de poids" },
    { id: "muscle-gain", label: "Prise de muscle" },
    { id: "endurance", label: "Améliorer l'endurance" },
    { id: "flexibility", label: "Gagner en souplesse" },
    { id: "wellness", label: "Bien-être général" },
    { id: "stress", label: "Réduire le stress" },
];

export const ALLERGIES_OPTIONS = [
    { id: "gluten", label: "Gluten" },
    { id: "lactose", label: "Lactose" },
    { id: "nuts", label: "Fruits à coque" },
    { id: "eggs", label: "Œufs" },
    { id: "fish", label: "Poisson" },
    { id: "shellfish", label: "Crustacés" },
    { id: "soy", label: "Soja" },
    { id: "none", label: "Aucune allergie" },
];

export type AgeFormData = z.infer<typeof ageSchema>;
export type WeightFormData = z.infer<typeof weightSchema>;
export type GoalsFormData = z.infer<typeof goalsSchema>;
export type AllergiesFormData = z.infer<typeof allergiesSchema>;
