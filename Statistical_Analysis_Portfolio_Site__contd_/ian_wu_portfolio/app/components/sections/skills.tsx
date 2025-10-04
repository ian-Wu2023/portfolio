
'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Code2, 
  BarChart3, 
  Database, 
  Brain, 
  GitBranch, 
  Zap
} from 'lucide-react'

const Skills = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const programmingSkills = [
    { name: 'Python', level: 90, description: 'Pandas, NumPy, Matplotlib, Scikit-learn, Statsmodels' },
    { name: 'R', level: 85, description: 'ggplot2, dplyr, tidyr, Statistical modeling, FRED API' },
    { name: 'Java', level: 80, description: 'Apache Commons Math, Maven, Object-oriented design' },
    { name: 'SQL', level: 85, description: 'PostgreSQL, MySQL, Data querying and analysis' },
  ]

  const statisticalSkills = [
    { name: 'Statistical Modeling', level: 88 },
    { name: 'Hypothesis Testing', level: 85 },
    { name: 'Regression Analysis', level: 90 },
    { name: 'Time Series Analysis', level: 82 },
    { name: 'Data Visualization', level: 92 },
    { name: 'Machine Learning', level: 78 },
  ]

  const toolsAndFrameworks = [
    'Jupyter Notebooks', 'RStudio', 'Git & GitHub', 'Maven', 'PostgreSQL', 
    'Matplotlib', 'ggplot2', 'Pandas', 'Apache Commons Math', 'ARIMA Models',
    'Statistical Tests', 'Data Preprocessing', 'Exploratory Data Analysis'
  ]

  const skillCategories = [
    {
      title: 'Programming Languages',
      icon: Code2,
      description: 'Proficient in statistical programming languages with focus on data analysis',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Statistical Analysis',
      icon: BarChart3,
      description: 'Advanced statistical methods and hypothesis testing techniques',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Data Management',
      icon: Database,
      description: 'Database design, data preprocessing, and ETL processes',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Machine Learning',
      icon: Brain,
      description: 'Predictive modeling and pattern recognition algorithms',
      color: 'from-orange-500 to-orange-600'
    }
  ]

  return (
    <section id="skills" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Technical Skills
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive expertise in statistical analysis and data science technologies
          </p>
        </motion.div>

        {/* Skill Categories Overview */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {skillCategories.map((category, index) => (
            <Card key={category.title} className="text-center hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200">
              <CardContent className="p-6">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center`}>
                  <category.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.title}</h3>
                <p className="text-sm text-gray-600">{category.description}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Programming Skills */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card className="h-full shadow-lg border-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <Code2 className="w-6 h-6 text-blue-600" />
                  <span>Programming Languages</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {programmingSkills.map((skill, index) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                      <span className="text-sm text-blue-600 font-medium">{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-2" />
                    <p className="text-sm text-gray-600">{skill.description}</p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Statistical Skills */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Card className="h-full shadow-lg border-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                  <span>Statistical Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {statisticalSkills.map((skill, index) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                      <span className="text-sm text-green-600 font-medium">{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-2" />
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tools and Frameworks */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-12"
        >
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-xl">
                <Zap className="w-6 h-6 text-purple-600" />
                <span>Tools & Frameworks</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {toolsAndFrameworks.map((tool, index) => (
                  <motion.div
                    key={tool}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 1.2 + index * 0.05 }}
                  >
                    <Badge
                      variant="outline"
                      className="px-4 py-2 text-sm hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 transition-colors cursor-default"
                    >
                      {tool}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Competencies */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="mt-12 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Core Competencies</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Statistical Modeling',
                description: 'Linear/nonlinear regression, ANOVA, time series analysis, hypothesis testing',
                icon: BarChart3
              },
              {
                title: 'Data Processing',
                description: 'ETL pipelines, data cleaning, feature engineering, database optimization',
                icon: Database
              },
              {
                title: 'Research Methodology',
                description: 'Experimental design, sampling methods, statistical inference, reporting',
                icon: GitBranch
              }
            ].map((competency, index) => (
              <Card key={competency.title} className="text-center p-6 hover:shadow-lg transition-all duration-300">
                <competency.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{competency.title}</h4>
                <p className="text-sm text-gray-600">{competency.description}</p>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Skills
