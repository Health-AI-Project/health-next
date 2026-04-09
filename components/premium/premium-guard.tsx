"use client";

import { ReactNode } from "react";
import { usePremiumStatus, SubscriptionTier } from "@/lib/hooks/use-premium-status";
import { Skeleton } from "@/components/ui/skeleton";
import { UpgradeDialog } from "@/components/premium/upgrade-dialog";

interface PremiumGuardProps {
    children: ReactNode;
    feature: string;
    requiredTier?: SubscriptionTier;
    fallback?: ReactNode;
}

export function PremiumGuard({
    children,
    feature,
    requiredTier = "premium",
    fallback,
}: PremiumGuardProps) {
    const { canAccess, isLoading, tier } = usePremiumStatus();

    if (isLoading) {
        return <Skeleton className="h-32 w-full" />;
    }

    if (canAccess(requiredTier)) {
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
                <UpgradeDialog feature={feature} requiredTier={requiredTier} currentTier={tier} />
            </div>
        </div>
    );
}
