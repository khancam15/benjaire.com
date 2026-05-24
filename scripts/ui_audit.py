#!/usr/bin/env python3
"""Static UI and accessibility hygiene checks for benjaire.com."""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Optional


TAG_RE = re.compile(r"<([a-zA-Z][a-zA-Z0-9:-]*)([^>]*)>", re.DOTALL)
ATTR_RE = re.compile(r'([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*([\'"])(.*?)\2', re.DOTALL)


@dataclass
class Finding:
    level: str
    file: Path
    message: str
    line: Optional[int] = None

    def render(self, root: Path) -> str:
        rel = self.file.relative_to(root) if self.file.is_relative_to(root) else self.file
        location = f"{rel}:{self.line}" if self.line else str(rel)
        return f"[{self.level}] {location} - {self.message}"


def html_files(root: Path) -> list[Path]:
    if root.is_file():
        return [root] if root.suffix.lower() == ".html" else []
    return sorted(path for path in root.rglob("*.html") if ".git" not in path.parts)


def attrs(raw: str) -> dict[str, str]:
    return {name.lower(): value for name, _, value in ATTR_RE.findall(raw)}


def line_number(text: str, index: int) -> int:
    return text.count("\n", 0, index) + 1


def add(findings: list[Finding], level: str, file: Path, message: str, line: Optional[int] = None) -> None:
    findings.append(Finding(level, file, message, line))


def audit_file(path: Path) -> list[Finding]:
    text = path.read_text(encoding="utf-8")
    lower = text.lower()
    findings: list[Finding] = []

    if '<meta name="viewport"' not in lower and "<meta name='viewport'" not in lower:
        add(findings, "FAIL", path, "Missing responsive viewport meta tag")

    if not re.search(r"<title>[^<]{8,}</title>", text, flags=re.IGNORECASE):
        add(findings, "FAIL", path, "Missing useful title")

    if not re.search(r'<meta\s+name=["\']description["\']\s+content=["\'][^"\']{40,}["\']', text, flags=re.IGNORECASE):
        add(findings, "WARN", path, "Meta description should be present and descriptive")

    if "<h1" not in lower:
        add(findings, "FAIL", path, "Missing h1")

    if ":focus-visible" not in text:
        add(findings, "WARN", path, "Add visible keyboard focus styles")

    if "prefers-reduced-motion" not in text:
        add(findings, "WARN", path, "Add reduced-motion handling for animated UI")

    if "clamp(" not in text:
        add(findings, "WARN", path, "Consider responsive type sizing with CSS clamp()")

    if "aria-expanded" not in lower and "mobile-menu" in lower:
        add(findings, "WARN", path, "Mobile menu toggle should maintain aria-expanded")

    for tag_match in TAG_RE.finditer(text):
        tag_name = tag_match.group(1).lower()
        tag_attrs = attrs(tag_match.group(2))
        line = line_number(text, tag_match.start())

        if tag_name == "img":
            if "alt" not in tag_attrs:
                add(findings, "FAIL", path, "Image missing alt text", line)
            if "width" not in tag_attrs and "height" not in tag_attrs:
                add(findings, "WARN", path, "Image has no intrinsic width/height attributes", line)

        if tag_name == "button":
            has_label = bool(tag_attrs.get("aria-label") or tag_attrs.get("aria-labelledby"))
            tag_end = text.find("</button>", tag_match.end())
            button_text = text[tag_match.end():tag_end].strip() if tag_end != -1 else ""
            if not has_label and not re.sub(r"<[^>]+>", "", button_text).strip():
                add(findings, "FAIL", path, "Button has no accessible label", line)

        style = tag_attrs.get("style", "")
        if "transition-delay" in style:
            add(findings, "INFO", path, "Inline transition-delay found; keep animation choices intentional", line)

    return findings


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("target", nargs="?", default=".", help="HTML file or directory to audit")
    args = parser.parse_args()

    root = Path(args.target).resolve()
    files = html_files(root)
    if not files:
        print(f"No HTML files found in {root}", file=sys.stderr)
        return 1

    scan_root = root if root.is_dir() else root.parent
    findings = [finding for file in files for finding in audit_file(file)]
    failures = [finding for finding in findings if finding.level == "FAIL"]
    warnings = [finding for finding in findings if finding.level == "WARN"]
    info = [finding for finding in findings if finding.level == "INFO"]

    print(f"UI audit scanned {len(files)} HTML file(s).")
    for finding in findings:
        print(finding.render(scan_root))

    print(f"Summary: {len(failures)} failure(s), {len(warnings)} warning(s), {len(info)} info item(s).")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
