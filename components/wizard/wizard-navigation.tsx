"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface WizardNavigationProps {
    onPrev?: () => void;
    prevLabel?: string;
    nextLabel?: string;
    nextIcon?: React.ReactNode;
    nextVariant?: ButtonProps["variant"];
    isSubmit?: boolean;
    isLoading?: boolean;
    disabled?: boolean;
    onNext?: () => void;
}

export function WizardNavigation({
    onPrev,
    prevLabel = "Précédent",
    nextLabel = "Suivant",
    nextIcon,
    nextVariant,
    isSubmit = true,
    isLoading = false,
    disabled = false,
    onNext,
}: WizardNavigationProps) {
    return (
        <div className={`flex ${onPrev ? "justify-between" : "justify-end"} pt-4`}>
            {onPrev && (
                <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={onPrev}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {prevLabel}
                </Button>
            )}
            <Button
                type={isSubmit ? "submit" : "button"}
                variant={nextVariant}
                size="lg"
                disabled={isLoading || disabled}
                onClick={onNext}
                className="gap-2"
            >
                {nextLabel}
                {nextIcon ?? <ArrowRight className="h-4 w-4" />}
            </Button>
        </div>
    );
}
