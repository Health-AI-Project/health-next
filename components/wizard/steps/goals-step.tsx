"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    goalsSchema,
    type GoalsFormData,
    GOALS_OPTIONS,
} from "@/lib/schemas/wizard-schemas";
import { useWizardStore } from "@/lib/stores/wizard-store";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function GoalsStep() {
    const { data, updateData, nextStep, prevStep } = useWizardStore();

    const form = useForm<GoalsFormData>({
        resolver: zodResolver(goalsSchema),
        defaultValues: {
            goals: data.goals || [],
        },
    });

    const onSubmit = (formData: GoalsFormData) => {
        updateData({ goals: formData.goals });
        nextStep();
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
                noValidate
            >
                <FormField
                    control={form.control}
                    name="goals"
                    render={() => (
                        <FormItem>
                            <FormLabel className="text-base">
                                Quels sont vos objectifs ?
                            </FormLabel>
                            <FormDescription id="goals-description">
                                Sélectionnez un ou plusieurs objectifs
                            </FormDescription>
                            <div
                                className="grid gap-3 pt-2"
                                role="group"
                                aria-labelledby="goals-label"
                                aria-describedby="goals-description goals-error"
                            >
                                {GOALS_OPTIONS.map((option) => (
                                    <FormField
                                        key={option.id}
                                        control={form.control}
                                        name="goals"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(option.id)}
                                                        onCheckedChange={(checked) => {
                                                            const currentValues = field.value || [];
                                                            if (checked) {
                                                                field.onChange([...currentValues, option.id]);
                                                            } else {
                                                                field.onChange(
                                                                    currentValues.filter(
                                                                        (value) => value !== option.id
                                                                    )
                                                                );
                                                            }
                                                        }}
                                                        aria-label={option.label}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer flex-1">
                                                    {option.label}
                                                </FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>
                            <FormMessage id="goals-error" />
                        </FormItem>
                    )}
                />

                <div className="flex justify-between pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={prevStep}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Précédent
                    </Button>
                    <Button type="submit" size="lg" className="gap-2">
                        Suivant
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </form>
        </Form>
    );
}
