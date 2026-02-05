import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility Audit (Axe-Core)", () => {
    const pages = [
        { url: "/", name: "Landing Page" },
        { url: "/inscription", name: "Inscription Wizard" },
        { url: "/dashboard", name: "Dashboard" },
        { url: "/dashboard/nutrition", name: "Nutrition Tracker" },
    ];

    for (const { url, name } of pages) {
        test(`${name} should meet WCAG 2.1 AA requirements`, async ({ page }) => {
            await page.goto(url);

            // Wait for dynamic content (animations, charts) to stabilize
            await page.waitForTimeout(1000);

            const accessibilityScanResults = await new AxeBuilder({ page })
                .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
                .analyze();

            const criticalViolations = accessibilityScanResults.violations.filter(
                v => v.impact === "critical" || v.impact === "serious"
            );

            if (criticalViolations.length > 0) {
                console.log(`\n🚨 FOUND ${criticalViolations.length} CRITICAL VIOLATIONS ON ${name.toUpperCase()}:\n`);
                criticalViolations.forEach(v => {
                    console.log(`- [${v.impact}] ${v.id}: ${v.help}`);
                    console.log(`  URL: ${v.helpUrl}`);
                    v.nodes.forEach(n => console.log(`    Selector: ${n.target}`));
                });
            }

            // This assertion will fail the test if any critical/serious violations are found
            expect(criticalViolations, `Found ${criticalViolations.length} accessibility violations on ${name}`).toHaveLength(0);
        });
    }
});
