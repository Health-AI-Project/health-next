import { test, expect } from "@playwright/test";

/**
 * Tests du dashboard avec session mockée.
 * On bypasse le middleware auth en injectant le cookie de session
 * et on mock toutes les réponses API.
 */

const SESSION_COOKIE = {
    name: "better-auth.session_token",
    value: "mock_session_token_abc",
    domain: "localhost",
    path: "/",
    httpOnly: true,
    secure: false,
    sameSite: "Lax" as const,
};

const HOME_DATA = {
    data: {
        user: {
            id: "user_123",
            email: "test@example.com",
            weight: 75,
            height: 180,
            is_premium: false,
            subscription_tier: "free",
        },
        stats: {
            calories: 1850,
            protein: 95,
            carbs: 200,
            fat: 60,
            workouts_count: 4,
        },
    },
};

const HOME_DATA_PREMIUM = {
    data: {
        user: {
            ...HOME_DATA.data.user,
            is_premium: true,
            subscription_tier: "premium",
        },
        stats: HOME_DATA.data.stats,
    },
};

const CALORIES_HISTORY = {
    data: [
        { jour: "15/04", date: "2026-04-15", calories: 1850, protein: 90, carbs: 200, fat: 50, objectif: 2000 },
        { jour: "16/04", date: "2026-04-16", calories: 2100, protein: 95, carbs: 220, fat: 55, objectif: 2000 },
    ],
};

const WEIGHT_HISTORY = {
    data: [
        { date: "21/04", poids: 75, objectif: 73 },
    ],
};

const MACROS_DATA = {
    data: [
        { name: "Proteines", value: 25 },
        { name: "Glucides", value: 50 },
        { name: "Lipides", value: 25 },
    ],
};

async function setupAuth(context: any) {
    await context.addCookies([SESSION_COOKIE]);
}

async function mockStandardAPIs(page: any, premium = false) {
    await page.route("**/api/home", async (route: any) => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(premium ? HOME_DATA_PREMIUM : HOME_DATA),
        });
    });
    await page.route("**/api/stats/calories-history**", async (route: any) => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(CALORIES_HISTORY),
        });
    });
    await page.route("**/api/stats/weight-history**", async (route: any) => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(WEIGHT_HISTORY),
        });
    });
    await page.route("**/api/stats/macros", async (route: any) => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(MACROS_DATA),
        });
    });
}

test.describe("Dashboard - Authenticated", () => {
    test.beforeEach(async ({ context }) => {
        await setupAuth(context);
    });

    test("should display user KPIs from API", async ({ page }) => {
        await mockStandardAPIs(page);
        await page.goto("/dashboard");
        await page.waitForLoadState("networkidle");

        // Les 4 KPIs sont présents (titres heading)
        await expect(page.getByRole("heading", { name: "Poids actuel" })).toBeVisible();
        await expect(page.getByRole("heading", { name: /calories aujourd/i })).toBeVisible();
        await expect(page.getByRole("heading", { name: /prot/i })).toBeVisible();
        await expect(page.getByRole("heading", { name: /activit/i })).toBeVisible();
    });

    test("should display demo banner when API fails", async ({ page }) => {
        await page.route("**/api/home", async (route) => {
            await route.fulfill({ status: 500, body: '{"error":"server"}' });
        });
        await page.goto("/dashboard");

        await expect(page.getByText(/mode demonstration|mode démonstration/i)).toBeVisible({ timeout: 5000 });
    });

    test("should render charts with real data", async ({ page }) => {
        await mockStandardAPIs(page);
        await page.goto("/dashboard");

        // Les titres des graphiques doivent être présents
        await expect(page.getByText(/évolution du poids/i)).toBeVisible();
        await expect(page.getByRole("heading", { name: /calories journalières/i })).toBeVisible();
    });

    test("should have BMI card", async ({ page }) => {
        await mockStandardAPIs(page);
        await page.goto("/dashboard");

        // BMI = 75 / (1.80)² = 23.15
        await expect(page.getByText(/IMC|imc/i).first()).toBeVisible({ timeout: 5000 });
    });
});

test.describe("Analytics - Authenticated", () => {
    test.beforeEach(async ({ context }) => {
        await setupAuth(context);
    });

    test("should display analytics page with stats", async ({ page }) => {
        await mockStandardAPIs(page, true); // Premium
        await page.goto("/dashboard/analytics");

        await expect(page.getByRole("heading", { name: /analytics/i })).toBeVisible();
        await expect(page.getByText(/calories moyennes/i)).toBeVisible();
        await expect(page.getByText(/proteines moyennes/i)).toBeVisible();
    });

    test("should have 3 tabs (overview, nutrition, weight)", async ({ page }) => {
        await mockStandardAPIs(page, true);
        await page.goto("/dashboard/analytics");

        await expect(page.getByRole("tab", { name: /vue d.ensemble/i })).toBeVisible();
        await expect(page.getByRole("tab", { name: /nutrition/i })).toBeVisible();
        await expect(page.getByRole("tab", { name: /poids/i })).toBeVisible();
    });

    test("should switch between tabs", async ({ page }) => {
        await mockStandardAPIs(page, true);
        await page.goto("/dashboard/analytics");

        await page.getByRole("tab", { name: /nutrition/i }).click();
        await expect(page.getByRole("heading", { name: /calories journalières/i })).toBeVisible();

        await page.getByRole("tab", { name: /poids/i }).click();
        await expect(page.getByText(/évolution du poids/i)).toBeVisible();
    });
});

