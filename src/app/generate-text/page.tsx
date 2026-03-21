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

const biasColors: Record<string, string> = {
  "L++": "#dc2626", "L+": "#f87171", L: "#fca5a5",
  C: "#6b7280",
  R: "#86efac", "R+": "#4ade80", "R++": "#16a34a",
  "T++": "#7c3aed", "T+": "#a78bfa", T: "#c4b5fd",
  B: "#fbbf24", "B+": "#f59e0b", "B++": "#d97706",
};

const biasOptions = [
  { value: "L++", label: "L++ — Far Left" },
  { value: "L+", label: "L+ — Progressive" },
  { value: "L", label: "L — Left-leaning" },
  { value: "C", label: "C — Center" },
  { value: "R", label: "R — Right-leaning" },
  { value: "R+", label: "R+ — Conservative" },
  { value: "R++", label: "R++ — Far Right" },
  { value: "T+", label: "T+ — Mainstream" },
  { value: "T++", label: "T++ — Establishment" },
  { value: "B+", label: "B+ — Grassroots" },
  { value: "B++", label: "B++ — Radical Dissent" },
];

const formatOptions = [
  { value: "paragraph", label: "Paragraph" },
  { value: "article", label: "Article" },
  { value: "tweet", label: "Tweet / Short Post" },
  { value: "opinion piece", label: "Opinion Piece" },
  { value: "news headline", label: "News Headline" },
];

const psyOptions = [
  "Emotional Framing",
  "Fear-mongering",
  "Appeal to Authority",
  "In-group Favoritism",
  "Scapegoating",
  "Urgency / Scarcity",
];

const socioOptions = [
  "Power Dynamics",
  "Marginalization",
  "Institutional Trust",
  "Group Identity",
  "Social Hierarchy",
  "Cultural Superiority",
];

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
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Perspective Weaver</h1>
            <p className="text-slate-400 text-sm">
              Generate content from specific ideological lenses to understand framing
            </p>
          </div>
        </div>

        {/* Introduction / Thinking Process */}
        <ThinkingProcess />

        {/* Input */}
        <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-400" />
              Framing Parameters
            </CardTitle>
            <CardDescription className="text-slate-500 text-xs">
              Define the topic and select the target ideological alignment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="generateTopicInput" className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                Central Topic
              </Label>
              <Input
                id="generateTopicInput"
                className="h-12 bg-slate-950/50 border-slate-800 text-slate-200 placeholder-slate-700 focus:ring-purple-500/50 rounded-xl"
                placeholder="e.g., The impact of decentralized finance on traditional banking"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="biasSelect" className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                  Ideological Lens
                </Label>
                <select
                  id="biasSelect"
                  className="w-full h-11 px-3 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 text-sm focus:ring-purple-500/50"
                  value={bias}
                  onChange={(e) => setBias(e.target.value)}
                >
                  {biasOptions.map((opt) => (
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
                  className="w-full h-11 px-3 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 text-sm focus:ring-purple-500/50"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                >
                  {formatOptions.map((opt) => (
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
                <div className="flex h-11 p-1 bg-slate-950/50 border border-slate-800 rounded-xl">
                  {(["short", "medium", "long"] as const).map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt)}
                      className={`flex-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
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

            <div className="grid md:grid-cols-2 gap-8 pt-2">
              <div className="space-y-3">
                <Label className="text-slate-400 text-xs font-bold uppercase tracking-widest block">
                  Psychological Indicators
                </Label>
                <div className="flex flex-wrap gap-2">
                  {psyOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => togglePsy(opt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
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
                <div className="flex flex-wrap gap-2">
                  {socioOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => toggleSocio(opt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
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
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white font-bold h-11 px-10 shadow-lg shadow-purple-500/20"
            >
              {generating ? (
                <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Synthesizing Perspective...</>
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-white">Generated Content</CardTitle>
                  <Badge
                    style={{ backgroundColor: biasColors[bias] || "#6b7280" }}
                    className="text-white"
                  >
                    {bias}
                  </Badge>
                </div>
                <Button
                  onClick={handleCopy}
                  size="sm"
                  variant="outline"
                  className="border-slate-600 text-slate-300"
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
              <div className="bg-slate-700/50 p-5 rounded-lg">
                <p className="text-white whitespace-pre-wrap leading-relaxed">
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
