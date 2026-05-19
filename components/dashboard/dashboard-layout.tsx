"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";

interface DashboardLayoutProps {
    children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <main className="flex-1 overflow-auto">
                <div className="container mx-auto p-6 lg:p-8">{children}</div>
            </main>
        </div>
    );
}
