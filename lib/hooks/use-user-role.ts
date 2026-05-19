"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export type UserRole = "user" | "admin";

interface RoleState {
    role: UserRole;
    isLoading: boolean;
}

const DEMO_ADMIN_KEY = "health_ai_demo_admin";

function readDemoAdmin(): boolean {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(DEMO_ADMIN_KEY) === "1";
}

export function setDemoAdmin(enabled: boolean): void {
    if (typeof window === "undefined") return;
    if (enabled) {
        window.localStorage.setItem(DEMO_ADMIN_KEY, "1");
    } else {
        window.localStorage.removeItem(DEMO_ADMIN_KEY);
    }
    window.dispatchEvent(new Event("health_ai_role_change"));
}

export function useUserRole(): RoleState & { isAdmin: boolean } {
    const [state, setState] = useState<RoleState>({
        role: "user",
        isLoading: true,
    });

    useEffect(() => {
        async function fetchRole() {
            try {
                const response = await apiFetch<{
                    data: { user?: { role?: string; is_admin?: boolean } };
                }>("/api/home");
                const user = response.data.user;
                const apiAdmin = user?.role === "admin" || user?.is_admin === true;
                const role: UserRole = apiAdmin || readDemoAdmin() ? "admin" : "user";
                setState({ role, isLoading: false });
            } catch {
                const role: UserRole = readDemoAdmin() ? "admin" : "user";
                setState({ role, isLoading: false });
            }
        }
        fetchRole();

        function onChange() {
            setState((prev) => ({
                ...prev,
                role: readDemoAdmin() ? "admin" : prev.role === "admin" && !readDemoAdmin() ? "user" : prev.role,
            }));
        }
        window.addEventListener("health_ai_role_change", onChange);
        return () => window.removeEventListener("health_ai_role_change", onChange);
    }, []);

    return {
        ...state,
        isAdmin: state.role === "admin",
    };
}
