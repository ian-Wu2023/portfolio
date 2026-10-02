---
name: check-site
description: Check the portfolio before pushing. Runs the CI checks (stylesheet up to date, JavaScript, Python and Java tests), checks every page's links, and loads each page in a browser at phone and desktop widths. Use before committing or pushing changes to this site, or when asked to check, test or verify the site.
---

# Check the site

Run these from the repository root and report each result. If the session
start hook hasn't run (outside a cloud session), install first with
`npm install` and `python3 -m pip install -r projects/pong/requirements.txt`.

1. **Stylesheet**: run `npm run build:css`, then
   `git diff --stat -- assets/css/styles.css`. If the stylesheet changed, the
   rebuilt file belongs in the commit; the Build CSS workflow fails pull
   requests without it. Don't edit `styles.css` by hand.
2. **JavaScript tests**: `npm test`
3. **Python tests**:
   `(cd projects/pong && SDL_VIDEODRIVER=dummy SDL_AUDIODRIVER=dummy python3 -m unittest test_pong)`
4. **Java tests**:
   `(cd projects/oop-calculator/java && javac -encoding UTF-8 -d build *.java && java -Djava.awt.headless=true -cp build CalculatorTest)`
5. **Pages**: `node .claude/skills/check-site/check_pages.mjs <dir>`, with
   `<dir>` in your scratchpad (never inside the repo). It finds:
   - links and asset paths that don't exist, and `#anchors` with no
     matching id;
   - script errors, failed local requests, and pages that scroll sideways at
     390px or 1280px.

   It also saves full-page screenshots to `<dir>`. Open the screenshots of
   the pages your change touched and look at them.

   Without Playwright it only checks links, and says so. Fonts and Binance
   data can't load in a sandbox; the script lists those hosts as notes, not
   problems.

If you added a project with tests in another language, run those too, as the
Tests workflow (`.github/workflows/tests.yml`) does.

Report what passed and what failed, quoting the failing output. Fix failures
that your change caused before pushing. Don't skip or weaken a test to get a
pass.
