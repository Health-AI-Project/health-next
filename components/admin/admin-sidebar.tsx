"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Shield,
    Database,
    CheckCircle2,
    BarChart3,
    Workflow,
    ArrowLeft,
    Sliders,
} from "lucide-react";

const adminNavItems = [
    { href: "/dashboard/admin", label: "Vue d'ensemble", icon: Shield },
    { href: "/dashboard/admin/data-quality", label: "Qualité des données", icon: Sliders },
    { href: "/dashboard/admin/datasets", label: "Datasets", icon: Database },
    { href: "/dashboard/admin/validation", label: "Validation", icon: CheckCircle2 },
    { href: "/dashboard/admin/analytics", label: "Analytics business", icon: BarChart3 },
    { href: "/dashboard/admin/flow", label: "Flux de données", icon: Workflow },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside
            className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar-background text-sidebar-foreground"
            aria-label="Navigation administration"
        >
            <div className="flex h-16 items-center gap-3 border-b px-6">
                <Shield className="h-8 w-8 text-primary" aria-hidden="true" />
                <div>
                    <p className="text-sm font-bold leading-tight">Admin</p>
                    <p className="text-xs text-muted-foreground leading-tight">HealthAI Coach</p>
                </div>
            </div>

            <nav className="flex-1 space-y-1 p-4" aria-label="Sections administration">
                {adminNavItems.map((item) => {
                    const isActive =
                        item.href === "/dashboard/admin"
                            ? pathname === item.href
                            : pathname?.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                            )}
                            aria-current={isActive ? "page" : undefined}
                        >
                            <item.icon className="h-5 w-5" aria-hidden="true" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t p-4">
                <Button asChild variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
                    <Link href="/dashboard">
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        Retour au dashboard
                    </Link>
                </Button>
            </div>
        </aside>
    );
}
