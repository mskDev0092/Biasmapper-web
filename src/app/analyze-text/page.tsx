"use client";

import { useState } from "react";
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
import {
  Search,
  RefreshCw,
  ArrowLeftRight,
  AlertTriangle,
  Brain,
  FileDown,
  CheckCircle2,
} from "lucide-react";
import { isAPIConfigured } from "@/lib/api-config";
import { analyzeTextBias, debiasText, type BiasAnalysis } from "@/lib/api-service";
import { AnalysisResultsDB, type AnalysisResult } from "@/lib/local-db";
import { exportAnalysesToCSV, exportToPDF } from "@/lib/export-utils";

const biasColors: Record<string, string> = {
  "L++": "#dc2626", "L+": "#f87171", L: "#fca5a5",
  C: "#6b7280",
  R: "#86efac", "R+": "#4ade80", "R++": "#16a34a",
  "T++": "#7c3aed", "T+": "#a78bfa", T: "#c4b5fd",
  B: "#fbbf24", "B+": "#f59e0b", "B++": "#d97706",
};

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
  const isConfigured = isAPIConfigured();

  const handleAnalyze = async () => {
    if (!customText.trim() || !isConfigured) return;
    setAnalyzing(true);
    setResult(null);
    setDebiasResult(null);
    try {
      const biasResult = await analyzeTextBias(customText);
      const stored = AnalysisResultsDB.create({
        articleId: null,
        inputText: customText,
        dominantBias: biasResult.dominant_bias,
        secondaryBias: biasResult.secondary_bias,
        confidence: biasResult.confidence,
        analysis: biasResult.analysis,
        keyThemes: biasResult.key_themes,
        narrativeTone: biasResult.narrative_tone,
        cognitiveBiases: [],
        logicalFallacies: [],
        premises: [],
        conclusions: [],
      });
      setResult(stored);
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
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Search className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Analyze Text</h1>
            <p className="text-slate-400 text-sm">
              Paste any text to detect bias, cognitive biases, and logical fallacies
            </p>
          </div>
        </div>

        {/* Input */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="h-5 w-5 text-amber-500" />
              Text Input
            </CardTitle>
            <CardDescription className="text-slate-400">
              Paste a news article, social media post, or any text content for analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="analyzeTextInput" className="text-slate-300">
                Text to Analyze
              </Label>
              <textarea
                id="analyzeTextInput"
                className="w-full h-48 p-4 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors resize-y"
                placeholder="Paste news article, social media post, or any text content here..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
              />
              <p className="text-xs text-slate-500">{customText.length} characters</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleAnalyze}
                disabled={!customText.trim() || !isConfigured || analyzing}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500"
              >
                {analyzing ? (
                  <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Analyzing...</>
                ) : (
                  <><Search className="h-4 w-4 mr-2" />Analyze Bias</>
                )}
              </Button>
              <Button
                onClick={handleDebias}
                disabled={!customText.trim() || !isConfigured || debiasing}
                variant="outline"
                className="border-green-600 text-green-400 hover:bg-green-900/20"
              >
                {debiasing ? (
                  <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Debiasing...</>
                ) : (
                  <><ArrowLeftRight className="h-4 w-4 mr-2" />Debias Text</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Result */}
        {result && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Analysis Result</CardTitle>
                <div className="flex gap-2">
                  <Button onClick={handleExportPDF} size="sm" variant="outline" className="border-slate-600 text-slate-300">
                    <FileDown className="h-3.5 w-3.5 mr-1.5" />PDF
                  </Button>
                  <Button onClick={handleExportCSV} size="sm" variant="outline" className="border-slate-600 text-slate-300">
                    <FileDown className="h-3.5 w-3.5 mr-1.5" />CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge
                  style={{ backgroundColor: biasColors[result.dominantBias] || "#6b7280" }}
                  className="text-white text-sm px-3 py-1"
                >
                  {result.dominantBias}
                </Badge>
                <Badge
                  variant="outline"
                  style={{
                    borderColor: biasColors[result.secondaryBias] || "#6b7280",
                    color: biasColors[result.secondaryBias] || "#6b7280",
                  }}
                  className="text-sm px-3 py-1"
                >
                  {result.secondaryBias}
                </Badge>
              </div>
              <p className="text-slate-300">{result.analysis}</p>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">Confidence:</span>
                <Progress value={result.confidence * 100} className="h-2 flex-1" />
                <span className="text-slate-400 text-sm">{Math.round(result.confidence * 100)}%</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.keyThemes.map((theme, i) => (
                  <Badge key={i} variant="secondary" className="bg-slate-600 text-slate-200">
                    {theme}
                  </Badge>
                ))}
              </div>
              {result.narrativeTone && (
                <p className="text-sm text-slate-400">
                  <span className="font-medium text-slate-300">Tone:</span> {result.narrativeTone}
                </p>
              )}
            </CardContent>
          </Card>
        )}

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
