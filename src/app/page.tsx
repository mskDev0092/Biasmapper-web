"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Scale,
  Search,
  Settings,
  SlidersHorizontal,
  PieChart,
  ArrowRight,
  CheckCircle2,
  Github,
  Zap,
  Shield,
  Globe,
  Brain,
  Target,
  TrendingUp,
} from "lucide-react";
import { BIAS_COLORS, BIAS_LABELS, type BiasCode } from "@/lib/bias-constants";

// Bias codes for the grid display
const biasGridCodes = [
  { code: "L++" as BiasCode, label: "Far Left", description: "Radical progressive, anti-capitalist perspectives" },
  { code: "L+" as BiasCode, label: "Progressive", description: "Center-left, reform-oriented viewpoints" },
  { code: "L" as BiasCode, label: "Left", description: "Mild progressive tendencies" },
  { code: "C" as BiasCode, label: "Center", description: "Neutral, balanced perspectives" },
  { code: "R" as BiasCode, label: "Right", description: "Mild conservative tendencies" },
  { code: "R+" as BiasCode, label: "Conservative", description: "Center-right, tradition-oriented" },
  { code: "R++" as BiasCode, label: "Far Right", description: "Radical conservative, nationalist" },
  { code: "T++" as BiasCode, label: "Est. Extreme", description: "Complete institutional alignment" },
  { code: "T+" as BiasCode, label: "Mainstream", description: "Trusts establishment institutions" },
  { code: "T" as BiasCode, label: "Establishment", description: "Generally pro-institution" },
  { code: "B" as BiasCode, label: "Oppositional", description: "Skeptical of institutions" },
  { code: "B+" as BiasCode, label: "Grassroots", description: "Bottom-up, anti-establishment" },
  { code: "B++" as BiasCode, label: "Radical", description: "Strongly anti-establishment" },
];

