import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "fs";
import path from "path";

const REPORT_DIR = path.join(process.cwd(), "a11y-report");

test.describe("Accessibility Audit (Axe-Core)", () => {
    const pages = [
        { url: "/", name: "Landing Page" },
        { url: "/inscription", name: "Inscription Wizard" },
        { url: "/dashboard", name: "Dashboard" },
        { url: "/dashboard/analytics", name: "Analytics" },
        { url: "/dashboard/nutrition", name: "Nutrition Tracker" },
        { url: "/dashboard/settings", name: "Settings" },
    ];

    test.beforeAll(() => {
        if (!fs.existsSync(REPORT_DIR)) {
            fs.mkdirSync(REPORT_DIR, { recursive: true });
        }
    });

    for (const { url, name } of pages) {
        test(`${name} should meet WCAG 2.1 AA requirements`, async ({ page }) => {
            await page.goto(url);
            await page.waitForTimeout(1000);

            const results = await new AxeBuilder({ page })
                .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
                .analyze();

            // Save full results to JSON
            const fileName = name.toLowerCase().replace(/\s+/g, "-");
            fs.writeFileSync(
                path.join(REPORT_DIR, `${fileName}.json`),
                JSON.stringify({
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
                    passes: results.passes,
                }, null, 2)
            );

            const criticalViolations = results.violations.filter(
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

            expect(criticalViolations, `Found ${criticalViolations.length} accessibility violations on ${name}`).toHaveLength(0);
        });
    }
});
