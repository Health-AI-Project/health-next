import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WizardData {
    age?: number;
    weight?: number;
    height?: number;
    goals?: string[];
    allergies?: string[];
}

interface WizardState {
    currentStep: number;
    totalSteps: number;
    data: WizardData;
    direction: number;
    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    updateData: (newData: Partial<WizardData>) => void;
    reset: () => void;
}

export const useWizardStore = create<WizardState>()(
    persist(
        (set) => ({
            currentStep: 0,
            totalSteps: 6,
            data: {},
            direction: 1,

            setStep: (step: number) =>
                set((state) => ({
                    direction: step > state.currentStep ? 1 : -1,
                    currentStep: Math.max(0, Math.min(step, state.totalSteps - 1)),
                })),

            nextStep: () =>
                set((state) => ({
                    direction: 1,
                    currentStep: Math.min(state.currentStep + 1, state.totalSteps - 1),
                })),

            prevStep: () =>
                set((state) => ({
                    direction: -1,
                    currentStep: Math.max(state.currentStep - 1, 0),
                })),

            updateData: (newData: Partial<WizardData>) =>
                set((state) => ({
                    data: { ...state.data, ...newData },
                })),

            reset: () =>
                set({
                    currentStep: 0,
                    data: {},
                    direction: 1,
                }),
        }),
        {
            name: "wizard-store",
            partialize: (state) => ({
                currentStep: state.currentStep,
                data: state.data,
            }),
        }
    )
);

export const STEP_TITLES = [
    "Votre âge",
    "Votre poids",
    "Vos objectifs",
    "Vos allergies",
    "Récapitulatif",
    "Créer votre compte",
];