const features = [
  {
    icon: Search,
    title: "Bias Detection",
    description:
      "Identify ideological (L++ to R++), societal (T++ to B++), and cognitive biases in any text with advanced NLP algorithms.",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    icon: SlidersHorizontal,
    title: "Bias Adjustment",
    description:
      "Reframe content to a specific bias perspective or neutralize it to a more balanced viewpoint with a single click.",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    icon: PieChart,
    title: "Visual Analytics",
    description:
      "Understand bias patterns through intuitive visualizations including heatmaps, vector scores, and confidence metrics.",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
];

const highlights = [
  {
    icon: Zap,
    text: "Real-time Analysis",
    description: "Instant bias classification powered by AI",
  },
  {
    icon: Shield,
    text: "Privacy First",
    description: "Your data never leaves your configured endpoint",
  },
  {
    icon: Globe,
    text: "Any OpenAI-Compatible API",
    description: "Use local models or cloud services",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 scroll-smooth">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-indigo-50/80 to-purple-50/80" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDE0di0yaDIyek0zNiAxNHYySDE0di0yaDIyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8 order-2 lg:order-1">
              <div className="space-y-4">
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-700 border-0 w-fit"
                >
                  <Zap className="h-3 w-3 mr-1" aria-hidden="true" />
                  AI-Powered Analysis
                </Badge>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight tracking-tight">
                  BiasMapper:{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    Fair and Balanced
                  </span>{" "}
                  Analysis
                </h1>
                <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-lg">
                  Uncover and understand ideological, societal, and cognitive
                  biases in text content using our advanced directional
                  framework. Perfect for journalists, educators, researchers,
                  and critical thinkers.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 font-semibold"
                >
                  <Link href="/analyze">
                    Try BiasMapper Now
                    <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-slate-300 hover:border-slate-400 font-semibold"
                >
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 pt-4">
                {highlights.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start sm:items-center gap-2 text-slate-600"
                  >
                    <item.icon
                      className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0"
                      aria-hidden="true"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900">
                        {item.text}
                      </span>
                      <span className="text-xs text-slate-500">
                        {item.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Bias Grid */}
            <div className="relative order-1 lg:order-2">
              <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-3xl transition-shadow duration-300">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-6">
                    Bias Directional Framework
                  </h3>

                  {/* Bias Grid */}
                  <div className="grid grid-cols-7 gap-2 gap-y-3 mb-6 auto-rows-max">
                    {/* Row 1: T++ */}
                    <div className="col-start-4 row-start-1">
                      <div
                        className="aspect-square rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm cursor-help hover:scale-110 transition-transform"
                        style={{ backgroundColor: BIAS_COLORS["T++"] }}
                        title="T++: Extreme Establishment"
                        role="tooltip"
                        aria-label="T++: Extreme Establishment"
                      >
                        T++
                      </div>
                    </div>

                    {/* Row 2: T+ */}
                    <div className="col-start-3 row-start-2">
                      <div
                        className="aspect-square rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm cursor-help hover:scale-110 transition-transform"
                        style={{ backgroundColor: BIAS_COLORS["T+"] }}
                        title="T+: Mainstream"
                      >
                        T+
                      </div>
                    </div>
                    <div className="col-start-5 row-start-2">
                      <div
                        className="aspect-square rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm cursor-help hover:scale-110 transition-transform"
                        style={{ backgroundColor: BIAS_COLORS["T+"] }}
                        title="T+: Mainstream"
                      >
                        T+
                      </div>
                    </div>

                    {/* Row 3: L++ to R++ */}
                    {(["L++", "L+", "L", "C", "R", "R+", "R++"] as BiasCode[]).map((code) => (
                      <div key={code} className={`col-start-${["L++", "L+", "L", "C", "R", "R+", "R++"].indexOf(code) + 1} row-start-3`}>
                        <div
                          className="aspect-square rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm cursor-help hover:scale-110 transition-transform"
                          style={{ 
                            backgroundColor: BIAS_COLORS[code],
                            color: ["L", "R"].includes(code) ? "#1e293b" : "white"
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
                        className="aspect-square rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm cursor-help hover:scale-110 transition-transform"
                        style={{ backgroundColor: BIAS_COLORS["B+"] }}
                        title="B+: Grassroots"
                      >
                        B+
                      </div>
                    </div>
                    <div className="col-start-5 row-start-4">
                      <div
                        className="aspect-square rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm cursor-help hover:scale-110 transition-transform"
                        style={{ backgroundColor: BIAS_COLORS["B+"] }}
                        title="B+: Grassroots"
                      >
                        B+
                      </div>
                    </div>

                    {/* Row 5: B++ */}
                    <div className="col-start-4 row-start-5">
                      <div
                        className="aspect-square rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm cursor-help hover:scale-110 transition-transform"
                        style={{ backgroundColor: BIAS_COLORS["B++"] }}
                        title="B++: Radical Dissent"
                      >
                        B++
                      </div>
                    </div>
                  </div>

                  {/* Axis Labels */}
                  <div className="flex justify-between text-xs text-slate-500 mb-2">
                    <span>← Left (Progressive)</span>
                    <span>Right (Conservative) →</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>↑ Establishment</span>
                    <span>Oppositional ↓</span>
                  </div>
                </CardContent>
              </Card>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full opacity-20 blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
              Key Features
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              BiasMapper provides comprehensive tools for understanding and
              analyzing media bias across multiple dimensions.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50 hover:scale-105 transform"
              >
                <CardContent className="p-6 sm:p-8">
                  <div
                    className={`w-14 h-14 ${feature.bgColor} rounded-xl flex items-center justify-center mb-6 shadow-sm`}
                    aria-hidden="true"
                  >
                    <feature.icon className={`h-7 w-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-20 lg:py-28 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
              How It Works
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Three simple steps to analyze and understand bias in any text
              content.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: "1",
                title: "Configure API",
                description:
                  "Set up your OpenAI-compatible API endpoint - use local models like Ollama or cloud services.",
                icon: Settings,
              },
              {
                step: "2",
                title: "Analyze Content",
                description:
                  "Enter text or news headlines and let BiasMapper analyze the ideological and societal bias.",
                icon: Search,
              },
              {
                step: "3",
                title: "Explore Results",
                description:
                  "View detailed bias classifications, narratives, and visualizations of the analysis.",
                icon: PieChart,
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div
                  className="absolute -top-3 -left-3 text-7xl sm:text-8xl font-bold text-blue-100 pointer-events-none"
                  aria-hidden="true"
                >
                  {item.step}
                </div>
                <div className="relative bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-2 mb-3">
                    <item.icon
                      className="h-5 w-5 text-blue-600"
                      aria-hidden="true"
                    />
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-16 sm:py-20 lg:py-28 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              Advanced Capabilities
            </h2>
            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Beyond mere classification, BiasMapper provides deep forensic analysis
              of text content.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Brain, title: "Cognitive Bias Detection", desc: "Identify confirmation bias, anchoring, and other cognitive distortions" },
              { icon: Target, title: "Logical Fallacy Analysis", desc: "Detect ad hominem, strawman, and other logical fallacies" },
              { icon: TrendingUp, title: "Narrative Mapping", desc: "Track how stories are framed across different perspectives" },
              { icon: Shield, title: "Privacy-Focused", desc: "All analysis happens at your configured endpoint - your data stays private" },
            ].map((cap, i) => (
              <Card key={i} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
                    <cap.icon className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-white mb-2">{cap.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{cap.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-28 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_1px)]"
            style={{ backgroundSize: "40px 40px" }}
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            Ready to Analyze Bias?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-8 leading-relaxed max-w-2xl mx-auto">
            Start uncovering perspectives and understanding media narratives
            today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Link href="/analyze">
                Start Analyzing
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 font-semibold"
            >
              <Link href="/settings">Configure API</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 md:mb-12">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Scale className="h-6 w-6 text-blue-500" aria-hidden="true" />
                <span className="text-white font-bold text-lg">BiasMapper</span>
              </div>
              <p className="text-sm text-slate-500">
                Fair and balanced analysis across perspectives using advanced AI
                technology.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4 text-sm">
                Navigation
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/analyze"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Analyze
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/settings"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Settings
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4 text-sm">
                Resources
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://github.com/mskDev0092/BiasMapper"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    GitHub
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
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-800">
            <div className="text-sm text-slate-500 mb-4 md:mb-0">
              <p>&copy; {new Date().getFullYear()} BiasMapper. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/mskDev0092/BiasMapper"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="View on GitHub (opens in new window)"
              >
                <Github className="h-6 w-6" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500 space-y-2">
            <p>
              BiasMapper provides directional classification as a guide, not
              absolute truth.
            </p>
            <p>Always review and validate content in context.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
