import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, Cell, ResponsiveContainer } from "recharts";
import { 
  TrendingUp, ArrowUpRight, ArrowDownRight, Minus, Share2, 
  Shield, AlertTriangle, Brain, ChevronDown, ChevronUp, 
  Activity, Target, Play, Clock, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DashboardTabProps {
  liveInternational: any[];
  livePakistan: any[];
  liveNarratives: any;
  chartConfig: ChartConfig;
  prepareDistributionData: (outlets: any[]) => any[];
  biasColors: Record<string, string>;
}

// Intensity icon
function IntensityIndicator({ intensity }: { intensity: string }) {
  if (intensity === "high") {
    return <ArrowUpRight className="h-4 w-4 text-red-500 inline-block drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />;
  }
  if (intensity === "medium") {
    return <Minus className="h-4 w-4 text-amber-500 inline-block drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />;
  }
  return <ArrowDownRight className="h-4 w-4 text-emerald-500 inline-block drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />;
}

// Tension Meter Component
function TensionMeter({ tension }: { tension: string }) {
  return (
    <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-slate-950 border border-indigo-900/30 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Activity className="h-24 w-24 text-indigo-500 rotate-12" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            <h4 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">Global Ideological Tension</h4>
          </div>
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 font-bold">Live Context</Badge>
        </div>
        
        <p className="text-sm text-slate-300 leading-relaxed font-medium mb-6 max-w-2xl">
          {tension}
        </p>

        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <span>Harmonious</span>
            <span className="text-indigo-400">Conflict Probable</span>
            <span>Fractured</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
            <div className="h-full bg-gradient-to-r from-emerald-500 via-indigo-600 to-red-600 w-[65%] shadow-[0_0_15px_rgba(79,70,229,0.4)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper: normalize promoted_by / opposed_by
function normalizeBiasField(value: any): string[] {
  if (!value) return [];
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) {
    return value.flatMap((v: any) => {
      if (typeof v === "string") return [v];
      if (v && typeof v === "object" && v.code) return [v.code];
      return [String(v)];
    });
  }
  return [String(value)];
}

export function DashboardTab({
  liveInternational,
  livePakistan,
  liveNarratives,
  chartConfig,
  prepareDistributionData,
  biasColors,
}: DashboardTabProps) {
  const [expandedOutlets, setExpandedOutlets] = useState<Record<string, boolean>>({});

  const toggleOutletExpand = (name: string) => {
    setExpandedOutlets(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const renderOutletCard = (outlet: any, type: "international" | "pakistan") => {
    const isExpanded = expandedOutlets[outlet.outlet];
    const accentColor = type === "international" ? "blue" : "emerald";
    const accentHex = type === "international" ? "#3b82f6" : "#10b981";

    return (
      <Card 
        key={outlet.outlet} 
        className={`bg-slate-950/50 border-slate-800 hover:border-slate-600 transition-all duration-300 group relative overflow-hidden ${isExpanded ? 'ring-1 ring-slate-700 shadow-2xl scale-[1.02] z-10' : ''}`}
      >
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${accentColor}-600/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
        
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className={`font-bold text-white group-hover:text-${accentColor}-400 transition-colors text-base tracking-tight`}>{outlet.outlet}</h4>
            <div className="flex gap-1.5">
              <Badge
                style={{ backgroundColor: biasColors[outlet.dominant_bias] }}
                className="text-white text-[10px] px-2.5 py-0.5 font-bold shadow-lg shadow-black/20"
              >
                {outlet.dominant_bias}
              </Badge>
              <Badge
                variant="outline"
                style={{ borderColor: biasColors[outlet.secondary_bias], color: biasColors[outlet.secondary_bias] }}
                className="text-[10px] px-2.5 py-0.5 border-2 font-bold bg-slate-900/50"
              >
                {outlet.secondary_bias}
              </Badge>
            </div>
          </div>
          
          <p className={`text-xs text-slate-400 mb-5 leading-relaxed italic ${isExpanded ? '' : 'line-clamp-2 h-8'}`}>
            "{outlet.analysis}"
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-[10px] uppercase tracking-widest text-slate-500 font-black">
              <span>Confidence Score</span>
              <span style={{ color: accentHex }}>{Math.round(outlet.confidence * 100)}%</span>
            </div>
            <Progress
              value={outlet.confidence * 100}
              className="h-1.5 bg-slate-900 shadow-inner"
              style={{ 
                // Using standard CSS variables for the color if possible or just inline styles
                background: '#0f172a' 
              }}
            />
          </div>

          {/* Summary Indicators */}
          <div className="flex flex-wrap gap-2 pt-2">
            {(outlet.logical_fallacies?.length > 0) && (
              <Badge variant="outline" className="text-[9px] bg-red-500/5 border-red-500/20 text-red-500 py-0 px-2 rounded-full font-bold">
                 <AlertTriangle className="h-2.5 w-2.5 mr-1" /> {outlet.logical_fallacies.length} Fallacies
              </Badge>
            )}
            {(outlet.cognitive_biases?.length > 0) && (
              <Badge variant="outline" className="text-[9px] bg-purple-500/5 border-purple-500/20 text-purple-500 py-0 px-2 rounded-full font-bold">
                 <Brain className="h-2.5 w-2.5 mr-1" /> {outlet.cognitive_biases.length} Biases
              </Badge>
            )}
            <Button 
               variant="ghost" 
               size="sm" 
               onClick={() => toggleOutletExpand(outlet.outlet)}
               className="h-6 ml-auto px-2 text-[10px] uppercase tracking-widest font-black text-slate-500 hover:text-white"
            >
              {isExpanded ? <><ChevronUp className="h-3 w-3 mr-1" /> Close</> : <><ChevronDown className="h-3 w-3 mr-1" /> Audit</>}
            </Button>
          </div>

          {/* Expanded Detailed Audit */}
          {isExpanded && (
            <div className="mt-5 pt-5 border-t border-slate-800/80 space-y-5 animate-in slide-in-from-top-2 duration-300">
              {outlet.logical_fallacies?.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                    <Target className="h-3 w-3" /> Logical Fallacies Audit
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {outlet.logical_fallacies.map((f: any, i: number) => (
                      <div key={i} className="p-2 rounded-lg bg-red-500/5 border border-red-500/10 transition-colors hover:bg-red-500/10">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-red-400">{f.name}</span>
                          <span className={`text-[8px] font-black uppercase px-1 rounded ${f.severity === 'high' ? 'bg-red-500 text-white' : 'bg-red-500/20 text-red-400'}`}>{f.severity}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight">{f.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {outlet.cognitive_biases?.length > 0 && (
                <div className="space-y-2">
                   <div className="text-[10px] font-black text-purple-500 uppercase tracking-widest flex items-center gap-2">
                    <Brain className="h-3 w-3" /> Cognitive Bias Filter
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {outlet.cognitive_biases.map((b: any, i: number) => (
                      <div key={i} className="p-2 rounded-lg bg-purple-500/5 border border-purple-500/10 transition-colors hover:bg-purple-500/10">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-purple-400">{b.name}</span>
                          <span className={`text-[8px] font-black uppercase px-1 rounded ${b.severity === 'high' ? 'bg-purple-500 text-white' : 'bg-purple-500/20 text-purple-400'}`}>{b.severity}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight">{b.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-2">
                <Button 
                   variant="outline" 
                   size="sm" 
                   className="w-full border-slate-700 text-slate-400 hover:text-white h-8 text-[10px] font-black uppercase tracking-tighter"
                   onClick={() => toggleOutletExpand(outlet.outlet)}
                >
                  Verify Structural Integrity
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Bias Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-slate-900 shadow-xl border-slate-800 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 group-hover:bg-blue-400 transition-colors" />
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2">
              <Share2 className="h-5 w-5 text-blue-500" />
              International Bias Map
            </CardTitle>
            <CardDescription className="text-slate-400 font-medium">
              Geopolitical framing across {liveInternational.length} monitored sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareDistributionData(liveInternational)}>
                    <defs>
                      <linearGradient id="barGradientIntl" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="bias" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <ChartTooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 4 }}
                      content={<ChartTooltipContent />} 
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={24} fill="url(#barGradientIntl)">
                      {prepareDistributionData(liveInternational).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill || "url(#barGradientIntl)"} className="hover:opacity-80 transition-opacity" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 shadow-xl border-slate-800 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600 group-hover:bg-emerald-400 transition-colors" />
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-500" />
              South Asia (Pakistan) Map
            </CardTitle>
            <CardDescription className="text-slate-400 font-medium">
              Regional ideological spread across {livePakistan.length} sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareDistributionData(livePakistan)}>
                    <defs>
                      <linearGradient id="barGradientPk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#047857" stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="bias" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <ChartTooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 4 }}
                      content={<ChartTooltipContent />} 
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={24} fill="url(#barGradientPk)">
                      {prepareDistributionData(livePakistan).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill || "url(#barGradientPk)"} className="hover:opacity-80 transition-opacity" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Narrative Hub */}
      <Card className="bg-slate-900/40 border-slate-800 overflow-hidden backdrop-blur-md">
        <CardHeader className="border-b border-slate-800/50 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-white flex items-center gap-2 text-2xl font-bold">
                <TrendingUp className="h-6 w-6 text-amber-500" />
                Narrative Intelligence
              </CardTitle>
              <CardDescription className="text-slate-500">
                Key patterns of contention and ideological promotion
              </CardDescription>
            </div>
            {liveNarratives.trending_topics?.length > 0 && (
              <div className="hidden sm:flex gap-2">
                <Badge variant="outline" className="text-emerald-400 border-emerald-900/30 bg-emerald-950/20 px-3 py-1">
                  {liveNarratives.trending_topics[0]}
                </Badge>
                {liveNarratives.trending_topics[1] && (
                  <Badge variant="outline" className="text-blue-400 border-blue-900/30 bg-blue-950/20 px-3 py-1">
                    {liveNarratives.trending_topics[1]}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {liveNarratives.narratives.map((narrative: any, index: number) => {
              const promoted = normalizeBiasField(narrative.promoted_by);
              const opposed = normalizeBiasField(narrative.opposed_by);

              return (
                <div key={index} className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 blur" />
                  <Card className="relative bg-slate-900 border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                          <h4 className="font-bold text-white text-lg group-hover:text-amber-400 transition-colors">
                            {narrative.title}
                          </h4>
                        </div>
                        <Badge
                          variant={narrative.intensity === "high" ? "destructive" : "secondary"}
                          className="px-3 py-0.5"
                        >
                          <IntensityIndicator intensity={narrative.intensity} />
                          <span className="ml-1 uppercase tracking-wider text-[10px] font-bold">{narrative.intensity}</span>
                        </Badge>
                      </div>

                      <p className="text-sm text-slate-400 mb-6 leading-relaxed italic">
                        "{narrative.description}"
                      </p>

                      <div className="grid grid-cols-2 gap-6 p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Main Promotion</label>
                          <div className="flex flex-wrap gap-2">
                            {promoted.map((code, i) => (
                              <Badge
                                key={i}
                                style={{ backgroundColor: biasColors[code] || "#64748b" }}
                                className="text-white shadow-lg shadow-black/20"
                              >
                                {code}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Active Opposition</label>
                          <div className="flex flex-wrap gap-2">
                            {opposed.map((code, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                style={{
                                  borderColor: biasColors[code] || "#64748b",
                                  color: biasColors[code] || "#94a3b8"
                                }}
                                className="bg-slate-900 border-2"
                              >
                                {code}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Tension summary with richer UI */}
          {liveNarratives.bias_tensions && (
            <TensionMeter tension={liveNarratives.bias_tensions} />
          )}
        </CardContent>
      </Card>

      {/* Outlet Map */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-blue-500" />
              Operational Maps
            </CardTitle>
            <Badge variant="secondary" className="bg-slate-800 text-slate-300 font-bold px-3 py-1">
              <Activity className="h-3 w-3 mr-2" />
              {liveInternational.length + livePakistan.length} Active Nodes
            </Badge>
          </div>
          <CardDescription className="text-slate-500">
            Audit results for tracked news infrastructure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="international" className="w-full">
            <TabsList className="bg-slate-950/50 p-1 border border-slate-800 mb-8 rounded-xl">
              <TabsTrigger 
                value="international" 
                className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold px-8"
              >
                🌏 Global Outlets
              </TabsTrigger>
              <TabsTrigger 
                value="pakistan" 
                className="rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-bold px-8"
              >
                🇵🇰 National Cluster
              </TabsTrigger>
            </TabsList>
            <TabsContent value="international" className="mt-0 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveInternational.map((outlet) => renderOutletCard(outlet, "international"))}
              </div>
            </TabsContent>
            <TabsContent value="pakistan" className="mt-0 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {livePakistan.map((outlet) => renderOutletCard(outlet, "pakistan"))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
