"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts";
import {
  Globe,
  Newspaper,
  TrendingUp,
  Activity,
  Scale,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Settings,
  Zap,
  Clock,
  RotateCcw,
  Play,
  FileDown,
  Upload,
  Trash2,
  Rss,
} from "lucide-react";
import { isAPIConfigured, getAPIConfig } from "@/lib/api-config";
import {
  analyzeTextBias,
  analyzeNarratives,
  analyzeMultipleOutlets,
  fetchAllOutletData,
  type BiasAnalysis,
} from "@/lib/api-service";
import {
  autoConnectLMStudio,
  checkLMStudioStatus,
  type LMStudioConnectionStatus,
} from "@/lib/lm-studio-service";
import {
  saveAnalysisData,
  loadAnalysisData,
  getTimeSinceUpdate,
} from "@/lib/analysis-storage";
import { rotateOutlets, RATE_LIMIT_CONFIG } from "@/lib/rate-limiter";
import { DashboardTab } from "@/components/analyze/DashboardTab";
import { NewsFeed } from "@/components/analyze/NewsFeed";
import {
  NewsArticlesDB,
  AnalysisResultsDB,
  NarrativeSnapshotsDB,
  OutletProfilesDB,
  type NewsArticle,
  exportAllData,
  clearAllData,
} from "@/lib/local-db";
import {
  exportToJSON,
  importFromJSON,
  exportToPDF,
  exportArticlesToCSV,
  exportAnalysesToCSV,
} from "@/lib/export-utils";

// Bias color mapping
const biasColors: Record<string, string> = {
  "L++": "#dc2626", "L+": "#f87171", L: "#fca5a5",
  C: "#6b7280",
  R: "#86efac", "R+": "#4ade80", "R++": "#16a34a",
  "T++": "#7c3aed", "T+": "#a78bfa", T: "#c4b5fd",
  B: "#fbbf24", "B+": "#f59e0b", "B++": "#d97706",
};

const biasLabels: Record<string, string> = {
  "L++": "Far Left", "L+": "Progressive", L: "Left",
  C: "Center",
  R: "Right", "R+": "Conservative", "R++": "Far Right",
  "T++": "Est. Extreme", "T+": "Mainstream", T: "Establishment",
  B: "Oppositional", "B+": "Grassroots", "B++": "Radical",
};

// Static pre-analyzed data
const STATIC_INTERNATIONAL = [
  { outlet: "CNN", dominant_bias: "T+", secondary_bias: "L+", confidence: 0.75, analysis: "Mainstream outlet with progressive leanings on social issues", key_themes: ["political news", "international affairs", "social justice"], narrative_tone: "Institutional with progressive framing" },
  { outlet: "BBC", dominant_bias: "T+", secondary_bias: "C", confidence: 0.8, analysis: "Establishment-aligned with balanced coverage approach", key_themes: ["world news", "politics", "culture"], narrative_tone: "Authoritative and measured" },
  { outlet: "Fox News", dominant_bias: "R++", secondary_bias: "T+", confidence: 0.85, analysis: "Strong conservative bias within mainstream institutional context", key_themes: ["conservative politics", "national security", "traditional values"], narrative_tone: "Confrontational and partisan" },
  { outlet: "MSNBC", dominant_bias: "L++", secondary_bias: "T+", confidence: 0.8, analysis: "Strong progressive stance on social and economic issues", key_themes: ["progressive politics", "social justice", "environmental issues"], narrative_tone: "Advocacy-oriented progressive" },
  { outlet: "Al Jazeera", dominant_bias: "B+", secondary_bias: "L+", confidence: 0.75, analysis: "Grassroots perspectives with focus on Global South", key_themes: ["Middle East", "Global South", "human rights"], narrative_tone: "Anti-establishment, pro-diplomatic" },
  { outlet: "The Guardian", dominant_bias: "L+", secondary_bias: "B+", confidence: 0.8, analysis: "Progressive outlook amplifying marginalized perspectives", key_themes: ["social justice", "environment", "human rights"], narrative_tone: "Liberal advocacy journalism" },
  { outlet: "Reuters", dominant_bias: "C", secondary_bias: "T+", confidence: 0.85, analysis: "Wire service focused on factual business reporting", key_themes: ["markets", "business", "economics"], narrative_tone: "Neutral, fact-based" },
  { outlet: "Breitbart", dominant_bias: "R++", secondary_bias: "B+", confidence: 0.9, analysis: "Far-right oppositional outlet challenging establishment", key_themes: ["anti-establishment", "conservative values", "nationalism"], narrative_tone: "Aggressive oppositional" },
];

