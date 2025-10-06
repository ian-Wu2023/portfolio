
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Copy } from 'lucide-react'

interface CodeBlockProps {
  code: string
  language?: string
}

const CodeBlock = ({ code, language = 'python' }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const highlightSyntax = (code: string, lang: string) => {
    const keywords = {
      python: ['import', 'from', 'def', 'class', 'if', 'else', 'elif', 'for', 'while', 'return', 'try', 'except', 'finally', 'with', 'as', 'and', 'or', 'not', 'in', 'is', 'None', 'True', 'False'],
      r: ['library', 'function', 'if', 'else', 'for', 'while', 'return', 'NULL', 'TRUE', 'FALSE', 'NA', 'c', 'data.frame', 'list'],
      java: ['public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'import', 'package', 'static', 'final', 'abstract', 'void', 'int', 'double', 'String', 'boolean', 'if', 'else', 'for', 'while', 'return', 'try', 'catch', 'finally', 'new', 'this', 'super', 'null', 'true', 'false']
    }

    const langKeywords = keywords[lang as keyof typeof keywords] || keywords.python
    
    let highlightedCode = code
    
    // Highlight keywords
    langKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g')
      highlightedCode = highlightedCode.replace(regex, `<span class="text-purple-600 font-medium">${keyword}</span>`)
    })
    
    // Highlight strings
    highlightedCode = highlightedCode.replace(/"([^"]*)"/g, '<span class="text-green-600">"$1"</span>')
    highlightedCode = highlightedCode.replace(/'([^']*)'/g, '<span class="text-green-600">\'$1\'</span>')
    
    // Highlight comments
    highlightedCode = highlightedCode.replace(/#(.*)$/gm, '<span class="text-gray-500 italic">#$1</span>')
    
    // Highlight numbers
    highlightedCode = highlightedCode.replace(/\b(\d+\.?\d*)\b/g, '<span class="text-blue-500">$1</span>')
    
    // Highlight function calls
    highlightedCode = highlightedCode.replace(/(\w+)(?=\()/g, '<span class="text-orange-500">$1</span>')
    
    return highlightedCode
  }

  return (
    <div className="relative bg-gray-950 rounded-lg overflow-hidden border border-gray-800">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-sm text-gray-400 ml-3 capitalize">{language}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="text-gray-400 hover:text-white hover:bg-gray-800"
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm">
          <code
            className="text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: highlightSyntax(code, language)
            }}
          />
        </pre>
      </div>
    </div>
  )
}

export default CodeBlock
