#!/usr/bin/env bash
# security-audit.sh — Static HTML security checker for benjaire.com
# Usage: ./security-audit.sh [directory]   (defaults to current directory)

set -euo pipefail

DIR="${1:-.}"
HTML_FILES=()
while IFS= read -r -d '' f; do
  HTML_FILES+=("$f")
done < <(find "$DIR" -name "*.html" -not -path "*/.git/*" -print0)

if [[ ${#HTML_FILES[@]} -eq 0 ]]; then
  echo "No HTML files found in: $DIR"
  exit 1
fi

PASS=0
FAIL=0

RED='\033[0;31m'
YEL='\033[0;33m'
GRN='\033[0;32m'
CYN='\033[0;36m'
RST='\033[0m'

fail()  { echo -e "  ${RED}[FAIL]${RST} $*"; FAIL=$((FAIL+1)); }
warn()  { echo -e "  ${YEL}[WARN]${RST} $*"; }
pass()  { echo -e "  ${GRN}[PASS]${RST} $*"; PASS=$((PASS+1)); }

echo ""
echo -e "${CYN}=== Benjaire Security Audit ===${RST}"
echo -e "Scanning ${#HTML_FILES[@]} HTML file(s) in: $DIR"
echo ""

for FILE in "${HTML_FILES[@]}"; do
  NAME="${FILE#$DIR/}"
  echo -e "${CYN}--- $NAME ---${RST}"

  # 1. Content-Security-Policy
  if grep -qi 'Content-Security-Policy' "$FILE"; then
    pass "Content-Security-Policy present"
    # Warn if unsafe-inline is in script-src
    CSP_LINE=$(grep -i 'Content-Security-Policy' "$FILE" | head -1)
    SCRIPT_SRC=$(echo "$CSP_LINE" | grep -oiE "script-src[^;'\"]*" | head -1)
    if echo "$SCRIPT_SRC" | grep -qi 'unsafe-inline'; then
      warn "script-src contains 'unsafe-inline' — consider nonces or hashes"
    fi
  else
    fail "Missing Content-Security-Policy meta tag"
  fi

  # 2. Referrer Policy
  if grep -qi 'name="referrer"' "$FILE"; then
    pass "Referrer Policy present"
  else
    fail "Missing <meta name=\"referrer\"> tag"
  fi

  # 3. target="_blank" without rel="noopener noreferrer"
  BLANK_UNSAFE=$(grep -n 'target="_blank"' "$FILE" | grep -v 'rel="noopener noreferrer"' || true)
  if [[ -n "$BLANK_UNSAFE" ]]; then
    while IFS= read -r line; do
      LINENO=$(echo "$line" | cut -d: -f1)
      fail "target=\"_blank\" without rel=\"noopener noreferrer\" — line $LINENO"
    done <<< "$BLANK_UNSAFE"
  else
    pass "All target=\"_blank\" links have rel=\"noopener noreferrer\""
  fi

  # 4. Inline event handlers (onclick, onsubmit, etc.)
  INLINE_HANDLERS=$(grep -nE 'on(click|submit|load|error|mouseover|focus|blur|change|keyup|keydown|input)=' "$FILE" || true)
  if [[ -n "$INLINE_HANDLERS" ]]; then
    while IFS= read -r line; do
      LINENO=$(echo "$line" | cut -d: -f1)
      warn "Inline event handler — line $LINENO (prefer addEventListener)"
    done <<< "$INLINE_HANDLERS"
  else
    pass "No inline event handlers found"
  fi

  # 5. document.write / eval()
  if grep -qE 'document\.write[[:space:]]*\(' "$FILE"; then
    LINES=$(grep -nE 'document\.write[[:space:]]*\(' "$FILE" | cut -d: -f1 | tr '\n' ',')
    fail "document.write() found — line(s) $LINES"
  else
    pass "No document.write() found"
  fi

  if grep -qE '[^a-zA-Z_$]eval[[:space:]]*\(' "$FILE"; then
    LINES=$(grep -nE '[^a-zA-Z_$]eval[[:space:]]*\(' "$FILE" | cut -d: -f1 | tr '\n' ',')
    fail "eval() found — line(s) $LINES"
  else
    pass "No eval() found"
  fi

  # 6. innerHTML assignments (potential XSS sink)
  if grep -qE 'innerHTML[[:space:]]*[+]?=' "$FILE"; then
    LINES=$(grep -nE 'innerHTML[[:space:]]*[+]?=' "$FILE" | cut -d: -f1 | tr '\n' ',')
    fail "innerHTML assignment found — line(s) $LINES (use textContent or DOMParser)"
  else
    pass "No innerHTML assignments found"
  fi

  # 7. HTTP (non-HTTPS) external resources
  HTTP_SRCS=$(grep -nE '(src|href|action)="http://' "$FILE" || true)
  if [[ -n "$HTTP_SRCS" ]]; then
    while IFS= read -r line; do
      LINENO=$(echo "$line" | cut -d: -f1)
      fail "Insecure HTTP resource — line $LINENO"
    done <<< "$HTTP_SRCS"
  else
    pass "No insecure HTTP external resources"
  fi

  # 8. javascript: protocol in href/src
  if grep -qiE '(href|src|action)="javascript:' "$FILE"; then
    LINES=$(grep -niE '(href|src|action)="javascript:' "$FILE" | cut -d: -f1 | tr '\n' ',')
    fail "javascript: protocol in attribute — line(s) $LINES"
  else
    pass "No javascript: protocol URIs"
  fi

  # 9. Form action pointing to external or insecure URL
  FORM_ACTION=$(grep -nE '<form[^>]+action=' "$FILE" || true)
  if [[ -n "$FORM_ACTION" ]]; then
    if echo "$FORM_ACTION" | grep -qE 'action="http://'; then
      fail "Form action uses HTTP — use HTTPS"
    else
      warn "Form with action attribute found — verify server-side input validation and CSRF protection"
    fi
  fi

  # 10. Password inputs (informational)
  if grep -qiE '<input[^>]+type="password"' "$FILE"; then
    warn "Password input found — ensure page is only served over HTTPS"
  fi

  echo ""
done

# ─── Summary ─────────────────────────────────────────────────────────────────
TOTAL=$((PASS + FAIL))
echo -e "${CYN}=== Summary ===${RST}"
echo -e "  Files scanned : ${#HTML_FILES[@]}"
echo -e "  Checks passed : ${GRN}$PASS${RST}"
echo -e "  Checks failed : ${RED}$FAIL${RST}"
echo ""

if [[ $FAIL -gt 0 ]]; then
  echo -e "${RED}Security audit FAILED. Fix the issues above before deploying.${RST}"
  echo ""
  exit 1
else
  echo -e "${GRN}All security checks passed.${RST}"
  echo ""
  exit 0
fi
