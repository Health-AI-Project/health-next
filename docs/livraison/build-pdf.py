"""
Genere un fichier HTML unique consolidant toute la documentation frontend.
Ouvre le HTML dans Brave/Chrome et fais Ctrl+P -> Enregistrer au format PDF.
"""
import base64
from pathlib import Path
import markdown
import re

ROOT = Path(__file__).parent
SCREENSHOTS = ROOT.parent / "screenshots"
OUTPUT = ROOT / "HealthNext-Documentation-Frontend.html"

DOCS_ORDER = [
    "01-Benchmark-Frontend.md",
    "02-Documentation-Technique-Frontend.md",
    "03-Maquettes-Design-System.md",
    "04-Accessibilite-WCAG-RGAA.md",
    "05-Conduite-Changement.md",
]

CSS = """
<style>
@page { size: A4; margin: 2cm 1.5cm; }
body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    max-width: 210mm;
    margin: 0 auto;
    padding: 2em;
    color: #1a1a1a;
    line-height: 1.6;
    font-size: 11pt;
}
h1 { font-size: 28pt; color: #16a34a; border-bottom: 3px solid #16a34a; padding-bottom: 0.3em; margin-top: 1.5em; page-break-before: always; }
h1:first-of-type { page-break-before: avoid; }
h2 { font-size: 18pt; color: #15803d; margin-top: 2em; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.2em; }
h3 { font-size: 14pt; color: #166534; margin-top: 1.5em; }
h4 { font-size: 12pt; color: #14532d; }
p, li { font-size: 11pt; }
code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 10pt; font-family: Consolas, Monaco, monospace; }
pre { background: #1f2937; color: #f3f4f6; padding: 1em; border-radius: 6px; overflow-x: auto; font-size: 9pt; page-break-inside: avoid; }
pre code { background: transparent; color: inherit; padding: 0; }
table { border-collapse: collapse; width: 100%; margin: 1em 0; font-size: 10pt; page-break-inside: avoid; }
th, td { border: 1px solid #d1d5db; padding: 0.5em 0.75em; text-align: left; }
th { background: #16a34a; color: white; font-weight: 600; }
tr:nth-child(even) { background: #f9fafb; }
blockquote { border-left: 4px solid #16a34a; padding-left: 1em; color: #4b5563; font-style: italic; }
img { max-width: 100%; height: auto; border: 1px solid #e5e7eb; border-radius: 6px; margin: 1em 0; page-break-inside: avoid; }
.screenshots { display: grid; grid-template-columns: 1fr; gap: 1em; }
.screenshots figure { margin: 0; text-align: center; page-break-inside: avoid; }
.screenshots figcaption { font-size: 10pt; color: #6b7280; margin-top: 0.5em; }
hr { border: none; border-top: 2px solid #e5e7eb; margin: 2em 0; }
.toc { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5em; margin-bottom: 2em; page-break-after: always; }
.toc h2 { margin-top: 0; border: none; }
.toc ol { padding-left: 1.5em; }
.toc a { color: #16a34a; text-decoration: none; }
.cover { text-align: center; padding: 5em 0; page-break-after: always; }
.cover h1 { font-size: 40pt; border: none; color: #16a34a; }
.cover .subtitle { font-size: 16pt; color: #4b5563; margin-top: 1em; }
.cover .meta { margin-top: 4em; color: #6b7280; }
</style>
"""

def image_to_base64(path: Path) -> str:
    """Inline image as base64 data URI."""
    if not path.exists():
        return ""
    data = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:image/png;base64,{data}"

