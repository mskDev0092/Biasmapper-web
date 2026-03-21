"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Scale,
  Search,
  SlidersHorizontal,
  PieChart,
  ArrowRight,
  Github,
  Zap,
  Shield,
  Globe,
  Brain,
  Target,
  TrendingUp,
  Newspaper,
  Activity,
  CheckCircle2,
  Sparkles,
  BarChart3,
  FileSearch,
} from "lucide-react";
import { BIAS_COLORS, BIAS_LABELS, type BiasCode } from "@/lib/bias-constants";

const features = [
  {
    icon: Search,
    title: "Advanced Bias Detection",
    description:
      "Uncover ideological (L++ to R++), societal (T++ to B++), and cognitive biases using sophisticated NLP algorithms trained on diverse media sources.",
    color: "from-blue-500 to-cyan-500",
    shadowColor: "shadow-blue-500/25",
  },
  {
    icon: SlidersHorizontal,
    title: "Perspective Adjustment",
    description:
      "Seamlessly reframe content to alternative viewpoints or neutralize to balanced perspectives. Perfect for comparative analysis.",
    color: "from-purple-500 to-pink-500",
    shadowColor: "shadow-purple-500/25",
  },
  {
    icon: PieChart,
    title: "Interactive Analytics",
    description:
      "Explore bias patterns through dynamic visualizations, heatmaps, vector scores, and confidence metrics with drill-down capabilities.",
    color: "from-emerald-500 to-teal-500",
    shadowColor: "shadow-emerald-500/25",
  },
];

// Returns either white or a dark slate color depending on background brightness
function getContrastColor(hex: string) {
  if (!hex) return "white";
  const c = hex.replace("#", "");
  const bigint = parseInt(
    c.length === 3
      ? c
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : c,
    16,
  );
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.65 ? "#0f172a" : "white";
}

const highlights = [
  {
    icon: Zap,
    text: "Real-time Analysis",
    description: "Instant AI-powered bias classification",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    icon: Shield,
    text: "Privacy First",
    description: "Your data never leaves your endpoint",
    gradient: "from-emerald-400 to-green-500",
  },
  {
    icon: Globe,
    text: "Universal API Support",
    description: "Local models or cloud services",
    gradient: "from-blue-400 to-indigo-500",
  },
];

const capabilities = [
  {
    icon: Brain,
    title: "Cognitive Bias Detection",
    desc: "Identify confirmation bias, anchoring, availability heuristic, and 20+ cognitive distortions",
    stat: "20+",
    statLabel: "Bias Types",
  },
  {
    icon: Target,
    title: "Logical Fallacy Analysis",
    desc: "Detect ad hominem, strawman, false dichotomy, slippery slope, and 15+ logical fallacies",
    stat: "15+",
    statLabel: "Fallacy Types",
  },
  {
    icon: TrendingUp,
    title: "Narrative Mapping",
    desc: "Track how stories are framed across different media perspectives and ideological lines",
    stat: "Real-time",
    statLabel: "Tracking",
  },
  {
    icon: Newspaper,
    title: "Multi-Source Analysis",
    desc: "Compare coverage across international, national, and regional news outlets simultaneously",
    stat: "15+",
    statLabel: "Outlets",
  },
];

