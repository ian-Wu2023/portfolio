#!/usr/bin/env python3
"""Reproduce explicitly synthetic portfolio demonstrations (no external data)."""

import argparse
import json
from pathlib import Path
import subprocess

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA

DEFAULT_OUTPUT = Path(__file__).resolve().parents[1] / "images"


def create_covid_timeseries(output_dir):
    """Fit an illustrative ARIMA model and measure a held-out 60-day forecast."""
    rng = np.random.default_rng(42)
    dates = pd.date_range("2020-03-01", "2024-08-31", freq="D")
    t = np.arange(len(dates))
    cases = 1000 + np.linspace(0, 2000, len(dates))
    cases += 500 * np.sin(2 * np.pi * t / 365.25)
    cases += rng.normal(0, 200, len(dates))
    for amplitude, centre, width in [(3000, 100, 50), (4000, 400, 80), (2500, 700, 60)]:
        cases += amplitude * np.exp(-((t - centre) ** 2) / (2 * width ** 2))
    cases = np.maximum(0, cases).astype(int)
    deaths = np.maximum(0, cases * 0.02 + rng.normal(0, 10, len(dates))).astype(int)
    train_size = int(len(cases) * 0.9)
    horizon = 60
    fitted = ARIMA(cases[:train_size], order=(2, 1, 2)).fit(method_kwargs={"maxiter": 500})
    forecast = np.asarray(fitted.forecast(steps=horizon))
    actual = cases[train_size:train_size + horizon]
    errors = actual - forecast
    metrics = {
        "data_type": "synthetic",
        "seed": 42,
        "model": "ARIMA(2,1,2)",
        "training_observations": train_size,
        "forecast_days": horizon,
        "mae_cases": float(np.mean(np.abs(errors))),
        "rmse_cases": float(np.sqrt(np.mean(errors ** 2))),
        "converged": bool(fitted.mle_retvals.get("converged", False)),
    }
    fig, axes = plt.subplots(2, 1, figsize=(12, 7), sharex=True)
    axes[0].plot(dates[:train_size], cases[:train_size], label="Synthetic training cases")
    axes[0].plot(dates[train_size:], cases[train_size:], alpha=0.55, label="Synthetic held-out cases")
    axes[0].plot(dates[train_size:train_size + horizon], forecast, "--", label="60-day ARIMA forecast")
    axes[0].set(title="Synthetic COVID-shaped counts — teaching demonstration", ylabel="Simulated daily cases")
    axes[0].legend(fontsize=8)
    axes[1].plot(dates, deaths, color="#b91c1c")
    axes[1].set(title="Synthetic deaths derived from simulated cases", xlabel="Date", ylabel="Simulated daily deaths")
    for axis in axes:
        axis.grid(alpha=0.2)
    fig.text(0.5, 0.01, "Synthetic data only. These are not observed COVID-19 counts.", ha="center", fontsize=9)
    fig.tight_layout(rect=(0, 0.035, 1, 1))
    fig.savefig(output_dir / "covid_timeseries.png", dpi=150)
    plt.close(fig)
    return metrics


def create_statistics_chart(output_dir):
    """Plot NumPy descriptive statistics; standard deviation uses ddof=0."""
    values = np.random.default_rng(42).normal(100, 15, 1000)
    statistics = {
        "Mean": float(np.mean(values)),
        "Median": float(np.median(values)),
        "Population SD": float(np.std(values)),
        "Minimum": float(np.min(values)),
        "Maximum": float(np.max(values)),
        "Q1": float(np.percentile(values, 25)),
        "Q3": float(np.percentile(values, 75)),
    }
    fig, axis = plt.subplots(figsize=(12, 6))
    bars = axis.bar(statistics.keys(), statistics.values(), color="#2563eb")
    axis.bar_label(bars, fmt="%.2f", padding=4)
    axis.set(title="Synthetic sample — descriptive statistics computed with NumPy",
             xlabel="Statistic", ylabel="Value (arbitrary units)")
    axis.set_ylim(0, max(statistics.values()) * 1.15)
    axis.grid(axis="y", alpha=0.2)
    fig.text(0.5, 0.015, "1,000 simulated observations; normal distribution, mean 100, SD 15; seed 42.",
             ha="center", fontsize=9)
    fig.tight_layout(rect=(0, 0.04, 1, 1))
    fig.savefig(output_dir / "statistics.png", dpi=150)
    plt.close(fig)
    return statistics


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--include-r", action="store_true", help="Also run Rscript; requires R and ggplot2.")
    args = parser.parse_args()
    output = args.output_dir.resolve()
    output.mkdir(parents=True, exist_ok=True)
    metrics = {
        "time_series": create_covid_timeseries(output),
        "numpy_statistics": create_statistics_chart(output),
    }
    if args.include_r:
        subprocess.run(["Rscript", str(Path(__file__).with_name("econ_analysis.R")), str(output)], check=True)
    (output / "demo_metrics.json").write_text(json.dumps(metrics, indent=2) + "\n", encoding="utf-8")
    print(f"Generated Python demonstrations in {output}")


if __name__ == "__main__":
    main()