def build_screenshots_section() -> str:
    """Build the screenshots section with inline base64 images."""
    sections = [
        ("Landing Page", [
            ("01-landing-hero.png", "Hero de la landing page avec CTAs principaux"),
            ("01b-landing-pricing.png", "Section pricing : 3 offres Freemium / Premium / Premium+"),
            ("01c-landing-cta.png", "Section CTA final et footer"),
        ]),
        ("Inscription Wizard (6 etapes)", [
            ("03-wizard-poids-taille.png", "Etape 2 : poids et taille"),
            ("03b-wizard-poids-taille-alt.png", "Etape 2 : validation des champs"),
            ("04-wizard-objectifs.png", "Etape 3 : selection d'objectifs"),
            ("04b-wizard-objectifs-validation.png", "Etape 3 : message d'erreur si aucun objectif"),
            ("04c-wizard-allergies.png", "Etape 4 : allergies alimentaires"),
            ("04d-wizard-signup.png", "Etape 6 : creation du compte"),
        ]),
        ("Connexion", [
            ("05-connexion.png", "Page de connexion avec lien vers l'inscription"),
        ]),
        ("Dashboard", [
            ("06-dashboard.png", "Dashboard principal : 4 KPIs, carte IMC, graphiques"),
            ("06b-dashboard-charts.png", "Graphiques evolution poids et calories journalieres"),
            ("06c-dashboard-charts-zoom.png", "Zoom sur les graphiques (donnees reelles)"),
        ]),
        ("Analytics (Premium)", [
            ("07-analytics-overview.png", "Onglet Vue d'ensemble : KPIs + graphique calories"),
            ("07b-analytics-macros.png", "Graphique macros (PieChart) et calories"),
            ("07c-analytics-poids.png", "Onglet Poids : evolution 30 derniers jours"),
        ]),
        ("Nutrition", [
            ("08-nutrition-upload.png", "Upload d'une photo de repas (drag & drop)"),
            ("09-nutrition-history.png", "Journal alimentaire : historique avec filtres"),
            ("10-meal-plan.png", "Plan de repas (Premium) genere par l'IA"),
        ]),
        ("Workouts (Premium)", [
            ("11-workouts.png", "Programme d'entrainement hebdomadaire avec exercices"),
        ]),
        ("Settings", [
            ("12-settings-profil.png", "Onglet Profil : email, age, poids, taille"),
            ("12b-settings-objectifs.png", "Onglet Objectifs et allergies alimentaires"),
            ("12c-settings-abonnement.png", "Onglet Abonnement : badge Premium + upgrade Premium+"),
        ]),
        ("Clients B2B (Premium+)", [
            ("13-clients-premium-guard.png", "Premium Guard : acces reserve aux comptes Premium+"),
        ]),
    ]

    html = ["<h1>Annexe : Captures d'ecran</h1>"]
    for section_title, items in sections:
        html.append(f"<h2>{section_title}</h2>")
        html.append('<div class="screenshots">')
        for filename, caption in items:
            img_path = SCREENSHOTS / filename
            if img_path.exists():
                data_uri = image_to_base64(img_path)
                html.append(f'<figure><img src="{data_uri}" alt="{caption}"><figcaption>{caption}</figcaption></figure>')
        html.append("</div>")
    return "\n".join(html)

def main():
    md = markdown.Markdown(extensions=["tables", "fenced_code", "toc"])

    parts = []

    # Cover page
    parts.append("""
<div class="cover">
  <h1>HealthNext</h1>
  <div class="subtitle">Documentation de livraison — Frontend</div>
  <p style="margin-top: 2em;">Plateforme digitale de suivi nutritionnel et coaching personnalise<br>
  Cahier des charges : MSPR TPRE502 (2025-2026)</p>
  <div class="meta">
    <p>Stack : Next.js 16 + React 19 + TypeScript + Tailwind CSS + Shadcn UI</p>
    <p>Date de livraison : Avril 2026</p>
  </div>
</div>
""")

    # Table of contents
    parts.append("""
<div class="toc">
  <h2>Sommaire</h2>
  <ol>
    <li><a href="#benchmark">Benchmark Frontend</a></li>
    <li><a href="#documentation">Documentation technique</a></li>
    <li><a href="#maquettes">Maquettes & Design System</a></li>
    <li><a href="#accessibilite">Accessibilite WCAG 2.1 AA / RGAA 4</a></li>
    <li><a href="#conduite">Conduite du changement</a></li>
    <li><a href="#annexe">Annexe : Captures d'ecran</a></li>
  </ol>
</div>
""")

    # Main docs
    anchors = ["benchmark", "documentation", "maquettes", "accessibilite", "conduite"]
    for doc_file, anchor in zip(DOCS_ORDER, anchors):
        src = ROOT / doc_file
        if not src.exists():
            continue
        content = src.read_text(encoding="utf-8")
        # Remove the first h1 to avoid duplicates, we'll add an anchor to the first
        html_content = md.convert(content)
        md.reset()
        # Add id to first h1
        html_content = re.sub(r"<h1>", f'<h1 id="{anchor}">', html_content, count=1)
        parts.append(html_content)

    # Screenshots annex
    parts.append('<div id="annexe">')
    parts.append(build_screenshots_section())
    parts.append("</div>")

    html = f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>HealthNext - Documentation Frontend</title>
{CSS}
</head>
<body>
{''.join(parts)}
</body>
</html>
"""
    OUTPUT.write_text(html, encoding="utf-8")
    print(f"Generated: {OUTPUT}")
    print(f"Size: {OUTPUT.stat().st_size / 1024:.1f} KB")

if __name__ == "__main__":
    main()
