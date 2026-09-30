# Ian Wu — portfolio

A static HTML portfolio with runnable Python and R statistical demonstrations.

## Preview the website

From this directory, run `python -m http.server 8000` and open
http://localhost:8000. The website uses Tailwind's CDN and Google Fonts, so its
full styling requires an internet connection. No Node build is needed.

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
conditions or forecasting performance on real-world data. The Java/Pong/trading
project cards have no corresponding source in this repository and are marked
accordingly. No degree completion date is inferred.

See [the current project summary](assets/docs/statistical_analysis_portfolio.md).
The older PDF and code screenshots are retained as historical assets, but are
not linked as current evidence: their claims/code are not reproduced by the
included demonstrations. The old `java_stats.png` was generated with NumPy;
the current site uses `statistics.png` with an accurate label.
