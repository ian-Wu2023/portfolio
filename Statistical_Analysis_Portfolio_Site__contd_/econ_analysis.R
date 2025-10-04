
# Load required libraries
library(ggplot2)
library(dplyr)

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
png("econ_scatter.png", width = 1600, height = 900, res = 150)
p <- ggplot(econ_data, aes(x = cpi_inflation, y = unemployment_rate)) +
  geom_point(color = "#2E86AB", size = 3, alpha = 0.7) +
  geom_smooth(method = "lm", color = "#A23B72", size = 1.2, se = TRUE, alpha = 0.2) +
  labs(
    title = "Relationship Between CPI Inflation and Unemployment Rate",
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
    panel.grid.major = element_line(alpha = 0.3),
    panel.grid.minor = element_line(alpha = 0.1),
    plot.caption = element_text(size = 9, color = "gray50")
  ) +
  scale_x_continuous(breaks = seq(0, 8, 1)) +
  scale_y_continuous(breaks = seq(2, 12, 2))

print(p)
dev.off()

# Create R code screenshot (4:3 aspect ratio)
code_text <- "# Economic Data Analysis with R and ggplot2
library(ggplot2)
library(dplyr)

# Load economic dataset
econ_data <- read.csv('economic_data.csv')

# Data preprocessing
econ_data$date <- as.Date(econ_data$date)
econ_data <- econ_data %>%
  mutate(
    cpi_change = (cpi - lag(cpi)) / lag(cpi) * 100,
    unemployment_change = unemployment - lag(unemployment)
  )

# Statistical tests
cor_test <- cor.test(econ_data$cpi_inflation, 
                    econ_data$unemployment_rate)
print(paste('Correlation:', round(cor_test$estimate, 3)))
print(paste('P-value:', format(cor_test$p.value, scientific = TRUE)))

# Linear regression analysis
model <- lm(unemployment_rate ~ cpi_inflation + 
           I(cpi_inflation^2), data = econ_data)
summary(model)

# Advanced visualization with ggplot2
ggplot(econ_data, aes(x = cpi_inflation, y = unemployment_rate)) +
  geom_point(aes(color = year), size = 3, alpha = 0.7) +
  geom_smooth(method = 'lm', se = TRUE, color = 'red') +
  scale_color_gradient(low = 'blue', high = 'red') +
  labs(title = 'Phillips Curve Analysis',
       subtitle = 'CPI Inflation vs Unemployment Rate',
       x = 'CPI Inflation Rate (%)',
       y = 'Unemployment Rate (%)') +
  theme_minimal() +
  theme(plot.title = element_text(size = 16, face = 'bold'))"

png("econ_code.png", width = 1200, height = 900, res = 120)
par(mar = c(0, 0, 0, 0))
plot.new()
text(0.05, 0.95, code_text, adj = c(0, 1), cex = 0.8, family = "mono", 
     col = "black")
dev.off()

cat("R analysis completed successfully!\n")