const STATIC_PAKISTAN = [
  { outlet: "Geo News", dominant_bias: "T+", secondary_bias: "C", confidence: 0.7, analysis: "Mainstream Pakistani outlet with centrist institutional alignment", key_themes: ["Pakistan politics", "regional security", "economy"], narrative_tone: "Mainstream institutional" },
  { outlet: "ARY News", dominant_bias: "R+", secondary_bias: "B+", confidence: 0.7, analysis: "Conservative leanings with oppositional stance on government", key_themes: ["political opposition", "national security", "conservative values"], narrative_tone: "Oppositional conservative" },
  { outlet: "Dawn", dominant_bias: "C", secondary_bias: "L+", confidence: 0.75, analysis: "Balanced English-language outlet with progressive social views", key_themes: ["democracy", "human rights", "governance"], narrative_tone: "Analytical and measured" },
  { outlet: "Express News", dominant_bias: "C", secondary_bias: "T+", confidence: 0.7, analysis: "Centrist mainstream outlet covering national affairs", key_themes: ["national news", "politics", "current affairs"], narrative_tone: "Balanced mainstream" },
  { outlet: "Samaa News", dominant_bias: "T+", secondary_bias: "C", confidence: 0.7, analysis: "Mainstream balanced coverage with institutional alignment", key_themes: ["current affairs", "social issues", "politics"], narrative_tone: "Moderate institutional" },
  { outlet: "Dunya News", dominant_bias: "T+", secondary_bias: "R+", confidence: 0.65, analysis: "Mainstream outlet with slight conservative leanings", key_themes: ["talk shows", "political debate", "current affairs"], narrative_tone: "Conversational mainstream" },
  { outlet: "Hum News", dominant_bias: "L+", secondary_bias: "B+", confidence: 0.65, analysis: "Progressive focus on social issues and grassroots perspectives", key_themes: ["social issues", "women rights", "youth"], narrative_tone: "Progressive advocacy" },
];

const STATIC_NARRATIVES = {
  narratives: [
    { title: "Iran Conflict Framing", description: "Coverage varies from defensive necessity to aggressive militarism", promoted_by: "R++", opposed_by: "B++", intensity: "high" as const },
    { title: "Economic Impact Narrative", description: "Focus on economic consequences of geopolitical tensions", promoted_by: "T+", opposed_by: "B+", intensity: "medium" as const },
    { title: "Government Accountability", description: "Scrutiny of government decisions and policies", promoted_by: "B+", opposed_by: "T+", intensity: "medium" as const },
    { title: "National Security Emphasis", description: "Focus on security threats and defense priorities", promoted_by: "R+", opposed_by: "L+", intensity: "high" as const },
    { title: "Humanitarian Concerns", description: "Highlighting civilian impact and humanitarian crises", promoted_by: "L+", opposed_by: "R++", intensity: "medium" as const },
  ],
  trending_topics: ["Iran Conflict", "Oil Prices", "Regional Security", "Economic Crisis", "Diplomatic Relations"],
  bias_tensions: "Significant tension between establishment (T+) and oppositional (B+) narratives, with clear ideological divide between progressive (L) and conservative (R) framing of events",
};

