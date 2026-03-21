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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, RefreshCw, AlertTriangle, FileDown, Copy, Check } from "lucide-react";
import { isAPIConfigured } from "@/lib/api-config";
import { generateWithBias } from "@/lib/api-service";
import { ThinkingProcess } from "@/components/analyze/ThinkingProcess";
import { 
  BIAS_SELECT_OPTIONS, 
  FORMAT_OPTIONS, 
  PSYCHOLOGICAL_INDICATORS, 
  SOCIOLOGICAL_INDICATORS 
} from "@/lib/bias-constants";

const biasColors: Record<string, string> = {
  "L++": "#dc2626", "L+": "#f87171", L: "#fca5a5",
  C: "#6b7280",
  R: "#86efac", "R+": "#4ade80", "R++": "#16a34a",
  "T++": "#7c3aed", "T+": "#a78bfa", T: "#c4b5fd",
  B: "#fbbf24", "B+": "#f59e0b", "B++": "#d97706",
};

export default function GenerateTextPage() {
  const [topic, setTopic] = useState("");
  const [bias, setBias] = useState("C");
  const [format, setFormat] = useState("paragraph");
  const [amount, setAmount] = useState<"short" | "medium" | "long">("medium");
  const [selectedPsy, setSelectedPsy] = useState<string[]>([]);
  const [selectedSocio, setSelectedSocio] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [copied, setCopied] = useState(false);
  const isConfigured = isAPIConfigured();

  // Load state from localStorage on mount
  useEffect(() => {
    const savedTopic = localStorage.getItem("generate_text_topic");
    const savedBias = localStorage.getItem("generate_text_bias");
    const savedFormat = localStorage.getItem("generate_text_format");
    const savedAmount = localStorage.getItem("generate_text_amount");
    const savedGenerated = localStorage.getItem("generate_text_result");

    if (savedTopic) setTopic(savedTopic);
    if (savedBias) setBias(savedBias);
    if (savedFormat) setFormat(savedFormat);
    if (savedAmount) setAmount(savedAmount as any);
    if (savedGenerated) setGeneratedText(savedGenerated);

    const savedPsy = localStorage.getItem("generate_text_psy");
    const savedSocio = localStorage.getItem("generate_text_socio");
    if (savedPsy) setSelectedPsy(JSON.parse(savedPsy));
    if (savedSocio) setSelectedSocio(JSON.parse(savedSocio));
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
    localStorage.setItem("generate_text_topic", topic);
  }, [topic]);

  useEffect(() => {
    localStorage.setItem("generate_text_bias", bias);
  }, [bias]);

  useEffect(() => {
    localStorage.setItem("generate_text_format", format);
  }, [format]);

  useEffect(() => {
    localStorage.setItem("generate_text_amount", amount);
  }, [amount]);

  useEffect(() => {
    localStorage.setItem("generate_text_result", generatedText);
  }, [generatedText]);

  useEffect(() => {
    localStorage.setItem("generate_text_psy", JSON.stringify(selectedPsy));
  }, [selectedPsy]);

  useEffect(() => {
    localStorage.setItem("generate_text_socio", JSON.stringify(selectedSocio));
  }, [selectedSocio]);

  const togglePsy = (val: string) => {
    setSelectedPsy(prev => 
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    );
  };

  const toggleSocio = (val: string) => {
    setSelectedSocio(prev => 
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    );
  };

  const handleGenerate = async () => {
    if (!topic.trim() || !isConfigured) return;
    setGenerating(true);
    setGeneratedText("");
    try {
      const result = await generateWithBias(topic, bias, format, amount, selectedPsy, selectedSocio);
      setGeneratedText(result);
    } catch (e: any) {
      console.error("Generate error:", e);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Perspective Weaver</h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              Generate content from specific ideological lenses to understand framing
            </p>
          </div>
        </div>

        {/* Introduction / Thinking Process */}
        <ThinkingProcess />

        {/* Input */}
        <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
              Framing Parameters
            </CardTitle>
            <CardDescription className="text-slate-500 text-xs sm:text-sm">
              Define the topic and select the target ideological alignment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="generateTopicInput" className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                Central Topic
              </Label>
              <Input
                id="generateTopicInput"
                className="h-10 sm:h-12 bg-slate-950/50 border-slate-800 text-slate-200 placeholder-slate-700 focus:ring-purple-500/50 rounded-xl text-sm"
                placeholder="e.g., The impact of decentralized finance on traditional banking"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="biasSelect" className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                  Ideological Lens
                </Label>
                <select
                  id="biasSelect"
                  className="w-full h-10 sm:h-11 px-3 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:ring-purple-500/50"
                  value={bias}
                  onChange={(e) => setBias(e.target.value)}
                >
                  {BIAS_SELECT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="formatSelect" className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                  Structural Format
                </Label>
                <select
                  id="formatSelect"
                  className="w-full h-10 sm:h-11 px-3 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:ring-purple-500/50"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                >
                  {FORMAT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                  Content Depth
                </Label>
                <div className="flex h-10 sm:h-11 p-1 bg-slate-950/50 border border-slate-800 rounded-xl">
                  {(["short", "medium", "long"] as const).map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt)}
                      className={`flex-1 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all ${
                        amount === amt
                          ? "bg-purple-600 text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Indicators Selection */}
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 pt-2">
              <div className="space-y-3">
                <Label className="text-slate-400 text-xs font-bold uppercase tracking-widest block">
                  Psychological Indicators
                </Label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {PSYCHOLOGICAL_INDICATORS.slice(0, 12).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => togglePsy(opt)}
                      className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all border ${
                        selectedPsy.includes(opt)
                          ? "bg-purple-600/20 border-purple-500 text-purple-300"
                          : "bg-slate-950/30 border-slate-800 text-slate-500 hover:border-slate-700"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-slate-400 text-xs font-bold uppercase tracking-widest block">
                  Sociological Indicators
                </Label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {SOCIOLOGICAL_INDICATORS.slice(0, 12).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => toggleSocio(opt)}
                      className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all border ${
                        selectedSocio.includes(opt)
                          ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                          : "bg-slate-950/30 border-slate-800 text-slate-500 hover:border-slate-700"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!topic.trim() || !isConfigured || generating}
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white font-bold h-10 sm:h-11 px-8 sm:px-10 shadow-lg shadow-purple-500/20 text-sm"
            >
              {generating ? (
                <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Synthesizing...</>
              ) : (
                <><Check className="h-4 w-4 mr-2" />Generate Content</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Output */}
        {generatedText && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-white text-base sm:text-lg">Generated Content</CardTitle>
                  <Badge
                    style={{ backgroundColor: biasColors[bias] || "#6b7280" }}
                    className="text-white text-xs"
                  >
                    {bias}
                  </Badge>
                </div>
                <Button
                  onClick={handleCopy}
                  size="sm"
                  variant="outline"
                  className="border-slate-600 text-slate-300 text-xs"
                >
                  {copied ? (
                    <><Check className="h-3.5 w-3.5 mr-1.5" />Copied</>
                  ) : (
                    <><Copy className="h-3.5 w-3.5 mr-1.5" />Copy</>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-700/50 p-4 sm:p-5 rounded-xl">
                <p className="text-white whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                  {generatedText}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No API Warning */}
        {!isConfigured && (
          <Card className="bg-amber-900/20 border-amber-700">
            <CardContent className="pt-6 flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 flex-shrink-0" />
              <p className="text-slate-300 text-xs sm:text-sm">
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
