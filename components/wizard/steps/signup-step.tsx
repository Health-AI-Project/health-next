"use client";

import { useWizardStore } from "@/lib/stores/wizard-store";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toaster";
import { WizardNavigation } from "@/components/wizard/wizard-navigation";
import { Loader2, UserPlus } from "lucide-react";
import { useState } from "react";

const signupSchema = z.object({
    email: z.string().email("Email invalide"),
    password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupStep() {
    const { data: wizardData, prevStep, reset: resetWizard } = useWizardStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: SignupFormValues) => {
        setIsLoading(true);
        try {
            const { data: signupData, error } = await authClient.signUp.email({
                email: values.email,
                password: values.password,
                name: values.email.split("@")[0],
                // On pourrait passer les wizardData ici si le backend les supportait en metadata
            });

            if (error) {
                toast.error(error.message || "Une erreur est survenue lors de l'inscription");
                return;
            }

            // Envoyer les données du wizard au profil santé (via cookies, session déjà active)
            try {
                const dob = wizardData.age
                    ? `${new Date().getFullYear() - wizardData.age}-01-01`
                    : "1990-01-01";

                const payload = {
                    date_of_birth: dob,
                    goals: Array.isArray(wizardData.goals) ? wizardData.goals : [],
                    allergies: Array.isArray(wizardData.allergies) ? wizardData.allergies : [],
                    weight: Number(wizardData.weight) || 0,
                    height: Number(wizardData.height) || 0,
                };

                await apiFetch("/api/user/profile", {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
            } catch (profileErr) {
                console.error("Error updating health profile:", profileErr);
            }

            toast.success("Compte créé avec succès !");
            resetWizard();
            router.push("/dashboard");
        } catch (err) {
            console.error("Signup error:", err);
            toast.error("Erreur de connexion au serveur");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        type="email"
                                        placeholder="votre@email.com"
                                        autoComplete="email"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mot de passe</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <WizardNavigation
                    onPrev={prevStep}
                    prevLabel="Retour"
                    nextLabel="Créer mon compte"
                    nextIcon={
                        isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <UserPlus className="h-4 w-4" />
                        )
                    }
                    nextVariant="premium"
                    isLoading={isLoading}
                />
            </form>
        </Form>
    );
}
