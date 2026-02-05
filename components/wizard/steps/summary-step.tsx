"use client";

import { useWizardStore } from "@/lib/stores/wizard-store";
import { Button } from "@/components/ui/button";
import {
    GOALS_OPTIONS,
    ALLERGIES_OPTIONS,
} from "@/lib/schemas/wizard-schemas";
import { ArrowLeft, Check, User, Scale, Target, AlertTriangle } from "lucide-react";

export function SummaryStep() {
    const { data, prevStep, nextStep, reset } = useWizardStore();

    const getGoalLabels = () => {
        return (data.goals || [])
            .map((goalId) => GOALS_OPTIONS.find((g) => g.id === goalId)?.label)
            .filter(Boolean);
    };

    const getAllergyLabels = () => {
        const allergies = data.allergies || [];
        if (allergies.includes("none") || allergies.length === 0) {
            return ["Aucune allergie"];
        }
        return allergies
            .map((allergyId) => ALLERGIES_OPTIONS.find((a) => a.id === allergyId)?.label)
            .filter(Boolean);
    };

    const handleSubmit = () => {
        // console.log("Données de simulation:", data);
        nextStep();
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Récapitulatif de vos informations</h3>

                <div className="grid gap-4">
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/50">
                        <User className="h-5 w-5 text-primary mt-0.5" aria-hidden="true" />
                        <div>
                            <p className="font-medium">Âge</p>
                            <p className="text-muted-foreground">{data.age} ans</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/50">
                        <Scale className="h-5 w-5 text-primary mt-0.5" aria-hidden="true" />
                        <div>
                            <p className="font-medium">Poids</p>
                            <p className="text-muted-foreground">{data.weight} kg</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/50">
                        <Target className="h-5 w-5 text-primary mt-0.5" aria-hidden="true" />
                        <div>
                            <p className="font-medium">Objectifs</p>
                            <ul className="text-muted-foreground list-disc list-inside">
                                {getGoalLabels().map((goal, index) => (
                                    <li key={index}>{goal}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/50">
                        <AlertTriangle className="h-5 w-5 text-primary mt-0.5" aria-hidden="true" />
                        <div>
                            <p className="font-medium">Allergies</p>
                            <ul className="text-muted-foreground list-disc list-inside">
                                {getAllergyLabels().map((allergy, index) => (
                                    <li key={index}>{allergy}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={prevStep}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Modifier
                </Button>
                <Button
                    type="button"
                    size="lg"
                    onClick={handleSubmit}
                    className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                    <Check className="h-4 w-4" />
                    Confirmer l&apos;inscription
                </Button>
            </div>
        </div>
    );
}
