#!/usr/bin/env python3
"""Check internal Earth to Ear Atlas structure, not factual/music-source validity."""
from collections import Counter
from pathlib import Path
import re
import sys

DOCS = Path(__file__).resolve().parents[1] / "docs" / "atlases"
ATLASES = [
    ("Africa", "african-musical-atlas-v0-3.md", r"(?m)^### ([^\n]+)\n", "## 06 | Islands"),
    ("North America", "north-american-musical-atlas-v0-3.md", r"(?m)^## (\d{2}) \| ([^\n]+)\n", "## Cross-border and historical relationship register"),
    ("South America", "south-american-musical-atlas-v0-2.md", r"(?m)^## (\d{2}) \| ([^\n]+)\n", "## 14 | Additional territory"),
]
LENSES = ("Living and inherited traditions", "Historical transformations", "Contemporary expressions")
CODE_PATTERN = re.compile(r"^- \*\*\[([GFPSAR])\]\*\* ")
problems = []

for region, name, pattern, boundary in ATLASES:
    text = (DOCS / name).read_text(encoding="utf-8")
    pos = text.find(boundary)
    if pos < 0:
        problems.append(f"{region}: cannot find section boundary")
        continue
    segment = text[:pos]
    headings = list(re.finditer(pattern, segment))
    if not headings:
        problems.append(f"{region}: no geographic sections")
        continue
    tally = Counter()
    for ix, match in enumerate(headings):
        country = match.group(match.lastindex)
        body = segment[match.end():headings[ix + 1].start() if ix + 1 < len(headings) else pos]
        if "Evidence starting points:" not in body:
            problems.append(f"{region} / {country}: missing source starting points")
        for lens in LENSES:
            if lens not in body:
                problems.append(f"{region} / {country}: missing {lens}")
        if region == "Africa" and "[A]" not in body:
            problems.append(f"{region} / {country}: missing composed-music research status")
        for line in body.splitlines():
            if line.startswith("- "):
                code = CODE_PATTERN.match(line)
                if code:
                    tally[code.group(1)] += 1
                else:
                    problems.append(f"{region} / {country}: untyped entry {line[:90]}")
    total = re.search(r"\| \*\*Total\*\* \| \*\*(\d+)\*\*", text)
    if not total or int(total.group(1)) != sum(tally.values()):
        problems.append(f"{region}: summary count disagrees with typed inventory ({sum(tally.values())})")
    refs = set(re.findall(r"\]\(#([sna]\d{2})\)", segment))
    unlinked = [ref for ref in refs if f'<a id="{ref}">' not in text]
    if unlinked:
        problems.append(f"{region}: source anchors not resolved: {', '.join(unlinked)}")
    print(f"{region}: {len(headings)} geographic sections, {sum(tally.values())} candidate listings")
if problems:
    print("ATLAS STRUCTURAL ERRORS:\n - " + "\n - ".join(problems), file=sys.stderr)
    sys.exit(1)
print("Structure passed. Editorial chronology and per-entry evidence still require human/source validation.")
