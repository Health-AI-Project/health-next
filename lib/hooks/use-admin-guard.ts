"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/lib/hooks/use-user-role";

interface AdminGuardState {
    isAdmin: boolean;
    isLoading: boolean;
}

export function useAdminGuard(redirectTo = "/dashboard"): AdminGuardState {
    const router = useRouter();
    const { isAdmin, isLoading } = useUserRole();

    useEffect(() => {
        if (!isLoading && !isAdmin) {
            router.replace(redirectTo);
        }
    }, [isAdmin, isLoading, redirectTo, router]);

    return { isAdmin, isLoading };
}
