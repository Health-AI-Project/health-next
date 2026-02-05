"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { weightSchema, type WeightFormData } from "@/lib/schemas/wizard-schemas";
import { useWizardStore } from "@/lib/stores/wizard-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export function WeightStep() {
    const { data, updateData, nextStep, prevStep } = useWizardStore();

    const form = useForm<WeightFormData>({
        resolver: zodResolver(weightSchema),
        defaultValues: {
            weight: data.weight,
        },
    });

    const onSubmit = (formData: WeightFormData) => {
        updateData({ weight: formData.weight });
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
                    name="weight"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-base">Quel est votre poids ?</FormLabel>
                            <div className="relative">
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="Ex: 70"
                                        className="text-lg h-12 pr-12"
                                        aria-describedby="weight-description weight-error"
                                        {...field}
                                        onChange={(e) =>
                                            field.onChange(
                                                e.target.value ? parseFloat(e.target.value) : undefined
                                            )
                                        }
                                    />
                                </FormControl>
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    kg
                                </span>
                            </div>
                            <FormDescription id="weight-description">
                                Entrez votre poids en kilogrammes (30-300 kg)
                            </FormDescription>
                            <FormMessage id="weight-error" />
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
