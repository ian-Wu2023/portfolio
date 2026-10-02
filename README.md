# Ian Wu — portfolio

A static HTML portfolio with runnable Python and R statistical demonstrations.

## Preview the website

From this directory, run `python -m http.server 8000` and open
http://localhost:8000. No build step is needed to preview: the compiled
stylesheet (`assets/css/styles.css`) is committed. The Inter font loads from
Google Fonts; offline, the page falls back to the system font.

The site is published with GitHub Pages at https://ianwu.co.uk (see `CNAME`).

## Edit the styles

The page is styled with [Tailwind CSS](https://tailwindcss.com) classes in
`index.html` and `404.html`, plus custom CSS in `src/input.css`. These are
compiled into `assets/css/styles.css`, so only the CSS the page uses is shipped.

After adding or changing Tailwind classes, rebuild the stylesheet (Node.js 18+):

```sh
npm install
npm run build:css    # or `npm run watch:css` while editing
```

If you edit files directly on github.com, the **Build CSS** GitHub Action
rebuilds and commits `assets/css/styles.css` for you when the change reaches
`main`. On pull requests it checks that the stylesheet is up to date.

## Projects

The "Other Projects" cards link to working versions in `projects/`, rebuilt on
3 October 2026. Each has a live demo on the site and its own README:

| Project | Source | Live demo |
| --- | --- | --- |
| Real-Time Crypto Trading Bot (JavaScript, WebSocket, Binance API) | [`projects/crypto-trading-bot`](projects/crypto-trading-bot) | https://ianwu.co.uk/projects/crypto-trading-bot/ |
| Pong Game (Python, Pygame) | [`projects/pong`](projects/pong) | https://ianwu.co.uk/projects/pong/ |
| OOP Calculator (Java) | [`projects/oop-calculator`](projects/oop-calculator) | https://ianwu.co.uk/projects/oop-calculator/ |

The Pong and calculator demos are JavaScript ports of the Python and Java code
(same classes and rules), so they run in the browser.

Run all the project tests:

```sh
npm test                                              # JavaScript (all three demos)
(cd projects/pong && python -m unittest test_pong)    # Python; needs pygame
(cd projects/oop-calculator/java && javac -d build *.java && java -cp build CalculatorTest)
```

The **Tests** GitHub Action runs all three on every pull request.

## Interactive features

`assets/js/main.js` adds optional enhancements: project filters, the CO₂ chart
toggle, the regression playground, chart lightbox, scroll effects and the
copy-email button. The page remains fully readable without JavaScript, and
animations are disabled for visitors who prefer reduced motion.

## Reproduce the Python demonstrations

Use Python 3.11 or 3.12:

```sh
python -m venv .venv
# Linux/macOS:
source .venv/bin/activate
# Windows PowerShell: .venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python assets/code/generate_portfolio_visualizations.py
```

The script uses a fixed random seed and writes `covid_timeseries.png`,
`statistics.png` and `demo_metrics.json` into `assets/images/`. Use
`--output-dir /path/to/output` to choose another directory. Results can vary
slightly across platforms and numerical-library versions.

## Reproduce the R demonstration

Install R and ggplot2 (`install.packages("ggplot2")` in R), then run:

```sh
Rscript assets/code/econ_analysis.R assets/images
```

This writes `econ_scatter.png` and `economic_demo_data.csv` to the requested
directory. With R and ggplot2 installed, `--include-r` on the Python command
also runs this step; an R failure stops the command with a non-zero exit code.

## What the examples demonstrate

- **COVID-shaped time series:** synthetic daily counts, an ARIMA(2, 1, 2)
  model, a 60-day held-out forecast and MAE/RMSE measurements.
- **Economic regression:** 200 synthetic observations, correlation and a
  linear regression of unemployment on inflation.
- **Descriptive statistics:** Python/NumPy calculations on a synthetic sample.

These examples do not establish findings about real COVID-19 cases, economic
conditions or forecasting performance on real-world data. No degree completion
date is inferred.

See [the current project summary](assets/docs/statistical_analysis_portfolio.md).
The older PDF and code screenshots are retained as historical assets, but are
not linked as current evidence: their claims/code are not reproduced by the
included demonstrations. The old `java_stats.png` was generated with NumPy;
the current site uses `statistics.png` with an accurate label.
