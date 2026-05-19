"""
Extrait la banque de questions/reponses du docx d'oral et genere un MP3 par section
+ un MP3 complet, en francais avec une voix neuronale Microsoft Edge.

Sortie : C:\\Developper\\Ecole\\Health-AI-project\\preparation_oral_audio\\
"""
import asyncio
import os
import re
from pathlib import Path

import edge_tts
from docx import Document

DOCX_PATH = Path(r"C:\Developper\Ecole\Health-AI-project\preparation_oral_frontend.docx")
OUT_DIR = Path(r"C:\Developper\Ecole\Health-AI-project\preparation_oral_audio")
VOICE = "fr-FR-DeniseNeural"  # voix francaise feminine naturelle
RATE = "-5%"  # legerement plus lent pour mieux retenir


def slugify(text: str) -> str:
    text = re.sub(r"[^a-zA-Z0-9]+", "_", text.lower()).strip("_")
    return text[:60]


def extract_qa_sections(docx_path: Path):
    """
    Parcourt le docx, repere la section '14. Banque de questions / reponses',
    puis groupe les Q/R par sous-section '14.x'.
    Retourne : list[(titre_section, list[(question, reponse)])]
    """
    doc = Document(str(docx_path))
    in_qa = False
    sections = []
    current_title = None
    current_pairs = []
    pending_q = None

    for p in doc.paragraphs:
        text = p.text.strip()
        if not text:
            continue
        # Detection du debut de la banque
        if not in_qa:
            if text.startswith("14.") and "Banque" in text:
                in_qa = True
            continue
        # Detection des sous-sections '14.x ...'
        m = re.match(r"^14\.(\d+)\s+(.+)$", text)
        if m:
            if current_title is not None:
                sections.append((current_title, current_pairs))
            current_title = text
            current_pairs = []
            pending_q = None
            continue
        # Sortie de la banque
        if text.startswith("Annexes") or text.startswith("A.") or text.startswith("Resume executif"):
            if current_title is not None:
                sections.append((current_title, current_pairs))
                current_title = None
            in_qa = False
            continue
        # Q : ...
        if text.startswith("Q :"):
            pending_q = text[3:].strip()
            continue
        # R : ...
        if text.startswith("R :") and pending_q is not None:
            current_pairs.append((pending_q, text[3:].strip()))
            pending_q = None
            continue

    if current_title is not None and in_qa:
        sections.append((current_title, current_pairs))
    return sections


def build_section_text(title: str, pairs):
    lines = [f"Section : {title}.", ""]
    for i, (q, r) in enumerate(pairs, 1):
        lines.append(f"Question {i}.")
        lines.append(q)
        lines.append("")
        lines.append("Reponse.")
        lines.append(r)
        lines.append("")
    return "\n".join(lines)


async def synth(text: str, output: Path):
    communicate = edge_tts.Communicate(text=text, voice=VOICE, rate=RATE)
    await communicate.save(str(output))


async def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    sections = extract_qa_sections(DOCX_PATH)
    if not sections:
        print("Aucune Q/R extraite. Verifie le docx source.")
        return

    print(f"{len(sections)} sections detectees.")
    full_lines = ["Banque de questions et reponses pour l'oral MSPR.", ""]

    for idx, (title, pairs) in enumerate(sections, 1):
        if not pairs:
            print(f"  [skip] {title} : aucune Q/R")
            continue
        section_text = build_section_text(title, pairs)
        slug = slugify(title)
        out_file = OUT_DIR / f"{idx:02d}_{slug}.mp3"
        print(f"  -> {out_file.name} ({len(pairs)} Q/R)")
        await synth(section_text, out_file)
        full_lines.append(section_text)
        full_lines.append("")

    # Fichier consolide
    full_text = "\n".join(full_lines)
    full_file = OUT_DIR / "00_complet.mp3"
    print(f"  -> {full_file.name} (consolide)")
    await synth(full_text, full_file)

    print(f"\nFichiers audio generes dans : {OUT_DIR}")


if __name__ == "__main__":
    asyncio.run(main())
