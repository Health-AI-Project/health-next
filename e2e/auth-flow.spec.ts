import { test, expect } from "@playwright/test";

/**
 * Tests des flows d'authentification avec mocks API.
 * Utilise page.route() pour simuler les réponses du backend
 * sans dépendre de l'infrastructure.
 */

test.describe("Auth Flow - Login", () => {
    test("should display login form fields", async ({ page }) => {
        await page.goto("/connexion");
        await expect(page.getByLabel(/email/i)).toBeVisible();
        await expect(page.getByLabel(/mot de passe/i)).toBeVisible();
        await expect(page.getByRole("button", { name: /se connecter/i })).toBeVisible();
    });

    test("should handle login API call on submit", async ({ page }) => {
        let signInCalled = false;
        await page.route("**/api/auth/sign-in/email", async (route) => {
            signInCalled = true;
            await route.fulfill({
                status: 401,
                contentType: "application/json",
                body: JSON.stringify({
                    message: "Invalid email or password",
                    code: "INVALID_CREDENTIALS",
                }),
            });
        });

        await page.goto("/connexion");
        await page.getByLabel(/email/i).fill("wrong@example.com");
        await page.getByLabel(/mot de passe/i).fill("wrongpass");
        await page.getByRole("button", { name: /se connecter/i }).click();

        await page.waitForTimeout(2000);
        expect(signInCalled).toBe(true);
    });

    test("should submit login successfully", async ({ page }) => {
        let signInCalled = false;
        await page.route("**/api/auth/sign-in/email", async (route) => {
            signInCalled = true;
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    user: { id: "user_123", email: "test@example.com" },
                    token: "session_xyz",
                }),
                headers: {
                    "Set-Cookie": "better-auth.session_token=session_xyz; Path=/; HttpOnly",
                },
            });
        });

        await page.goto("/connexion");
        await page.getByLabel(/email/i).fill("test@example.com");
        await page.getByLabel(/mot de passe/i).fill("Password123!");
        await page.getByRole("button", { name: /se connecter/i }).click();

        await page.waitForTimeout(2000);
        expect(signInCalled).toBe(true);
    });

    test("should have link to signup from login", async ({ page }) => {
        await page.goto("/connexion");
        const signupLink = page.getByRole("link", { name: /creer un compte|créer/i });
        await expect(signupLink).toBeVisible();
        await signupLink.click();
        await expect(page).toHaveURL(/\/inscription/);
    });

    test("should keep 'Se connecter' button visible after failed login", async ({ page }) => {
        await page.route("**/api/auth/sign-in/email", async (route) => {
            await route.fulfill({
                status: 401,
                contentType: "application/json",
                body: JSON.stringify({ message: "Invalid credentials" }),
            });
        });

        await page.goto("/connexion");
        await page.getByLabel(/email/i).fill("wrong@example.com");
        await page.getByLabel(/mot de passe/i).fill("wrongpass");
        await page.getByRole("button", { name: /se connecter/i }).click();

        // Should stay on connexion page (not redirected)
        await page.waitForTimeout(1000);
        await expect(page).toHaveURL(/\/connexion/);
        await expect(page.getByRole("button", { name: /se connecter/i })).toBeVisible();
    });
});

test.describe("Auth Flow - Signup validation", () => {
    test("should show wizard start with progress indicator", async ({ page }) => {
        await page.goto("/inscription");
        await expect(page.getByText(/étape 1 sur 6/i)).toBeVisible();
    });

    test("should persist wizard state in localStorage", async ({ page }) => {
        await page.goto("/inscription");
        await page.getByLabel(/âge/i).fill("28");
        await page.getByRole("button", { name: "Suivant" }).click();

        // Check localStorage has wizard state
        const storedState = await page.evaluate(() =>
            localStorage.getItem("wizard-store"),
        );
        expect(storedState).toBeTruthy();
        expect(storedState).toContain("28");
    });

    test("should refuse age below 18", async ({ page }) => {
        await page.goto("/inscription");
        await page.getByLabel(/âge/i).fill("17");
        await page.getByRole("button", { name: "Suivant" }).click();
        await expect(page.getByText(/18 ans/i)).toBeVisible();
    });

    test("should refuse missing height", async ({ page }) => {
        await page.goto("/inscription");
        await page.getByLabel(/âge/i).fill("25");
        await page.getByRole("button", { name: "Suivant" }).click();
        await page.getByLabel(/poids/i).fill("70");
        await page.getByRole("button", { name: "Suivant" }).click();
        await expect(page.getByText(/taille est requise/i)).toBeVisible();
    });

    test("should allow going back to modify age", async ({ page }) => {
        await page.goto("/inscription");
        await page.getByLabel(/âge/i).fill("25");
        await page.getByRole("button", { name: "Suivant" }).click();
        await page.getByRole("button", { name: /précédent/i }).click();
        await expect(page.getByRole("heading", { name: /âge/i })).toBeVisible();
        // L'âge précédemment rempli est conservé
        await expect(page.getByLabel(/âge/i)).toHaveValue("25");
    });
});
