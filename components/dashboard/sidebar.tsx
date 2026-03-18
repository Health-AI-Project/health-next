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
import {
    LayoutDashboard,
    BarChart3,
    Settings,
    Users,
    Sun,
    Moon,
    Monitor,
    Utensils,
} from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/nutrition", label: "Nutrition", icon: Utensils },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/clients", label: "Clients", icon: Users },
    { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const {
        currentTheme,
        setTheme,
        availableThemes,
        colorMode,
        setColorMode,
    } = useTheme();

    return (
        <aside
            className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar-background text-sidebar-foreground"
        >
            <div className="flex h-16 items-center gap-3 border-b px-6">
                <currentTheme.icon className="h-8 w-8 text-primary" aria-label={`Logo ${currentTheme.name}`} />
                <span className="text-lg font-bold">{currentTheme.name}</span>
            </div>

            <nav className="flex-1 space-y-1 p-4" aria-label="Navigation principale">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                            aria-current={isActive ? "page" : undefined}
                        >
                            <item.icon className="h-5 w-5" aria-hidden="true" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t p-4 space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">
                        Entreprise
                    </Label>
                    <Select value={currentTheme.id} onValueChange={setTheme}>
                        <SelectTrigger aria-label="Sélectionner une entreprise">
                            <SelectValue placeholder="Sélectionner une entreprise" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableThemes.map((theme) => (
                                <SelectItem key={theme.id} value={theme.id}>
                                    {theme.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">
                        Mode
                    </Label>
                    <div className="flex gap-1">
                        <Button
                            variant={colorMode === "light" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setColorMode("light")}
                            className="flex-1"
                            aria-label="Mode clair"
                        >
                            <Sun className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={colorMode === "dark" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setColorMode("dark")}
                            className="flex-1"
                            aria-label="Mode sombre"
                        >
                            <Moon className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={colorMode === "system" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setColorMode("system")}
                            className="flex-1"
                            aria-label="Mode système"
                        >
                            <Monitor className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
