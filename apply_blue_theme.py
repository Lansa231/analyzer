#!/usr/bin/env python3
"""
Green -> Blue theme patcher for index.html (S.K. Wellala Biology Paper Class)

Usage:
    python3 apply_blue_theme.py index.html

- Makes index.html.backup first (never overwrites an existing backup).
- Applies the 11 changes from your guide as exact-text replacements.
- Prints how many times each one matched, so you can see anything missed.
- Does NOT touch semantic colours (--good/--warn/--bad, gold buttons, grade bars, etc.)
"""
import sys, shutil, os

if len(sys.argv) < 2:
    sys.exit("Usage: python3 apply_blue_theme.py index.html")

path = sys.argv[1]
backup = path + ".backup"
if not os.path.exists(backup):
    shutil.copyfile(path, backup)
    print(f"Backup saved -> {backup}")
else:
    print(f"Backup already exists ({backup}) - leaving it untouched")

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

# (label, old, new, expected_count)
R = [
 # ---- Change 1: light theme variables
 ("1  light --bg/--ink/--muted/--line",
  "--bg:#f1f8f3; --card:#ffffff; --ink:#12281c; --muted:#5a7364; --line:#dfece4;",
  "--bg:#f0f6fb; --card:#ffffff; --ink:#0f2033; --muted:#5a7189; --line:#dae7f2;", 1),
 ("1  light --brand/--brand2/--brand-soft",
  "--brand:#15803d; --brand2:#22a06b; --brand-soft:#e4f4e8;",
  "--brand:#0369a1; --brand2:#06b6d4; --brand-soft:#e0f2fe;", 1),
 ("1  light --brand-bg",
  "--brand-bg:#e4f4e8;", "--brand-bg:#e0f2fe;", 1),
 ("1  light --shadow",
  "--shadow:0 8px 28px rgba(20,80,40,.10)", "--shadow:0 8px 28px rgba(3,7,30,.10)", 1),

 # ---- Change 2: dark theme variables
 ("2  dark --bg/--card/--ink/--muted/--line",
  "--bg:#0a1710; --card:#12261a; --ink:#e6f2ea; --muted:#8fb09a; --line:#1f3a2a;",
  "--bg:#0a1420; --card:#122130; --ink:#e6eef2; --muted:#8fa9bd; --line:#1e3a52;", 1),
 ("2  dark --brand/--brand2/--brand-soft",
  "--brand:#4ade80; --brand2:#a3e635; --brand-soft:#14532d;",
  "--brand:#38bdf8; --brand2:#67e8f9; --brand-soft:#082f49;", 1),
 ("2  dark --brand-bg",
  "--brand-bg:#14532d;", "--brand-bg:#082f49;", 1),

 # ---- Change 3: .lp-hero-bg (original + softer override) and shared dark->teal gradient
 ("3  hero overlay (original)",
  "rgba(6,42,24,.34) 0%,rgba(6,42,24,.58) 62%,rgba(6,42,24,.74) 100%",
  "rgba(3,7,30,.42) 0%,rgba(3,7,30,.68) 62%,rgba(3,7,30,.86) 100%", 1),
 ("3  hero radial glow",
  "radial-gradient(circle at 78% 28%,rgba(52,211,153,.30)",
  "radial-gradient(circle at 78% 28%,rgba(6,182,212,.30)", 1),
 ("3  hero overlay (softer override)",
  "rgba(6,42,24,.28) 0%,rgba(6,42,24,.42) 62%,rgba(6,42,24,.58) 100%",
  "rgba(3,7,30,.4) 0%,rgba(3,7,30,.62) 62%,rgba(3,7,30,.78) 100%", 1),
 ("3+7 base gradient (hero x2 + portal banner)",
  "linear-gradient(135deg,#0c4a27,#15803d 55%,#22a06b)",
  "linear-gradient(135deg,#082f49,#075985 55%,#06b6d4)", 3),

 # ---- Change 4: mobile hero
 ("4  mobile hero overlay",
  "rgba(6,42,24,.32) 0%, rgba(6,42,24,.55) 55%, rgba(6,42,24,.78) 100%",
  "rgba(3,7,30,.4) 0%, rgba(3,7,30,.62) 55%, rgba(3,7,30,.82) 100%", 1),
 ("4  mobile hero base gradient",
  "linear-gradient(135deg, #0c4a27, #15803d 55%, #22a06b)",
  "linear-gradient(135deg, #082f49, #075985 55%, #06b6d4)", 1),

 # ---- Changes 5 + 6: .side and .hero.photo
 ("5+6 tint overlay (.side + .hero.photo)",
  "rgba(6,45,25,var(--tint-a)),rgba(6,45,25,var(--tint-b))",
  "rgba(3,7,30,var(--tint-a)),rgba(3,7,30,var(--tint-b))", 2),
 ("5+6 base gradient (.side + .hero.photo)",
  "linear-gradient(135deg,#15803d,#22a06b)",
  "linear-gradient(135deg,#082f49,#06b6d4)", 2),

 # ---- Change 7: portal banner overlay
 ("7  portal banner overlay",
  "rgba(6,42,24,.55),rgba(6,42,24,.78)",
  "rgba(3,7,30,.62),rgba(3,7,30,.82)", 1),

 # ---- Change 8: teacher photo
 ("8  teacher photo overlay",
  "rgba(6,42,24,.30),rgba(6,42,24,.55)",
  "rgba(3,7,30,.42),rgba(3,7,30,.68)", 1),
 ("8  teacher photo base gradient",
  "linear-gradient(150deg,#0c4a27,#15803d 60%,#22a06b)",
  "linear-gradient(150deg,#082f49,#075985 60%,#06b6d4)", 1),

 # ---- Change 9: primary button shadow
 ("9  btn-primary-solid shadow",
  "rgba(21,128,61,.28)", "rgba(3,105,161,.28)", 1),

 # ---- Change 10: chart colours (student dashboard + teacher's student view)
 ("10 chart borderColor",
  "borderColor:'#15803d'", "borderColor:'#0369a1'", 2),
 ("10 chart backgroundColor (fill)",
  "backgroundColor:'rgba(21,128,61,.12)'", "backgroundColor:'rgba(3,105,161,.12)'", 2),
 ("10 chart pointBackgroundColor",
  "pointBackgroundColor:'#22a06b'", "pointBackgroundColor:'#06b6d4'", 2),
 # Extra (not in guide, but it is a chart colour): analytics bar chart
 ("10+ analytics bar chart",
  "backgroundColor:'#22a06b',borderRadius:8", "backgroundColor:'#06b6d4',borderRadius:8", 1),

 # ---- Change 11: PWA theme colour
 ("11 theme-color meta",
  '<meta name="theme-color" content="#15803d" />',
  '<meta name="theme-color" content="#0369a1" />', 1),

 # ---- Optional from guide: gold -> cyan progress bar in landing mock
 ("opt mock-bar gradient",
  "linear-gradient(90deg,#fde68a,#4ade80)",
  "linear-gradient(90deg,#fde68a,#67e8f9)", 1),
]

problems = 0
for label, old, new, expected in R:
    n = src.count(old)
    if n:
        src = src.replace(old, new)
    status = "OK " if n == expected else "!! "
    if n != expected:
        problems += 1
    print(f"{status}{label:<46} matched {n} (expected {expected})")

with open(path, "w", encoding="utf-8") as f:
    f.write(src)

print("\n--- Leftover scan (these may still be green) ---")
for tok in ["#15803d", "#22a06b", "#0c4a27", "rgba(6,42,24", "rgba(6,45,25", "rgba(21,128,61"]:
    lines = [i + 1 for i, l in enumerate(src.splitlines()) if tok in l]
    print(f"{tok:<16} {len(lines)} line(s) {lines[:12]}")

print("\nExpected leftovers: '#15803d' once in the signup password-strength meter (semantic, keep).")
print("PDF exports use rgb(21,128,61) green headers - see notes if you want those blue too.")
print("Also check theme.css, motion.css and features.js for the same hex values.")
if problems:
    print(f"\n{problems} replacement(s) did not match the expected count - check those lines by hand.")
