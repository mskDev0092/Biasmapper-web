"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Brain, 
  ShieldAlert, 
  Users, 
  Zap, 
  FileText, 
  CheckCircle2, 
  Info,
  Layers,
  Activity
} from "lucide-react";
import { type AnalysisResult } from "@/lib/local-db";

interface AnalyzeResultDisplayProps {
  result: Partial<AnalysisResult>;
}

export function AnalyzeResultDisplay({ result }: AnalyzeResultDisplayProps) {
  if (!result) return null;

  const biasColorMap: Record<string, string> = {
    "L++": "#dc2626", "L+": "#f87171", L: "#fca5a5",
    C: "#6b7280",
    R: "#86efac", "R+": "#4ade80", "R++": "#16a34a",
    "T++": "#7c3aed", "T+": "#a78bfa", T: "#c4b5fd",
    B: "#fbbf24", "B+": "#f59e0b", "B++": "#d97706",
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "medium": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "low": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overview & Bias Axis */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-8 bg-slate-900/60 border-slate-800 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-white text-lg font-bold">Analysis Overview</CardTitle>
              </div>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-bold">
                {Math.round((result.confidence || 0) * 100)}% Confidence
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300 leading-relaxed text-sm">
              {result.analysis}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {result.keyThemes?.map((theme, i) => (
                <Badge key={i} className="bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 transition-colors">
                  #{theme}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-4 bg-slate-900/60 border-slate-800 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm font-bold uppercase tracking-wider text-slate-400">Bias Classification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Primary Axis</label>
              <div className="flex items-center gap-3">
                <Badge 
                  style={{ backgroundColor: biasColorMap[result.dominantBias || 'C'] }}
                  className="text-white px-3 py-1 text-base font-black shadow-lg shadow-black/20"
                >
                  {result.dominantBias}
                </Badge>
                <div className="text-xs text-slate-400 font-medium">Dominant ideology detected in framing.</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Secondary Axis</label>
              <div className="flex items-center gap-3">
                <Badge 
                  style={{ backgroundColor: biasColorMap[result.secondaryBias || 'C'] }}
                  className="text-white px-3 py-1 text-sm font-bold"
                >
                  {result.secondaryBias}
                </Badge>
                <div className="text-xs text-slate-400 font-medium">Underlying institutional alignment.</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/50">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Activity className="h-3 w-3 text-amber-400" />
                <span className="font-bold">TONE:</span>
                <span className="italic">{result.narrativeTone}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logic & Reasoning */}
      <Card className="bg-slate-900/60 border-slate-800">
        <CardHeader className="py-4 border-b border-slate-800/50 bg-slate-800/10">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-400" />
            <CardTitle className="text-white text-base font-bold">Logical Structure</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-6 border-b md:border-b-0 md:border-r border-slate-800/50 space-y-4">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Info className="h-3 w-3" /> Core Premises
              </h4>
              <ul className="space-y-3">
                {result.premises?.map((p, i) => (
                  <li key={i} className="flex items-start gap-3 group">
                    <span className="h-5 w-5 rounded-full bg-slate-800 text-slate-500 text-[10px] font-bold flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                      {i + 1}
                    </span>
                    <span className="text-sm text-slate-300 leading-relaxed">{p}</span>
                  </li>
                ))}
                {!result.premises?.length && <li className="text-xs text-slate-500 italic">No premises explicitly extracted.</li>}
              </ul>
            </div>
            <div className="p-6 space-y-4 bg-emerald-500/5">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Derivations & Conclusions
              </h4>
              <ul className="space-y-3">
                {result.conclusions?.map((c, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-300 leading-relaxed font-medium">{c}</span>
                  </li>
                ))}
                {!result.conclusions?.length && <li className="text-xs text-slate-500 italic">No conclusions explicitly extracted.</li>}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Indicators Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logical Fallacies */}
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-3 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-400" />
              <CardTitle className="text-white text-base font-bold">Logical Fallacies</CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500">Errors in reasoning detected in the text.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {result.logicalFallacies?.map((fallacy, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-bold text-slate-200">{fallacy.name}</h5>
                    <Badge className={`${getSeverityColor(fallacy.severity)} text-[10px] uppercase font-bold`}>
                      {fallacy.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{fallacy.description}</p>
                </div>
              ))}
              {!result.logicalFallacies?.length && (
                <div className="py-8 text-center bg-slate-800/20 rounded-lg border border-dashed border-slate-800">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500/20 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-medium">No major logical fallacies detected.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cognitive Biases */}
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-3 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-amber-400" />
              <CardTitle className="text-white text-base font-bold">Cognitive Biases</CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500">Systematic patterns of deviation from rationality.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {result.cognitiveBiases?.map((bias, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-bold text-slate-200">{bias.name}</h5>
                    <Badge className={`${getSeverityColor(bias.severity)} text-[10px] uppercase font-bold`}>
                      {bias.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{bias.description}</p>
                </div>
              ))}
              {!result.cognitiveBiases?.length && (
                <div className="py-8 text-center bg-slate-800/20 rounded-lg border border-dashed border-slate-800">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500/20 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-medium">No cognitive biases identified.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Psychological Indicators */}
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-3 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-400" />
              <CardTitle className="text-white text-base font-bold">Psychological Indicators</CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500">Emotional framing and persuasion techniques.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {result.psychologicalIndicators?.map((ind, i) => (
                <div key={i} className="flex items-start gap-4 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                  <div className={`p-2 rounded-lg ${getSeverityColor(ind.intensity)} border-none`}>
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-bold text-slate-200">{ind.name}</h5>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{ind.intensity} Intensity</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{ind.description}</p>
                  </div>
                </div>
              ))}
              {!result.psychologicalIndicators?.length && (
                <div className="py-8 text-center bg-slate-800/20 rounded-lg border border-dashed border-slate-800">
                  <Activity className="h-8 w-8 text-slate-500/20 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-medium">None identified.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sociological Indicators */}
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-3 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-400" />
              <CardTitle className="text-white text-base font-bold">Sociological Indicators</CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500">Social dynamics, identity, and group structures.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {result.sociologicalIndicators?.map((ind, i) => (
                <div key={i} className="flex items-start gap-4 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                  <div className={`p-2 rounded-lg ${getSeverityColor(ind.impact)} border-none`}>
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-bold text-slate-200">{ind.name}</h5>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{ind.impact} Impact</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{ind.description}</p>
                  </div>
                </div>
              ))}
              {!result.sociologicalIndicators?.length && (
                <div className="py-8 text-center bg-slate-800/20 rounded-lg border border-dashed border-slate-800">
                  <Users className="h-8 w-8 text-slate-500/20 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-medium">None identified.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
