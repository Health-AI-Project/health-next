"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export type SubscriptionTier = "free" | "premium" | "premium_plus";

interface PremiumState {
    tier: SubscriptionTier;
    isLoading: boolean;
}

export function usePremiumStatus(): PremiumState & {
    isPremium: boolean;
    isPremiumPlus: boolean;
    canAccess: (requiredTier: SubscriptionTier) => boolean;
} {
    const [state, setState] = useState<PremiumState>({
        tier: "free",
        isLoading: true,
    });

    useEffect(() => {
        async function fetchStatus() {
            try {
                const response = await apiFetch<{
                    data: { user?: { is_premium?: boolean; subscription_tier?: string } };
                }>("/api/home");
                const user = response.data.user;
                let tier: SubscriptionTier = "free";
                if (user?.subscription_tier === "premium_plus") {
                    tier = "premium_plus";
                } else if (user?.subscription_tier === "premium" || user?.is_premium) {
                    tier = "premium";
                }
                setState({ tier, isLoading: false });
            } catch {
                setState({ tier: "free", isLoading: false });
            }
        }
        fetchStatus();
    }, []);

    const tierLevel = { free: 0, premium: 1, premium_plus: 2 };

    return {
        ...state,
        isPremium: tierLevel[state.tier] >= 1,
        isPremiumPlus: state.tier === "premium_plus",
        canAccess: (requiredTier: SubscriptionTier) =>
            tierLevel[state.tier] >= tierLevel[requiredTier],
    };
}
