import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Search, RefreshCw } from "lucide-react";
import { ThinkingProcess } from "./ThinkingProcess";

export interface AnalyzeTabProps {
  customText: string;
  setCustomText: (text: string) => void;
  analyzing: boolean;
  isConfigured: boolean;
  handleCustomAnalysis: () => void;
  customResult: any;
  biasColors: Record<string, string>;
}

export function AnalyzeTab({
  customText,
  setCustomText,
  analyzing,
  isConfigured,
  handleCustomAnalysis,
  customResult,
  biasColors,
}: AnalyzeTabProps) {
  return (
    <div className="space-y-6">
      <ThinkingProcess />
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="h-5 w-5 text-amber-500" />
            Custom Text Analysis
          </CardTitle>
          <CardDescription className="text-slate-400">
            Analyze any text for bias using the BiasMapper framework
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customText" className="text-slate-300">
              Text to Analyze
            </Label>
            <textarea
              id="customText"
              className="w-full h-40 p-3 rounded-lg bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paste news article, social media post, or any text content here..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
            />
          </div>
          <Button
            onClick={handleCustomAnalysis}
            disabled={!customText.trim() || !isConfigured || analyzing}
            className="bg-gradient-to-r from-amber-600 to-orange-600"
          >
            {analyzing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Analyze Bias
              </>
            )}
          </Button>

          {customResult && (
            <Card className="bg-slate-700/50 border-slate-600 mt-4">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-white">
                    Analysis Result
                  </h4>
                  <div className="flex gap-2">
                    <Badge
                      style={{
                        backgroundColor:
                          biasColors[customResult.dominant_bias],
                      }}
                      className="text-white"
                    >
                      {customResult.dominant_bias}
                    </Badge>
                    <Badge
                      variant="outline"
                      style={{
                        borderColor:
                          biasColors[customResult.secondary_bias],
                        color: biasColors[customResult.secondary_bias],
                      }}
                    >
                      {customResult.secondary_bias}
                    </Badge>
                  </div>
                </div>
                <p className="text-slate-300 mb-3">
                  {customResult.analysis}
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-slate-400 text-sm">
                    Confidence:
                  </span>
                  <Progress
                    value={customResult.confidence * 100}
                    className="h-2 flex-1"
                  />
                  <span className="text-slate-400 text-sm">
                    {Math.round(customResult.confidence * 100)}%
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {customResult.key_themes.map((theme: string, i: number) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="bg-slate-600"
                    >
                      {theme}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
