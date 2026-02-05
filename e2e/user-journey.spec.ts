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

        // Step 1: Weight
        await expect(page.getByRole("heading", { name: /poids/i })).toBeVisible();
        await page.getByLabel(/poids/i).fill("75");
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
    test("should verify dashboard content and navigation", async ({ page }) => {
        await page.goto("/dashboard");

        // Stats cards
        await expect(page.getByRole("heading", { name: "Poids actuel" })).toBeVisible();

        // Charts
        await expect(page.getByText(/évolution du poids/i)).toBeVisible();
        // Use specific heading role for charts to avoid ambiguity with KPI cards
        await expect(page.getByRole("heading", { name: "Calories journalières" })).toBeVisible();

        // Sidebar navigation to Nutrition
        await page.getByRole("link", { name: /nutrition/i }).click();
        await expect(page).toHaveURL(/\/dashboard\/nutrition/);
        await expect(page.getByRole("heading", { name: /nutrition tracker/i })).toBeVisible();
    });
});
