import { test, expect, type Page } from "@playwright/test";

/**
 * Tests e2e des pages admin MSPR501.
 * - Bypass auth via cookie de session
 * - Mock /api/home pour user role=admin
 * - Mock /api/admin/* pour fixture déterministe
 */

const SESSION_COOKIE = {
    name: "better-auth.session_token",
    value: "mock_admin_session_token",
    domain: "localhost",
    path: "/",
    httpOnly: true,
    secure: false,
    sameSite: "Lax" as const,
};

const ADMIN_USER = {
    data: {
        user: {
            id: "admin_123",
            email: "admin@healthai.coach",
            name: "Admin Test",
            role: "admin",
            is_admin: true,
        },
        stats: { calories: 0, protein: 0, carbs: 0, fat: 0, workouts_count: 0 },
    },
};

const DATA_QUALITY_METRICS = {
    data: {
        total_runs_24h: 5,
        successful_runs_24h: 4,
        failed_runs_24h: 1,
        rows_ingested_24h: 25000,
        rows_rejected_24h: 300,
        rejection_rate_pct: 1.2,
        avg_duration_seconds: 180,
        by_source: [
            {
                source: "daily_food_nutrition",
                rows_inserted: 20000,
                rows_rejected: 200,
                rejection_rate_pct: 1.0,
                last_run_status: "success",
                last_run_at: new Date().toISOString(),
            },
        ],
    },
};

const ETL_RUNS = {
    data: [
        {
            id: 100,
            source_type: "csv",
            source_name: "daily_food_nutrition",
            status: "success",
            started_at: new Date(Date.now() - 3600000).toISOString(),
            finished_at: new Date(Date.now() - 3500000).toISOString(),
            rows_inserted: 9847,
            rows_rejected: 153,
            error_message: null,
        },
        {
            id: 99,
            source_type: "json",
            source_name: "exercisedb",
            status: "failed",
            started_at: new Date(Date.now() - 7200000).toISOString(),
            finished_at: new Date(Date.now() - 7100000).toISOString(),
            rows_inserted: 0,
            rows_rejected: 0,
            error_message: "Connexion timeout après 30s",
        },
    ],
};

const VALIDATION_QUEUE = {
    data: [
        {
            id: 1,
            entity_type: "daily_food_nutrition",
            entity_id: "dfn_002",
            status: "PENDING",
            payload: {
                food: "Caesar salad",
                calories: 850,
                anomaly: "macro_mismatch",
                suggested_fix: { calories: 312 },
            },
            reviewed_by: null,
            reviewed_at: null,
            created_at: new Date(Date.now() - 3600000).toISOString(),
        },
    ],
};

const EMPTY_LIST = { data: [], meta: { count: 0 } };

async function setupAdminContext(page: Page) {
    await page.context().addCookies([SESSION_COOKIE]);
    await page.context().addInitScript(() => {
        window.localStorage.setItem("health_ai_demo_admin", "1");
    });

    await page.context().route("**/api/home", (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(ADMIN_USER),
        }),
    );

    await page.context().route("**/api/admin/data-quality", (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(DATA_QUALITY_METRICS),
        }),
    );

    await page.context().route("**/api/admin/runs**", (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(ETL_RUNS),
        }),
    );

    await page.context().route("**/api/admin/validation**", (route) => {
        if (route.request().method() === "POST") {
            return route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    data: {
                        id: 1,
                        status: "VALIDATED",
                        reviewed_by: "admin@healthai.coach",
                        reviewed_at: new Date().toISOString(),
                    },
                }),
            });
        }
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(VALIDATION_QUEUE),
        });
    });

    await page.context().route("**/api/admin/**", (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(EMPTY_LIST),
        }),
    );
}

