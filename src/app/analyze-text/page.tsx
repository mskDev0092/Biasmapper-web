"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  RefreshCw,
  ArrowLeftRight,
  AlertTriangle,
  Brain,
  FileDown,
  CheckCircle2,
  Zap,
  History,
  Activity,
  Share2,
  Target,
  Play,
} from "lucide-react";
import { isAPIConfigured } from "@/lib/api-config";
import { analyzeTextBias, debiasText, type BiasAnalysis } from "@/lib/api-service";
import { AnalysisResultsDB, type AnalysisResult } from "@/lib/local-db";
import { exportAnalysesToCSV, exportToPDF } from "@/lib/export-utils";
import { ThinkingProcess } from "@/components/analyze/ThinkingProcess";

const biasColors: Record<string, string> = {
  "L++": "#dc2626", "L+": "#f87171", L: "#fca5a5",
  C: "#6b7280",
  R: "#86efac", "R+": "#4ade80", "R++": "#16a34a",
  "T++": "#7c3aed", "T+": "#a78bfa", T: "#c4b5fd",
  B: "#fbbf24", "B+": "#f59e0b", "B++": "#d97706",
};

import { AnalyzeResultDisplay } from "@/components/analyze/AnalyzeResultDisplay";

export default function AnalyzeTextPage() {
  const [customText, setCustomText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [debiasing, setDebiasing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [debiasResult, setDebiasResult] = useState<{
    original_bias: string;
    neutralized_text: string;
    changes_made: string[];
  } | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const isConfigured = isAPIConfigured();

  // Load state from localStorage on mount
  useEffect(() => {
    const savedText = localStorage.getItem("analyze_text_input");
    const savedResult = localStorage.getItem("analyze_text_result");
    const savedDebias = localStorage.getItem("analyze_text_debias");

    if (savedText) setCustomText(savedText);
    if (savedResult) {
      try {
        setResult(JSON.parse(savedResult));
      } catch (e) {
        console.error("Error parsing saved analysis result", e);
      }
    }
    if (savedDebias) {
      try {
        setDebiasResult(JSON.parse(savedDebias));
      } catch (e) {
        console.error("Error parsing saved debias result", e);
      }
    }

    // Load history
    setHistory(AnalysisResultsDB.getRecent(100).filter(a => a.source === "Manual Input"));
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
    localStorage.setItem("analyze_text_input", customText);
  }, [customText]);

  useEffect(() => {
    if (result) {
      localStorage.setItem("analyze_text_result", JSON.stringify(result));
    } else {
      localStorage.removeItem("analyze_text_result");
    }
  }, [result]);

  useEffect(() => {
    if (debiasResult) {
      localStorage.setItem("analyze_text_debias", JSON.stringify(debiasResult));
    } else {
      localStorage.removeItem("analyze_text_debias");
    }
  }, [debiasResult]);

  const handleAnalyze = async () => {
    if (!customText.trim() || !isConfigured) return;
    setAnalyzing(true);
    setResult(null);
    setDebiasResult(null);
    try {
      const biasResult = await analyzeTextBias(customText);
      const stored = AnalysisResultsDB.create({
        articleId: null,
        source: "Manual Input",
        inputText: customText,
        dominantBias: biasResult.dominant_bias,
        secondaryBias: biasResult.secondary_bias,
        confidence: biasResult.confidence,
        analysis: biasResult.analysis,
        keyThemes: biasResult.key_themes,
        narrativeTone: biasResult.narrative_tone,
        cognitiveBiases: biasResult.cognitive_biases || [],
        logicalFallacies: biasResult.logical_fallacies || [],
        psychologicalIndicators: biasResult.psychological_indicators || [],
        sociologicalIndicators: biasResult.sociological_indicators || [],
        premises: biasResult.premises || [],
        conclusions: biasResult.conclusions || [],
      });
      setResult(stored);
      // Refresh history immediately
      setHistory(prev => [stored, ...prev]);
    } catch (e: any) {
      console.error("Analysis error:", e);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDebias = async () => {
    if (!customText.trim() || !isConfigured) return;
    setDebiasing(true);
    try {
      const res = await debiasText(customText);
      setDebiasResult(res);
    } catch (e: any) {
      console.error("Debias error:", e);
    } finally {
      setDebiasing(false);
    }
  };

  const handleExportPDF = () => {
    if (!result) return;
    exportToPDF({ analyses: [result], title: "BiasMapper Text Analysis" });
  };

  const handleExportCSV = () => {
    if (!result) return;
    exportAnalysesToCSV([result]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Search className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Advanced Analysis</h1>
            <p className="text-slate-400 text-sm">
              Detect complex bias patterns, cognitive errors, and logical flaws
            </p>
          </div>
        </div>

        {/* Introduction / Thinking Process */}
        <ThinkingProcess />

        <Tabs defaultValue="input" className="space-y-6">
          <TabsList className="bg-slate-900/50 border border-slate-800 p-1">
            <TabsTrigger value="input" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white uppercase text-[10px] font-black tracking-widest px-8">
              <Activity className="h-3 w-3 mr-2" /> Intelligence Input
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white uppercase text-[10px] font-black tracking-widest px-8">
              <History className="h-3 w-3 mr-2" /> Generation History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-8 outline-none mt-0">
            {/* Input */}
            <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-indigo-400" />
                  Intelligence Input
                </CardTitle>
                <CardDescription className="text-slate-500 text-xs">
                  Paste content for multi-dimensional psychological and sociological auditing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="analyzeTextInput" className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                    Source Content
                  </Label>
                  <textarea
                    id="analyzeTextInput"
                    className="w-full h-48 p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-y text-sm font-medium"
                    placeholder="Paste news article, social media post, or any text content here..."
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                  />
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                    <span>{customText.length} characters</span>
                    <span className={isConfigured ? "text-emerald-500" : "text-amber-500"}>
                      {isConfigured ? "AI Ready" : "API Required"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    onClick={handleAnalyze}
                    disabled={!customText.trim() || !isConfigured || analyzing}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-11 px-8 shadow-lg shadow-indigo-500/20"
                  >
                    {analyzing ? (
                      <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Processing Logic...</>
                    ) : (
                      <><Zap className="h-4 w-4 mr-2" />Run Deep Analysis</>
                    )}
                  </Button>
                  <Button
                    onClick={handleDebias}
                    disabled={!customText.trim() || !isConfigured || debiasing}
                    variant="outline"
                    className="border-slate-800 bg-slate-800/20 text-slate-300 hover:bg-slate-800 h-11 px-8"
                  >
                    {debiasing ? (
                      <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Neutralizing...</>
                    ) : (
                      <><ArrowLeftRight className="h-4 w-4 mr-2" />Debias Content</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results Toolbar */}
            {result && (
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Audited Result
                </h3>
                <div className="flex gap-2">
                  <Button onClick={handleExportPDF} size="sm" variant="ghost" className="text-slate-500 hover:text-white hover:bg-slate-800 h-8 text-[10px] font-bold uppercase tracking-widest">
                    <FileDown className="h-3 w-3 mr-1.5" /> Export PDF
                  </Button>
                  <Button onClick={handleExportCSV} size="sm" variant="ghost" className="text-slate-500 hover:text-white hover:bg-slate-800 h-8 text-[10px] font-bold uppercase tracking-widest">
                    <FileDown className="h-3 w-3 mr-1.5" /> Export CSV
                  </Button>
                </div>
              </div>
            )}

            {/* Analysis Result Display */}
            {result && <AnalyzeResultDisplay result={result} />}

            {/* Debias Result */}
            {debiasResult && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ArrowLeftRight className="h-5 w-5 text-green-500" />
                    Debiased Result
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-slate-400 text-sm">Original Bias</Label>
                    <Badge
                      style={{ backgroundColor: biasColors[debiasResult.original_bias] || "#6b7280" }}
                      className="ml-2 text-white"
                    >
                      {debiasResult.original_bias}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-sm">Neutralized Text</Label>
                    <p className="mt-2 text-white bg-slate-700 p-4 rounded-lg leading-relaxed">
                      {debiasResult.neutralized_text}
                    </p>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-sm">Changes Made</Label>
                    <ul className="mt-2 space-y-1">
                      {debiasResult.changes_made.map((c, i) => (
                        <li key={i} className="text-slate-300 text-sm flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="outline-none mt-0">
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/50">
                  <History className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                  <h3 className="text-slate-400 font-bold">No Generation History Recorded</h3>
                  <p className="text-slate-600 text-sm">Run deep analysis on custom content to build your forensic library.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {history.map((log) => (
                    <Card 
                      key={log.id} 
                      className="bg-slate-900/40 border-slate-800/50 hover:border-indigo-500/50 transition-all cursor-pointer group"
                      onClick={() => {
                        setResult(log);
                        setCustomText(log.inputText);
                      }}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
                            <Target className="h-5 w-5 text-indigo-400" />
                          </div>
                          <div className="max-w-md">
                            <h4 className="text-white font-bold text-sm leading-none mb-2 line-clamp-1">{log.inputText.slice(0, 80)}...</h4>
                            <p className="text-[10px] text-slate-500 font-mono">
                              {new Date(log.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <Badge 
                              variant="outline" 
                              style={{
                                borderColor: biasColors[log.dominantBias] || "#64748b",
                                backgroundColor: (biasColors[log.dominantBias] || "#64748b") + "10",
                                color: biasColors[log.dominantBias] || "#94a3b8"
                              }}
                              className="font-bold border-2"
                            >
                              {log.dominantBias}
                            </Badge>
                          </div>
                          <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-400/10 font-bold text-xs uppercase tracking-tighter">
                            Reload Audit
                            <Play className="h-3 w-3 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* No API Warning */}
        {!isConfigured && (
          <Card className="bg-amber-900/20 border-amber-700">
            <CardContent className="pt-6 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <p className="text-slate-300 text-sm">
                No AI service configured. Please set up your API in{" "}
                <a href="/settings" className="text-blue-400 hover:underline">Settings</a>.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
