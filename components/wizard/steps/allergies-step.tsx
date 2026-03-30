"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    allergiesSchema,
    type AllergiesFormData,
    ALLERGIES_OPTIONS,
} from "@/lib/schemas/wizard-schemas";
import { useWizardStore } from "@/lib/stores/wizard-store";
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
import { WizardNavigation } from "@/components/wizard/wizard-navigation";

export function AllergiesStep() {
    const { data, updateData, nextStep, prevStep } = useWizardStore();

    const form = useForm<AllergiesFormData>({
        resolver: zodResolver(allergiesSchema),
        defaultValues: {
            allergies: data.allergies || [],
        },
    });

    const onSubmit = (formData: AllergiesFormData) => {
        updateData({ allergies: formData.allergies || [] });
        nextStep();
    };

    const handleNoneSelected = (checked: boolean, field: { value?: string[]; onChange: (value: string[]) => void }) => {
        if (checked) {
            field.onChange(["none"]);
        } else {
            field.onChange([]);
        }
    };

    const handleAllergySelected = (
        checked: boolean,
        optionId: string,
        field: { value?: string[]; onChange: (value: string[]) => void }
    ) => {
        const currentValues = (field.value || []).filter((v) => v !== "none");
        if (checked) {
            field.onChange([...currentValues, optionId]);
        } else {
            field.onChange(currentValues.filter((value) => value !== optionId));
        }
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
                    name="allergies"
                    render={() => (
                        <FormItem>
                            <FormLabel className="text-base">
                                Avez-vous des allergies alimentaires ?
                            </FormLabel>
                            <FormDescription id="allergies-description">
                                Sélectionnez vos allergies ou "Aucune allergie"
                            </FormDescription>
                            <div
                                className="grid gap-3 pt-2"
                                role="group"
                                aria-labelledby="allergies-label"
                                aria-describedby="allergies-description"
                            >
                                {ALLERGIES_OPTIONS.map((option) => (
                                    <FormField
                                        key={option.id}
                                        control={form.control}
                                        name="allergies"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(option.id)}
                                                        onCheckedChange={(checked) => {
                                                            if (option.id === "none") {
                                                                handleNoneSelected(!!checked, field);
                                                            } else {
                                                                handleAllergySelected(!!checked, option.id, field);
                                                            }
                                                        }}
                                                        disabled={
                                                            option.id !== "none" &&
                                                            field.value?.includes("none")
                                                        }
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
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <WizardNavigation onPrev={prevStep} />
            </form>
        </Form>
    );
}
