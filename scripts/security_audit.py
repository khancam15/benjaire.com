#!/usr/bin/env python3
"""Static security checks for benjaire.com HTML files."""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Optional


HTML_ATTR_RE = re.compile(r'([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*([\'"])(.*?)\2', re.DOTALL)
TAG_RE = re.compile(r"<([a-zA-Z][a-zA-Z0-9:-]*)([^>]*)>", re.DOTALL)


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


def line_number(text: str, index: int) -> int:
    return text.count("\n", 0, index) + 1


def attrs(raw: str) -> dict[str, str]:
    return {name.lower(): value for name, _, value in HTML_ATTR_RE.findall(raw)}


def add(findings: list[Finding], level: str, file: Path, message: str, line: Optional[int] = None) -> None:
    findings.append(Finding(level, file, message, line))


def audit_file(path: Path) -> list[Finding]:
    text = path.read_text(encoding="utf-8")
    lower = text.lower()
    findings: list[Finding] = []

    csp = ""
    for tag_match in TAG_RE.finditer(text):
        if tag_match.group(1).lower() != "meta":
            continue
        tag_attrs = attrs(tag_match.group(2))
        if tag_attrs.get("http-equiv", "").lower() == "content-security-policy":
            csp = tag_attrs.get("content", "").lower()
            break

    if not csp:
        add(findings, "FAIL", path, "Missing Content-Security-Policy meta tag")
    else:
        required = ["default-src", "script-src", "style-src", "img-src", "frame-ancestors", "base-uri"]
        for directive in required:
            if directive not in csp:
                add(findings, "FAIL", path, f"CSP missing {directive}")
        if "frame-ancestors 'none'" not in csp:
            add(findings, "FAIL", path, "CSP should include frame-ancestors 'none'")
        if "connect-src 'none'" not in csp:
            add(findings, "WARN", path, "CSP should lock connect-src to 'none' for this static site")
        if "'unsafe-inline'" in csp:
            add(findings, "WARN", path, "CSP contains 'unsafe-inline'; consider hashes or external assets")

    if 'name="referrer"' not in lower and "name='referrer'" not in lower:
        add(findings, "FAIL", path, "Missing referrer policy meta tag")

    if "document.write" in lower:
        for match in re.finditer(r"document\.write\s*\(", text, flags=re.IGNORECASE):
            add(findings, "FAIL", path, "document.write() is unsafe", line_number(text, match.start()))

    for match in re.finditer(r"(^|[^a-zA-Z0-9_$])eval\s*\(", text):
        add(findings, "FAIL", path, "eval() is unsafe", line_number(text, match.start()))

    for match in re.finditer(r"\.innerHTML\s*(?:\+)?=", text):
        add(findings, "FAIL", path, "innerHTML assignment can become an XSS sink", line_number(text, match.start()))

    for tag_match in TAG_RE.finditer(text):
        tag_name = tag_match.group(1).lower()
        tag_attrs = attrs(tag_match.group(2))
        line = line_number(text, tag_match.start())

        for attr_name in ("src", "href", "action"):
            value = tag_attrs.get(attr_name, "").strip().lower()
            if value.startswith("http://"):
                add(findings, "FAIL", path, f"Insecure HTTP {attr_name} URL", line)
            if value.startswith("javascript:"):
                add(findings, "FAIL", path, f"javascript: URL in {attr_name}", line)

        if tag_attrs.get("target", "").lower() == "_blank":
            rel_values = set(tag_attrs.get("rel", "").lower().split())
            if not {"noopener", "noreferrer"}.issubset(rel_values):
                add(findings, "FAIL", path, 'target="_blank" missing rel="noopener noreferrer"', line)

        if any(name.startswith("on") for name in tag_attrs):
            add(findings, "WARN", path, f"Inline event handler on <{tag_name}>", line)

        if tag_name == "form" and "action" in tag_attrs:
            add(findings, "WARN", path, "Verify server-side validation and CSRF protection for forms", line)

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

    print(f"Security audit scanned {len(files)} HTML file(s).")
    for finding in findings:
        print(finding.render(scan_root))

    print(f"Summary: {len(failures)} failure(s), {len(warnings)} warning(s).")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
