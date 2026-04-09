"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toaster";
import { Heart, LogIn, Loader2 } from "lucide-react";
import { useState } from "react";

const loginSchema = z.object({
    email: z.string().email("Email invalide"),
    password: z.string().min(1, "Le mot de passe est requis"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function ConnexionPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: LoginFormValues) => {
        setIsLoading(true);
        try {
            const { error } = await authClient.signIn.email({
                email: values.email,
                password: values.password,
            });

            if (error) {
                toast.error(error.message || "Email ou mot de passe incorrect");
                return;
            }

            toast.success("Connexion reussie !");
            router.push("/dashboard");
        } catch {
            toast.error("Erreur de connexion au serveur");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
            <header className="container mx-auto px-4 py-6">
                <nav className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Heart className="h-8 w-8 text-primary" aria-hidden="true" />
                        <span className="text-xl font-bold">HealthNext</span>
                    </Link>
                </nav>
            </header>

            <main className="flex-1 flex items-center justify-center px-4 pb-16">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Connexion</CardTitle>
                        <CardDescription>
                            Connectez-vous a votre compte HealthNext
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
                                                    autoComplete="current-password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full gap-2"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <LogIn className="h-4 w-4" />
                                    )}
                                    {isLoading ? "Connexion..." : "Se connecter"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2 text-center">
                        <p className="text-sm text-muted-foreground">
                            Pas encore de compte ?{" "}
                            <Link href="/inscription" className="text-primary font-medium hover:underline">
                                Creer un compte
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </main>
        </div>
    );
}
