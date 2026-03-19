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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, RefreshCw, AlertTriangle, FileDown, Copy, Check } from "lucide-react";
import { isAPIConfigured } from "@/lib/api-config";
import { generateWithBias } from "@/lib/api-service";

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

export default function GenerateTextPage() {
  const [topic, setTopic] = useState("");
  const [bias, setBias] = useState("C");
  const [format, setFormat] = useState("paragraph");
  const [generating, setGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [copied, setCopied] = useState(false);
  const isConfigured = isAPIConfigured();

  const handleGenerate = async () => {
    if (!topic.trim() || !isConfigured) return;
    setGenerating(true);
    setGeneratedText("");
    try {
      const result = await generateWithBias(topic, bias, format);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Generate Text</h1>
            <p className="text-slate-400 text-sm">
              Generate content from a specific bias perspective to understand how framing works
            </p>
          </div>
        </div>

        {/* Input */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-500" />
              Content Generation
            </CardTitle>
            <CardDescription className="text-slate-400">
              Enter a topic and select a bias perspective to generate content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="generateTopicInput" className="text-slate-300">
                Topic
              </Label>
              <Input
                id="generateTopicInput"
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="e.g., Climate change policy, Economic reform, Immigration..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="biasSelect" className="text-slate-300">
                  Target Bias Perspective
                </Label>
                <select
                  id="biasSelect"
                  className="w-full p-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white"
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
                <Label htmlFor="formatSelect" className="text-slate-300">
                  Output Format
                </Label>
                <select
                  id="formatSelect"
                  className="w-full p-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white"
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
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!topic.trim() || !isConfigured || generating}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
            >
              {generating ? (
                <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Generating...</>
              ) : (
                <><Zap className="h-4 w-4 mr-2" />Generate Content</>
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
