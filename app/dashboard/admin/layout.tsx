"use client";

import { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SkipLink } from "@/components/ui/skip-link";
import { useAdminGuard } from "@/lib/hooks/use-admin-guard";

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { isAdmin, isLoading } = useAdminGuard();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
                    Vérification des droits d&apos;accès...
                </p>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-8">
                <div className="max-w-md space-y-4 text-center">
                    <h1 className="text-2xl font-bold">Accès refusé</h1>
                    <p className="text-muted-foreground">
                        Cette section est réservée aux administrateurs HealthAI Coach.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-background">
            <SkipLink href="#admin-main" />
            <AdminSidebar />
            <main id="admin-main" className="flex-1 overflow-auto" tabIndex={-1}>
                <div className="container mx-auto p-6 lg:p-8">{children}</div>
            </main>
        </div>
    );
}
