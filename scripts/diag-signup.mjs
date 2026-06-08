// Reproduit le bug signup en parcourant le wizard inscription du browser
import { chromium } from "playwright";

const EMAIL = `diag-browser-${Date.now()}@test.local`;
const PASSWORD = "Password123!";

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext();
const page = await ctx.newPage();

const networkErrors = [];
const consoleErrors = [];
page.on("response", (r) => {
    if (!r.ok() && r.url().includes("auth")) {
        networkErrors.push({ status: r.status(), url: r.url() });
    }
});
page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
});

console.log("Navigating to /inscription...");
await page.goto("http://localhost:3000/inscription", { waitUntil: "domcontentloaded" });

// On va sauter le wizard et appeler signup directement comme le frontend le ferait
console.log("Calling signup directly via page context (avoiding wizard)...");
const result = await page.evaluate(async ({ email, password }) => {
    const r = await fetch("http://localhost:3002/api/auth/sign-up/email", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: email.split("@")[0] }),
    });
    const text = await r.text();
    return { status: r.status, body: text };
}, { email: EMAIL, password: PASSWORD });

console.log("\n=== BROWSER SIGNUP RESULT ===");
console.log("Status:", result.status);
console.log("Body:", result.body);
console.log("\n=== NETWORK ERRORS ===");
networkErrors.forEach((e) => console.log(`  ${e.status} ${e.url}`));
console.log("\n=== CONSOLE ERRORS ===");
consoleErrors.forEach((e) => console.log(`  ${e}`));

await browser.close();
process.exit(result.status === 200 ? 0 : 1);
