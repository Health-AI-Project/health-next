"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface PremiumState {
    isPremium: boolean;
    isLoading: boolean;
}

export function usePremiumStatus(): PremiumState {
    const [state, setState] = useState<PremiumState>({
        isPremium: false,
        isLoading: true,
    });

    useEffect(() => {
        async function fetchStatus() {
            try {
                const response = await apiFetch<{
                    data: { user?: { is_premium?: boolean } };
                }>("/api/home");
                setState({
                    isPremium: response.data.user?.is_premium ?? false,
                    isLoading: false,
                });
            } catch {
                setState({ isPremium: false, isLoading: false });
            }
        }
        fetchStatus();
    }, []);

    return state;
}
