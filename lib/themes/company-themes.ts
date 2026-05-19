import { Activity, Dumbbell, Zap, Heart, type LucideIcon } from "lucide-react";

export interface CompanyTheme {
    id: string;
    name: string;
    icon: LucideIcon;
    colors: {
        primary: string;
        primaryForeground: string;
        accent: string;
        accentForeground: string;
        chart1: string;
        chart2: string;
        chart3: string;
    };
}

export const companyThemes: Record<string, CompanyTheme> = {
    default: {
        id: "default",
        name: "HealthNext",
        icon: Activity,
        colors: {
            primary: "142 72% 29%",
            primaryForeground: "0 0% 100%",
            accent: "142 72% 29%",
            accentForeground: "0 0% 100%",
            chart1: "142 72% 29%",
            chart2: "173 58% 39%",
            chart3: "197 37% 24%",
        },
    },
    gymclub: {
        id: "gymclub",
        name: "Gym Club",
        icon: Dumbbell,
        colors: {
            primary: "262 80% 40%",
            primaryForeground: "0 0% 100%",
            accent: "262 80% 40%",
            accentForeground: "0 0% 100%",
            chart1: "262 80% 40%",
            chart2: "280 65% 60%",
            chart3: "250 50% 50%",
        },
    },
    fitlife: {
        id: "fitlife",
        name: "FitLife Pro",
        icon: Zap,
        colors: {
            primary: "25 95% 35%",
            primaryForeground: "0 0% 100%",
            accent: "25 95% 35%",
            accentForeground: "0 0% 100%",
            chart1: "25 95% 35%",
            chart2: "38 92% 50%",
            chart3: "16 70% 50%",
        },
    },
    wellness: {
        id: "wellness",
        name: "Wellness Center",
        icon: Heart,
        colors: {
            primary: "199 89% 30%",
            primaryForeground: "0 0% 100%",
            accent: "199 89% 30%",
            accentForeground: "0 0% 100%",
            chart1: "199 89% 30%",
            chart2: "186 72% 50%",
            chart3: "210 60% 45%",
        },
    },
};

export function getThemeById(id: string): CompanyTheme {
    return companyThemes[id] || companyThemes.default;
}
