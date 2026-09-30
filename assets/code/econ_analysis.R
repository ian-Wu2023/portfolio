
# Load required libraries
library(ggplot2)
args <- commandArgs(trailingOnly = TRUE)
output_dir <- if (length(args)) args[[1]] else "assets/images"
dir.create(output_dir, recursive = TRUE, showWarnings = FALSE)

# Generate synthetic economic data
set.seed(42)
n <- 200
years <- seq(1990, 2023, length.out = n)

# Create realistic CPI and unemployment data
base_cpi <- 2.5
cpi_trend <- 0.02 * (years - 1990)
cpi_cycle <- 1.5 * sin(2 * pi * (years - 1990) / 8)
cpi_noise <- rnorm(n, 0, 0.8)
cpi_inflation <- pmax(0, base_cpi + cpi_trend + cpi_cycle + cpi_noise)

base_unemployment <- 6.0
unemployment_trend <- -0.01 * (years - 1990)
unemployment_cycle <- -1.2 * sin(2 * pi * (years - 1990) / 8 + pi/4)
unemployment_noise <- rnorm(n, 0, 0.6)
unemployment_rate <- pmax(2, base_unemployment + unemployment_trend + unemployment_cycle + unemployment_noise)

# Create data frame
econ_data <- data.frame(
  year = years,
  cpi_inflation = cpi_inflation,
  unemployment_rate = unemployment_rate
)

# Statistical analysis
correlation <- cor(econ_data$cpi_inflation, econ_data$unemployment_rate)
cat("Correlation between CPI inflation and unemployment:", round(correlation, 3), "\n")

# Perform linear regression
lm_model <- lm(unemployment_rate ~ cpi_inflation, data = econ_data)
summary_stats <- summary(lm_model)
cat("R-squared:", round(summary_stats$r.squared, 3), "\n")
cat("P-value:", format(summary_stats$coefficients[2,4], scientific = TRUE), "\n")

# Create scatter plot with regression line (16:9 aspect ratio)
png(file.path(output_dir, "econ_scatter.png"), width = 1600, height = 900, res = 150)
p <- ggplot(econ_data, aes(x = cpi_inflation, y = unemployment_rate)) +
  geom_point(color = "#2E86AB", size = 3, alpha = 0.7) +
  geom_smooth(method = "lm", color = "#A23B72", linewidth = 1.2, se = TRUE, alpha = 0.2) +
  labs(
    title = "Synthetic Inflation and Unemployment — Regression Demonstration",
    subtitle = paste("Correlation coefficient:", round(correlation, 3), 
                    "| R² =", round(summary_stats$r.squared, 3)),
    x = "CPI Inflation Rate (%)",
    y = "Unemployment Rate (%)",
    caption = "Data: Synthetic Economic Dataset (1990-2023)"
  ) +
  theme_minimal() +
  theme(
    plot.title = element_text(size = 16, face = "bold", hjust = 0.5),
    plot.subtitle = element_text(size = 12, hjust = 0.5),
    axis.title = element_text(size = 12, face = "bold"),
    axis.text = element_text(size = 10),
    panel.grid.major = element_line(colour = "grey85"),
    panel.grid.minor = element_line(colour = "grey95"),
    plot.caption = element_text(size = 9, color = "gray50")
  ) +
  scale_x_continuous(breaks = seq(0, 8, 1)) +
  scale_y_continuous(breaks = seq(2, 12, 2))

print(p)
dev.off()

write.csv(econ_data, file.path(output_dir, "economic_demo_data.csv"), row.names = FALSE)
cat("Synthetic R regression demonstration completed.\n")
