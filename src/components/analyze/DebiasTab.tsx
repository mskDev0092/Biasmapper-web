import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeftRight, CheckCircle2, RefreshCw } from "lucide-react";
import { ThinkingProcess } from "./ThinkingProcess";

export interface DebiasTabProps {
  debiasText_input: string;
  setDebiasText_input: (text: string) => void;
  analyzing: boolean;
  isConfigured: boolean;
  handleDebias: () => void;
  debiasResult: any;
  biasColors: Record<string, string>;
}

export function DebiasTab({
  debiasText_input,
  setDebiasText_input,
  analyzing,
  isConfigured,
  handleDebias,
  debiasResult,
  biasColors,
}: DebiasTabProps) {
  return (
    <div className="space-y-6">
      <ThinkingProcess />
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-green-500" />
            Debias Text
          </CardTitle>
          <CardDescription className="text-slate-400">
            Neutralize biased text while preserving factual accuracy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="debiasInput" className="text-slate-300">
              Biased Text
            </Label>
            <textarea
              id="debiasInput"
              className="w-full h-40 p-3 rounded-lg bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter biased text to neutralize..."
              value={debiasText_input}
              onChange={(e) => setDebiasText_input(e.target.value)}
            />
          </div>
          <Button
            onClick={handleDebias}
            disabled={
              !debiasText_input.trim() || !isConfigured || analyzing
            }
            className="bg-gradient-to-r from-green-600 to-emerald-600"
          >
            {analyzing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Debias Text
              </>
            )}
          </Button>

          {debiasResult && (
            <Card className="bg-slate-700/50 border-slate-600 mt-4">
              <CardContent className="pt-4 space-y-4">
                <div>
                  <Label className="text-slate-400 text-sm">
                    Original Bias
                  </Label>
                  <Badge
                    style={{
                      backgroundColor:
                        biasColors[debiasResult.original_bias],
                    }}
                    className="ml-2 text-white"
                  >
                    {debiasResult.original_bias}
                  </Badge>
                </div>
                <div>
                  <Label className="text-slate-400 text-sm">
                    Neutralized Text
                  </Label>
                  <p className="mt-2 text-white bg-slate-800 p-3 rounded-lg">
                    {debiasResult.neutralized_text}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-400 text-sm">
                    Changes Made
                  </Label>
                  <ul className="mt-2 space-y-1">
                    {debiasResult.changes_made.map((change: string, i: number) => (
                      <li
                        key={i}
                        className="text-slate-300 text-sm flex items-center gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
