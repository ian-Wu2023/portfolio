
'use client'

import { motion } from 'framer-motion'
import { Heart, Github, Linkedin, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IW</span>
              </div>
              <span className="text-xl font-bold">Ian Wu</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Computer Science student passionate about statistical analysis and data-driven solutions. 
              Always eager to tackle new challenges and learn cutting-edge technologies.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold">Specializations</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Statistical Analysis & Modeling</li>
              <li>Python Data Science Stack</li>
              <li>R Programming & Visualization</li>
              <li>Java Enterprise Development</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold">Connect</h3>
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-800 hover:text-blue-400 transition-colors"
                onClick={() => window.open('https://github.com/ian-Wu2023/', '_blank', 'noopener,noreferrer')}
              >
                <Github className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-800 hover:text-blue-400 transition-colors"
                onClick={() => window.open('https://www.linkedin.com/in/ian-wu-techian3481/', '_blank')}
              >
                <Linkedin className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-800 hover:text-blue-400 transition-colors"
                onClick={() => {
                  const element = document.getElementById('contact')
                  element?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <Mail className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-gray-400 text-sm">
              <Mail className="w-4 h-4 inline mr-2" />
              ian.kin.wu@gmail.com
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="border-t border-gray-800 mt-8 pt-8 text-center"
        >
          <p className="text-gray-400 flex items-center justify-center space-x-2">
            <span>© 2025 Ian Wu Portfolio. Built with</span>
            <Heart className="w-4 h-4 text-red-500" />
            <span>and Next.js</span>
          </p>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer
