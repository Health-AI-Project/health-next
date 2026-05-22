import { expect, test, type BrowserContext, type Page } from "@playwright/test";

const SESSION_COOKIE = {
    name: "better-auth.session_token",
    value: "mock_session_token_quality",
    domain: "localhost",
    path: "/",
    httpOnly: true,
    secure: false,
    sameSite: "Lax" as const,
};

async function setupAuth(context: BrowserContext) {
    await context.addCookies([SESSION_COOKIE]);
}

const API_HEADERS = {
    "access-control-allow-origin": "http://localhost:3001",
    "access-control-allow-credentials": "true",
    "access-control-allow-headers": "content-type,x-api-key",
    "access-control-allow-methods": "GET,PATCH,OPTIONS",
};

async function mockQualityAPIs(page: Page) {
    await page.route("**/*", async (route) => {
        const url = route.request().url();
        if (!url.includes("/api/v1/etl/")) {
            await route.fallback();
            return;
        }
        if (route.request().method() === "OPTIONS") {
            await route.fulfill({ status: 204, headers: API_HEADERS });
            return;
        }
        if (url.includes("/api/v1/etl/runs")) {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                headers: API_HEADERS,
                body: JSON.stringify({
                    data: [
                        {
                            run_id: 3,
                            source_type: "nutrition",
                            source_name: "nutrition.csv",
                            status: "success",
                            rows_inserted: 14,
                            rows_rejected: 1,
                        },
                    ],
                    meta: { count: 1 },
                }),
            });
            return;
        }
        if (url.includes("/api/v1/etl/rejected-rows")) {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                headers: API_HEADERS,
                body: JSON.stringify({
                    data: [{ id: 10, source_file: "nutrition.csv", reason: "invalid_calories" }],
                    meta: { count: 1 },
                }),
            });
            return;
        }
        if (route.request().method() === "PATCH" && url.includes("/api/v1/etl/validation-queue/")) {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                headers: API_HEADERS,
                body: JSON.stringify({
                    data: {
                        id: 1,
                        entity_type: "etl_rejected_row",
                        entity_id: "10",
                        status: "VALIDATED",
                        payload: { reason: "invalid_calories" },
                    },
                }),
            });
            return;
        }
        if (url.includes("/api/v1/etl/validation-queue")) {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                headers: API_HEADERS,
                body: JSON.stringify({
                    data: [
                        {
                            id: 1,
                            entity_type: "etl_rejected_row",
                            entity_id: "10",
                            status: "PENDING",
                            payload: { source_file: "nutrition.csv", reason: "invalid_calories" },
                        },
                    ],
                    meta: { count: 1 },
                }),
            });
            return;
        }
        await route.fallback();
    });
}

test.describe("Data quality admin", () => {
    test.beforeEach(async ({ context }) => {
        await setupAuth(context);
    });

    test("shows ETL quality queue and can validate an item", async ({ page }) => {
        await mockQualityAPIs(page);

        await page.goto("/dashboard/data-quality");

        await expect(page.getByRole("heading", { name: /qualite des donnees/i })).toBeVisible();
        await expect(page.getByText("nutrition.csv").first()).toBeVisible();
        await expect(page.getByText("invalid_calories").first()).toBeVisible();

        await page.getByRole("button", { name: /valider/i }).click();

        await expect(page.getByText(/element marque VALIDATED/i)).toBeVisible();
    });

    test("shows explicit demo fallback when quality API fails", async ({ page }) => {
        await page.route("**/*", async (route) => {
            if (!route.request().url().includes("/api/v1/etl/")) {
                await route.fallback();
                return;
            }
            await route.fulfill({ status: 500, contentType: "application/json", headers: API_HEADERS, body: "{}" });
        });

        await page.goto("/dashboard/data-quality");

        await expect(page.getByText(/donnees de demonstration/i)).toBeVisible();
    });
});
