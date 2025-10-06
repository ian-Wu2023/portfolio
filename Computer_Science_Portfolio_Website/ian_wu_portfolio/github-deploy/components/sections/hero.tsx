
'use client'

import { motion } from 'framer-motion'
import { ChevronDown, Github, Linkedin, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

const Hero = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="min-h-screen flex items-center justify-center pt-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
              >
                Hi, I'm{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                  Ian Wu
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl sm:text-2xl text-gray-600 font-medium"
              >
                Computer Science Student & Statistical Analysis Specialist
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-lg text-gray-500 leading-relaxed max-w-lg"
              >
                Passionate about transforming data into actionable insights using Python, R, and Java. 
                Specializing in statistical modeling and data visualization.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                size="lg"
                onClick={() => scrollToSection('projects')}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                View My Work
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => scrollToSection('contact')}
                className="border-2 hover:bg-blue-50 transition-all duration-300"
              >
                Get In Touch
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="flex items-center space-x-6"
            >
              <p className="text-sm text-gray-500">Connect with me:</p>
              <div className="flex space-x-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => window.open('https://github.com/ian-Wu2023/', '_blank', 'noopener,noreferrer')}
                >
                  <Github className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => window.open('https://www.linkedin.com/in/ian-wu-techian3481/', '_blank')}
                >
                  <Linkedin className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => scrollToSection('contact')}
                >
                  <Mail className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative w-80 h-80 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 shadow-2xl overflow-hidden">
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                <div className="text-white text-6xl font-bold">IW</div>
              </div>
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-full opacity-80 animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-green-400 rounded-full opacity-60 animate-pulse"></div>
              <div className="absolute top-1/4 -left-2 w-12 h-12 bg-pink-400 rounded-full opacity-70 animate-pulse"></div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex justify-center mt-16"
        >
          <Button
            variant="ghost"
            onClick={() => scrollToSection('about')}
            className="flex flex-col items-center space-y-2 hover:bg-transparent group"
          >
            <span className="text-sm text-gray-500">Scroll to explore</span>
            <ChevronDown className="w-6 h-6 text-gray-400 animate-bounce group-hover:text-blue-600" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
