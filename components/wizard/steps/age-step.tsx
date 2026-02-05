"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ageSchema, type AgeFormData } from "@/lib/schemas/wizard-schemas";
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
import { ArrowRight } from "lucide-react";

export function AgeStep() {
    const { data, updateData, nextStep } = useWizardStore();

    const form = useForm<AgeFormData>({
        resolver: zodResolver(ageSchema),
        defaultValues: {
            age: data.age,
        },
    });

    const onSubmit = (formData: AgeFormData) => {
        updateData({ age: formData.age });
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
                    name="age"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-base">Quel est votre âge ?</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder="Ex: 35"
                                    className="text-lg h-12"
                                    aria-describedby="age-description age-error"
                                    {...field}
                                    onChange={(e) =>
                                        field.onChange(
                                            e.target.value ? parseInt(e.target.value, 10) : undefined
                                        )
                                    }
                                />
                            </FormControl>
                            <FormDescription id="age-description">
                                Entrez votre âge en années (18-120 ans)
                            </FormDescription>
                            <FormMessage id="age-error" />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end pt-4">
                    <Button type="submit" size="lg" className="gap-2">
                        Suivant
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </form>
        </Form>
    );
}
