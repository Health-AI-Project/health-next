import { chromium } from "playwright";

const ADMIN_EMAIL = "admin@healthai.coach";
const ADMIN_PASSWORD = "AdminTest2026!";
const BASE = "http://localhost:3000";

const PAGES = [
    { url: "/dashboard/admin", name: "00-home" },
    { url: "/dashboard/admin/data-quality", name: "01-data-quality" },
    { url: "/dashboard/admin/sources", name: "02-sources" },
    { url: "/dashboard/admin/datasets", name: "03-datasets" },
    { url: "/dashboard/admin/datasets/exercisedb", name: "04-dataset-exercisedb" },
    { url: "/dashboard/admin/validation", name: "05-validation" },
    { url: "/dashboard/admin/analytics", name: "06-analytics" },
    { url: "/dashboard/admin/users", name: "07-users" },
    { url: "/dashboard/admin/flow", name: "08-flow" },
];

async function main() {
    const browser = await chromium.launch({ headless: true });
    const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
    const page = await ctx.newPage();

    const errors = [];
    page.on("response", async (res) => {
        const url = res.url();
        if (/api\//.test(url) && !url.includes("/_next/") && res.status() >= 400) {
            const body = await res.text().catch(() => "");
            errors.push(`[${res.status()}] ${res.request().method()} ${url} — ${body.slice(0, 200)}`);
        }
    });

    console.log("=== Login ===");
    await page.goto(`${BASE}/connexion`, { waitUntil: "networkidle" });
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 }).catch(() => {});

    if (!page.url().includes("/dashboard")) {
        console.log("❌ Login failed");
        await browser.close();
        return;
    }
    console.log("✅ Login OK");

    for (const p of PAGES) {
        await page.goto(`${BASE}${p.url}`, { waitUntil: "networkidle" });
        await page.waitForTimeout(1500);
        const h1 = await page.locator("h1").first().textContent().catch(() => "(no h1)");
        const url = page.url();
        const ok = !url.includes("/connexion") && !url.endsWith("/dashboard");
        console.log(`${ok ? "✅" : "❌"} ${p.name.padEnd(30)} → ${h1?.trim() ?? "(empty)"}`);
        await page.screenshot({ path: `scripts/all-${p.name}.png`, fullPage: true });
    }

    console.log("");
    console.log(`=== Erreurs réseau capturées (${errors.length}) ===`);
    errors.slice(0, 10).forEach((e) => console.log(`  ${e}`));

    await browser.close();
    console.log("");
    console.log("=== Screenshots dans scripts/all-*.png ===");
}

main().catch((e) => { console.error(e); process.exit(1); });
