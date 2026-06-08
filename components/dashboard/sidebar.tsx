"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/dynamic-theme-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    LayoutDashboard,
    BarChart3,
    Settings,
    Users,
    Dumbbell,
    ClipboardCheck,
    Sun,
    Moon,
    Monitor,
    Utensils,
    Crown,
    LogOut,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/nutrition", label: "Nutrition", icon: Utensils },
    { href: "/dashboard/workouts", label: "Entrainement", icon: Dumbbell, premium: true },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, premium: true },
    { href: "/dashboard/data-quality", label: "Qualite", icon: ClipboardCheck },
    { href: "/dashboard/clients", label: "Clients", icon: Users },
    { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const {
        currentTheme,
        setTheme,
        availableThemes,
        colorMode,
        setColorMode,
    } = useTheme();

    async function handleSignOut() {
        await authClient.signOut();
        router.push("/connexion");
    }

    return (
        <aside className="flex h-screen w-64 flex-col bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))]">
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 px-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--sidebar-primary))]/20">
                    <currentTheme.icon className="h-5 w-5 text-[hsl(var(--sidebar-primary))]" aria-label={`Logo ${currentTheme.name}`} />
                </div>
                <span className="text-base font-bold tracking-tight text-[hsl(var(--sidebar-foreground))]">
                    {currentTheme.name}
                </span>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-2" aria-label="Navigation principale">
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--sidebar-muted))]">
                    Menu
                </p>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 mb-0.5",
                                isActive
                                    ? "bg-[hsl(var(--sidebar-primary))]/15 text-[hsl(var(--sidebar-primary))]"
                                    : "text-[hsl(var(--sidebar-muted))] hover:bg-white/5 hover:text-[hsl(var(--sidebar-foreground))]"
                            )}
                            aria-current={isActive ? "page" : undefined}
                        >
                            <item.icon
                                className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-[hsl(var(--sidebar-primary))]" : "text-[hsl(var(--sidebar-muted))]")}
                                aria-hidden="true"
                            />
                            {item.label}
                            {"premium" in item && item.premium && (
                                <span className="ml-auto flex items-center gap-1 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">
                                    <Crown className="h-2.5 w-2.5" aria-hidden="true" />
                                    Pro
                                </span>
                            )}
                            {isActive && (
                                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[hsl(var(--sidebar-primary))]" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="border-t border-[hsl(var(--sidebar-border))] p-3 space-y-2">
                <Select value={currentTheme.id} onValueChange={setTheme}>
                    <SelectTrigger
                        className="w-full h-9 border-[hsl(var(--sidebar-border))] bg-white/5 text-[hsl(var(--sidebar-muted))] text-xs hover:bg-white/10"
                        aria-label="Sélectionner une entreprise"
                    >
                        <SelectValue placeholder="Entreprise" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableThemes.map((theme) => (
                            <SelectItem key={theme.id} value={theme.id}>
                                {theme.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="flex items-center gap-1">
                    {(["light", "dark", "system"] as const).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setColorMode(mode)}
                            className={cn(
                                "flex flex-1 items-center justify-center rounded-md p-1.5 transition-colors",
                                colorMode === mode
                                    ? "bg-[hsl(var(--sidebar-primary))]/20 text-[hsl(var(--sidebar-primary))]"
                                    : "text-[hsl(var(--sidebar-muted))] hover:bg-white/5"
                            )}
                            aria-label={mode}
                        >
                            {mode === "light" && <Sun className="h-3.5 w-3.5" />}
                            {mode === "dark" && <Moon className="h-3.5 w-3.5" />}
                            {mode === "system" && <Monitor className="h-3.5 w-3.5" />}
                        </button>
                    ))}
                </div>

                <button
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-[hsl(var(--sidebar-muted))] transition-colors hover:bg-red-500/10 hover:text-red-400"
                    onClick={handleSignOut}
                >
                    <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                    Se déconnecter
                </button>
            </div>
        </aside>
    );
}