test.describe("Admin — parcours utilisateur (MSPR501)", () => {
    test.beforeEach(async ({ page }) => {
        await setupAdminContext(page);
    });

    test("Affiche la page d'accueil admin avec les 5 cartes de sections", async ({ page }) => {
        await page.goto("/dashboard/admin");
        await expect(page.getByRole("heading", { name: /Administration HealthAI Coach/i })).toBeVisible();
        await expect(page.getByRole("link", { name: /Qualité des données/i })).toBeVisible();
        await expect(page.getByRole("link", { name: /Datasets/i })).toBeVisible();
        await expect(page.getByRole("link", { name: /Workflow de validation/i })).toBeVisible();
        await expect(page.getByRole("link", { name: /Analytics business/i })).toBeVisible();
        await expect(page.getByRole("link", { name: /Flux de données/i })).toBeVisible();
    });

    test("Affiche les KPIs et la table des runs sur la page qualité", async ({ page }) => {
        await page.goto("/dashboard/admin/data-quality");
        await page.waitForLoadState("networkidle");

        // KPIs
        await expect(page.getByText("Lignes ingérées (24h)")).toBeVisible();
        await expect(page.getByText("Taux de rejet")).toBeVisible();
        await expect(page.getByText("Taux de succès")).toBeVisible();

        // Table des runs
        await expect(page.getByText("#100")).toBeVisible();
        await expect(page.getByText("#99")).toBeVisible();

        // Bloc d'alertes pour le run failed
        await expect(page.getByText(/Connexion timeout/i)).toBeVisible();
    });

    test("La sidebar admin contient toutes les sections", async ({ page }) => {
        await page.goto("/dashboard/admin");
        const sidebar = page.getByRole("complementary", { name: /Navigation administration/i });
        await expect(sidebar).toBeVisible();

        await expect(sidebar.getByRole("link", { name: /Vue d'ensemble/i })).toBeVisible();
        await expect(sidebar.getByRole("link", { name: /Qualité des données/i })).toBeVisible();
        await expect(sidebar.getByRole("link", { name: /Datasets/i })).toBeVisible();
        await expect(sidebar.getByRole("link", { name: /Validation/i })).toBeVisible();
        await expect(sidebar.getByRole("link", { name: /Analytics business/i })).toBeVisible();
        await expect(sidebar.getByRole("link", { name: /Flux de données/i })).toBeVisible();
    });

    test("La page validation affiche les lots en attente et permet d'approuver", async ({ page }) => {
        await page.goto("/dashboard/admin/validation");
        await page.waitForLoadState("networkidle");

        // En-tête + KPIs
        await expect(page.getByRole("heading", { name: "Validation" })).toBeVisible();

        // Lot pending visible (id 1, source daily_food_nutrition)
        await expect(page.getByText("#1").first()).toBeVisible();

        // Bouton Approuver visible
        const approveButton = page.getByRole("button", { name: /Approuver le lot 1/i }).first();
        await expect(approveButton).toBeVisible();

        // Clic + vérification toast
        await approveButton.click();
        await expect(page.getByText(/Lot approuvé/i)).toBeVisible({ timeout: 3000 });
    });

    test("La page analytics business charge les 6 KPIs", async ({ page }) => {
        await page.goto("/dashboard/admin/analytics");
        await page.waitForLoadState("networkidle");

        await expect(page.getByRole("heading", { name: /Analytics business/i })).toBeVisible();
        // Les tabs sont présents
        await expect(page.getByRole("tab", { name: /Utilisateurs/i })).toBeVisible();
        await expect(page.getByRole("tab", { name: /Nutrition/i })).toBeVisible();
        await expect(page.getByRole("tab", { name: /Fitness/i })).toBeVisible();
    });

    test("La page flow affiche le diagramme 5 couches", async ({ page }) => {
        await page.goto("/dashboard/admin/flow");
        await page.waitForLoadState("networkidle");

        await expect(page.getByRole("heading", { name: /Flux de données/i })).toBeVisible();
        // Les 5 sections de layer
        await expect(page.getByRole("heading", { name: /Sources/i })).toBeVisible();
        await expect(page.getByRole("heading", { name: /Pipeline ETL/i })).toBeVisible();
        await expect(page.getByRole("heading", { name: /Stockage/i })).toBeVisible();
        await expect(page.getByRole("heading", { name: /Couche API/i })).toBeVisible();
        await expect(page.getByRole("heading", { name: /Consommateurs/i })).toBeVisible();
    });

    test("La navigation depuis l'accueil admin fonctionne", async ({ page }) => {
        await page.goto("/dashboard/admin");
        await page.getByRole("link", { name: /Qualité des données/i }).first().click();
        await expect(page).toHaveURL(/data-quality/);

        await page.getByRole("link", { name: /Vue d'ensemble/i }).click();
        await expect(page).toHaveURL(/\/dashboard\/admin$/);
    });

    test("Le retour au dashboard utilisateur depuis la sidebar admin fonctionne", async ({ page }) => {
        await page.goto("/dashboard/admin/data-quality");
        await page.waitForLoadState("networkidle");

        await page.getByRole("link", { name: /Retour au dashboard/i }).click();
        await expect(page).toHaveURL(/\/dashboard$/);
    });
});

test.describe("Admin — garde de rôle", () => {
    test("Un user non-admin est redirigé vers /dashboard", async ({ page }) => {
        await page.context().addCookies([SESSION_COOKIE]);
        // Pas de localStorage demo admin
        await page.context().route("**/api/home", (route) =>
            route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    data: {
                        user: { id: "user_1", email: "user@test.com", role: "user", is_admin: false },
                        stats: {},
                    },
                }),
            }),
        );

        await page.goto("/dashboard/admin");
        // Doit être redirigé vers /dashboard
        await expect(page).toHaveURL(/\/dashboard$/, { timeout: 5000 });
    });
});
