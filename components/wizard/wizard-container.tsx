"use client";

import { useWizardStore, STEP_TITLES } from "@/lib/stores/wizard-store";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { WizardStepWrapper } from "@/components/wizard/wizard-step";
import { AgeStep } from "@/components/wizard/steps/age-step";
import { WeightStep } from "@/components/wizard/steps/weight-step";
import { GoalsStep } from "@/components/wizard/steps/goals-step";
import { AllergiesStep } from "@/components/wizard/steps/allergies-step";
import { SummaryStep } from "@/components/wizard/steps/summary-step";

const STEPS = [AgeStep, WeightStep, GoalsStep, AllergiesStep, SummaryStep];

export function WizardContainer() {
    const { currentStep, totalSteps, direction } = useWizardStore();

    const progressValue = ((currentStep + 1) / totalSteps) * 100;
    const CurrentStepComponent = STEPS[currentStep];

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
            <Card className="w-full max-w-lg shadow-xl border-0 bg-card/95 backdrop-blur">
                <CardHeader className="space-y-4">
                    <div className="space-y-2">
                        <CardDescription className="text-sm">
                            Étape {currentStep + 1} sur {totalSteps}
                        </CardDescription>
                        <CardTitle className="text-2xl" id="wizard-step-title">
                            {STEP_TITLES[currentStep]}
                        </CardTitle>
                    </div>
                    <Progress
                        value={progressValue}
                        className="h-2"
                        aria-label={`Progression: étape ${currentStep + 1} sur ${totalSteps}`}
                    />
                </CardHeader>
                <CardContent>
                    <div
                        aria-live="polite"
                        aria-atomic="true"
                        className="sr-only"
                    >
                        Étape {currentStep + 1}: {STEP_TITLES[currentStep]}
                    </div>
                    <WizardStepWrapper stepKey={currentStep} direction={direction}>
                        <CurrentStepComponent />
                    </WizardStepWrapper>
                </CardContent>
            </Card>
        </div>
    );
}
