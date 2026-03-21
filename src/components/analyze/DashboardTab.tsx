import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Minus, Share2, Shield, AlertTriangle, Brain, Zap, MessageSquare, ShieldCheck } from "lucide-react";

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
            <ChartContainer config={chartConfig} className="h-72">
              <BarChart data={prepareDistributionData(liveInternational)}>
                <XAxis dataKey="bias" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={32}>
                  {prepareDistributionData(liveInternational).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-80 transition-opacity" />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
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
            <ChartContainer config={chartConfig} className="h-72">
              <BarChart data={prepareDistributionData(livePakistan)}>
                <XAxis dataKey="bias" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={32}>
                  {prepareDistributionData(livePakistan).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-80 transition-opacity" />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
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

          {/* Tensions summary with richer UI */}
          {liveNarratives.bias_tensions && (
            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-slate-950 border border-indigo-900/30 shadow-inner">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Global Bias Tension Map</h4>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                {liveNarratives.bias_tensions}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Outlet Map */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-xl">Operational Maps</CardTitle>
            <Badge variant="secondary" className="bg-slate-800 text-slate-300">
              {liveInternational.length + livePakistan.length} Total Nodes
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="international" className="w-full">
            <TabsList className="bg-slate-950 p-1 border border-slate-800 mb-6">
              <TabsTrigger value="international" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                🌏 Global Outlets
              </TabsTrigger>
              <TabsTrigger value="pakistan" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                🇵🇰 National Cluster
              </TabsTrigger>
            </TabsList>
            <TabsContent value="international" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {liveInternational.map((outlet, index) => (
                  <Card key={index} className="bg-slate-950/50 border-slate-800 hover:border-slate-600 transition-all duration-200 group">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">{outlet.outlet}</h4>
                        <div className="flex gap-1">
                          <Badge
                            style={{ backgroundColor: biasColors[outlet.dominant_bias] }}
                            className="text-white text-[10px] px-2 py-0"
                          >
                            {outlet.dominant_bias}
                          </Badge>
                          <Badge
                            variant="outline"
                            style={{ borderColor: biasColors[outlet.secondary_bias], color: biasColors[outlet.secondary_bias] }}
                            className="text-[10px] px-2 py-0 border-2"
                          >
                            {outlet.secondary_bias}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mb-4 line-clamp-2 h-8">
                        {outlet.analysis}
                      </p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] uppercase tracking-widest text-slate-600 font-bold">
                          <span>Confidence Score</span>
                          <span>{Math.round(outlet.confidence * 100)}%</span>
                        </div>
                        <Progress
                          value={outlet.confidence * 100}
                          className="h-1.5 bg-slate-900 [&>div]:bg-gradient-to-r [&>div]:from-blue-600 [&>div]:to-indigo-400"
                        />
                      </div>

                      {/* Advanced Indicators */}
                      {(outlet.logical_fallacies?.length > 0 || outlet.cognitive_biases?.length > 0) && (
                        <div className="mt-4 pt-4 border-t border-slate-800/50 space-y-3">
                          {outlet.logical_fallacies?.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-red-500/70 uppercase tracking-tighter flex items-center gap-1">
                                <AlertTriangle className="h-2.5 w-2.5" /> Fallacies
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {outlet.logical_fallacies.slice(0, 2).map((f: any, i: number) => (
                                  <Badge key={i} variant="outline" className="text-[8px] py-0 px-1 border-red-900/30 text-red-400">
                                    {f.name}
                                  </Badge>
                                ))}
                                {outlet.logical_fallacies.length > 2 && (
                                  <span className="text-[8px] text-slate-600">+{outlet.logical_fallacies.length - 2} more</span>
                                )}
                              </div>
                            </div>
                          )}
                          {outlet.cognitive_biases?.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-purple-500/70 uppercase tracking-tighter flex items-center gap-1">
                                <Brain className="h-2.5 w-2.5" /> Cognitive
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {outlet.cognitive_biases.slice(0, 2).map((b: any, i: number) => (
                                  <Badge key={i} variant="outline" className="text-[8px] py-0 px-1 border-purple-900/30 text-purple-400">
                                    {b.name}
                                  </Badge>
                                ))}
                                {outlet.cognitive_biases.length > 2 && (
                                  <span className="text-[8px] text-slate-600">+{outlet.cognitive_biases.length - 2} more</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="pakistan" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {livePakistan.map((outlet, index) => (
                  <Card key={index} className="bg-slate-950/50 border-slate-800 hover:border-slate-600 transition-all duration-200 group">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{outlet.outlet}</h4>
                        <div className="flex gap-1">
                          <Badge
                            style={{ backgroundColor: biasColors[outlet.dominant_bias] }}
                            className="text-white text-[10px] px-2 py-0"
                          >
                            {outlet.dominant_bias}
                          </Badge>
                          <Badge
                            variant="outline"
                            style={{ borderColor: biasColors[outlet.secondary_bias], color: biasColors[outlet.secondary_bias] }}
                            className="text-[10px] px-2 py-0 border-2"
                          >
                            {outlet.secondary_bias}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mb-4 line-clamp-2 h-8">
                        {outlet.analysis}
                      </p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] uppercase tracking-widest text-slate-600 font-bold">
                          <span>Confidence Score</span>
                          <span>{Math.round(outlet.confidence * 100)}%</span>
                        </div>
                        <Progress
                          value={outlet.confidence * 100}
                          className="h-1.5 bg-slate-900 [&>div]:bg-gradient-to-r [&>div]:from-emerald-600 [&>div]:to-teal-400"
                        />
                      </div>

                      {/* Advanced Indicators */}
                      {(outlet.logical_fallacies?.length > 0 || outlet.cognitive_biases?.length > 0) && (
                        <div className="mt-4 pt-4 border-t border-slate-800/50 space-y-3">
                          {outlet.logical_fallacies?.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-red-500/70 uppercase tracking-tighter flex items-center gap-1">
                                <AlertTriangle className="h-2.5 w-2.5" /> Fallacies
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {outlet.logical_fallacies.slice(0, 2).map((f: any, i: number) => (
                                  <Badge key={i} variant="outline" className="text-[8px] py-0 px-1 border-red-900/30 text-red-400">
                                    {f.name}
                                  </Badge>
                                ))}
                                {outlet.logical_fallacies.length > 2 && (
                                  <span className="text-[8px] text-slate-600">+{outlet.logical_fallacies.length - 2} more</span>
                                )}
                              </div>
                            </div>
                          )}
                          {outlet.cognitive_biases?.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-purple-500/70 uppercase tracking-tighter flex items-center gap-1">
                                <Brain className="h-2.5 w-2.5" /> Cognitive
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {outlet.cognitive_biases.slice(0, 2).map((b: any, i: number) => (
                                  <Badge key={i} variant="outline" className="text-[8px] py-0 px-1 border-purple-900/30 text-purple-400">
                                    {b.name}
                                  </Badge>
                                ))}
                                {outlet.cognitive_biases.length > 2 && (
                                  <span className="text-[8px] text-slate-600">+{outlet.cognitive_biases.length - 2} more</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
