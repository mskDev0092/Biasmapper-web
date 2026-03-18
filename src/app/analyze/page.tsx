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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  PieChart,
  Pie,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  Globe,
  Newspaper,
  TrendingUp,
  Activity,
  Scale,
  ArrowLeftRight,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Settings,
  Search,
  ArrowRight,
  Zap,
  Twitter,
  FileText,
  Link2,
  Clock,
  RotateCcw,
} from "lucide-react";
import { isAPIConfigured, getAPIConfig } from "@/lib/api-config";
import {
  analyzeTextBias,
  analyzeNarratives,
  analyzeMultipleOutlets,
  debiasText,
  generateWithBias,
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
import { AnalyzeTab } from "@/components/analyze/AnalyzeTab";
import { DebiasTab } from "@/components/analyze/DebiasTab";
import { GenerateTab } from "@/components/analyze/GenerateTab";

// Bias color mapping
const biasColors: Record<string, string> = {
  "L++": "#dc2626",
  "L+": "#f87171",
  L: "#fca5a5",
  C: "#6b7280",
  R: "#86efac",
  "R+": "#4ade80",
  "R++": "#16a34a",
  "T++": "#7c3aed",
  "T+": "#a78bfa",
  T: "#c4b5fd",
  B: "#fbbf24",
  "B+": "#f59e0b",
  "B++": "#d97706",
};

const biasLabels: Record<string, string> = {
  "L++": "Far Left",
  "L+": "Progressive",
  L: "Left",
  C: "Center",
  R: "Right",
  "R+": "Conservative",
  "R++": "Far Right",
  "T++": "Est. Extreme",
  "T+": "Mainstream",
  T: "Establishment",
  B: "Oppositional",
  "B+": "Grassroots",
  "B++": "Radical",
};

// Static pre-analyzed data (from previous analysis)
const STATIC_INTERNATIONAL = [
  {
    outlet: "CNN",
    dominant_bias: "T+",
    secondary_bias: "L+",
    confidence: 0.75,
    analysis: "Mainstream outlet with progressive leanings on social issues",
    key_themes: ["political news", "international affairs", "social justice"],
    narrative_tone: "Institutional with progressive framing",
  },
  {
    outlet: "BBC",
    dominant_bias: "T+",
    secondary_bias: "C",
    confidence: 0.8,
    analysis: "Establishment-aligned with balanced coverage approach",
    key_themes: ["world news", "politics", "culture"],
    narrative_tone: "Authoritative and measured",
  },
  {
    outlet: "Fox News",
    dominant_bias: "R++",
    secondary_bias: "T+",
    confidence: 0.85,
    analysis:
      "Strong conservative bias within mainstream institutional context",
    key_themes: [
      "conservative politics",
      "national security",
      "traditional values",
    ],
    narrative_tone: "Confrontational and partisan",
  },
  {
    outlet: "MSNBC",
    dominant_bias: "L++",
    secondary_bias: "T+",
    confidence: 0.8,
    analysis: "Strong progressive stance on social and economic issues",
    key_themes: [
      "progressive politics",
      "social justice",
      "environmental issues",
    ],
    narrative_tone: "Advocacy-oriented progressive",
  },
  {
    outlet: "Al Jazeera",
    dominant_bias: "B+",
    secondary_bias: "L+",
    confidence: 0.75,
    analysis: "Grassroots perspectives with focus on Global South",
    key_themes: ["Middle East", "Global South", "human rights"],
    narrative_tone: "Anti-establishment, pro-diplomatic",
  },
  {
    outlet: "The Guardian",
    dominant_bias: "L+",
    secondary_bias: "B+",
    confidence: 0.8,
    analysis: "Progressive outlook amplifying marginalized perspectives",
    key_themes: ["social justice", "environment", "human rights"],
    narrative_tone: "Liberal advocacy journalism",
  },
  {
    outlet: "Reuters",
    dominant_bias: "C",
    secondary_bias: "T+",
    confidence: 0.85,
    analysis: "Wire service focused on factual business reporting",
    key_themes: ["markets", "business", "economics"],
    narrative_tone: "Neutral, fact-based",
  },
  {
    outlet: "Breitbart",
    dominant_bias: "R++",
    secondary_bias: "B+",
    confidence: 0.9,
    analysis: "Far-right oppositional outlet challenging establishment",
    key_themes: ["anti-establishment", "conservative values", "nationalism"],
    narrative_tone: "Aggressive oppositional",
  },
];

const STATIC_PAKISTAN = [
  {
    outlet: "Geo News",
    dominant_bias: "T+",
    secondary_bias: "C",
    confidence: 0.7,
    analysis:
      "Mainstream Pakistani outlet with centrist institutional alignment",
    key_themes: ["Pakistan politics", "regional security", "economy"],
    narrative_tone: "Mainstream institutional",
  },
  {
    outlet: "ARY News",
    dominant_bias: "R+",
    secondary_bias: "B+",
    confidence: 0.7,
    analysis: "Conservative leanings with oppositional stance on government",
    key_themes: [
      "political opposition",
      "national security",
      "conservative values",
    ],
    narrative_tone: "Oppositional conservative",
  },
  {
    outlet: "Dawn",
    dominant_bias: "C",
    secondary_bias: "L+",
    confidence: 0.75,
    analysis: "Balanced English-language outlet with progressive social views",
    key_themes: ["democracy", "human rights", "governance"],
    narrative_tone: "Analytical and measured",
  },
  {
    outlet: "Express News",
    dominant_bias: "C",
    secondary_bias: "T+",
    confidence: 0.7,
    analysis: "Centrist mainstream outlet covering national affairs",
    key_themes: ["national news", "politics", "current affairs"],
    narrative_tone: "Balanced mainstream",
  },
  {
    outlet: "Samaa News",
    dominant_bias: "T+",
    secondary_bias: "C",
    confidence: 0.7,
    analysis: "Mainstream balanced coverage with institutional alignment",
    key_themes: ["current affairs", "social issues", "politics"],
    narrative_tone: "Moderate institutional",
  },
  {
    outlet: "Dunya News",
    dominant_bias: "T+",
    secondary_bias: "R+",
    confidence: 0.65,
    analysis: "Mainstream outlet with slight conservative leanings",
    key_themes: ["talk shows", "political debate", "current affairs"],
    narrative_tone: "Conversational mainstream",
  },
  {
    outlet: "Hum News",
    dominant_bias: "L+",
    secondary_bias: "B+",
    confidence: 0.65,
    analysis: "Progressive focus on social issues and grassroots perspectives",
    key_themes: ["social issues", "women rights", "youth"],
    narrative_tone: "Progressive advocacy",
  },
];

const STATIC_NARRATIVES = {
  narratives: [
    {
      title: "Iran Conflict Framing",
      description:
        "Coverage varies from defensive necessity to aggressive militarism",
      promoted_by: "R++",
      opposed_by: "B++",
      intensity: "high",
    },
    {
      title: "Economic Impact Narrative",
      description: "Focus on economic consequences of geopolitical tensions",
      promoted_by: "T+",
      opposed_by: "B+",
      intensity: "medium",
    },
    {
      title: "Government Accountability",
      description: "Scrutiny of government decisions and policies",
      promoted_by: "B+",
      opposed_by: "T+",
      intensity: "medium",
    },
    {
      title: "National Security Emphasis",
      description: "Focus on security threats and defense priorities",
      promoted_by: "R+",
      opposed_by: "L+",
      intensity: "high",
    },
    {
      title: "Humanitarian Concerns",
      description: "Highlighting civilian impact and humanitarian crises",
      promoted_by: "L+",
      opposed_by: "R++",
      intensity: "medium",
    },
  ],
  trending_topics: [
    "Iran Conflict",
    "Oil Prices",
    "Regional Security",
    "Economic Crisis",
    "Diplomatic Relations",
  ],
  bias_tensions:
    "Significant tension between establishment (T+) and oppositional (B+) narratives, with clear ideological divide between progressive (L) and conservative (R) framing of events",
};

export default function AnalyzePage() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [lmStudioStatus, setLmStudioStatus] =
    useState<LMStudioConnectionStatus | null>(null);
  const [autoConnecting, setAutoConnecting] = useState(true);
  const [autoOperating, setAutoOperating] = useState(false);

  // Custom analysis state
  const [customText, setCustomText] = useState("");
  const [customResult, setCustomResult] = useState<BiasAnalysis | null>(null);

  // Live data state
  const [liveInternational, setLiveInternational] =
    useState(STATIC_INTERNATIONAL);
  const [livePakistan, setLivePakistan] = useState(STATIC_PAKISTAN);
  const [liveNarratives, setLiveNarratives] = useState(STATIC_NARRATIVES);

  // Debias state
  const [debiasText_input, setDebiasText_input] = useState("");
  const [debiasResult, setDebiasResult] = useState<{
    original_bias: string;
    neutralized_text: string;
    changes_made: string[];
  } | null>(null);

  // Generate state
  const [generateTopic, setGenerateTopic] = useState("");
  const [generateBias, setGenerateBias] = useState("C");
  const [generatedText, setGeneratedText] = useState("");

  // Auto-refresh state
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(600); // 10 minutes default (more reasonable)
  const [countdownTimer, setCountdownTimer] = useState(600);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0); // Track refresh cycles for outlet rotation

  // Auto-connect to LM-Studio on mount and fetch real data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("Attempting auto-connect to LM-Studio...");

        // First, try to load from localStorage
        const storedData = loadAnalysisData();
        if (storedData) {
          console.log("✅ Loaded analysis data from localStorage");
          setLiveInternational(storedData.international);
          setLivePakistan(storedData.pakistan);
          setLiveNarratives(storedData.narratives);
          setLastUpdateTime(getTimeSinceUpdate());
        }

        // Try auto-connect
        const status = await autoConnectLMStudio();
        setLmStudioStatus(status);

        if (status.isConnected) {
          console.log("✅ LM-Studio connected successfully:", status.endpoint);
          setIsConfigured(true);

          // Auto-fetch real data when connected
          setAutoOperating(true);
          await autoFetchOutletData();
        } else {
          console.log("⚠️ LM-Studio not available, using static data");
          // Check if other API is configured
          if (isAPIConfigured()) {
            setIsConfigured(true);
          }
        }
      } catch (error) {
        console.error("Auto-connect error:", error);
      } finally {
        setAutoConnecting(false);
      }
    };

    initializeApp();
  }, []);

  // Auto-refresh timer effect
  useEffect(() => {
    if (!isAutoRefreshEnabled) return;

    const interval = setInterval(() => {
      setCountdownTimer((prev) => {
        if (prev <= 1) {
          // Time to refresh
          setAutoOperating(true);
          autoFetchOutletData().finally(() => setAutoOperating(false));
          return autoRefreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAutoRefreshEnabled, autoRefreshInterval]);

  // Update countdown when interval changes
  useEffect(() => {
    setCountdownTimer(autoRefreshInterval);
  }, [autoRefreshInterval]);

  // Auto-fetch outlet data with rate limiting and outlet rotation
  const autoFetchOutletData = async () => {
    try {
      const allInternationalOutlets = [
        "CNN",
        "BBC",
        "Reuters",
        "Guardian",
        "Al Jazeera",
        "Fox",
        "MSNBC",
      ];
      const allPakistaniOutlets = [
        "Dawn",
        "Express",
        "Samaa",
        "Dunya",
        "Hum",
        "ARY",
        "Geo",
        "Pakistan Today",
      ];

      // Rotate outlets to limit concurrent requests
      const internationalOutlets = rotateOutlets(
        allInternationalOutlets,
        refreshCount,
      );
      const pakistaniOutlets = rotateOutlets(allPakistaniOutlets, refreshCount);

      console.log(
        `📊 Refresh cycle ${refreshCount}: Fetching ${internationalOutlets.length} intl + ${pakistaniOutlets.length} pk outlets`,
      );

      // Fetch international outlet data
      let intlAnalysis = liveInternational;
      const intlData = await fetchAllOutletData(internationalOutlets);
      if (intlData.length > 0) {
        console.log(`Fetched ${intlData.length} international outlets`);

        // Auto-analyze international outlets
        try {
          const newIntlAnalysis = await analyzeMultipleOutlets(intlData);
          intlAnalysis = liveInternational.map(
            (o) => newIntlAnalysis.find((n) => n.outlet === o.outlet) || o
          );
          setLiveInternational(intlAnalysis);
          console.log("International outlets analyzed:", intlAnalysis);
        } catch (error) {
          console.error("Failed to analyze international outlets:", error);
        }
      }

      // Fetch Pakistani outlet data
      let pkAnalysis = livePakistan;
      const pkData = await fetchAllOutletData(pakistaniOutlets);
      if (pkData.length > 0) {
        console.log(`Fetched ${pkData.length} Pakistani outlets`);

        // Auto-analyze Pakistani outlets
        try {
          const newPkAnalysis = await analyzeMultipleOutlets(pkData);
          pkAnalysis = livePakistan.map(
            (o) => newPkAnalysis.find((n) => n.outlet === o.outlet) || o
          );
          setLivePakistan(pkAnalysis);
          console.log("Pakistani outlets analyzed:", pkAnalysis);
        } catch (error) {
          console.error("Failed to analyze Pakistani outlets:", error);
        }
      }

      // Auto-analyze narratives using the newly fetched analyses
      let finalNarratives = liveNarratives;
      if (intlAnalysis.length > 0 || pkAnalysis.length > 0) {
        try {
          const allAnalyses = [...intlAnalysis, ...pkAnalysis];
          const narratives = await analyzeNarratives(
            allAnalyses.map((a) => ({
              outlet: a.outlet,
              dominant_bias: a.dominant_bias,
            })),
          );
          setLiveNarratives(narratives);
          finalNarratives = narratives;
          console.log("Narratives analyzed:", narratives);
        } catch (error) {
          console.error("Failed to analyze narratives:", error);
        }
      }

      // Save to localStorage after successful fetch and analysis
      saveAnalysisData({
        international: intlAnalysis,
        pakistan: pkAnalysis,
        narratives: finalNarratives,
      });

      // Update last update time
      setLastUpdateTime(getTimeSinceUpdate());

      // Increment refresh count for next rotation
      setRefreshCount((prev) => prev + 1);

      console.log("✅ Data saved to localStorage");
    } catch (error) {
      console.error("Auto-fetch outlet data error:", error);
    } finally {
      setAutoOperating(false);
    }
  };

  // Retry connection
  const handleRetryConnection = async () => {
    setAutoConnecting(true);
    try {
      const status = await checkLMStudioStatus();
      setLmStudioStatus(status);

      if (status.isConnected) {
        setIsConfigured(true);
        setAutoOperating(true);
        await autoFetchOutletData();
      }
    } finally {
      setAutoConnecting(false);
    }
  };

  // Chart config
  const chartConfig: ChartConfig = {
    count: { label: "Outlets" },
    ...Object.fromEntries(
      Object.entries(biasColors).map(([key, color]) => [
        key,
        { label: biasLabels[key] || key, color },
      ]),
    ),
  };

  // Prepare distribution data
  const prepareDistributionData = (outlets: typeof STATIC_INTERNATIONAL) => {
    const distribution: Record<string, number> = {};
    outlets.forEach((o) => {
      distribution[o.dominant_bias] = (distribution[o.dominant_bias] || 0) + 1;
    });
    return Object.entries(distribution)
      .filter(([_, count]) => count > 0)
      .map(([bias, count]) => ({
        bias,
        count,
        fill: biasColors[bias] || "#8884d8",
      }));
  };

  // Prepare radar data
  const prepareRadarData = (outlets: typeof STATIC_INTERNATIONAL) => {
    return [
      {
        dimension: "Left",
        value: outlets.filter((o) => o.dominant_bias.startsWith("L")).length,
        fullMark: outlets.length,
      },
      {
        dimension: "Right",
        value: outlets.filter((o) => o.dominant_bias.startsWith("R")).length,
        fullMark: outlets.length,
      },
      {
        dimension: "Center",
        value: outlets.filter((o) => o.dominant_bias === "C").length,
        fullMark: outlets.length,
      },
      {
        dimension: "Establishment",
        value: outlets.filter((o) => o.dominant_bias.startsWith("T")).length,
        fullMark: outlets.length,
      },
      {
        dimension: "Opposition",
        value: outlets.filter((o) => o.dominant_bias.startsWith("B")).length,
        fullMark: outlets.length,
      },
    ];
  };

  // Custom text analysis
  const handleCustomAnalysis = async () => {
    if (!customText.trim() || !isConfigured) return;

    setAnalyzing(true);
    try {
      const result = await analyzeTextBias(customText);
      setCustomResult(result);
    } catch (error: any) {
      console.error("Analysis error:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  // Debias text
  const handleDebias = async () => {
    if (!debiasText_input.trim() || !isConfigured) return;

    setAnalyzing(true);
    try {
      const result = await debiasText(debiasText_input);
      setDebiasResult(result);
    } catch (error: any) {
      console.error("Debias error:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  // Generate with bias
  const handleGenerate = async () => {
    if (!generateTopic.trim() || !isConfigured) return;

    setAnalyzing(true);
    try {
      const result = await generateWithBias(generateTopic, generateBias);
      setGeneratedText(result);
    } catch (error: any) {
      console.error("Generate error:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Scale className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  BiasMapper Analysis
                </h1>
                <p className="text-slate-400 text-sm">
                  {autoConnecting
                    ? "Connecting to LM-Studio..."
                    : autoOperating
                      ? "Auto-analyzing outlets..."
                      : "Live & Static Analysis Dashboard"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {autoConnecting && (
                <Badge
                  variant="outline"
                  className="bg-blue-900/20 border-blue-700 text-blue-400 animate-pulse"
                >
                  <Zap className="h-3 w-3 mr-1 animate-spin" />
                  Auto-connecting...
                </Badge>
              )}
              {autoOperating && (
                <Badge
                  variant="outline"
                  className="bg-amber-900/20 border-amber-700 text-amber-400 animate-pulse"
                >
                  <Activity className="h-3 w-3 mr-1 animate-spin" />
                  Auto-operating...
                </Badge>
              )}
              {lmStudioStatus?.isConnected && !autoConnecting && (
                <Badge
                  variant="outline"
                  className="bg-green-900/20 border-green-700 text-green-400"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  LM-Studio Ready
                </Badge>
              )}
              {!isConfigured && !autoConnecting && (
                <Badge variant="destructive" className="animate-pulse">
                  <Settings className="h-3 w-3 mr-1" />
                  API Required
                </Badge>
              )}
              {/* Last Updated Display */}
              {lastUpdateTime && (
                <Badge variant="outline" className="text-slate-400">
                  <Clock className="h-3 w-3 mr-1" />
                  {lastUpdateTime}
                </Badge>
              )}
              {/* Manual Refresh Button */}
              <Button
                onClick={async () => {
                  setAutoOperating(true);
                  await autoFetchOutletData();
                }}
                disabled={autoOperating || autoConnecting}
                variant="outline"
                size="sm"
                className="bg-slate-800 border-slate-600 hover:bg-slate-700"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${autoOperating ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="bg-slate-800 border-slate-600"
              >
                <Link href="/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Connection Status */}
        {!isConfigured && !autoConnecting && (
          <Alert className="bg-amber-900/20 border-amber-700">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-400">
              No AI Service Connected
            </AlertTitle>
            <AlertDescription className="text-slate-400">
              <p className="mb-2">
                Showing static pre-analyzed data. To enable live analysis:
              </p>
              <div className="space-y-2 ml-2">
                <p>
                  1. Start{" "}
                  <span className="font-mono bg-slate-800 px-2 py-1 rounded">
                    LM-Studio
                  </span>{" "}
                  locally (port 8000)
                </p>
                <p className="text-sm text-slate-400">
                  OR configure a cloud API in{" "}
                  <Link
                    href="/settings"
                    className="text-blue-400 hover:underline"
                  >
                    Settings
                  </Link>
                </p>
                <Button
                  onClick={handleRetryConnection}
                  size="sm"
                  variant="outline"
                  className="mt-3 border-amber-600 text-amber-400 hover:bg-amber-900/20"
                >
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Retry Connection
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {lmStudioStatus?.error && isConfigured && (
          <Alert className="bg-amber-900/20 border-amber-700">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-400">
              Connection Status
            </AlertTitle>
            <AlertDescription className="text-slate-300">
              {lmStudioStatus.error}
              <Button
                onClick={handleRetryConnection}
                size="sm"
                variant="outline"
                className="ml-4 border-amber-600 text-amber-400 hover:bg-amber-900/20"
              >
                <RefreshCw className="h-3 w-3 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Auto-Refresh Controls */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-400" />
              Auto-Refresh Settings
            </CardTitle>
            <CardDescription className="text-slate-400">
              Configure automatic data refresh intervals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAutoRefreshEnabled}
                  onChange={(e) => setIsAutoRefreshEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-900"
                />
                <span className="text-slate-300">Enable Auto-Refresh</span>
              </label>
            </div>

            {isAutoRefreshEnabled && (
              <div className="space-y-3 bg-slate-900/50 p-4 rounded border border-slate-700">
                <div className="flex items-center gap-4">
                  <label className="text-slate-300 text-sm min-w-fit">
                    Refresh Interval (seconds):
                  </label>
                  <input
                    type="number"
                    min={RATE_LIMIT_CONFIG.MIN_AUTO_REFRESH}
                    max="3600"
                    step="60"
                    value={autoRefreshInterval}
                    onChange={(e) =>
                      setAutoRefreshInterval(
                        Math.max(
                          RATE_LIMIT_CONFIG.MIN_AUTO_REFRESH,
                          parseInt(e.target.value) ||
                            RATE_LIMIT_CONFIG.MIN_AUTO_REFRESH,
                        ),
                      )
                    }
                    className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm w-24"
                  />
                  <span className="text-slate-400 text-sm">
                    ({Math.floor(autoRefreshInterval / 60)}m{" "}
                    {autoRefreshInterval % 60}s)
                  </span>
                  <span className="text-slate-500 text-xs">
                    (min: {Math.floor(RATE_LIMIT_CONFIG.MIN_AUTO_REFRESH / 60)}
                    m)
                  </span>
                </div>

                <div className="flex items-center gap-4 bg-slate-800 p-3 rounded border border-slate-600">
                  <RotateCcw className="h-5 w-5 text-purple-400" />
                  <div className="flex-1">
                    <p className="text-slate-300 font-medium">Next Refresh</p>
                    <p className="text-sm text-slate-400">
                      in {Math.floor(countdownTimer / 60)}m{" "}
                      {countdownTimer % 60}s
                    </p>
                  </div>
                  {autoOperating && (
                    <Badge className="bg-amber-900/50 text-amber-300">
                      <Activity className="h-3 w-3 mr-1 animate-spin" />
                      Refreshing...
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Globe className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="text-blue-300 text-sm">International Outlets</p>
                  <p className="text-3xl font-bold text-white">
                    {liveInternational.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Newspaper className="h-8 w-8 text-green-400" />
                <div>
                  <p className="text-green-300 text-sm">Pakistan Outlets</p>
                  <p className="text-3xl font-bold text-white">
                    {livePakistan.length}
                  </p>
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
                  <p className="text-3xl font-bold text-white">
                    {liveNarratives.narratives.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-purple-400" />
                <div>
                  <p className="text-purple-300 text-sm">Trending Topics</p>
                  <p className="text-3xl font-bold text-white">
                    {liveNarratives.trending_topics.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-blue-600"
            >
              <Activity className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="analyze"
              className="data-[state=active]:bg-amber-600"
            >
              <Search className="h-4 w-4 mr-2" />
              Analyze Text
            </TabsTrigger>
            <TabsTrigger
              value="debias"
              className="data-[state=active]:bg-green-600"
            >
              <ArrowLeftRight className="h-4 w-4 mr-2" />
              Debias
            </TabsTrigger>
            <TabsTrigger
              value="generate"
              className="data-[state=active]:bg-purple-600"
            >
              <Zap className="h-4 w-4 mr-2" />
              Generate
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

          {/* Analyze Tab */}
          <TabsContent value="analyze" className="space-y-6">
            <AnalyzeTab
              customText={customText}
              setCustomText={setCustomText}
              analyzing={analyzing}
              isConfigured={isConfigured}
              handleCustomAnalysis={handleCustomAnalysis}
              customResult={customResult}
              biasColors={biasColors}
            />
          </TabsContent>

          {/* Debias Tab */}
          <TabsContent value="debias" className="space-y-6">
            <DebiasTab
              debiasText_input={debiasText_input}
              setDebiasText_input={setDebiasText_input}
              analyzing={analyzing}
              isConfigured={isConfigured}
              handleDebias={handleDebias}
              debiasResult={debiasResult}
              biasColors={biasColors}
            />
          </TabsContent>

          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-6">
            <GenerateTab
              generateTopic={generateTopic}
              setGenerateTopic={setGenerateTopic}
              generateBias={generateBias}
              setGenerateBias={setGenerateBias}
              analyzing={analyzing}
              isConfigured={isConfigured}
              handleGenerate={handleGenerate}
              generatedText={generatedText}
              biasColors={biasColors}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
