"use client";

import { useWizardStore } from "@/lib/stores/wizard-store";
import { Card, CardContent } from "@/components/ui/card";
import {
    GOALS_OPTIONS,
    ALLERGIES_OPTIONS,
} from "@/lib/schemas/wizard-schemas";
import { WizardNavigation } from "@/components/wizard/wizard-navigation";
import { Check, User, Scale, Target, AlertTriangle, type LucideIcon } from "lucide-react";

function SummaryCard({
    icon: Icon,
    label,
    children,
}: {
    icon: LucideIcon;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <Card className="bg-accent/50 border-0">
            <CardContent className="flex items-start gap-3 p-4">
                <Icon className="h-5 w-5 text-primary mt-0.5" aria-hidden="true" />
                <div>
                    <p className="font-medium">{label}</p>
                    {children}
                </div>
            </CardContent>
        </Card>
    );
}

export function SummaryStep() {
    const { data, prevStep, nextStep } = useWizardStore();

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
                    <SummaryCard icon={User} label="Âge">
                        <p className="text-muted-foreground">{data.age} ans</p>
                    </SummaryCard>

                    <SummaryCard icon={Scale} label="Poids">
                        <p className="text-muted-foreground">{data.weight} kg</p>
                    </SummaryCard>

                    <SummaryCard icon={Target} label="Objectifs">
                        <ul className="text-muted-foreground list-disc list-inside">
                            {getGoalLabels().map((goal, index) => (
                                <li key={index}>{goal}</li>
                            ))}
                        </ul>
                    </SummaryCard>

                    <SummaryCard icon={AlertTriangle} label="Allergies">
                        <ul className="text-muted-foreground list-disc list-inside">
                            {getAllergyLabels().map((allergy, index) => (
                                <li key={index}>{allergy}</li>
                            ))}
                        </ul>
                    </SummaryCard>
                </div>
            </div>

            <WizardNavigation
                onPrev={prevStep}
                prevLabel="Modifier"
                nextLabel="Confirmer l'inscription"
                nextIcon={<Check className="h-4 w-4" />}
                nextVariant="premium"
                isSubmit={false}
                onNext={handleSubmit}
            />
        </div>
    );
}
