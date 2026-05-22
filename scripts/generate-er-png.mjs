// Génère un PNG du diagramme ER à partir du HTML standalone.
import { chromium } from "playwright";
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HTML = path.resolve(__dirname, "../docs/mspr501/assets/er-diagram.html");
const OUT_DIR = path.resolve(__dirname, "../docs/mspr501/assets");

async function main() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1600, height: 2400 } });
    await page.goto(pathToFileURL(HTML).href, { waitUntil: "networkidle" });
    // Wait for Mermaid to render
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(OUT_DIR, "er-diagram-full.png"), fullPage: true });
    console.log("ER diagram → er-diagram-full.png");
    await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
