import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test("should display the hero section with CTA", async ({ page }) => {
        await expect(page.getByRole("heading", { level: 1 })).toContainText("santé personnalisé");
        await expect(page.getByText(/atteignez vos objectifs/i)).toBeVisible();
        await expect(page.getByRole("link", { name: /commencer/i }).first()).toBeVisible();
    });

    test("should display all three pricing plans", async ({ page }) => {
        await expect(page.getByRole("heading", { name: "Freemium" })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Premium", exact: true })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Premium+" })).toBeVisible();
        await expect(page.getByText("0€")).toBeVisible();
        await expect(page.getByText("9,99€", { exact: true })).toBeVisible();
        await expect(page.getByText("19,99€")).toBeVisible();
    });

    test("should have navigation links to login and signup", async ({ page }) => {
        await expect(page.getByRole("link", { name: /se connecter/i })).toBeVisible();
        await expect(page.getByRole("link", { name: /commencer gratuitement/i }).first()).toBeVisible();
    });

    test("should display footer with copyright", async ({ page }) => {
        await expect(page.getByText(/2026 HealthNext/)).toBeVisible();
    });
});

test.describe("Inscription Wizard - Full Flow", () => {
    test("should complete all wizard steps", async ({ page }) => {
        await page.goto("/inscription");

        // Step 0: Age
        await expect(page.getByRole("heading", { name: /âge/i })).toBeVisible();
        await page.getByLabel(/âge/i).fill("25");
        await page.getByRole("button", { name: "Suivant" }).click();

        // Step 1: Weight + Height
        await expect(page.getByRole("heading", { name: /poids/i })).toBeVisible();
        await page.getByLabel(/poids/i).fill("70");
        await page.getByLabel(/taille/i).fill("180");
        await page.getByRole("button", { name: "Suivant" }).click();

        // Step 2: Goals
        await expect(page.getByRole("heading", { name: /objectifs/i })).toBeVisible();
        await expect(page.getByText(/perte de poids/i)).toBeVisible();
    });

    test("should show validation error for invalid age", async ({ page }) => {
        await page.goto("/inscription");
        await page.getByLabel(/âge/i).fill("10");
        await page.getByRole("button", { name: "Suivant" }).click();
        await expect(page.getByText(/18 ans/i)).toBeVisible();
    });

    test("should show validation error for missing height", async ({ page }) => {
        await page.goto("/inscription");
        await page.getByLabel(/âge/i).fill("25");
        await page.getByRole("button", { name: "Suivant" }).click();

        await page.getByLabel(/poids/i).fill("70");
        // Don't fill height
        await page.getByRole("button", { name: "Suivant" }).click();
        await expect(page.getByText(/taille est requise/i)).toBeVisible();
    });

    test("should allow navigating back with Precedent button", async ({ page }) => {
        await page.goto("/inscription");
        await page.getByLabel(/âge/i).fill("25");
        await page.getByRole("button", { name: "Suivant" }).click();

        await expect(page.getByRole("heading", { name: /poids/i })).toBeVisible();
        await page.getByRole("button", { name: /précédent/i }).click();
        await expect(page.getByRole("heading", { name: /âge/i })).toBeVisible();
    });
});

test.describe("Connexion Page", () => {
    test("should display login form", async ({ page }) => {
        await page.goto("/connexion");
        await expect(page.getByRole("heading", { name: /connexion/i })).toBeVisible();
        await expect(page.getByLabel(/email/i)).toBeVisible();
        await expect(page.getByLabel(/mot de passe/i)).toBeVisible();
        await expect(page.getByRole("button", { name: /se connecter/i })).toBeVisible();
    });

    test("should have link to create account", async ({ page }) => {
        await page.goto("/connexion");
        await expect(page.getByText(/creer un compte/i)).toBeVisible();
    });
});

test.describe("Auth Protection", () => {
    test("should redirect /dashboard to /connexion when not authenticated", async ({ page }) => {
        await page.goto("/dashboard");
        await expect(page).toHaveURL(/\/connexion/);
    });

    test("should redirect /dashboard/nutrition to /connexion", async ({ page }) => {
        await page.goto("/dashboard/nutrition");
        await expect(page).toHaveURL(/\/connexion/);
    });

    test("should redirect /dashboard/analytics to /connexion", async ({ page }) => {
        await page.goto("/dashboard/analytics");
        await expect(page).toHaveURL(/\/connexion/);
    });

    test("should redirect /dashboard/settings to /connexion", async ({ page }) => {
        await page.goto("/dashboard/settings");
        await expect(page).toHaveURL(/\/connexion/);
    });

    test("should redirect /dashboard/workouts to /connexion", async ({ page }) => {
        await page.goto("/dashboard/workouts");
        await expect(page).toHaveURL(/\/connexion/);
    });

    test("should redirect /dashboard/clients to /connexion", async ({ page }) => {
        await page.goto("/dashboard/clients");
        await expect(page).toHaveURL(/\/connexion/);
    });

    test("should redirect /dashboard/nutrition/history to /connexion", async ({ page }) => {
        await page.goto("/dashboard/nutrition/history");
        await expect(page).toHaveURL(/\/connexion/);
    });

    test("should redirect /dashboard/nutrition/meal-plan to /connexion", async ({ page }) => {
        await page.goto("/dashboard/nutrition/meal-plan");
        await expect(page).toHaveURL(/\/connexion/);
    });
});

test.describe("Responsive Design", () => {
    test("should render landing page on mobile viewport", async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto("/");
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await expect(page.getByText("Freemium")).toBeVisible();
    });

    test("should render landing page on tablet viewport", async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto("/");
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Premium", exact: true })).toBeVisible();
    });

    test("should render inscription page on mobile viewport", async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto("/inscription");
        await expect(page.getByRole("heading", { name: /âge/i })).toBeVisible();
        await expect(page.getByRole("button", { name: "Suivant" })).toBeVisible();
    });

    test("should render connexion page on mobile viewport", async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto("/connexion");
        await expect(page.getByRole("heading", { name: /connexion/i })).toBeVisible();
        await expect(page.getByRole("button", { name: /se connecter/i })).toBeVisible();
    });
});
