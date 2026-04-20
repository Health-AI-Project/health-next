import { test, expect } from "@playwright/test";

test.describe("Critical User Journey: Landing → Wizard", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test("should navigate from landing page to inscription wizard", async ({ page }) => {
        await expect(page).toHaveTitle(/HealthNext/i);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

        const ctaButton = page.getByRole("link", { name: /commencer/i }).first();
        await ctaButton.click();

        await expect(page).toHaveURL(/\/inscription/);
    });

    test("should flow through the wizard correctly", async ({ page }) => {
        await page.goto("/inscription");

        // Step 0: Age
        await expect(page.getByRole("heading", { name: /âge/i })).toBeVisible();
        await page.getByLabel(/âge/i).fill("30");
        await page.getByRole("button", { name: "Suivant" }).click();

        // Step 1: Weight + Height
        await expect(page.getByRole("heading", { name: /poids/i })).toBeVisible();
        await page.getByLabel(/poids/i).fill("75");
        await page.getByLabel(/taille/i).fill("175");
        await page.getByRole("button", { name: "Suivant" }).click();

        // Step 2: Goals
        await expect(page.getByRole("heading", { name: /objectifs/i })).toBeVisible();
        // Verify at least one goal is present
        await expect(page.getByText(/perte de poids/i)).toBeVisible();
    });

    test("should show validation errors on age step", async ({ page }) => {
        await page.goto("/inscription");
        await page.getByLabel(/âge/i).fill("15"); // Below 18
        await page.getByRole("button", { name: "Suivant" }).click();

        await expect(page.getByText(/18 ans/i)).toBeVisible();
    });
});

test.describe("Dashboard & Nutrition", () => {
    test("should redirect to login when not authenticated", async ({ page }) => {
        await page.goto("/dashboard");

        // Middleware should redirect to /connexion
        await expect(page).toHaveURL(/\/connexion/);
        await expect(page.getByRole("heading", { name: /connexion/i })).toBeVisible();
    });

    test("should show login page with email and password fields", async ({ page }) => {
        await page.goto("/connexion");

        await expect(page.getByLabel(/email/i)).toBeVisible();
        await expect(page.getByLabel(/mot de passe/i)).toBeVisible();
        await expect(page.getByRole("button", { name: /se connecter/i })).toBeVisible();
        await expect(page.getByText(/creer un compte/i)).toBeVisible();
    });
});