export default function AnalyzePage() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [lmStudioStatus, setLmStudioStatus] = useState<LMStudioConnectionStatus | null>(null);
  const [autoConnecting, setAutoConnecting] = useState(false); // NOT auto on mount
  const [autoOperating, setAutoOperating] = useState(false);

  // Live data state
  const [liveInternational, setLiveInternational] = useState(STATIC_INTERNATIONAL);
  const [livePakistan, setLivePakistan] = useState(STATIC_PAKISTAN);
  const [liveNarratives, setLiveNarratives] = useState(STATIC_NARRATIVES);

  // Auto-refresh state
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(600);
  const [countdownTimer, setCountdownTimer] = useState(600);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // DB stats
  const [dbStats, setDbStats] = useState({ articles: 0, analyses: 0 });

  // Load from localStorage on mount (passive, no auto-fetch)
  useEffect(() => {
    const storedData = loadAnalysisData();
    if (storedData) {
      setLiveInternational(storedData.international);
      setLivePakistan(storedData.pakistan);
      setLiveNarratives(storedData.narratives);
      setLastUpdateTime(getTimeSinceUpdate());
    }
    // Check if API is configured
    if (isAPIConfigured()) {
      setIsConfigured(true);
    }
    // Load DB stats
    setDbStats({
      articles: NewsArticlesDB.count(),
      analyses: AnalysisResultsDB.getAll().length,
    });
  }, []);

  // Auto-refresh timer effect
  useEffect(() => {
    if (!isAutoRefreshEnabled) return;
    const interval = setInterval(() => {
      setCountdownTimer((prev) => {
        if (prev <= 1) {
          setAutoOperating(true);
          autoFetchOutletData().finally(() => setAutoOperating(false));
          return autoRefreshInterval;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isAutoRefreshEnabled, autoRefreshInterval]);

  useEffect(() => {
    setCountdownTimer(autoRefreshInterval);
  }, [autoRefreshInterval]);

  // Manual connect to LM-Studio
  const handleConnect = async () => {
    setAutoConnecting(true);
    try {
      const status = await autoConnectLMStudio();
      setLmStudioStatus(status);
      if (status.isConnected) {
        setIsConfigured(true);
      }
    } finally {
      setAutoConnecting(false);
    }
  };

  // Manual start analysis
  const handleStartAnalysis = async () => {
    setAutoOperating(true);
    await autoFetchOutletData();
  };

  // Auto-fetch outlet data with rate limiting and outlet rotation
  const autoFetchOutletData = async () => {
    try {
      setAnalysisProgress(0);
      const allInternationalOutlets = ["CNN", "BBC", "Reuters", "Guardian", "Al Jazeera", "Fox", "MSNBC"];
      const allPakistaniOutlets = ["Dawn", "Express", "Samaa", "Dunya", "Hum", "ARY", "Geo", "Pakistan Today"];

      const internationalOutlets = rotateOutlets(allInternationalOutlets, refreshCount);
      const pakistaniOutlets = rotateOutlets(allPakistaniOutlets, refreshCount);

      // 1. Fetch data with progress (0-30%)
      const intlData = await fetchAllOutletData(internationalOutlets, (p) => setAnalysisProgress(Math.round(p * 0.15)));
      const pkData = await fetchAllOutletData(pakistaniOutlets, (p) => setAnalysisProgress(15 + Math.round(p * 0.15)));

      // 2. Analyze International (30-60%)
      let intlAnalysis = liveInternational;
      if (intlData.length > 0) {
        try {
          const newIntlAnalysis = await analyzeMultipleOutlets(intlData, (p) => setAnalysisProgress(30 + Math.round(p * 0.3)));
          intlAnalysis = liveInternational.map(
            (o) => newIntlAnalysis.find((n) => n.outlet === o.outlet) || o
          );
          setLiveInternational(intlAnalysis);
        } catch (error) {
          console.error("Failed to analyze international outlets:", error);
        }
      }

      // 3. Analyze Pakistani (60-90%)
      let pkAnalysis = livePakistan;
      if (pkData.length > 0) {
        try {
          const newPkAnalysis = await analyzeMultipleOutlets(pkData, (p) => setAnalysisProgress(60 + Math.round(p * 0.3)));
          pkAnalysis = livePakistan.map(
            (o) => newPkAnalysis.find((n) => n.outlet === o.outlet) || o
          );
          setLivePakistan(pkAnalysis);
        } catch (error) {
          console.error("Failed to analyze Pakistani outlets:", error);
        }
      }

      // 4. Analyze Narratives (90-100%)
      let finalNarratives = liveNarratives;
      if (intlAnalysis.length > 0 || pkAnalysis.length > 0) {
        setAnalysisProgress(95);
        try {
          const allAnalyses = [...intlAnalysis, ...pkAnalysis];
          const narratives = await analyzeNarratives(
            allAnalyses.map((a) => ({ outlet: a.outlet, dominant_bias: a.dominant_bias }))
          );
          setLiveNarratives(narratives as any);
          finalNarratives = narratives as any;
        } catch (error) {
          console.error("Failed to analyze narratives:", error);
        }
      }

      setAnalysisProgress(100);
      saveAnalysisData({ international: intlAnalysis, pakistan: pkAnalysis, narratives: finalNarratives });
      setLastUpdateTime(getTimeSinceUpdate());
      setRefreshCount((prev) => prev + 1);
      setDbStats({ articles: NewsArticlesDB.count(), analyses: AnalysisResultsDB.getAll().length });
    } catch (error) {
      console.error("Auto-fetch outlet data error:", error);
    } finally {
      setAutoOperating(false);
      setTimeout(() => setAnalysisProgress(0), 1000);
    }
  };

  // Handle per-article LLM analysis from the news feed
  const handleAnalyzeArticle = async (article: NewsArticle) => {
    // 1. Check if we already have this analysis to prevent redundant LLM calls
    const existing = AnalysisResultsDB.getRecent(100).find(a => a.articleId === article.id);
    if (existing) {
      console.log("Using existing analysis for:", article.id);
      return;
    }

    const textToAnalyze = `${article.title}\n\n${article.description || ""}`;
    const result = await analyzeTextBias(textToAnalyze, article.source);
    
    AnalysisResultsDB.create({
      articleId: article.id,
      inputText: textToAnalyze,
      dominantBias: result.dominant_bias,
      secondaryBias: result.secondary_bias,
      confidence: result.confidence,
      analysis: result.analysis,
      keyThemes: result.key_themes,
      narrativeTone: result.narrative_tone,
      cognitiveBiases: [],
      logicalFallacies: [],
      premises: [],
      conclusions: [],
    });

    // Link analysis to article
    const allArticles = NewsArticlesDB.getAll();
    const updated = allArticles.map((a) =>
      a.id === article.id ? { ...a, analysisId: "linked", updatedAt: new Date().toISOString() } : a
    );
    
    // Directly write to avoid re-upsert overhead
    localStorage.setItem("bm_db_news_articles", JSON.stringify(updated));
    setDbStats({ articles: NewsArticlesDB.count(), analyses: AnalysisResultsDB.getAll().length });
  };

  // Chart config
  const chartConfig: ChartConfig = {
    count: { label: "Outlets" },
    ...Object.fromEntries(
      Object.entries(biasColors).map(([key, color]) => [
        key,
        { label: biasLabels[key] || key, color },
      ])
    ),
  };

  const prepareDistributionData = (outlets: typeof STATIC_INTERNATIONAL) => {
    const distribution: Record<string, number> = {};
    outlets.forEach((o) => {
      distribution[o.dominant_bias] = (distribution[o.dominant_bias] || 0) + 1;
    });
    return Object.entries(distribution)
      .filter(([_, count]) => count > 0)
      .map(([bias, count]) => ({ bias, count, fill: biasColors[bias] || "#8884d8" }));
  };

  // Export handlers
  const handleExportJSON = () => exportToJSON();
  const handleExportPDF = () => {
    const latestNarrative = NarrativeSnapshotsDB.getLatest();
    exportToPDF({
      articles: NewsArticlesDB.getRecent(30),
      analyses: AnalysisResultsDB.getRecent(30),
      narrative: latestNarrative || undefined,
      dashboardState: {
        international: liveInternational,
        pakistan: livePakistan,
        narratives: liveNarratives,
      },
      title: "BiasMapper Dashboard Report",
    });
  };
  const handleImportJSON = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          await importFromJSON(file);
          window.location.reload();
        } catch (err) {
          console.error("Import error:", err);
        }
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Scale className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">BiasMapper Dashboard</h1>
                <p className="text-slate-400 text-sm">
                  {autoOperating ? "Analyzing outlets..." : "Analysis Dashboard — Manual Control"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {lmStudioStatus?.isConnected && (
                <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold px-3 py-1 animate-pulse">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  LM-Studio Active
                </Badge>
              )}
              {lastUpdateTime && (
                <Badge variant="outline" className="bg-slate-800/80 border-slate-700 text-slate-300 px-3 py-1 font-medium">
                  <Clock className="h-3.5 w-3.5 mr-2 text-blue-400" />
                  Last Updated: {lastUpdateTime}
                </Badge>
              )}
              {/* Export / Import */}
              <Button onClick={handleExportPDF} size="sm" variant="outline" className="bg-slate-800 border-slate-600 text-slate-300">
                <FileDown className="h-3.5 w-3.5 mr-1.5" />PDF
              </Button>
              <Button onClick={handleExportJSON} size="sm" variant="outline" className="bg-slate-800 border-slate-600 text-slate-300">
                <FileDown className="h-3.5 w-3.5 mr-1.5" />JSON
              </Button>
              <Button onClick={handleImportJSON} size="sm" variant="outline" className="bg-slate-800 border-slate-600 text-slate-300">
                <Upload className="h-3.5 w-3.5 mr-1.5" />Import
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="bg-slate-800 border-slate-600"
              >
                <Link href="/settings">
                  <Settings className="h-4 w-4 mr-2" />Settings
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Manual Start Banner */}
        {!autoOperating && !isConfigured && (
          <Alert className="bg-amber-900/20 border-amber-700">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-400">No AI Service Connected</AlertTitle>
            <AlertDescription className="text-slate-400">
              <p className="mb-3">Showing static pre-analyzed data. Connect to enable live analysis:</p>
              <div className="flex gap-3">
                <Button
                  onClick={handleConnect}
                  disabled={autoConnecting}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {autoConnecting ? (
                    <><RefreshCw className="h-3 w-3 mr-2 animate-spin" />Connecting...</>
                  ) : (
                    <><Zap className="h-3 w-3 mr-2" />Connect LM-Studio</>
                  )}
                </Button>
                <Button asChild size="sm" variant="outline" className="border-amber-600 text-amber-400 hover:bg-amber-900/20">
                  <Link href="/settings"><Settings className="h-3 w-3 mr-2" />Configure API</Link>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Action Bar */}
        <Card className="bg-slate-900/60 border-slate-800 relative overflow-hidden backdrop-blur-md shadow-2xl">
          {autoOperating && (
            <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-800/80">
              <div 
                className="h-full bg-gradient-to-r from-amber-600 via-orange-500 to-amber-400 transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
          )}
          <CardContent className="pt-8 pb-6">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="flex flex-col gap-2 min-w-[180px]">
                  <Button
                    onClick={handleStartAnalysis}
                    disabled={autoOperating || !isConfigured}
                    size="lg"
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 w-full font-bold shadow-lg shadow-orange-900/20 transition-all active:scale-95"
                  >
                    {autoOperating ? (
                      <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Processing...</>
                    ) : (
                      <><Play className="h-4 w-4 mr-2" />Initiate Analysis Hub</>
                    )}
                  </Button>
                  {autoOperating && (
                    <div className="flex items-center justify-center gap-2">
                       <span className="text-[10px] text-amber-500 font-black uppercase tracking-[0.2em] animate-pulse">
                        {analysisProgress}% Complete
                      </span>
                    </div>
                  )}
                </div>

                {autoOperating && (
                   <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-950/40 rounded-xl border border-slate-800">
                      <div className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                        Live Deep-Forensic Audit in Progress
                      </span>
                   </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAutoRefreshEnabled}
                    onChange={(e) => setIsAutoRefreshEnabled(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-900"
                  />
                  <span className="text-slate-300">Auto-Refresh</span>
                </label>
                {isAutoRefreshEnabled && (
                  <span className="text-slate-500 text-xs">
                    Next in {Math.floor(countdownTimer / 60)}m {countdownTimer % 60}s
                  </span>
                )}
              </div>

              <div className="ml-auto flex gap-3 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <Newspaper className="h-3.5 w-3.5" />{dbStats.articles} articles
                </span>
                <span className="flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5" />{dbStats.analyses} analyses
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Globe className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="text-blue-300 text-sm">International</p>
                  <p className="text-3xl font-bold text-white">{liveInternational.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Newspaper className="h-8 w-8 text-green-400" />
                <div>
                  <p className="text-green-300 text-sm">Pakistan</p>
                  <p className="text-3xl font-bold text-white">{livePakistan.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-900/50 to-amber-800/30 border-amber-700/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-amber-400" />
                <div>
                  <p className="text-amber-300 text-sm">Narratives</p>
                  <p className="text-3xl font-bold text-white">{liveNarratives.narratives.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-purple-400" />
                <div>
                  <p className="text-purple-300 text-sm">Trending</p>
                  <p className="text-3xl font-bold text-white">{liveNarratives.trending_topics.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600">
              <Activity className="h-4 w-4 mr-2" />Dashboard
            </TabsTrigger>
            <TabsTrigger value="feed" className="data-[state=active]:bg-emerald-600">
              <Rss className="h-4 w-4 mr-2" />News Feed
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <DashboardTab
              liveInternational={liveInternational}
              livePakistan={livePakistan}
              liveNarratives={liveNarratives}
              chartConfig={chartConfig}
              prepareDistributionData={prepareDistributionData}
              biasColors={biasColors}
            />
          </TabsContent>

          {/* News Feed Tab */}
          <TabsContent value="feed" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Rss className="h-5 w-5 text-emerald-400" />
                  Live News Feed
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Fetch news from APIs, then analyze them with the LLM for bias detection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NewsFeed
                  onAnalyzeArticle={handleAnalyzeArticle}
                  isLLMReady={isConfigured}
                  maxHeight="700px"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
