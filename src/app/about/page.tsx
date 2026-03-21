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
  Github,
  Zap,
  Shield,
  ShieldCheck,
  Brain,
  MessageSquare,
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
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-purple-500/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 pt-32 pb-20 border-b border-indigo-500/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
        
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-8 animate-pulse">
            <Zap className="h-3 w-3" />
            Empowering Cognitive Sovereignty
          </div>
          <h1 className="text-5xl lg:text-7xl font-black mb-6 tracking-tighter text-white">
            The Science of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Media Auditing</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
            BiasMapper is a deep-forensic framework designed to deconstruct the mechanics of persuasion, 
            mapping ideological positioning and cognitive distortion in real-time.
          </p>
        </div>
      </section>

      {/* Video Deep Dive Section */}
      <section className="py-24 bg-slate-900/50 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-16 items-center">
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-white tracking-tight">Conceptual Origins</h2>
                <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
              </div>
              <p className="text-slate-400 leading-relaxed text-lg">
                Understanding directional bias requires moving beyond simplistic left-right binaries. 
                Our framework explores the intersection of ideological alignment and institutional 
                power dynamics.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 group">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    <Scale className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Balanced Forensics</h4>
                    <p className="text-xs text-slate-500">Multidimensional auditing of truth claims.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white transition-all">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Cognitive Defense</h4>
                    <p className="text-xs text-slate-500">Screening for logical traps and fallacies.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl opacity-10 blur-2xl group-hover:opacity-20 transition-all duration-700" />
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/REYUkC1bW_w" 
                    title="BiasMapper Framework Introduction" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                    className="opacity-90 group-hover:opacity-100 transition-opacity"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Framework Overview */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl font-black text-white tracking-tighter">The Dual-Axis Architecture</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
              We replace unidirectional scales with a high-resolution map of human ideation and institutional alignment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Ideological Axis */}
            <div className="group p-8 rounded-3xl bg-slate-900/40 border border-slate-800/50 hover:border-indigo-500/30 transition-all duration-500 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                  <ArrowRight className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Ideological Dimension</h3>
                  <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Left / Center / Right</div>
                </div>
              </div>
              
              <p className="text-slate-400 mb-8 leading-relaxed font-medium">
                Measures the core political and economic positioning. From radical progressivism (L++) 
                through neutral arbitration (C) to traditionalist conservatism (R++).
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/50">
                   <div className="flex items-center gap-3">
                     <Badge className="bg-red-500/20 text-red-400 border-red-500/30 px-3 font-black">L++</Badge>
                     <span className="text-xs font-bold text-slate-300">Radical Progressive</span>
                   </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/50">
                   <div className="flex items-center gap-3">
                     <Badge className="bg-slate-700 text-slate-300 border-slate-600 px-3 font-black">C</Badge>
                     <span className="text-xs font-bold text-slate-300">Centrist / Neutral</span>
                   </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/50">
                   <div className="flex items-center gap-3">
                     <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 px-3 font-black">R++</Badge>
                     <span className="text-xs font-bold text-slate-300">Far Right / Nationalist</span>
                   </div>
                </div>
              </div>
            </div>

            {/* Societal Axis */}
            <div className="group p-8 rounded-3xl bg-slate-900/40 border border-slate-800/50 hover:border-amber-500/30 transition-all duration-500 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                  <ArrowRight className="h-7 w-7 text-white rotate-90" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Societal Alignment</h3>
                  <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Establishment / Grassroots</div>
                </div>
              </div>
              
              <p className="text-slate-400 mb-8 leading-relaxed font-medium">
                Measures the relationship to institutional power. From complete establishment trust (T++) 
                to structural skepticism and radical dissent (B++).
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/50">
                   <div className="flex items-center gap-3">
                     <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 px-3 font-black">T++</Badge>
                     <span className="text-xs font-bold text-slate-300">Institutional / Official</span>
                   </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/50">
                   <div className="flex items-center gap-3">
                     <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 px-3 font-black">B++</Badge>
                     <span className="text-xs font-bold text-slate-300">Radical Dissent / Outsider</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Capabilities Section */}
      <section className="py-24 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white tracking-tighter">Deep-Forensic Capabilities</h2>
              <p className="text-slate-500 max-w-xl font-medium leading-relaxed">
                Beyond mere classification, BiasMapper audits the hidden engines of thought and communication.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, title: "Fallacy Detection", desc: "Identifying logical traps and circular reasoning in arguments." },
              { icon: Brain, title: "Cognitive Auditing", desc: "Detection of confirmation bias and heuristic-based distortions." },
              { icon: Users, title: "Sociological Mapping", desc: "Analyzing power dynamics and in-group/out-group positioning." },
              { icon: MessageSquare, title: "Psychological Screen", desc: "Identifying emotional framing and high-intensity persuasion." },
            ].map((cap, i) => (
              <Card key={i} className="bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 transition-all duration-300 group shadow-2xl">
                <CardContent className="pt-8">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    <cap.icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-black text-white mb-3 text-sm tracking-tight">{cap.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{cap.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 opacity-10" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-8 tracking-tighter">Enter the Mapping Room.</h2>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            Begin your journey towards cognitive sovereignty by analyzing the narratives that shape your world.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button asChild size="lg" className="h-14 px-10 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/20">
              <Link href="/analyze-text">
                Start Analysis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-10 border-slate-800 bg-slate-900/50 text-slate-200 font-bold rounded-2xl hover:bg-slate-800 transition-all">
              <a href="https://github.com/mskDev0092/BiasMapper" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-5 w-5" />
                Open Source Repo
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-20 selection:bg-indigo-500/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 justify-between items-start gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Scale className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-black text-white tracking-widest uppercase">BiasMapper</span>
              </div>
              <p className="text-slate-500 max-w-sm leading-relaxed font-medium">
                BiasMapper provides forensic directional classification as an analytical tool. 
                Always review results in their full sociological context.
              </p>
            </div>
            
            <div className="flex flex-col md:items-end gap-10">
              <div className="flex items-center gap-4">
                <a href="https://github.com/mskDev0092/BiasMapper" target="_blank" rel="noopener noreferrer" className="h-12 w-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-all">
                  <Github className="h-6 w-6" />
                </a>
              </div>
              <p className="text-[10px] font-bold text-slate-700 uppercase tracking-[4px]">
                Built for Objective Clarity &copy; 2026
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
