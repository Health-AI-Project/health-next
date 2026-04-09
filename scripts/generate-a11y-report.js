const fs = require("fs");
const path = require("path");

const REPORT_DIR = path.join(__dirname, "..", "a11y-report");
const OUTPUT_FILE = path.join(REPORT_DIR, "rapport-accessibilite.html");

// Mapping WCAG -> RGAA
const WCAG_TO_RGAA = {
    "color-contrast": "RGAA 3.2.1 - Contraste des textes",
    "image-alt": "RGAA 1.1.1 - Images informatives",
    "label": "RGAA 11.1.1 - Champs de formulaire avec etiquette",
    "link-name": "RGAA 6.1.1 - Intitule des liens",
    "button-name": "RGAA 11.9.1 - Intitule des boutons",
    "html-has-lang": "RGAA 8.3.1 - Langue par defaut",
    "heading-order": "RGAA 9.1.1 - Hierarchie des titres",
    "aria-roles": "RGAA 7.1.1 - Roles ARIA valides",
    "tabindex": "RGAA 12.8.1 - Ordre de tabulation",
    "focus-visible": "RGAA 10.7.1 - Prise de focus visible",
};

function getSeverityColor(impact) {
    switch (impact) {
        case "critical": return "#dc2626";
        case "serious": return "#ea580c";
        case "moderate": return "#ca8a04";
        case "minor": return "#65a30d";
        default: return "#6b7280";
    }
}

