# Ian Wu's portfolio (ianwu.co.uk)

A static site with no build step to preview, published by GitHub Pages from
`main` (custom domain in `CNAME`). `README.md` is the user-facing guide; this
file covers what a contributor needs.

## Layout

- `index.html`: the whole portfolio page. `404.html` uses absolute paths
  because GitHub Pages serves it at any depth.
- `assets/js/main.js`: optional enhancements (project filters, chart toggle,
  regression playground, lightbox, scroll effects, copy-email).
- `src/input.css`: the Tailwind source. It compiles to `assets/css/styles.css`,
  which is committed.
- `projects/<name>/`: one folder per "Other Projects" card. Each has
  `index.html` (the live demo), `README.md` and the original-language source.
  The Pong and calculator demos are JavaScript ports of the Python and Java
  code, which keep the same classes and rules.
- `tests/*.test.mjs`: Node tests for the JavaScript demos. They mirror the
  Python and Java tests.
- `assets/code/`: Python and R scripts that regenerate the charts and
  `demo_metrics.json` in `assets/images/`.

## Commands

```sh
python3 -m http.server 8000                       # preview at http://localhost:8000
npm run build:css                                 # after any Tailwind class change
npm test                                          # JavaScript demo tests
(cd projects/pong && python3 -m unittest test_pong)
(cd projects/oop-calculator/java && javac -encoding UTF-8 -d build *.java && java -Djava.awt.headless=true -cp build CalculatorTest)
```

In cloud sessions, `.claude/hooks/session-start.sh` installs the npm packages
and Pygame, and sets the SDL variables Pygame needs without a display. To
regenerate the charts, install the root `requirements.txt` (pandas,
statsmodels, matplotlib); R is optional.

## Rules

- **Rebuild the stylesheet.** After adding or changing Tailwind classes in
  any HTML or JS file, run `npm run build:css` and commit
  `assets/css/styles.css`. The Build CSS workflow fails pull requests whose
  stylesheet is out of date.
- **Keep claims accurate.** The statistical demos use synthetic data and the
  page says so. Don't describe them as real-world findings, and don't add
  results, dates or credentials that the code in this repo doesn't produce.
  The trading bot only paper-trades.
- **Work without JavaScript.** Mark JS-only controls with the `js-only` class,
  which hides them until `main.js` adds `.js` to `<html>`. Respect
  `prefers-reduced-motion`, as the existing CSS and JS do.
- **Keep demos and source in step.** When a project's rules change, update
  the original-language code, the JavaScript port and both test suites
  together.
- **Plain HTML, CSS and JS.** Don't add a framework or bundler. The only npm
  dependency is the Tailwind CLI.
- **Update listings with project pages.** When a project page is added or
  renamed, update `sitemap.xml` and the Projects table in `README.md`.

## Skills

- `/add-project`: adds a new project card, demo page, README and tests.
- `/check-site`: runs the same checks as CI, plus link and browser checks,
  before you push.
