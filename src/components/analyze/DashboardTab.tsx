import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts";
import { TrendingUp } from "lucide-react";

export interface DashboardTabProps {
  liveInternational: any[];
  livePakistan: any[];
  liveNarratives: any;
  chartConfig: ChartConfig;
  prepareDistributionData: (outlets: any[]) => any[];
  biasColors: Record<string, string>;
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
    <div className="space-y-6">
      {/* Bias Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              International Media Bias
            </CardTitle>
            <CardDescription className="text-slate-400">
              Distribution across bias categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <BarChart data={prepareDistributionData(liveInternational)}>
                <XAxis dataKey="bias" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {prepareDistributionData(liveInternational).map(
                    (entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ),
                  )}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              Pakistan Media Bias
            </CardTitle>
            <CardDescription className="text-slate-400">
              Distribution across bias categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <BarChart data={prepareDistributionData(livePakistan)}>
                <XAxis dataKey="bias" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {prepareDistributionData(livePakistan).map(
                    (entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ),
                  )}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Narratives */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-500" />
            Detected Narratives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveNarratives.narratives.map((narrative: any, index: number) => (
              <Card
                key={index}
                className="bg-slate-700/50 border-slate-600"
              >
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white">
                      {narrative.title}
                    </h4>
                    <Badge
                      variant={
                        narrative.intensity === "high"
                          ? "destructive"
                          : "default"
                      }
                    >
                      {narrative.intensity}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-300 mb-4">
                    {narrative.description}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">
                        Promoted:
                      </span>
                      <Badge
                        style={{
                          backgroundColor:
                            biasColors[narrative.promoted_by],
                        }}
                        className="text-white text-xs"
                      >
                        {narrative.promoted_by}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">
                        Opposed:
                      </span>
                      <Badge
                        style={{
                          backgroundColor:
                            biasColors[narrative.opposed_by],
                        }}
                        className="text-white text-xs"
                      >
                        {narrative.opposed_by}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Outlet Details */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Outlet Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="international">
            <TabsList className="bg-slate-700">
              <TabsTrigger value="international">
                International
              </TabsTrigger>
              <TabsTrigger value="pakistan">Pakistan</TabsTrigger>
            </TabsList>
            <TabsContent value="international" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {liveInternational.map((outlet, index) => (
                  <Card
                    key={index}
                    className="bg-slate-700/50 border-slate-600"
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white">
                          {outlet.outlet}
                        </h4>
                        <div className="flex gap-1">
                          <Badge
                            style={{
                              backgroundColor:
                                biasColors[outlet.dominant_bias],
                            }}
                            className="text-white"
                          >
                            {outlet.dominant_bias}
                          </Badge>
                          <Badge
                            variant="outline"
                            style={{
                              borderColor:
                                biasColors[outlet.secondary_bias],
                              color: biasColors[outlet.secondary_bias],
                            }}
                          >
                            {outlet.secondary_bias}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-slate-300 mb-2">
                        {outlet.analysis}
                      </p>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={outlet.confidence * 100}
                          className="h-2 flex-1"
                        />
                        <span className="text-xs text-slate-400">
                          {Math.round(outlet.confidence * 100)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="pakistan" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {livePakistan.map((outlet, index) => (
                  <Card
                    key={index}
                    className="bg-slate-700/50 border-slate-600"
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white">
                          {outlet.outlet}
                        </h4>
                        <div className="flex gap-1">
                          <Badge
                            style={{
                              backgroundColor:
                                biasColors[outlet.dominant_bias],
                            }}
                            className="text-white"
                          >
                            {outlet.dominant_bias}
                          </Badge>
                          <Badge
                            variant="outline"
                            style={{
                              borderColor:
                                biasColors[outlet.secondary_bias],
                              color: biasColors[outlet.secondary_bias],
                            }}
                          >
                            {outlet.secondary_bias}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-slate-300 mb-2">
                        {outlet.analysis}
                      </p>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={outlet.confidence * 100}
                          className="h-2 flex-1"
                        />
                        <span className="text-xs text-slate-400">
                          {Math.round(outlet.confidence * 100)}%
                        </span>
                      </div>
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
