import { Metadata } from "next";
import { DynamicThemeProvider } from "@/components/providers/dynamic-theme-provider";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
    title: "Dashboard | HealthNext",
    description: "Tableau de bord analytique B2B",
};

export default function DashboardRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DynamicThemeProvider>
            <DashboardLayout>{children}</DashboardLayout>
            <Toaster position="bottom-right" />
        </DynamicThemeProvider>
    );
}

