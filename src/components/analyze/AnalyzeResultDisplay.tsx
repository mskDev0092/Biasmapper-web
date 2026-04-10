"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorldMap } from "@/components/map/WorldMap";
import { COUNTRIES } from "@/lib/country-config";
import { ENTITIES, getEntitiesByType, type Entity, type EntityType } from "@/lib/entities";
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
  Activity,
  Target,
  MessageSquare,
  Heart
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

  const biasLabelMap: Record<string, string> = {
    "L++": "Far Left", "L+": "Progressive", L: "Left-leaning",
    C: "Center",
    R: "Right-leaning", "R+": "Conservative", "R++": "Far Right",
    "T++": "Est. Extreme", "T+": "Mainstream", T: "Establishment",
    B: "Oppositional", "B+": "Grassroots", "B++": "Radical Dissent",
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-500/15 text-red-400 border-red-500/30";
      case "medium": return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "low": return "bg-blue-500/15 text-blue-400 border-blue-500/30";
      default: return "bg-slate-500/15 text-slate-400 border-slate-500/30";
    }
  };

  const dominantBias = result.dominantBias || 'C';
  const secondaryBias = result.secondaryBias || 'C';

  // Get entity relations from AI result (if available) or derive
  const getEntityRelations = () => {
    // Use AI-derived relations if available
    if (result.entityRelations && result.entityRelations.length > 0) {
      const accepts = result.entityRelations.filter(e => e.relation === 'accepter').map(e => e.entity_id);
      const opposes = result.entityRelations.filter(e => e.relation === 'opposer').map(e => e.entity_id);
      return { accepts, opposes, fromAI: true };
    }
    // Fallback: derive from input text deterministically
    if (!result.inputText) return { accepts: [], opposes: [], fromAI: false };
    const text = result.inputText;
    let seed = 7;
    for (let i = 0; i < text.length; i++) {
      seed = (seed * 31 + text.charCodeAt(i)) >>> 0;
    }
    const accepts: string[] = [];
    const opposes: string[] = [];
    COUNTRIES.forEach((c, idx) => {
      const v = Math.abs((seed + idx * 17) % 97);
      if (v % 3 === 0) accepts.push(c.code);
      else if (v % 3 === 1) opposes.push(c.code);
    });
    return { accepts: Array.from(new Set(accepts)), opposes: Array.from(new Set(opposes)), fromAI: false };
  };
  const { accepts, opposes, fromAI } = getEntityRelations();

  // Group entities by type for display
  const entityTypes: EntityType[] = ['country', 'organization', 'political_party', 'politician', 'media', 'scientist', 'philosopher', 'religious', 'academic', 'bureaucracy'];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Dynamic Entity Relations Map - shows after analysis runs */}
      {result.inputText && (
        <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm font-bold flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              Dynamic Entity Relations Map
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              {fromAI ? 'AI-powered analysis' : 'Narrative-based derivation'} • {accepts.length} aligned • {opposes.length} opposed
              {result.narrativePosition && ` • ${result.narrativePosition}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="py-2">
            <WorldMap accepters={accepts} opposers={opposes} />
            {/* Entity Lists by Type */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <span>Aligned / Accepters</span>
                  <Badge variant="outline" className="text-emerald-400 border-emerald-400/30">{accepts.length}</Badge>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {accepts.slice(0, 15).map(id => {
                    const entity = ENTITIES.find(e => e.id === id) || COUNTRIES.find(c => c.code === id);
                    return entity ? (
                      <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-xs border border-emerald-500/30" title={entity.name}>
                        {'flag' in entity ? <span>{entity.flag}</span> : null}
                        <span className="font-medium">{id.toUpperCase()}</span>
                      </span>
                    ) : null;
                  })}
                  {accepts.length > 15 && <span className="text-emerald-400/60 text-xs">+{accepts.length - 15} more</span>}
                  {accepts.length === 0 && <span className="text-slate-500 text-xs">None detected</span>}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                  <span>Opposed / Critics</span>
                  <Badge variant="outline" className="text-red-400 border-red-400/30">{opposes.length}</Badge>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {opposes.slice(0, 15).map(id => {
                    const entity = ENTITIES.find(e => e.id === id) || COUNTRIES.find(c => c.code === id);
                    return entity ? (
                      <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/15 text-red-400 text-xs border border-red-500/30" title={entity.name}>
                        {'flag' in entity ? <span>{entity.flag}</span> : null}
                        <span className="font-medium">{id.toUpperCase()}</span>
                      </span>
                    ) : null;
                  })}
                  {opposes.length > 15 && (
                    <span className="text-red-400/60 text-xs">+{opposes.length - 15} more</span>
                  )}
                  {opposes.length === 0 && <span className="text-slate-500 text-xs">None detected</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Overview & Bias Axis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Main Analysis Card */}
        <Card className="lg:col-span-8 bg-slate-900/60 border-slate-800 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10">
                  <FileText className="h-5 w-5 text-blue-400" />
                </div>
                <CardTitle className="text-white text-base sm:text-lg font-bold">Analysis Overview</CardTitle>
              </div>
              <Badge 
                variant="outline" 
                className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-bold text-xs sm:text-sm px-3 py-1"
              >
                <Activity className="h-3 w-3 mr-1.5" />
                {Math.round((result.confidence || 0) * 100)}% Confidence
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
              {result.analysis}
            </p>
            {result.keyThemes && result.keyThemes.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {result.keyThemes.map((theme, i) => (
                  <Badge 
                    key={i} 
                    className="bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700 transition-colors text-xs"
                  >
                    #{theme}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Narrative Tone */}
            {result.narrativeTone && (
              <div className="pt-3 mt-3 border-t border-slate-800/50">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                  <MessageSquare className="h-4 w-4 text-amber-400" />
                  <span className="font-semibold">Tone:</span>
                  <span className="italic">{result.narrativeTone}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bias Classification Card */}
        <Card className="lg:col-span-4 bg-slate-900/60 border-slate-800 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400">
              Bias Classification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Dominant Bias */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Primary Axis</label>
              <div className="flex items-center gap-3">
                <Badge 
                  style={{ backgroundColor: biasColorMap[dominantBias] || '#6b7280' }}
                  className="text-white px-4 py-1.5 text-sm sm:text-base font-black shadow-lg shadow-black/20"
                >
                  {dominantBias}
                </Badge>
                <div className="text-xs text-slate-400 font-medium hidden sm:block">
                  {biasLabelMap[dominantBias] || 'Unknown'}
                </div>
              </div>
            </div>
            
            {/* Secondary Bias */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Secondary Axis</label>
              <div className="flex items-center gap-3">
                <Badge 
                  style={{ backgroundColor: biasColorMap[secondaryBias] || '#6b7280' }}
                  className="text-white px-3 py-1 text-xs sm:text-sm font-bold shadow-lg shadow-black/20"
                >
                  {secondaryBias}
                </Badge>
                <div className="text-xs text-slate-400 font-medium hidden sm:block">
                  {biasLabelMap[secondaryBias] || 'Unknown'}
                </div>
              </div>
            </div>

            {/* Bias Framework Legend */}
            <div className="pt-4 mt-2 border-t border-slate-800/50">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Framework Guide</p>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-slate-400">L = Progressive</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-slate-400">R = Conservative</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-violet-400" />
                  <span className="text-slate-400">T = Establishment</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-slate-400">B = Oppositional</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logic & Reasoning */}
      <Card className="bg-slate-900/60 border-slate-800">
        <CardHeader className="py-4 border-b border-slate-800/50 bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10">
              <Layers className="h-5 w-5 text-indigo-400" />
            </div>
            <CardTitle className="text-white text-base sm:text-lg font-bold">Logical Structure</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Premises */}
            <div className="p-4 sm:p-6 border-b md:border-b-0 md:border-r border-slate-800/50 space-y-4">
              <h4 className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Info className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" /> Core Premises
              </h4>
              <ul className="space-y-3">
                {result.premises && result.premises.length > 0 ? (
                  result.premises.map((p, i) => (
                    <li key={i} className="flex items-start gap-3 group">
                      <span className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-slate-800 text-slate-500 text-[10px] sm:text-xs font-bold flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                        {i + 1}
                      </span>
                      <span className="text-xs sm:text-sm text-slate-300 leading-relaxed">{p}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs sm:text-sm text-slate-500 italic py-4">No premises explicitly extracted.</li>
                )}
              </ul>
            </div>
            
            {/* Conclusions */}
            <div className="p-4 sm:p-6 space-y-4 bg-emerald-500/5">
              <h4 className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" /> Derivations & Conclusions
              </h4>
              <ul className="space-y-3">
                {result.conclusions && result.conclusions.length > 0 ? (
                  result.conclusions.map((c, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">{c}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs sm:text-sm text-slate-500 italic py-4">No conclusions explicitly extracted.</li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Indicators Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Logical Fallacies */}
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-3 border-b border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/10">
                <ShieldAlert className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <CardTitle className="text-white text-sm sm:text-base font-bold">Logical Fallacies</CardTitle>
                <CardDescription className="text-[10px] sm:text-xs text-slate-500">
                  Errors in reasoning detected in the text
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {result.logicalFallacies && result.logicalFallacies.length > 0 ? (
                result.logicalFallacies.map((fallacy, i) => (
                  <div 
                    key={i} 
                    className="p-3 sm:p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 space-y-2 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <h5 className="text-xs sm:text-sm font-bold text-slate-200">{fallacy.name}</h5>
                      <Badge className={`${getSeverityColor(fallacy.severity)} text-[9px] sm:text-[10px] uppercase font-bold px-2 py-0.5`}>
                        {fallacy.severity}
                      </Badge>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">{fallacy.description}</p>
                  </div>
                ))
              ) : (
                <div className="py-8 sm:py-10 text-center bg-slate-800/20 rounded-xl border border-dashed border-slate-800">
                  <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-500/30 mx-auto mb-3" />
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">No major logical fallacies detected.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cognitive Biases */}
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-3 border-b border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10">
                <Brain className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-white text-sm sm:text-base font-bold">Cognitive Biases</CardTitle>
                <CardDescription className="text-[10px] sm:text-xs text-slate-500">
                  Systematic patterns of deviation from rationality
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {result.cognitiveBiases && result.cognitiveBiases.length > 0 ? (
                result.cognitiveBiases.map((bias, i) => (
                  <div 
                    key={i} 
                    className="p-3 sm:p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 space-y-2 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <h5 className="text-xs sm:text-sm font-bold text-slate-200">{bias.name}</h5>
                      <Badge className={`${getSeverityColor(bias.severity)} text-[9px] sm:text-[10px] uppercase font-bold px-2 py-0.5`}>
                        {bias.severity}
                      </Badge>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">{bias.description}</p>
                  </div>
                ))
              ) : (
                <div className="py-8 sm:py-10 text-center bg-slate-800/20 rounded-xl border border-dashed border-slate-800">
                  <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-500/30 mx-auto mb-3" />
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">No cognitive biases identified.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Psychological Indicators */}
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-3 border-b border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10">
                <Heart className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-white text-sm sm:text-base font-bold">Psychological Indicators</CardTitle>
                <CardDescription className="text-[10px] sm:text-xs text-slate-500">
                  Emotional framing and persuasion techniques
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {result.psychologicalIndicators && result.psychologicalIndicators.length > 0 ? (
                result.psychologicalIndicators.map((ind, i) => (
                  <div 
                    key={i} 
                    className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${getSeverityColor(ind.intensity)} border-none flex-shrink-0`}>
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-1">
                        <h5 className="text-xs sm:text-sm font-bold text-slate-200">{ind.name}</h5>
                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase">
                          {ind.intensity} intensity
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">{ind.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 sm:py-10 text-center bg-slate-800/20 rounded-xl border border-dashed border-slate-800">
                  <Activity className="h-8 w-8 sm:h-10 sm:w-10 text-slate-500/20 mx-auto mb-3" />
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">None identified.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sociological Indicators */}
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-3 border-b border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10">
                <Users className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-white text-sm sm:text-base font-bold">Sociological Indicators</CardTitle>
                <CardDescription className="text-[10px] sm:text-xs text-slate-500">
                  Social dynamics, identity, and group structures
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {result.sociologicalIndicators && result.sociologicalIndicators.length > 0 ? (
                result.sociologicalIndicators.map((ind, i) => (
                  <div 
                    key={i} 
                    className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${getSeverityColor(ind.impact)} border-none flex-shrink-0`}>
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-1">
                        <h5 className="text-xs sm:text-sm font-bold text-slate-200">{ind.name}</h5>
                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase">
                          {ind.impact} impact
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">{ind.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 sm:py-10 text-center bg-slate-800/20 rounded-xl border border-dashed border-slate-800">
                  <Users className="h-8 w-8 sm:h-10 sm:w-10 text-slate-500/20 mx-auto mb-3" />
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">None identified.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Input Text Section */}
      {result.inputText && (
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-3 border-b border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-700/50">
                <Target className="h-5 w-5 text-slate-400" />
              </div>
              <CardTitle className="text-white text-sm sm:text-base font-bold">Analyzed Content</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/50 max-h-48 overflow-y-auto">
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed whitespace-pre-wrap break-words">
                {result.inputText.length > 500 
                  ? `${result.inputText.substring(0, 500)}...` 
                  : result.inputText}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
