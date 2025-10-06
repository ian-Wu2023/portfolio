
'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Github, ExternalLink, BarChart3, TrendingUp, Database } from 'lucide-react'
import Image from 'next/image'
import CodeBlock from '@/components/code-block'

const Projects = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const projects = [
    {
      id: 1,
      title: 'COVID-19 Statistical Analysis',
      description: 'Comprehensive time series analysis of COVID-19 data using Python, pandas, and advanced statistical modeling including ARIMA forecasting.',
      longDescription: 'This project analyzes COVID-19 trends using statistical methods and machine learning. Features include data preprocessing, exploratory analysis, time series forecasting with ARIMA models, and interactive visualizations.',
      image: 'https://media.springernature.com/lw685/springer-static/image/art%3A10.1186%2Fs12874-022-01755-x/MediaObjects/12874_2022_1755_Fig2_HTML.png',
      technologies: ['Python', 'Pandas', 'Matplotlib', 'Scikit-learn', 'ARIMA', 'Statistical Modeling'],
      category: 'Data Science',
      icon: BarChart3,
      githubUrl: '#',
      liveUrl: '#',
      codePreview: `import pandas as pd
import matplotlib.pyplot as plt
from statsmodels.tsa.arima.model import ARIMA
import numpy as np

# Load and preprocess COVID-19 data
def load_covid_data():
    url = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv"
    df = pd.read_csv(url)
    
    # Aggregate global data
    global_cases = df.iloc[:, 4:].sum(axis=0)
    global_cases.index = pd.to_datetime(global_cases.index)
    
    return global_cases

# Perform ARIMA forecasting
def arima_forecast(data, order=(2,1,2)):
    model = ARIMA(data, order=order)
    fitted_model = model.fit()
    
    # Generate forecasts
    forecast_steps = 30
    forecast = fitted_model.forecast(steps=forecast_steps)
    
    return forecast, fitted_model

# Statistical analysis
covid_data = load_covid_data()
forecast, model = arima_forecast(covid_data)

print(f"Model AIC: {model.aic:.2f}")
print(f"Forecast accuracy: {model.rsquared:.3f}")`,
      highlights: ['Johns Hopkins COVID-19 dataset analysis', 'ARIMA time series forecasting', 'Statistical hypothesis testing', 'Pandas data manipulation']
    },
    {
      id: 2,
      title: 'Economic Data Analysis with R',
      description: 'In-depth analysis of inflation trends and economic indicators using R, ggplot2, and advanced statistical methods including Phillips Curve analysis.',
      longDescription: 'This project explores the relationship between unemployment and inflation using Federal Reserve economic data. Implements correlation analysis, regression modeling, and advanced statistical tests.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/U.S._Phillips_Curve_2000_to_2013.png/330px-U.S._Phillips_Curve_2000_to_2013.png',
      technologies: ['R', 'ggplot2', 'dplyr', 'FRED API', 'Statistical Testing', 'Economic Modeling'],
      category: 'Economic Analysis',
      icon: TrendingUp,
      githubUrl: '#',
      liveUrl: '#',
      codePreview: `library(ggplot2)
library(dplyr)
library(fredr)
library(corrr)

# Set FRED API key
fredr_set_key("your_fred_api_key")

# Fetch economic data
get_economic_data <- function() {
  # Unemployment rate
  unemployment <- fredr(series_id = "UNRATE", 
                       observation_start = as.Date("2000-01-01"))
  
  # Inflation rate (CPI)
  inflation <- fredr(series_id = "CPIAUCSL", 
                    observation_start = as.Date("2000-01-01"))
  
  return(list(unemployment = unemployment, inflation = inflation))
}

# Phillips Curve Analysis
phillips_curve_analysis <- function(unemp_data, infl_data) {
  # Merge datasets
  merged_data <- inner_join(unemp_data, infl_data, by = "date")
  
  # Calculate correlation
  correlation <- cor(merged_data$unemployment, merged_data$inflation)
  
  # Linear regression
  model <- lm(inflation ~ unemployment, data = merged_data)
  
  # Create visualization
  plot <- ggplot(merged_data, aes(x = unemployment, y = inflation)) +
    geom_point(alpha = 0.7, color = "#2563eb") +
    geom_smooth(method = "lm", se = TRUE, color = "#dc2626") +
    labs(title = "Phillips Curve: Unemployment vs Inflation",
         x = "Unemployment Rate (%)",
         y = "Inflation Rate (%)") +
    theme_minimal()
  
  return(list(correlation = correlation, model = model, plot = plot))
}

# Run analysis
data <- get_economic_data()
results <- phillips_curve_analysis(data$unemployment, data$inflation)
print(summary(results$model))`,
      highlights: ['Federal Reserve Economic Data (FRED) integration', 'Phillips Curve statistical modeling', 'Advanced ggplot2 visualizations', 'Correlation and regression analysis']
    },
    {
      id: 3,
      title: 'Java Statistical Computing Framework',
      description: 'Object-oriented statistical computing framework built in Java with Apache Commons Math, featuring hypothesis testing, regression analysis, and bootstrap methods.',
      longDescription: 'A comprehensive Java-based statistical analysis framework demonstrating enterprise-grade code organization, design patterns, and advanced statistical computations using Apache Commons Math library.',
      image: 'https://i.ytimg.com/vi/lQgGDMITWnk/maxresdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGGAgYChgMA8=&rs=AOn4CLAR98vjw-bXnH0B0U9JuUKk8lk-iQ',
      technologies: ['Java', 'Apache Commons Math', 'Maven', 'JUnit', 'Object-Oriented Design', 'Statistical Computing'],
      category: 'Software Development',
      icon: Database,
      githubUrl: '#',
      liveUrl: '#',
      codePreview: `package com.ianwu.statistics;

import org.apache.commons.math3.stat.regression.SimpleRegression;
import org.apache.commons.math3.stat.descriptive.DescriptiveStatistics;
import org.apache.commons.math3.distribution.TDistribution;

public class StatisticalAnalyzer {
    private DescriptiveStatistics stats;
    private SimpleRegression regression;
    
    public StatisticalAnalyzer() {
        this.stats = new DescriptiveStatistics();
        this.regression = new SimpleRegression();
    }
    
    /**
     * Performs comprehensive descriptive statistics analysis
     */
    public StatisticalSummary analyzeData(double[] data) {
        // Clear previous data
        stats.clear();
        
        // Add data points
        for (double value : data) {
            stats.addValue(value);
        }
        
        return new StatisticalSummary(
            stats.getMean(),
            stats.getStandardDeviation(),
            stats.getVariance(),
            stats.getMin(),
            stats.getMax(),
            stats.getPercentile(50) // Median
        );
    }
    
    /**
     * Performs linear regression analysis
     */
    public RegressionResult performRegression(double[][] dataPoints) {
        regression.clear();
        
        for (double[] point : dataPoints) {
            regression.addData(point[0], point[1]);
        }
        
        double slope = regression.getSlope();
        double intercept = regression.getIntercept();
        double rSquared = regression.getRSquare();
        double slopeStdErr = regression.getSlopeStdErr();
        
        return new RegressionResult(slope, intercept, rSquared, slopeStdErr);
    }
    
    /**
     * Performs one-sample t-test
     */
    public TTestResult performTTest(double[] sample, double expectedMean, double alpha) {
        double sampleMean = stats.getMean();
        double sampleStd = stats.getStandardDeviation();
        int n = sample.length;
        
        // Calculate t-statistic
        double tStatistic = (sampleMean - expectedMean) / (sampleStd / Math.sqrt(n));
        
        // Calculate p-value
        TDistribution tDist = new TDistribution(n - 1);
        double pValue = 2 * (1 - tDist.cumulativeProbability(Math.abs(tStatistic)));
        
        boolean isSignificant = pValue < alpha;
        
        return new TTestResult(tStatistic, pValue, isSignificant, n - 1);
    }
}`,
      highlights: ['Enterprise Java development patterns', 'Apache Commons Math integration', 'Statistical hypothesis testing', 'Object-oriented design principles']
    }
  ]

  return (
    <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Featured Projects
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Statistical analysis projects showcasing proficiency in Python, R, and Java
          </p>
        </motion.div>

        <div className="space-y-16">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-0 bg-white">
                <div className={`grid grid-cols-1 ${index % 2 === 0 ? 'lg:grid-cols-2' : 'lg:grid-cols-2'} gap-0`}>
                  <div className={`${index % 2 === 1 ? 'lg:order-2' : ''} relative aspect-video lg:aspect-auto`}>
                    <Image
                      src={project.image}
                      alt={`${project.title} visualization`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge variant="secondary" className="mb-2">
                        {project.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className={`${index % 2 === 1 ? 'lg:order-1' : ''} p-8 space-y-6`}>
                    <CardHeader className="p-0">
                      <div className="flex items-center space-x-3 mb-3">
                        <project.icon className="w-8 h-8 text-blue-600" />
                        <CardTitle className="text-2xl font-bold text-gray-900">
                          {project.title}
                        </CardTitle>
                      </div>
                      <p className="text-lg text-gray-600 leading-relaxed">
                        {project.longDescription}
                      </p>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Key Highlights:</h4>
                          <ul className="space-y-1">
                            {project.highlights.map((highlight, i) => (
                              <li key={i} className="flex items-center space-x-2 text-sm text-gray-600">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                                <span>{highlight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Technologies Used:</h4>
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech) => (
                              <Badge
                                key={tech}
                                variant="outline"
                                className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                              >
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex space-x-3 pt-4">
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => window.open('https://github.com/ianwu', '_blank')}
                          >
                            <Github className="w-4 h-4 mr-2" />
                            View Code
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              // For demo purposes, show an alert - in real implementation would link to live demo
                              alert(`This would link to the live demo of ${project.title}. In a real portfolio, this would be the deployed application URL.`)
                            }}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Live Demo
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </div>
                
                <div className="px-8 pb-8">
                  <h4 className="font-semibold text-gray-900 mb-4">Code Sample:</h4>
                  <CodeBlock code={project.codePreview} language="python" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Projects