const trustedBy = [
  { name: "Journalists", icon: FileSearch },
  { name: "Researchers", icon: Brain },
  { name: "Educators", icon: Target },
  { name: "Analysts", icon: BarChart3 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-indigo-500/5 to-transparent rounded-full" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="space-y-6">
                {/* Badge */}
                <div className="flex justify-center lg:justify-start">
                  <Badge className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-400 border border-blue-500/20 px-4 py-1.5 text-sm font-medium">
                    <Sparkles className="h-3.5 w-3.5 mr-2" />
                    AI-Powered Media Analysis
                  </Badge>
                </div>

                {/* Main Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-tight tracking-tight">
                  Uncover{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                    Hidden Bias
                  </span>{" "}
                  <br className="hidden sm:block" />
                  in Any Text
                </h1>

                {/* Subheadline */}
                <p className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  BiasMapper empowers journalists, researchers, and critical
                  thinkers to detect, analyze, and understand ideological and
                  cognitive biases across media sources.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-500/25 font-bold text-base px-8 py-6 rounded-xl group transition-all hover:scale-105"
                  >
                    <Link href="/analyze">
                      Start Analyzing
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white font-semibold text-base px-8 py-6 rounded-xl transition-all"
                  >
                    <Link href="/about">Learn More</Link>
                  </Button>
                </div>

                {/* Trust Indicators */}
                <div className="pt-8 border-t border-slate-800/50">
                  <p className="text-sm text-slate-500 mb-4">
                    Trusted by professionals worldwide
                  </p>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-6">
                    {trustedBy.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-slate-400"
                      >
                        <item.icon className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Interactive Bias Grid */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
              <Card className="relative bg-slate-900/80 backdrop-blur-xl border-slate-700/50 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-800/50 px-6 py-4 border-b border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      bias-mapper.framework
                    </span>
                  </div>
                </div>

                <CardContent className="p-6 sm:p-8">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Scale className="h-5 w-5 text-blue-400" />
                    Bias Directional Framework
                  </h3>

                  {/* Bias Grid */}
                  <div className="grid grid-cols-7 gap-2 gap-y-3 mb-6">
                    {/* Row 1: T++ */}
                    <div className="col-start-4 row-start-1">
                      <div
                        className="aspect-square rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer hover:scale-110 transition-transform shadow-lg"
                        style={{
                          backgroundColor: BIAS_COLORS["T++"],
                          color: getContrastColor(BIAS_COLORS["T++"]),
                        }}
                        title="T++: Extreme Establishment"
                      >
                        T++
                      </div>
                    </div>

                    {/* Row 2: T+ */}
                    <div className="col-start-3 row-start-2">
                      <div
                        className="aspect-square rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer hover:scale-110 transition-transform shadow-lg"
                        style={{
                          backgroundColor: BIAS_COLORS["T+"],
                          color: getContrastColor(BIAS_COLORS["T+"]),
                        }}
                        title="T+: Mainstream"
                      >
                        T+
                      </div>
                    </div>
                    <div className="col-start-5 row-start-2">
                      <div
                        className="aspect-square rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer hover:scale-110 transition-transform shadow-lg"
                        style={{
                          backgroundColor: BIAS_COLORS["T+"],
                          color: getContrastColor(BIAS_COLORS["T+"]),
                        }}
                        title="T+: Mainstream"
                      >
                        T+
                      </div>
                    </div>

                    {/* Row 3: L++ to R++ */}
                    {(
                      ["L++", "L+", "L", "C", "R", "R+", "R++"] as BiasCode[]
                    ).map((code) => (
                      <div
                        key={code}
                        className={`col-start-${["L++", "L+", "L", "C", "R", "R+", "R++"].indexOf(code) + 1} row-start-3`}
                      >
                        <div
                          className="aspect-square rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer hover:scale-110 transition-transform shadow-lg"
                          style={{
                            backgroundColor: BIAS_COLORS[code],
                            color: getContrastColor(BIAS_COLORS[code]),
                          }}
                          title={`${code}: ${BIAS_LABELS[code]}`}
                        >
                          {code}
                        </div>
                      </div>
                    ))}

                    {/* Row 4: B+ */}
                    <div className="col-start-3 row-start-4">
                      <div
                        className="aspect-square rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer hover:scale-110 transition-transform shadow-lg"
                        style={{
                          backgroundColor: BIAS_COLORS["B+"],
                          color: getContrastColor(BIAS_COLORS["B+"]),
                        }}
                        title="B+: Grassroots"
                      >
                        B+
                      </div>
                    </div>
                    <div className="col-start-5 row-start-4">
                      <div
                        className="aspect-square rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer hover:scale-110 transition-transform shadow-lg"
                        style={{
                          backgroundColor: BIAS_COLORS["B+"],
                          color: getContrastColor(BIAS_COLORS["B+"]),
                        }}
                        title="B+: Grassroots"
                      >
                        B+
                      </div>
                    </div>

                    {/* Row 5: B++ */}
                    <div className="col-start-4 row-start-5">
                      <div
                        className="aspect-square rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer hover:scale-110 transition-transform shadow-lg"
                        style={{
                          backgroundColor: BIAS_COLORS["B++"],
                          color: getContrastColor(BIAS_COLORS["B++"]),
                        }}
                        title="B++: Radical Dissent"
                      >
                        B++
                      </div>
                    </div>
                  </div>

                  {/* Axis Labels */}
                  <div className="flex justify-between text-xs text-slate-500 mb-2">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      Left (Progressive)
                    </span>
                    <span className="flex items-center gap-1">
                      Right (Conservative)
                      <span className="w-2 h-2 rounded-full bg-green-400" />
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      Establishment
                    </span>
                    <span className="flex items-center gap-1">
                      Oppositional
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="mt-6 pt-6 border-t border-slate-700/50 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white">13</div>
                      <div className="text-xs text-slate-500">Bias Codes</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">2</div>
                      <div className="text-xs text-slate-500">Axis System</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">∞</div>
                      <div className="text-xs text-slate-500">
                        Possibilities
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Bar */}
      <section className="relative py-8 border-y border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {highlights.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors"
              >
                <div
                  className={`p-3 rounded-lg bg-gradient-to-br ${item.gradient} shadow-lg`}
                >
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white">{item.text}</div>
                  <div className="text-sm text-slate-400">
                    {item.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 mb-4">
              Core Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Everything You Need to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Analyze Bias
              </span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Comprehensive tools for understanding and analyzing media bias
              across multiple dimensions.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group relative bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all duration-500 overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />

                <CardContent className="relative p-8">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg ${feature.shadowColor} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="relative py-24 sm:py-32 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 mb-4">
              Advanced Capabilities
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Deep Forensic Analysis
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Beyond classification — comprehensive text analysis powered by AI.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilities.map((cap, i) => (
              <Card
                key={i}
                className="group bg-slate-800/30 border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/20">
                      <cap.icon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">
                        {cap.stat}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                        {cap.statLabel}
                      </div>
                    </div>
                  </div>
                  <h4 className="font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {cap.title}
                  </h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {cap.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 mb-4">
              Simple Process
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Three simple steps to analyze and understand bias in any text
              content.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Configure",
                description:
                  "Set up your OpenAI-compatible API endpoint — use local models like Ollama or cloud services like OpenAI.",
                icon: Zap,
                color: "from-amber-500 to-orange-500",
              },
              {
                step: "02",
                title: "Analyze",
                description:
                  "Enter text, fetch news headlines, or analyze entire outlets. BiasMapper identifies patterns instantly.",
                icon: Search,
                color: "from-blue-500 to-cyan-500",
              },
              {
                step: "03",
                title: "Explore",
                description:
                  "View detailed bias classifications, narratives, cognitive biases, logical fallacies, and visualizations.",
                icon: PieChart,
                color: "from-emerald-500 to-teal-500",
              },
            ].map((item, index) => (
              <div key={index} className="relative group">
                <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all duration-300 h-full">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}
                      >
                        <item.icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-4xl font-black text-slate-800 group-hover:text-slate-700 transition-colors">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 sm:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 border-0 shadow-2xl">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.5)_1px,transparent_1px)]"
                style={{ backgroundSize: "40px 40px" }}
              />
            </div>

            <CardContent className="relative p-12 sm:p-16 text-center">
              <Scale className="h-16 w-16 text-white/80 mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                Ready to Uncover the Truth?
              </h2>
              <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Start analyzing media bias today. Join thousands of journalists,
                researchers, and critical thinkers using BiasMapper.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 font-bold shadow-xl px-8 py-6 rounded-xl text-base"
                >
                  <Link href="/analyze">
                    Start Free Analysis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-6 rounded-xl text-base"
                >
                  <Link href="/settings">Configure API</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Scale className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">BiasMapper</span>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                Fair and balanced analysis across perspectives using advanced AI
                technology. Empowering critical thinkers to understand media
                narratives.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
                Navigation
              </h3>
              <ul className="space-y-3 text-sm">
                {[
                  { name: "Home", href: "/" },
                  { name: "Dashboard", href: "/analyze" },
                  { name: "Analyze Text", href: "/analyze-text" },
                  { name: "Generate", href: "/generate-text" },
                  { name: "About", href: "/about" },
                  { name: "Settings", href: "/settings" },
                ].map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
                Resources
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="https://github.com/mskDev0092/BiasMapper"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <Github className="h-4 w-4" />
                    GitHub Repository
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/mskDev0092/BiasMapper"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    About BiasMapper
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} BiasMapper. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/mskDev0092/BiasMapper"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-white transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 pt-8 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-600">
              BiasMapper provides directional classification as a guide, not
              absolute truth. Always review and validate content in context.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
