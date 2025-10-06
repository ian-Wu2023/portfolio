
'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { GraduationCap, Calendar, MapPin, Award } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const About = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const stats = [
    { number: '3+', label: 'Years of Study', icon: Calendar },
    { number: '15+', label: 'Projects Completed', icon: Award },
    { number: '3', label: 'Programming Languages', icon: GraduationCap },
    { number: '100%', label: 'Passion for Data', icon: MapPin },
  ]

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            About Me
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Driven computer science student with a passion for statistical analysis and data-driven solutions
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">
                Computer Science Student & Statistical Analysis Specialist
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Currently pursuing my Bachelor's degree in Computer Science with 3 years of academic experience. 
                My expertise lies in statistical analysis, data visualization, and building robust data processing systems.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                I specialize in transforming complex datasets into meaningful insights using modern statistical methods 
                and programming languages. My approach combines rigorous mathematical foundations with practical 
                implementation skills.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-xl font-semibold text-gray-900">Core Competencies</h4>
              <ul className="space-y-2">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-600">Statistical Modeling & Hypothesis Testing</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-600">Data Visualization & Exploratory Analysis</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-600">Machine Learning & Predictive Analytics</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-600">Database Design & Data Processing Systems</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center space-x-4 pt-4">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <div>
                <p className="font-semibold text-gray-900">Bachelor of Computer Science</p>
                <p className="text-gray-600">Statistical Analysis Concentration</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200">
                  <CardContent className="p-0">
                    <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default About
