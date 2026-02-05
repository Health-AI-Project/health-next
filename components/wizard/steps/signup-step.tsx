"use client";

import { useWizardStore } from "@/lib/stores/wizard-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, UserPlus, ArrowLeft } from "lucide-react";
import { useState } from "react";

const signupSchema = z.object({
    email: z.string().email("Email invalide"),
    password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupStep() {
    const { data: wizardData, prevStep } = useWizardStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { data: session } = authClient.useSession();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupFormValues>({
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

            const activeToken = signupData?.token;

            // Envoyer les données du wizard au profil santé
            try {
                const dob = wizardData.age
                    ? `${new Date().getFullYear() - wizardData.age}-01-01`
                    : "1990-01-01";

                const payload = {
                    date_of_birth: dob,
                    goals: Array.isArray(wizardData.goals) ? wizardData.goals : [],
                    allergies: Array.isArray(wizardData.allergies) ? wizardData.allergies : [],
                    weight: Number(wizardData.weight) || 0,
                };

                // console.log("[SignupStep] Sending profile payload:", payload);

                const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${activeToken || ''}`
                    },
                    body: JSON.stringify(payload),
                });

                if (!profileResponse.ok) {
                    console.warn("Échec de la mise à jour du profil santé, mais le compte est créé.");
                }
            } catch (profileErr) {
                console.error("Error updating health profile:", profileErr);
            }

            toast.success("Compte créé avec succès !");
            router.push("/dashboard");
        } catch (err) {
            console.error("Signup error:", err);
            toast.error("Erreur de connexion au serveur");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        {...register("email")}
                    />
                    {errors.email && (
                        <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        {...register("password")}
                    />
                    {errors.password && (
                        <p className="text-sm text-red-500">{errors.password.message}</p>
                    )}
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
                    Retour
                </Button>
                <Button
                    type="submit"
                    size="lg"
                    disabled={isLoading}
                    className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <UserPlus className="h-4 w-4" />
                    )}
                    Créer mon compte
                </Button>
            </div>
        </form>
    );
}
