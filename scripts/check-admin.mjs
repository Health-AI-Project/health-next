// Test script — login + navigate admin + screenshot
import { chromium } from "playwright";

const ADMIN_EMAIL = "admin@healthai.coach";
const ADMIN_PASSWORD = "AdminTest2026!";
const BASE = "http://localhost:3000";

async function main() {
    const browser = await chromium.launch({ headless: true });
    const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
    const page = await ctx.newPage();

    // Capture EVERY auth/api request
    page.on("request", (req) => {
        const url = req.url();
        if (/auth|api\//.test(url) && !url.includes("/_next/")) {
            console.log(`[REQ] ${req.method()} ${url}`);
        }
    });
    page.on("requestfailed", (req) => {
        console.log(`[REQ FAIL] ${req.method()} ${req.url()} — ${req.failure()?.errorText}`);
    });
    page.on("response", async (res) => {
        const url = res.url();
        if (/auth|api\//.test(url) && !url.includes("/_next/")) {
            const status = res.status();
            console.log(`[RES ${status}] ${res.request().method()} ${url}`);
            if (status >= 400) {
                try {
                    const body = await res.text();
                    console.log(`  body: ${body.slice(0, 300)}`);
                } catch {}
            }
        }
    });
    page.on("console", (msg) => {
        const text = msg.text();
        if (msg.type() === "error" || /fail|error|404|500|502/i.test(text)) {
            console.log(`[CONSOLE ${msg.type()}] ${text}`);
        }
    });

    console.log("=== Étape 1 : Login ===");
    await page.goto(`${BASE}/connexion`, { waitUntil: "networkidle" });
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.screenshot({ path: "scripts/00-login-filled.png" });
    const loginRespPromise = page.waitForResponse((r) => r.url().includes("/api/auth/sign-in/email"), { timeout: 15000 }).catch(() => null);
    await page.click('button[type="submit"]');

    const loginResp = await loginRespPromise;
    if (loginResp) {
        console.log(`[LOGIN RESP] status=${loginResp.status()}`);
        const body = await loginResp.text();
        console.log(`[LOGIN BODY] ${body.slice(0, 400)}`);
    } else {
        console.log("[LOGIN RESP] no response captured");
    }

    await page.waitForTimeout(3000);
    const urlAfterLogin = page.url();
    console.log(`URL after login: ${urlAfterLogin}`);
    await page.screenshot({ path: "scripts/01-after-login.png", fullPage: true });

    if (!urlAfterLogin.includes("/dashboard")) {
        const bodyText = await page.locator("body").textContent();
        console.log(`Body snippet: ${bodyText?.slice(0, 500)}`);
        await browser.close();
        return;
    }

    console.log("=== Étape 2 : Active mode admin via localStorage + navigate ===");
    await page.evaluate(() => {
        window.localStorage.setItem("health_ai_demo_admin", "1");
    });
    await page.goto(`${BASE}/dashboard/admin`, { waitUntil: "networkidle" });
    console.log(`URL: ${page.url()}`);
    await page.screenshot({ path: "scripts/02-admin-home.png", fullPage: true });

    const h1 = await page.locator("h1").first().textContent();
    console.log(`h1: ${h1}`);

    console.log("=== Étape 3 : data-quality ===");
    await page.goto(`${BASE}/dashboard/admin/data-quality`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "scripts/03-data-quality.png", fullPage: true });

    console.log("=== Étape 4 : validation ===");
    await page.goto(`${BASE}/dashboard/admin/validation`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "scripts/04-validation.png", fullPage: true });

    console.log("=== Étape 5 : analytics ===");
    await page.goto(`${BASE}/dashboard/admin/analytics`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "scripts/05-analytics.png", fullPage: true });

    console.log("=== Étape 6 : flow ===");
    await page.goto(`${BASE}/dashboard/admin/flow`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: "scripts/06-flow.png", fullPage: true });

    await browser.close();
    console.log("=== DONE — screenshots dans scripts/*.png ===");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