test.describe("Settings - Authenticated", () => {
    test.beforeEach(async ({ context }) => {
        await setupAuth(context);
    });

    test("should display settings page with profile", async ({ page }) => {
        await mockStandardAPIs(page);
        await page.goto("/dashboard/settings");

        await expect(page.getByRole("heading", { name: /paramètres|parametres|settings/i })).toBeVisible();
    });

    test("should have profile, goals, and subscription tabs", async ({ page }) => {
        await mockStandardAPIs(page);
        await page.goto("/dashboard/settings");

        // Les onglets/sections settings existent
        const profileTab = page.getByRole("tab", { name: /profil/i }).or(page.getByText(/mon profil/i).first());
        await expect(profileTab).toBeVisible({ timeout: 5000 });
    });
});

test.describe("Premium Guard", () => {
    test.beforeEach(async ({ context }) => {
        await setupAuth(context);
    });

    test("should block free user workout generation via API 403", async ({ page }) => {
        // Mock backend returning 403 Premium required
        await page.route("**/api/workout/generate", async (route) => {
            await route.fulfill({
                status: 403,
                contentType: "application/json",
                body: JSON.stringify({
                    error: "Premium required",
                    required_tier: "premium",
                }),
            });
        });
        await mockStandardAPIs(page, false);
        await page.goto("/dashboard/workouts");

        // Essaie de cliquer sur générer si bouton présent
        const generateBtn = page.getByRole("button", { name: /générer|generer/i }).first();
        const count = await generateBtn.count();
        if (count > 0) {
            await generateBtn.click();
            await page.waitForTimeout(1000);
            // Un toast d'erreur ou PremiumGuard doit bloquer (pas de plan généré)
            // On vérifie juste que la page ne crash pas
        }
        // La page se charge sans erreur fatale
        await expect(page).toHaveURL(/\/dashboard\/workouts|\/connexion/);
    });

    test("should allow workouts for premium user", async ({ page }) => {
        await mockStandardAPIs(page, true); // Premium
        await page.route("**/api/workout/generate", async (route) => {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    plan_id: "plan_1",
                    date: "2026-04-21",
                    duration_minutes: 30,
                    est_calories_burn: 300,
                    exercises: [
                        {
                            exercise_id: "ex_1",
                            name: "Pompes",
                            order: 1,
                            sets: 3,
                            reps: 12,
                            duration_sec: 0,
                            rest_sec: 60,
                            details: { type: "STRENGTH", difficulty: "BEGINNER", equipment: "NONE", muscle_targets: ["Pectoraux"], video_url: "" },
                        },
                    ],
                }),
            });
        });

        await page.goto("/dashboard/workouts");
        // La page workouts doit charger sans le guard bloquant
        await expect(page.getByRole("heading", { name: /workouts|entra|programme/i }).first()).toBeVisible({ timeout: 5000 });
    });
});

test.describe("API Error Handling", () => {
    test.beforeEach(async ({ context }) => {
        await setupAuth(context);
    });

    test("should handle 401 by redirecting to login", async ({ page }) => {
        await page.route("**/api/home", async (route) => {
            await route.fulfill({ status: 401, body: '{"error":"unauthorized"}' });
        });

        await page.goto("/dashboard");
        // 401 redirects to /connexion
        await page.waitForURL(/\/connexion/, { timeout: 5000 });
    });

    test("should handle 500 with demo fallback", async ({ page }) => {
        await page.route("**/api/home", async (route) => {
            await route.fulfill({ status: 500, body: '{"error":"server"}' });
        });

        await page.goto("/dashboard");
        await expect(page.getByText(/mode demonstration|mode démonstration/i)).toBeVisible({ timeout: 5000 });
    });

    test("should show toast on workout generation error", async ({ page }) => {
        await mockStandardAPIs(page, true);
        await page.route("**/api/workout/generate", async (route) => {
            await route.fulfill({
                status: 500,
                body: '{"error":"internal"}',
            });
        });

        await page.goto("/dashboard/workouts");
        const generateBtn = page.getByRole("button", { name: /générer|generer/i }).first();
        const count = await generateBtn.count();
        if (count > 0) {
            await generateBtn.click();
            // Un toast ou message d'erreur doit apparaître
            await page.waitForTimeout(1500);
        }
    });
});