function generateReport() {
    const jsonFiles = fs.readdirSync(REPORT_DIR).filter(f => f.endsWith(".json"));

    if (jsonFiles.length === 0) {
        console.error("Aucun fichier JSON trouve dans a11y-report/. Lancez d'abord npm run test:a11y");
        process.exit(1);
    }

    const pages = jsonFiles.map(f => JSON.parse(fs.readFileSync(path.join(REPORT_DIR, f), "utf-8")));
    const totalViolations = pages.reduce((sum, p) => sum + p.summary.violations, 0);
    const totalPasses = pages.reduce((sum, p) => sum + p.summary.passes, 0);
    const totalRules = totalViolations + totalPasses;
    const conformityRate = totalRules > 0 ? Math.round((totalPasses / totalRules) * 100) : 0;
    const timestamp = pages[0]?.timestamp || new Date().toISOString();

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport d'accessibilite WCAG/RGAA AA - HealthNext</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1f2937; background: #f9fafb; }
        .container { max-width: 1000px; margin: 0 auto; padding: 2rem; }
        h1 { font-size: 1.75rem; margin-bottom: 0.5rem; }
        h2 { font-size: 1.35rem; margin: 2rem 0 1rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
        h3 { font-size: 1.1rem; margin: 1.5rem 0 0.5rem; }
        .meta { color: #6b7280; font-size: 0.875rem; margin-bottom: 2rem; }
        .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin: 1.5rem 0; }
        .summary-card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.25rem; text-align: center; }
        .summary-card .value { font-size: 2rem; font-weight: 700; }
        .summary-card .label { font-size: 0.75rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
        .conformity { color: ${conformityRate >= 90 ? '#16a34a' : conformityRate >= 70 ? '#ca8a04' : '#dc2626'}; }
        .page-section { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; margin: 1rem 0; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
        .badge-pass { background: #dcfce7; color: #16a34a; }
        .badge-fail { background: #fee2e2; color: #dc2626; }
        .violation { border-left: 4px solid; padding: 1rem; margin: 0.75rem 0; background: #fafafa; border-radius: 0 4px 4px 0; }
        .violation-id { font-weight: 600; font-size: 0.95rem; }
        .violation-help { color: #4b5563; font-size: 0.875rem; }
        .violation-rgaa { color: #7c3aed; font-size: 0.8rem; margin-top: 4px; }
        .violation-selector { font-family: monospace; font-size: 0.8rem; color: #6b7280; background: #f3f4f6; padding: 2px 6px; border-radius: 3px; }
        .pass-list { columns: 2; column-gap: 2rem; }
        .pass-item { font-size: 0.85rem; color: #374151; padding: 2px 0; break-inside: avoid; }
        .pass-item::before { content: "\\2713 "; color: #16a34a; font-weight: 700; }
        a { color: #2563eb; }
        @media (max-width: 768px) { .summary-grid { grid-template-columns: repeat(2, 1fr); } .pass-list { columns: 1; } }
    </style>
</head>
<body>
    <div class="container">
        <h1>Rapport d'accessibilite WCAG/RGAA AA</h1>
        <p class="meta">
            Application : <strong>HealthNext</strong> |
            Date : <strong>${new Date(timestamp).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</strong> |
            Referentiels : WCAG 2.1 AA / RGAA 4.1
        </p>

        <h2>Resume global</h2>
        <div class="summary-grid">
            <div class="summary-card">
                <div class="value">${pages.length}</div>
                <div class="label">Pages testees</div>
            </div>
            <div class="summary-card">
                <div class="value conformity">${conformityRate}%</div>
                <div class="label">Taux de conformite</div>
            </div>
            <div class="summary-card">
                <div class="value" style="color: #dc2626">${totalViolations}</div>
                <div class="label">Violations</div>
            </div>
            <div class="summary-card">
                <div class="value" style="color: #16a34a">${totalPasses}</div>
                <div class="label">Regles validees</div>
            </div>
        </div>

        <h2>Detail par page</h2>
        ${pages.map(p => {
            const hasViolations = p.violations.length > 0;
            return `
        <div class="page-section">
            <div class="page-header">
                <h3>${p.page} <code style="font-size:0.8rem;color:#6b7280">${p.url}</code></h3>
                <span class="badge ${hasViolations ? 'badge-fail' : 'badge-pass'}">
                    ${hasViolations ? p.violations.length + ' violation(s)' : 'Conforme'}
                </span>
            </div>
            ${p.violations.length > 0 ? `
            <h4 style="font-size:0.9rem;margin:0.5rem 0;color:#dc2626">Violations</h4>
            ${p.violations.map(v => `
            <div class="violation" style="border-color: ${getSeverityColor(v.impact)}">
                <div class="violation-id">[${v.impact}] ${v.id}</div>
                <div class="violation-help">${v.help}</div>
                ${WCAG_TO_RGAA[v.id] ? `<div class="violation-rgaa">${WCAG_TO_RGAA[v.id]}</div>` : ''}
                <div style="margin-top:4px"><a href="${v.helpUrl}" target="_blank">Documentation</a></div>
                ${v.nodes.slice(0, 3).map(n => `<div style="margin-top:4px"><span class="violation-selector">${n.target}</span></div>`).join('')}
            </div>`).join('')}` : ''}
            ${p.passes.length > 0 ? `
            <h4 style="font-size:0.9rem;margin:1rem 0 0.5rem;color:#16a34a">Regles validees (${p.passes.length})</h4>
            <div class="pass-list">
                ${p.passes.map(r => `<div class="pass-item">${r.id}: ${r.help}</div>`).join('')}
            </div>` : ''}
        </div>`;
        }).join('')}

        <h2>Mapping WCAG AA / RGAA</h2>
        <div class="page-section">
            <p style="font-size:0.875rem;color:#4b5563;margin-bottom:1rem">
                Les criteres WCAG 2.1 AA ont une correspondance directe avec les criteres RGAA 4.1.
                Les tests axe-core couvrent les deux referentiels simultanement via les tags
                <code>wcag2a</code>, <code>wcag2aa</code>, <code>wcag21a</code>, <code>wcag21aa</code>.
            </p>
            <table style="width:100%;border-collapse:collapse;font-size:0.85rem">
                <tr style="border-bottom:1px solid #e5e7eb;text-align:left">
                    <th style="padding:8px">Regle axe-core</th>
                    <th style="padding:8px">Critere RGAA</th>
                </tr>
                ${Object.entries(WCAG_TO_RGAA).map(([key, val]) => `
                <tr style="border-bottom:1px solid #f3f4f6">
                    <td style="padding:8px"><code>${key}</code></td>
                    <td style="padding:8px">${val}</td>
                </tr>`).join('')}
            </table>
        </div>

        <footer style="margin-top:3rem;padding-top:1rem;border-top:1px solid #e5e7eb;font-size:0.75rem;color:#9ca3af;text-align:center">
            Rapport genere automatiquement par axe-core + Playwright | HealthNext &copy; 2026
        </footer>
    </div>
</body>
</html>`;

    fs.writeFileSync(OUTPUT_FILE, html);
    console.log(`Rapport genere : ${OUTPUT_FILE}`);
    console.log(`Pages testees : ${pages.length}`);
    console.log(`Taux de conformite : ${conformityRate}%`);
    console.log(`Violations : ${totalViolations} | Regles validees : ${totalPasses}`);
}

generateReport();
