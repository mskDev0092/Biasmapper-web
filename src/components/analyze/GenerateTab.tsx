import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, RefreshCw } from "lucide-react";

export interface GenerateTabProps {
  generateTopic: string;
  setGenerateTopic: (topic: string) => void;
  generateBias: string;
  setGenerateBias: (bias: string) => void;
  analyzing: boolean;
  isConfigured: boolean;
  handleGenerate: () => void;
  generatedText: string;
  biasColors: Record<string, string>;
}

export function GenerateTab({
  generateTopic,
  setGenerateTopic,
  generateBias,
  setGenerateBias,
  analyzing,
  isConfigured,
  handleGenerate,
  generatedText,
  biasColors,
}: GenerateTabProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-500" />
            Generate with Bias
          </CardTitle>
          <CardDescription className="text-slate-400">
            Generate content from a specific bias perspective
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="generateTopic" className="text-slate-300">
                Topic
              </Label>
              <Input
                id="generateTopic"
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="e.g., Climate change policy"
                value={generateTopic}
                onChange={(e) => setGenerateTopic(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="generateBiasSelect"
                className="text-slate-300"
              >
                Target Bias
              </Label>
              <select
                id="generateBiasSelect"
                className="w-full p-2 rounded-lg bg-slate-700 border-slate-600 text-white"
                value={generateBias}
                onChange={(e) => setGenerateBias(e.target.value)}
              >
                <option value="L++">L++ - Far Left</option>
                <option value="L+">L+ - Progressive</option>
                <option value="C">C - Center</option>
                <option value="R+">R+ - Conservative</option>
                <option value="R++">R++ - Far Right</option>
                <option value="T+">T+ - Mainstream</option>
                <option value="B+">B+ - Grassroots</option>
              </select>
            </div>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={!generateTopic.trim() || !isConfigured || analyzing}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {analyzing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>

          {generatedText && (
            <Card className="bg-slate-700/50 border-slate-600 mt-4">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Badge
                    style={{ backgroundColor: biasColors[generateBias] }}
                    className="text-white"
                  >
                    {generateBias}
                  </Badge>
                  <span className="text-slate-400 text-sm">
                    Perspective
                  </span>
                </div>
                <p className="text-white whitespace-pre-wrap">
                  {generatedText}
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
