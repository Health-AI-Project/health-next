"use client";

import { ReactNode } from "react";
import { usePremiumStatus } from "@/lib/hooks/use-premium-status";
import { Skeleton } from "@/components/ui/skeleton";
import { UpgradeDialog } from "@/components/premium/upgrade-dialog";

interface PremiumGuardProps {
    children: ReactNode;
    feature: string;
    fallback?: ReactNode;
}

export function PremiumGuard({ children, feature, fallback }: PremiumGuardProps) {
    const { isPremium, isLoading } = usePremiumStatus();

    if (isLoading) {
        return <Skeleton className="h-32 w-full" />;
    }

    if (isPremium) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    return (
        <div className="relative">
            <div className="pointer-events-none opacity-40 blur-[2px] select-none">
                {children}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
                <UpgradeDialog feature={feature} />
            </div>
        </div>
    );
}
