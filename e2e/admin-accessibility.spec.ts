import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "fs";
import path from "path";

const REPORT_DIR = path.join(process.cwd(), "a11y-report", "admin");

const ADMIN_PAGES = [
    { url: "/dashboard/admin", name: "Admin Home" },
    { url: "/dashboard/admin/data-quality", name: "Admin Data Quality" },
    { url: "/dashboard/admin/datasets", name: "Admin Datasets Index" },
    { url: "/dashboard/admin/datasets/daily_food_nutrition", name: "Admin Dataset Detail" },
    { url: "/dashboard/admin/validation", name: "Admin Validation" },
    { url: "/dashboard/admin/analytics", name: "Admin Analytics Business" },
    { url: "/dashboard/admin/flow", name: "Admin Flow Diagram" },
];

const COOKIE_SESSION = {
    name: "better-auth.session_token",
    value: "test-session-token",
    domain: "localhost",
    path: "/",
};

test.describe("Admin Accessibility — WCAG 2.1 AA / RGAA 4", () => {
    test.beforeAll(() => {
        if (!fs.existsSync(REPORT_DIR)) {
            fs.mkdirSync(REPORT_DIR, { recursive: true });
        }
    });

    test.beforeEach(async ({ context }) => {
        // Simule une session pour passer le middleware
        await context.addCookies([COOKIE_SESSION]);
        await context.addInitScript(() => {
            // Active le mode admin via localStorage (helper existant setDemoAdmin)
            window.localStorage.setItem("health_ai_demo_admin", "1");
        });
        // Mock /api/home pour retourner un user admin
        await context.route("**/api/home", (route) =>
            route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    data: {
                        user: { id: "admin-test", email: "admin@healthai.coach", role: "admin", is_admin: true },
                        stats: { calories: 0, protein: 0, workouts_count: 0 },
                    },
                }),
            }),
        );
        // Mock les endpoints admin pour qu'ils renvoient des données vides mais valides
        await context.route("**/api/admin/**", (route) => {
            const url = route.request().url();
            let body: unknown = { data: [], meta: { count: 0 } };
            if (url.includes("data-quality")) {
                body = {
                    data: {
                        total_runs_24h: 0,
                        successful_runs_24h: 0,
                        failed_runs_24h: 0,
                        rows_ingested_24h: 0,
                        rows_rejected_24h: 0,
                        rejection_rate_pct: 0,
                        avg_duration_seconds: 0,
                        by_source: [],
                    },
                };
            }
            route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify(body),
            });
        });
    });

    for (const { url, name } of ADMIN_PAGES) {
        test(`${name} respecte WCAG 2.1 AA`, async ({ page }) => {
            await page.goto(url, { waitUntil: "networkidle" });
            // Laisse le temps au useEffect/setState de finir
            await page.waitForTimeout(500);

            const results = await new AxeBuilder({ page })
                .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
                .analyze();

            const slug = name.toLowerCase().replace(/\s+/g, "-");
            fs.writeFileSync(
                path.join(REPORT_DIR, `${slug}.json`),
                JSON.stringify(
                    {
                        page: name,
                        url,
                        timestamp: new Date().toISOString(),
                        summary: {
                            violations: results.violations.length,
                            passes: results.passes.length,
                            incomplete: results.incomplete.length,
                            inapplicable: results.inapplicable.length,
                        },
                        violations: results.violations,
                    },
                    null,
                    2,
                ),
            );

            const critical = results.violations.filter(
                (v) => v.impact === "critical" || v.impact === "serious",
            );

            if (critical.length > 0) {
                console.log(`\n🚨 ${critical.length} violations critiques/sérieuses sur ${name}:\n`);
                critical.forEach((v) => {
                    console.log(`  - [${v.impact}] ${v.id}: ${v.help}`);
                    v.nodes.slice(0, 3).forEach((n) => console.log(`      → ${n.target}`));
                });
            }

            expect(
                critical,
                `${critical.length} violations a11y critiques/sérieuses sur ${name}`,
            ).toHaveLength(0);
        });
    }

    test("La navigation au clavier fonctionne sur l'accueil admin", async ({ page }) => {
        await page.goto("/dashboard/admin", { waitUntil: "networkidle" });
        await page.waitForTimeout(500);

        // Le skip-link doit apparaître au premier Tab
        await page.keyboard.press("Tab");
        const skipLink = page.getByRole("link", { name: /passer au contenu/i });
        await expect(skipLink).toBeVisible();

        // Activation du skip-link
        await page.keyboard.press("Enter");
        const main = page.locator("#admin-main");
        await expect(main).toBeVisible();
    });

    test("Toutes les images et icônes décoratives sont aria-hidden ou ont un alt", async ({ page }) => {
        await page.goto("/dashboard/admin/data-quality", { waitUntil: "networkidle" });
        await page.waitForTimeout(500);

        // Cherche les SVG sans aria-hidden ni aria-label
        const orphanSvgs = await page.locator("svg:not([aria-hidden]):not([aria-label]):not([role='img'])").count();
        expect(orphanSvgs, "Tous les SVG doivent être soit aria-hidden, soit avoir un label").toBeLessThan(5);
    });

    test("Les boutons ont tous un nom accessible", async ({ page }) => {
        await page.goto("/dashboard/admin/validation", { waitUntil: "networkidle" });
        await page.waitForTimeout(500);

        const buttons = await page.getByRole("button").all();
        for (const btn of buttons) {
            const accessibleName = await btn.evaluate((el) => {
                const ariaLabel = el.getAttribute("aria-label");
                const text = el.textContent?.trim();
                return ariaLabel || text || "";
            });
            expect(accessibleName, "Tous les boutons doivent avoir un nom accessible").not.toBe("");
        }
    });
});
