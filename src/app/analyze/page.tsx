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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Zap,
  Clock,
  Play,
  FileDown,
  Upload,
  Rss,
  ShieldCheck,
  ChevronRight,
  BarChart3,
  MapPin,
} from "lucide-react";
import { isAPIConfigured } from "@/lib/api-config";
import {
  analyzeTextBias,
  analyzeNarratives,
  analyzeMultipleOutlets,
  fetchAllOutletData,
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
import { rotateOutlets } from "@/lib/rate-limiter";
import { DashboardTab } from "@/components/analyze/DashboardTab";
import { AnalyzeResultDisplay } from "@/components/analyze/AnalyzeResultDisplay";
import { NewsFeed } from "@/components/analyze/NewsFeed";
import {
  NewsArticlesDB,
  AnalysisResultsDB,
  NarrativeSnapshotsDB,
  OutletProfilesDB,
  type NewsArticle,
  type AnalysisResult,
  exportAllData,
} from "@/lib/local-db";
import {
  exportToJSON,
  importFromJSON,
  exportToPDF,
} from "@/lib/export-utils";
import {
  COUNTRIES,
  INTERNATIONAL_OUTLETS,
  getOutletsByCountry,
  getCountryByCode,
  type CountryConfig,
} from "@/lib/country-config";

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

// Static pre-analyzed data for international outlets
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

// Generate static data for any country
function generateStaticCountryData(country: CountryConfig): any[] {
  const biasOptions = ["L+", "C", "R+", "T+", "B+", "L", "R"];
  return country.outlets.slice(0, 7).map((outlet, index) => ({
    outlet,
    dominant_bias: biasOptions[index % biasOptions.length],
    secondary_bias: biasOptions[(index + 3) % biasOptions.length],
    confidence: 0.65 + (index * 0.03),
    analysis: `${country.name} media outlet with regional perspective on national affairs`,
    key_themes: ["national politics", "regional news", "economy"],
    narrative_tone: "National focus",
  }));
}

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

// Types for stat card dialogs
type StatDialogType = 'international' | 'country' | 'narratives' | 'trending' | null;

export default function AnalyzePage() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [lmStudioStatus, setLmStudioStatus] = useState<LMStudioConnectionStatus | null>(null);
  const [autoConnecting, setAutoConnecting] = useState(false);
  const [autoOperating, setAutoOperating] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Country selection state
  const [selectedCountry, setSelectedCountry] = useState<string>("pk");
  
  // Stat card dialog state
  const [statDialogOpen, setStatDialogOpen] = useState<StatDialogType>(null);

  // Persistence for analysis state
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAuto = localStorage.getItem("bm_auto_operating") === "true";
      const savedProgress = parseFloat(localStorage.getItem("bm_analysis_progress") || "0");
      const savedCountry = localStorage.getItem("bm_selected_country") || "pk";
      if (savedAuto) setAutoOperating(true);
      if (savedProgress > 0) setAnalysisProgress(savedProgress);
      if (savedCountry) setSelectedCountry(savedCountry);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("bm_auto_operating", autoOperating.toString());
    }
  }, [autoOperating]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("bm_analysis_progress", analysisProgress.toString());
    }
  }, [analysisProgress]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("bm_selected_country", selectedCountry);
    }
  }, [selectedCountry]);

  // Live data state
  const [liveInternational, setLiveInternational] = useState(STATIC_INTERNATIONAL);
  const [liveCountry, setLiveCountry] = useState<any[]>([]);
  const [liveNarratives, setLiveNarratives] = useState(STATIC_NARRATIVES);

  // Auto-refresh state
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(600);
  const [countdownTimer, setCountdownTimer] = useState(600);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [selectedHistoricalAnalysis, setSelectedHistoricalAnalysis] = useState<AnalysisResult | null>(null);

  // DB stats
  const [dbStats, setDbStats] = useState({ articles: 0, analyses: 0 });

  // Get selected country config
  const selectedCountryConfig = getCountryByCode(selectedCountry);

  // Initialize country data when country changes
  useEffect(() => {
    if (selectedCountryConfig) {
      setLiveCountry(generateStaticCountryData(selectedCountryConfig));
    }
  }, [selectedCountry, selectedCountryConfig]);

  // Load from localStorage on mount
  useEffect(() => {
    const storedData = loadAnalysisData();
    if (storedData) {
      setLiveInternational(storedData.international || STATIC_INTERNATIONAL);
      setLiveCountry(storedData.country || generateStaticCountryData(selectedCountryConfig!));
      setLiveNarratives(storedData.narratives || STATIC_NARRATIVES);
      setLastUpdateTime(getTimeSinceUpdate());
    }
    if (isAPIConfigured()) {
      setIsConfigured(true);
    }
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

  // Auto-fetch outlet data with rate limiting
  const autoFetchOutletData = async () => {
    try {
      setAnalysisProgress(0);
      
      // Get outlets based on selected country
      const countryOutlets = selectedCountryConfig?.outlets || [];
      const internationalOutlets = INTERNATIONAL_OUTLETS.slice(0, 8);

      const rotatedIntlOutlets = rotateOutlets(internationalOutlets, refreshCount);
      const rotatedCountryOutlets = rotateOutlets(countryOutlets, refreshCount);

      // 1. Fetch data with progress (0-30%)
      const intlData = await fetchAllOutletData(rotatedIntlOutlets, (p) => setAnalysisProgress(Math.round(p * 0.15)));
      const countryData = await fetchAllOutletData(rotatedCountryOutlets, (p) => setAnalysisProgress(15 + Math.round(p * 0.15)));

      // Sync fetched headlines to DB
      const syncHeadlinesToDB = (data: any[], country: string) => {
        const articles: Omit<NewsArticle, "id" | "createdAt" | "updatedAt">[] = [];
        data.forEach(outlet => {
          (outlet.headlines || []).forEach((headline: string) => {
            const cleanOutlet = outlet.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            const cleanHeadline = headline.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 50);
            const syntheticUrl = `https://${cleanOutlet}.com/news/${cleanHeadline}`;
            
            articles.push({
              title: headline,
              description: `Fetched during automated bias audit of ${outlet.name}.`,
              url: syntheticUrl,
              source: outlet.name,
              author: "AI Analyst",
              publishedAt: new Date().toISOString(),
              country: country,
              category: "General",
              imageUrl: null,
              fetchedVia: "lm-studio",
              analysisId: null
            });
          });
        });
        if (articles.length > 0) NewsArticlesDB.bulkUpsert(articles);
      };

      if (intlData.length > 0) syncHeadlinesToDB(intlData, "intl");
      if (countryData.length > 0) syncHeadlinesToDB(countryData, selectedCountry);

      // 2. Analyze International (30-60%)
      let intlAnalysis = liveInternational;
      if (intlData.length > 0) {
        try {
          const newIntlAnalysis = await analyzeMultipleOutlets(intlData, (p) => setAnalysisProgress(30 + Math.round(p * 0.3)));
          intlAnalysis = liveInternational.map(
            (o) => newIntlAnalysis.find((n) => n.outlet === o.outlet) || o
          );
          setLiveInternational(intlAnalysis);

          newIntlAnalysis.forEach(res => {
            AnalysisResultsDB.create({
              articleId: null,
              source: res.outlet,
              inputText: "Automated geopolitical audit of headlines.",
              dominantBias: res.dominant_bias,
              secondaryBias: res.secondary_bias,
              confidence: res.confidence,
              analysis: res.analysis,
              keyThemes: res.key_themes,
              narrativeTone: res.narrative_tone,
              cognitiveBiases: res.cognitive_biases || [],
              logicalFallacies: res.logical_fallacies || [],
              psychologicalIndicators: res.psychological_indicators || [],
              sociologicalIndicators: res.sociological_indicators || [],
              premises: res.premises || [],
              conclusions: res.conclusions || [],
            });
          });
        } catch (error) {
          console.error("Failed to analyze international outlets:", error);
        }
      }

      // 3. Analyze Country outlets (60-90%)
      let countryAnalysis = liveCountry;
      if (countryData.length > 0) {
        try {
          const newCountryAnalysis = await analyzeMultipleOutlets(countryData, (p) => setAnalysisProgress(60 + Math.round(p * 0.3)));
          countryAnalysis = liveCountry.map(
            (o) => newCountryAnalysis.find((n) => n.outlet === o.outlet) || o
          );
          setLiveCountry(countryAnalysis);

          newCountryAnalysis.forEach(res => {
            AnalysisResultsDB.create({
              articleId: null,
              source: res.outlet,
              inputText: `Automated national audit for ${selectedCountryConfig?.name}.`,
              dominantBias: res.dominant_bias,
              secondaryBias: res.secondary_bias,
              confidence: res.confidence,
              analysis: res.analysis,
              keyThemes: res.key_themes,
              narrativeTone: res.narrative_tone,
              cognitiveBiases: res.cognitive_biases || [],
              logicalFallacies: res.logical_fallacies || [],
              psychologicalIndicators: res.psychological_indicators || [],
              sociologicalIndicators: res.sociological_indicators || [],
              premises: res.premises || [],
              conclusions: res.conclusions || [],
            });
          });
        } catch (error) {
          console.error("Failed to analyze country outlets:", error);
        }
      }

      // 4. Analyze Narratives (90-100%)
      let finalNarratives = liveNarratives;
      if (intlAnalysis.length > 0 || countryAnalysis.length > 0) {
        setAnalysisProgress(95);
        try {
          const allAnalyses = [...intlAnalysis, ...countryAnalysis];
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
      saveAnalysisData({ 
        international: intlAnalysis, 
        country: countryAnalysis, 
        narratives: finalNarratives 
      });
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

  // Handle per-article LLM analysis
  const handleAnalyzeArticle = async (article: NewsArticle) => {
    const existing = AnalysisResultsDB.getRecent(100).find(a => a.articleId === article.id);
    if (existing) {
      console.log("Using existing analysis for:", article.id);
      return;
    }

    const textToAnalyze = `${article.title}\n\n${article.description || ""}`;
    const result = await analyzeTextBias(textToAnalyze, article.source);
    
    AnalysisResultsDB.create({
      articleId: article.id,
      source: article.source,
      inputText: textToAnalyze,
      dominantBias: result.dominant_bias,
      secondaryBias: result.secondary_bias,
      confidence: result.confidence,
      analysis: result.analysis,
      keyThemes: result.key_themes,
      narrativeTone: result.narrative_tone,
      cognitiveBiases: result.cognitive_biases || [],
      logicalFallacies: result.logical_fallacies || [],
      psychologicalIndicators: result.psychological_indicators || [],
      sociologicalIndicators: result.sociological_indicators || [],
      premises: result.premises || [],
      conclusions: result.conclusions || [],
    });

    const allArticles = NewsArticlesDB.getAll();
    const updated = allArticles.map((a) =>
      a.id === article.id ? { ...a, analysisId: "linked", updatedAt: new Date().toISOString() } : a
    );
    
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
        pakistan: liveCountry, // Keep backward compatibility
        narratives: liveNarratives,
      },
      country: selectedCountryConfig,
      title: `BiasMapper Report - ${selectedCountryConfig?.name || 'Global'}`,
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

  // Open stat card dialog
  const openStatDialog = (type: StatDialogType) => {
    setStatDialogOpen(type);
  };

  const countryDisplayName = selectedCountryConfig ? `${selectedCountryConfig.flag} ${selectedCountryConfig.name}` : "Select Country";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Scale className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">BiasMapper Dashboard</h1>
                <p className="text-slate-400 text-sm">
                  {autoOperating ? "Analyzing outlets..." : "Analysis Dashboard"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {lmStudioStatus?.isConnected && (
                <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold px-3 py-1">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                  LM-Studio Active
                </Badge>
              )}
              {lastUpdateTime && (
                <Badge variant="outline" className="bg-slate-800/80 border-slate-700 text-slate-300 px-3 py-1 font-medium">
                  <Clock className="h-3.5 w-3.5 mr-2 text-blue-400" />
                  {lastUpdateTime}
                </Badge>
              )}
              <Button onClick={handleExportPDF} size="sm" variant="outline" className="bg-slate-800 border-slate-600 text-slate-300 hover:text-white">
                <FileDown className="h-3.5 w-3.5 mr-1.5" />PDF
              </Button>
              <Button onClick={handleExportJSON} size="sm" variant="outline" className="bg-slate-800 border-slate-600 text-slate-300 hover:text-white">
                <FileDown className="h-3.5 w-3.5 mr-1.5" />JSON
              </Button>
              <Button onClick={handleImportJSON} size="sm" variant="outline" className="bg-slate-800 border-slate-600 text-slate-300 hover:text-white">
                <Upload className="h-3.5 w-3.5 mr-1.5" />Import
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
                  <Link href="/settings"><Zap className="h-3 w-3 mr-2" />Configure API</Link>
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
                className="h-full bg-gradient-to-r from-amber-600 via-orange-500 to-amber-400 transition-all duration-700 ease-in-out"
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
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 w-full font-bold shadow-lg transition-all active:scale-95"
                  >
                    {autoOperating ? (
                      <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Processing...</>
                    ) : (
                      <><Play className="h-4 w-4 mr-2" />Initiate Analysis</>
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

              {/* Country Selector */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-400">Region:</span>
                </div>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code} className="text-white hover:bg-slate-700">
                        {country.flag} {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
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

              <div className="flex gap-4 text-sm text-slate-400">
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

        {/* Quick Stats - Now Clickable! */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* International Card */}
          <Card 
            className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50 hover:border-blue-500/50 cursor-pointer transition-all hover:scale-[1.02] group"
            onClick={() => openStatDialog('international')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Globe className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-blue-300 text-xs uppercase tracking-wider">International</p>
                    <p className="text-2xl font-bold text-white">{liveInternational.length}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-blue-400/60 mt-3">Click to view outlets</p>
            </CardContent>
          </Card>

          {/* Selected Country Card */}
          <Card 
            className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700/50 hover:border-green-500/50 cursor-pointer transition-all hover:scale-[1.02] group"
            onClick={() => openStatDialog('country')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <Newspaper className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-green-300 text-xs uppercase tracking-wider">{selectedCountryConfig?.flag || '🌍'} {selectedCountryConfig?.name || 'Country'}</p>
                    <p className="text-2xl font-bold text-white">{liveCountry.length}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-green-400/60 mt-3">Click to view outlets</p>
            </CardContent>
          </Card>

          {/* Narratives Card */}
          <Card 
            className="bg-gradient-to-br from-amber-900/50 to-amber-800/30 border-amber-700/50 hover:border-amber-500/50 cursor-pointer transition-all hover:scale-[1.02] group"
            onClick={() => openStatDialog('narratives')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <TrendingUp className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-amber-300 text-xs uppercase tracking-wider">Narratives</p>
                    <p className="text-2xl font-bold text-white">{liveNarratives.narratives.length}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-amber-400/60 mt-3">Click to view narratives</p>
            </CardContent>
          </Card>

          {/* Trending Card */}
          <Card 
            className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50 hover:border-purple-500/50 cursor-pointer transition-all hover:scale-[1.02] group"
            onClick={() => openStatDialog('trending')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <BarChart3 className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-purple-300 text-xs uppercase tracking-wider">Trending</p>
                    <p className="text-2xl font-bold text-white">{liveNarratives.trending_topics.length}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-purple-400/60 mt-3">Click to view topics</p>
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
              livePakistan={liveCountry}
              liveNarratives={liveNarratives}
              chartConfig={chartConfig}
              prepareDistributionData={prepareDistributionData}
              biasColors={biasColors}
              history={AnalysisResultsDB.getRecent(100).filter(a => a.source !== "Manual Input")}
              onSelectHistory={(a) => setSelectedHistoricalAnalysis(a)}
              countryConfig={selectedCountryConfig}
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

      {/* Forensic Report Dialog for Historical Audits */}
      <Dialog open={!!selectedHistoricalAnalysis} onOpenChange={(open) => !open && setSelectedHistoricalAnalysis(null)}>
        <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] bg-slate-950 border-slate-800 text-white overflow-hidden p-0">
          <DialogHeader className="p-4 sm:p-6 border-b border-slate-800 bg-slate-900/50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
                  Forensic Audit Report
                </DialogTitle>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Source: <span className="text-purple-400 font-bold">{selectedHistoricalAnalysis?.source}</span> • 
                  Audited: {selectedHistoricalAnalysis && new Date(selectedHistoricalAnalysis.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </DialogHeader>
          <ScrollArea className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 max-h-[calc(90vh-100px)]">
            {selectedHistoricalAnalysis && (
              <AnalyzeResultDisplay result={selectedHistoricalAnalysis} />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Stat Card Dialogs */}
      {/* International Outlets Dialog */}
      <Dialog open={statDialogOpen === 'international'} onOpenChange={(open) => !open && setStatDialogOpen(null)}>
        <DialogContent className="max-w-3xl w-[95vw] max-h-[85vh] bg-slate-950 border-slate-800 text-white overflow-hidden p-0">
          <DialogHeader className="p-4 sm:p-6 border-b border-slate-800 bg-slate-900/50">
            <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
              International Outlets ({liveInternational.length})
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="p-4 sm:p-6 max-h-[60vh]">
            <div className="space-y-4">
              {liveInternational.map((outlet) => (
                <Card key={outlet.outlet} className="bg-slate-900/50 border-slate-800">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-white mb-1">{outlet.outlet}</h4>
                        <p className="text-sm text-slate-400">{outlet.analysis}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {outlet.key_themes?.map((theme: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs border-slate-700 text-slate-400">
                              {theme}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                        <div className="flex gap-1">
                          <Badge style={{ backgroundColor: biasColors[outlet.dominant_bias] }} className="text-white font-bold">
                            {outlet.dominant_bias}
                          </Badge>
                          <Badge variant="outline" style={{ borderColor: biasColors[outlet.secondary_bias], color: biasColors[outlet.secondary_bias] }}>
                            {outlet.secondary_bias}
                          </Badge>
                        </div>
                        <span className="text-xs text-slate-500">{Math.round(outlet.confidence * 100)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Country Outlets Dialog */}
      <Dialog open={statDialogOpen === 'country'} onOpenChange={(open) => !open && setStatDialogOpen(null)}>
        <DialogContent className="max-w-3xl w-[95vw] max-h-[85vh] bg-slate-950 border-slate-800 text-white overflow-hidden p-0">
          <DialogHeader className="p-4 sm:p-6 border-b border-slate-800 bg-slate-900/50">
            <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <Newspaper className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
              {selectedCountryConfig?.flag} {selectedCountryConfig?.name} Outlets ({liveCountry.length})
            </DialogTitle>
            <p className="text-xs text-slate-500 mt-1">{selectedCountryConfig?.description}</p>
          </DialogHeader>
          <ScrollArea className="p-4 sm:p-6 max-h-[60vh]">
            <div className="space-y-4">
              {liveCountry.map((outlet: any) => (
                <Card key={outlet.outlet} className="bg-slate-900/50 border-slate-800">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-white mb-1">{outlet.outlet}</h4>
                        <p className="text-sm text-slate-400">{outlet.analysis}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {outlet.key_themes?.map((theme: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs border-slate-700 text-slate-400">
                              {theme}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                        <div className="flex gap-1">
                          <Badge style={{ backgroundColor: biasColors[outlet.dominant_bias] }} className="text-white font-bold">
                            {outlet.dominant_bias}
                          </Badge>
                          <Badge variant="outline" style={{ borderColor: biasColors[outlet.secondary_bias], color: biasColors[outlet.secondary_bias] }}>
                            {outlet.secondary_bias}
                          </Badge>
                        </div>
                        <span className="text-xs text-slate-500">{Math.round(outlet.confidence * 100)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Narratives Dialog */}
      <Dialog open={statDialogOpen === 'narratives'} onOpenChange={(open) => !open && setStatDialogOpen(null)}>
        <DialogContent className="max-w-3xl w-[95vw] max-h-[85vh] bg-slate-950 border-slate-800 text-white overflow-hidden p-0">
          <DialogHeader className="p-4 sm:p-6 border-b border-slate-800 bg-slate-900/50">
            <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500" />
              Detected Narratives ({liveNarratives.narratives.length})
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="p-4 sm:p-6 max-h-[60vh]">
            <div className="space-y-4">
              {liveNarratives.narratives.map((narrative: any, index: number) => (
                <Card key={index} className="bg-slate-900/50 border-slate-800">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-3">
                      <h4 className="font-bold text-white">{narrative.title}</h4>
                      <Badge variant={narrative.intensity === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                        {narrative.intensity}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">{narrative.description}</p>
                    <div className="grid grid-cols-2 gap-4 p-3 bg-slate-950/50 rounded-lg">
                      <div>
                        <p className="text-xs text-slate-500 uppercase mb-1">Promoted by</p>
                        <Badge style={{ backgroundColor: biasColors[narrative.promoted_by] || '#64748b' }} className="text-white text-xs">
                          {narrative.promoted_by}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase mb-1">Opposed by</p>
                        <Badge variant="outline" style={{ borderColor: biasColors[narrative.opposed_by] || '#64748b', color: biasColors[narrative.opposed_by] || '#94a3b8' }} className="text-xs">
                          {narrative.opposed_by}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Trending Topics Dialog */}
      <Dialog open={statDialogOpen === 'trending'} onOpenChange={(open) => !open && setStatDialogOpen(null)}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[85vh] bg-slate-950 border-slate-800 text-white overflow-hidden p-0">
          <DialogHeader className="p-4 sm:p-6 border-b border-slate-800 bg-slate-900/50">
            <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
              Trending Topics ({liveNarratives.trending_topics.length})
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="p-4 sm:p-6 max-h-[60vh]">
            <div className="space-y-3">
              {liveNarratives.trending_topics.map((topic: string, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-purple-500/50 transition-colors">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 font-bold text-sm">
                    {index + 1}
                  </span>
                  <span className="text-white font-medium">{topic}</span>
                </div>
              ))}
            </div>
            {liveNarratives.bias_tensions && (
              <div className="mt-6 p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                <p className="text-xs text-slate-500 uppercase mb-2">Bias Tensions</p>
                <p className="text-sm text-slate-300">{liveNarratives.bias_tensions}</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
