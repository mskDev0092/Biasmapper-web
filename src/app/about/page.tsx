'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Scale, 
  ArrowRight, 
  BookOpen,
  Target,
  Users,
  Lightbulb,
  Code,
  ExternalLink,
  Github
} from 'lucide-react'

const biasDefinitions = [
  { code: 'L++', label: 'Far Left', color: 'bg-red-500', description: 'Radical progressive perspectives advocating for fundamental systemic change. Often anti-capitalist, advocating for complete economic restructuring.' },
  { code: 'L+', label: 'Progressive', color: 'bg-red-400', description: 'Center-left viewpoints supporting social reform, progressive policies, and government intervention for social equity.' },
  { code: 'L', label: 'Left-leaning', color: 'bg-red-300', description: 'Mild progressive tendencies, generally supportive of liberal social policies with moderate economic views.' },
  { code: 'C', label: 'Center', color: 'bg-gray-400', description: 'Neutral or balanced perspectives that attempt to present multiple viewpoints without strong ideological leaning.' },
  { code: 'R', label: 'Right-leaning', color: 'bg-blue-300', description: 'Mild conservative tendencies, generally supportive of traditional values with moderate economic views.' },
  { code: 'R+', label: 'Conservative', color: 'bg-blue-400', description: 'Center-right viewpoints supporting traditional values, limited government, and free-market policies.' },
  { code: 'R++', label: 'Far Right', color: 'bg-blue-500', description: 'Radical conservative perspectives often nationalist in nature, advocating for significant traditionalist reforms.' },
  { code: 'T++', label: 'Est. Extreme', color: 'bg-purple-500', description: 'Complete alignment with institutional narratives and establishment viewpoints. Strong trust in official sources.' },
  { code: 'T+', label: 'Mainstream', color: 'bg-purple-400', description: 'General trust in establishment institutions and mainstream narratives. Accepts conventional wisdom.' },
  { code: 'T', label: 'Establishment', color: 'bg-purple-300', description: 'Moderate pro-institution stance. Generally accepts official narratives but maintains some skepticism.' },
  { code: 'B', label: 'Oppositional', color: 'bg-amber-300', description: 'Skeptical of institutions and official narratives. Questions conventional wisdom.' },
  { code: 'B+', label: 'Grassroots', color: 'bg-amber-400', description: 'Strong bottom-up perspective, amplifying marginalized voices. Anti-establishment orientation.' },
  { code: 'B++', label: 'Radical Dissent', color: 'bg-amber-500', description: 'Strongly anti-establishment, advocating for fundamental change to power structures. Deep institutional skepticism.' },
]

const useCases = [
  {
    icon: BookOpen,
    title: 'Journalism & Media',
    description: 'Understand and transparently communicate the bias perspectives in your reporting. Help readers recognize the lens through which news is presented.',
  },
  {
    icon: Target,
    title: 'Research & Academia',
    description: 'Analyze media framing and ideological patterns in communication studies. Track bias trends across publications and time periods.',
  },
  {
    icon: Users,
    title: 'Education',
    description: 'Teach critical thinking and media literacy. Help students understand how the same event can be framed differently across outlets.',
  },
  {
    icon: Lightbulb,
    title: 'Critical Thinking',
    description: 'Develop a more nuanced understanding of media consumption. Recognize your own bias blind spots and diversify your information sources.',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-900 text-white py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDE0di0yaDIyek0zNiAxNHYySDE0di0yaDIyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Scale className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Understanding the BiasMapper Framework
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            A comprehensive guide to our directional bias classification system for fair and balanced analysis.
          </p>
        </div>
      </section>

      {/* Framework Overview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">The BiasMapper Framework</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Unlike traditional unidirectional bias scales, BiasMapper uses a two-axis system that captures both 
              ideological positioning and societal alignment, providing a more nuanced understanding of media perspectives.
            </p>
          </div>

          {/* Axes Explanation */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-red-500 to-blue-500 flex items-center justify-center">
                    <ArrowRight className="h-5 w-5 text-white" />
                  </div>
                  Ideological Axis (L/R)
                </CardTitle>
                <CardDescription>
                  Measures political and economic positioning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  The ideological axis spans from Left (L) through Center (C) to Right (R), with intensity 
                  modifiers indicating the strength of alignment. This captures traditional political spectrum 
                  positioning.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <Badge className="bg-red-500">L++</Badge>
                    <span>Far Left - Radical progressive, anti-capitalist</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge className="bg-gray-400">C</Badge>
                    <span>Center - Balanced, neutral perspectives</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge className="bg-blue-500">R++</Badge>
                    <span>Far Right - Radical conservative, nationalist</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-500 to-amber-500 flex items-center justify-center">
                    <ArrowRight className="h-5 w-5 text-white rotate-90" />
                  </div>
                  Societal Axis (T/B)
                </CardTitle>
                <CardDescription>
                  Measures relationship to institutional power
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  The societal axis measures how content relates to established power structures, from 
                  Top/Establishment (T) alignment to Bottom/Oppositional (B) perspectives.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <Badge className="bg-purple-500">T++</Badge>
                    <span>Establishment Extreme - Complete institutional trust</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge className="bg-purple-400">T+</Badge>
                    <span>Mainstream - Generally pro-institution</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge className="bg-amber-500">B++</Badge>
                    <span>Radical Dissent - Strongly anti-establishment</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Bias Code Definitions */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Bias Code Reference</h2>
            <p className="text-lg text-slate-600">
              Complete definitions for all BiasMapper classification codes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {biasDefinitions.map((bias) => (
              <Card key={bias.code} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`h-10 w-10 rounded-lg ${bias.color} flex items-center justify-center text-white font-bold text-sm`}>
                      {bias.code}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{bias.label}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">{bias.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Who Should Use BiasMapper?</h2>
            <p className="text-lg text-slate-600">
              Practical applications for understanding media bias
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {useCases.map((useCase, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all group">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <useCase.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">{useCase.title}</h3>
                      <p className="text-slate-600">{useCase.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Analyzing?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Configure your API and begin uncovering bias patterns in media content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
              <Link href="/analyze">
                Start Analyzing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <a href="https://github.com/mskDev0092/BiasMapper" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-5 w-5" />
                View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Scale className="h-6 w-6 text-blue-500" />
              <span className="text-white font-semibold">BiasMapper</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="https://github.com/mskDev0092/BiasMapper" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm">
            <p>BiasMapper provides directional classification as a guide, not absolute truth.</p>
            <p className="mt-2">Always review and validate content in context.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
