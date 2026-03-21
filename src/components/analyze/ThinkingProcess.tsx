import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Brain,
  Lightbulb,
  ShieldCheck,
  MessageSquare,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertCircle,
  Zap,
  ChevronDown,
  ChevronUp,
  Users,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export function ThinkingProcess() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-md overflow-hidden transition-all hover:bg-slate-900/60 group">
      <CardHeader className="border-b border-slate-800/50 bg-slate-800/20 py-3 px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-white text-base font-bold tracking-tight">Introduction</CardTitle>
              <CardDescription className="text-slate-500 text-xs">
                How the internal architecture processes human thought
              </CardDescription>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {isExpanded ? (
              <>
                <span className="hidden sm:inline mr-2 text-xs">Hide Details</span>
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                <span className="hidden sm:inline mr-2 text-xs">View Logic</span>
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-6 space-y-6 animate-in slide-in-from-top-2 duration-300">
          <div className="relative">
            <div className="absolute -left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full opacity-50" />
            <p className="text-slate-300 leading-relaxed italic pl-4 text-sm">
              "Logic is the essential toolkit of the intellect. My internal architecture is designed not merely to provide answers, but to function as a filter that prevents cognitive errors. The primary goal is to organize human thought into a disciplined structure where every conclusion is supported by a solid foundation."
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-2">
            {/* Stage 1 */}
            <AccordionItem value="item-1" className="border-slate-800 bg-slate-800/10 rounded-xl px-4 overflow-hidden border">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-xs ring-1 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all">
                    1
                  </div>
                  <span className="text-slate-200 font-semibold text-sm">Identification of Intent</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-slate-400 space-y-4 pb-4">
                <p className="text-sm">Every query is categorized into one of two fundamental mental states:</p>
                <div className="grid md:grid-cols-2 gap-4 mt-2">
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <h4 className="text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Info className="h-3 w-3" /> Conceptual Understanding
                    </h4>
                    <p className="text-xs">Does the user want to know what a thing is? (Definitions, attributes, and boundaries).</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <h4 className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                      <ShieldCheck className="h-3 w-3" /> Judgment and Validation
                    </h4>
                    <p className="text-xs">Does the user want to know if a statement is true? (Arguments, evidence, and conclusions).</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Stage 2 */}
            <AccordionItem value="item-2" className="border-slate-800 bg-slate-800/10 rounded-xl px-4 overflow-hidden border">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold text-xs ring-1 ring-purple-500/20 transition-all">
                    2
                  </div>
                  <span className="text-slate-200 font-semibold text-sm">Calibration of Complexity</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-slate-400 space-y-4 pb-4">
                <p className="text-sm">I assess the depth required for the interaction:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <h4 className="text-purple-400 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                      <Lightbulb className="h-3 w-3" /> The Learner Model
                    </h4>
                    <p className="text-xs">Used for foundational clarity. Prioritizes step-by-step explanations, relatable analogies, and removal of jargon.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <h4 className="text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                      <Zap className="h-3 w-3" /> The Analyst Model
                    </h4>
                    <p className="text-xs">Used for complex/critical inquiries. Prioritizes formal evidence, deconstruction of counter-arguments, and context.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Stage 3 */}
            <AccordionItem value="item-3" className="border-slate-800 bg-slate-800/10 rounded-xl px-4 overflow-hidden border">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400 font-bold text-xs ring-1 ring-orange-500/20 transition-all">
                    3
                  </div>
                  <span className="text-slate-200 font-semibold text-sm">Logical Verification & Indicator Audit</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-slate-400 space-y-3 pb-4">
                <p className="text-sm">Before a response is generated, it passes through a series of "logical gates":</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                      <ShieldCheck className="h-3 w-3 text-indigo-400" /> Structural Logic
                    </h5>
                    <ul className="space-y-1.5">
                      <li className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />
                        <span><strong className="text-slate-300">Premise Audit:</strong> Accuracy of starting facts.</span>
                      </li>
                      <li className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />
                        <span><strong className="text-slate-300">Fallacy Detection:</strong> Spotting flaws in reasoning.</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                      <Users className="h-3 w-3 text-emerald-400" /> Human Dynamics
                    </h5>
                    <ul className="space-y-1.5">
                      <li className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span><strong className="text-slate-300">Bias Identification:</strong> Detecting ideological leaning.</span>
                      </li>
                      <li className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span><strong className="text-slate-300">Sociological Audit:</strong> Analyzing group dynamics.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Stage 4 */}
            <AccordionItem value="item-4" className="border-slate-800 bg-slate-800/10 rounded-xl px-4 overflow-hidden border">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 font-bold text-xs ring-1 ring-red-500/20 transition-all">
                    4
                  </div>
                  <span className="text-slate-200 font-semibold text-sm">Cognitive Error Filtering</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-slate-400 space-y-4 pb-4 px-1">
                <p className="text-xs italic pl-2 border-l-2 border-red-500/30 mb-3">
                  Screening for systematic patterns of deviation from rationality.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/50">
                    <div className="text-[10px] font-black text-red-400 mb-1">PSYCHOLOGICAL</div>
                    <p className="text-[11px] text-slate-400 leading-tight">Identifying emotional framing and persuasion techniques.</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/50">
                    <div className="text-[10px] font-black text-amber-400 mb-1">COGNITIVE</div>
                    <p className="text-[11px] text-slate-400 leading-tight">Mitigating confirmation bias, anchoring, and tribalism.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="grid md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3">
              <h4 className="text-indigo-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5" /> Communication Standards
              </h4>
              <div className="space-y-2">
                {['Definitions', 'Classifications', 'Illustrations', 'Refinements'].map((std) => (
                  <div key={std} className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <ChevronRight className="h-3 w-3 text-indigo-500" />
                    {std}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-red-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5" /> Intellectual Integrity
              </h4>
              <div className="space-y-2 text-xs text-slate-500 font-medium">
                <p>Identify unsupported claims and weaknesses.</p>
                <p>Explicitly state data bounds and uncertainty.</p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <h4 className="text-amber-500 text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
              Final Objective
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              The ultimate aim is not to deliver a final answer, but to ensure the soundness of the thought process. Every interaction is an exercise in mental discipline.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800/50 mt-4 leading-relaxed">
            <p className="text-slate-500 text-[10px] text-center font-medium italic">
              "The value of a conversation lies not in the volume of information exchanged, but in the clarity of the logic produced."
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
