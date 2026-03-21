import React from "react";
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
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function ThinkingProcess() {
  return (
    <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-md overflow-hidden transition-all hover:bg-slate-900/60 group">
      <CardHeader className="border-b border-slate-800/50 bg-slate-800/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-white text-lg font-bold tracking-tight">Introduction</CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              How the internal architecture processes human thought
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="relative">
          <div className="absolute -left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full opacity-50" />
          <p className="text-slate-300 leading-relaxed italic pl-4">
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
                <span className="text-slate-200 font-semibold">Identification of Intent</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-slate-400 space-y-4 pb-4">
              <p>Every query is categorized into one of two fundamental mental states:</p>
              <div className="grid md:grid-cols-2 gap-4 mt-2">
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Info className="h-3 w-3" /> Conceptual Understanding
                  </h4>
                  <p className="text-sm">Does the user want to know what a thing is? (Definitions, attributes, and boundaries).</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <h4 className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3" /> Judgment and Validation
                  </h4>
                  <p className="text-sm">Does the user want to know if a statement is true? (Arguments, evidence, and conclusions).</p>
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
                <span className="text-slate-200 font-semibold">Calibration of Complexity</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-slate-400 space-y-4 pb-4">
              <p>I assess the depth required for the interaction:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <h4 className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Lightbulb className="h-3 w-3" /> The Learner Model
                  </h4>
                  <p className="text-sm">Used for foundational clarity. Prioritizes step-by-step explanations, relatable analogies, and removal of jargon.</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <h4 className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Zap className="h-3 w-3" /> The Analyst Model
                  </h4>
                  <p className="text-sm">Used for complex/critical inquiries. Prioritizes formal evidence, deconstruction of counter-arguments, and context.</p>
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
                <span className="text-slate-200 font-semibold">Logical Verification</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-slate-400 space-y-3 pb-4">
              <p>Before a response is generated, it passes through a series of "logical gates":</p>
              <ul className="grid grid-cols-1 gap-2">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span><strong className="text-slate-300">Premise Audit:</strong> Are the starting facts accurate?</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span><strong className="text-slate-300">Structural Integrity:</strong> Does the conclusion follow from the premises?</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span><strong className="text-slate-300">Fallacy Detection:</strong> Identify hidden biases or circular reasoning.</span>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="grid md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-3">
            <h4 className="text-indigo-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> Communication Standards
            </h4>
            <div className="space-y-2">
              {['Definitions', 'Classifications', 'Illustrations', 'Refinements'].map((std) => (
                <div key={std} className="flex items-center gap-2 text-sm text-slate-300">
                  <ChevronRight className="h-3 w-3 text-indigo-500" />
                  {std}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Intellectual Integrity
            </h4>
            <div className="space-y-2 text-sm text-slate-400">
              <p>Identify unsupported claims and weaknesses.</p>
              <p>Explicitly state when conclusions cannot be reached.</p>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <h4 className="text-amber-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
            Final Objective
          </h4>
          <p className="text-sm text-slate-400">
            The ultimate aim is not to deliver a final answer, but to ensure the soundness of the thought process. Every interaction is an exercise in mental discipline.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-800/50 mt-4">
          <p className="text-slate-500 text-xs text-center font-medium italic">
            "The value of a conversation lies not in the volume of information exchanged, but in the clarity of the logic produced."
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
