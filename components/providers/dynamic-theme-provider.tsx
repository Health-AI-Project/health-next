"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
    useCallback,
} from "react";
import {
    CompanyTheme,
    companyThemes,
    getThemeById,
} from "@/lib/themes/company-themes";

type ColorMode = "light" | "dark" | "system";

interface ThemeContextValue {
    currentTheme: CompanyTheme;
    setTheme: (themeId: string) => void;
    availableThemes: CompanyTheme[];
    colorMode: ColorMode;
    setColorMode: (mode: ColorMode) => void;
    resolvedColorMode: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function applyThemeColors(theme: CompanyTheme) {
    const root = document.documentElement;

    root.style.setProperty("--primary", theme.colors.primary);
    root.style.setProperty("--primary-foreground", theme.colors.primaryForeground);
    root.style.setProperty("--accent", theme.colors.accent);
    root.style.setProperty("--accent-foreground", theme.colors.accentForeground);
    root.style.setProperty("--ring", theme.colors.primary);
    root.style.setProperty("--chart-1", theme.colors.chart1);
    root.style.setProperty("--chart-2", theme.colors.chart2);
    root.style.setProperty("--chart-3", theme.colors.chart3);
}

interface DynamicThemeProviderProps {
    children: ReactNode;
    defaultTheme?: string;
    defaultColorMode?: ColorMode;
}

export function DynamicThemeProvider({
    children,
    defaultTheme = "default",
    defaultColorMode = "system",
}: DynamicThemeProviderProps) {
    const [currentTheme, setCurrentTheme] = useState<CompanyTheme>(() =>
        getThemeById(defaultTheme)
    );
    const [colorMode, setColorMode] = useState<ColorMode>(defaultColorMode);
    const [resolvedColorMode, setResolvedColorMode] = useState<"light" | "dark">("light");

    const resolveColorMode = useCallback((mode: ColorMode): "light" | "dark" => {
        if (mode === "system") {
            return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }
        return mode;
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Syncing with browser media query requires setState in effect
        setResolvedColorMode(resolveColorMode(colorMode));

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => setResolvedColorMode(resolveColorMode(colorMode));
        mediaQuery.addEventListener("change", handler);

        return () => mediaQuery.removeEventListener("change", handler);
    }, [colorMode, resolveColorMode]);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(resolvedColorMode);
    }, [resolvedColorMode]);

    useEffect(() => {
        applyThemeColors(currentTheme);
    }, [currentTheme]);

    const setTheme = useCallback((themeId: string) => {
        const theme = getThemeById(themeId);
        setCurrentTheme(theme);
        localStorage.setItem("company-theme", themeId);
    }, []);

    const handleSetColorMode = useCallback((mode: ColorMode) => {
        setColorMode(mode);
        localStorage.setItem("color-mode", mode);
    }, []);

    useEffect(() => {
        const savedTheme = localStorage.getItem("company-theme");
        const savedColorMode = localStorage.getItem("color-mode") as ColorMode | null;

        if (savedTheme) {
            const theme = getThemeById(savedTheme);
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Restoring persisted theme on mount
            setCurrentTheme(theme);
        }
        if (savedColorMode) {
            setColorMode(savedColorMode);
        }
    }, []);

    const availableThemes = Object.values(companyThemes);

    return (
        <ThemeContext.Provider
            value={{
                currentTheme,
                setTheme,
                availableThemes,
                colorMode,
                setColorMode: handleSetColorMode,
                resolvedColorMode,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a DynamicThemeProvider");
    }
    return context;
}

export function useChartColors() {
    const { currentTheme, resolvedColorMode } = useTheme();

    return {
        primary: `hsl(${currentTheme.colors.chart1})`,
        secondary: `hsl(${currentTheme.colors.chart2})`,
        tertiary: `hsl(${currentTheme.colors.chart3})`,
        text: resolvedColorMode === "dark" ? "hsl(0 0% 98%)" : "hsl(0 0% 9%)",
        grid: resolvedColorMode === "dark" ? "hsl(0 0% 20%)" : "hsl(0 0% 90%)",
        background: resolvedColorMode === "dark" ? "hsl(0 0% 5%)" : "hsl(0 0% 100%)",
    };
}
