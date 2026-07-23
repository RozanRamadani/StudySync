"use client";

import { motion } from "framer-motion";
import { Info, Map, Target } from "lucide-react";
import { FuzzyResult } from "@/lib/fuzzy-engine";

interface RecommendationSummaryProps {
  fuzzyResult: FuzzyResult;
}

export function RecommendationSummary({ fuzzyResult }: RecommendationSummaryProps) {
  
  // Generate reason based on strongest rule
  const strongestRule = fuzzyResult.activeRules.sort((a, b) => b.strength - a.strength)[0];
  
  let reason = "The AI determined this duration based on a balance of your current state.";
  if (strongestRule) {
    const focusTxt = strongestRule.focus === "high" ? "high focus" : strongestRule.focus === "low" ? "low focus" : "moderate focus";
    const fatigueTxt = strongestRule.fatigue === "high" ? "high fatigue" : strongestRule.fatigue === "low" ? "low fatigue" : "moderate fatigue";
    const complexityTxt = strongestRule.complexity === "high" ? "high material complexity" : strongestRule.complexity === "low" ? "low material complexity" : "moderate material complexity";
    
    reason = `Because you reported ${focusTxt}, ${fatigueTxt}, and ${complexityTxt}, the optimal strategy is a ${fuzzyResult.category.toLowerCase()} study duration of ${fuzzyResult.duration} minutes.`;
  }

  // Generate strategy
  let strategy = "Maintain a steady pace and follow the session timeline.";
  if (fuzzyResult.duration >= 90) {
    strategy = "Immersive Deep Work. Block out all distractions and tackle the hardest problems first while your stamina holds.";
  } else if (fuzzyResult.duration >= 50) {
    strategy = "Balanced Pomodoro blocks. Work in solid chunks of time, taking mandatory short breaks to prevent burnout.";
  } else {
    strategy = "Micro-learning. Keep the session short and highly interactive to overcome low focus or high fatigue.";
  }

  // Generate goal
  const goal = `Successfully complete ${fuzzyResult.duration} minutes of focused learning, followed by active recall.`;

  return (
    <div className="bg-bg-secondary p-6 rounded-2xl border border-border-color shadow-sm h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Info size={20} className="text-accent-blue" />
          <h3 className="text-lg font-bold font-serif">Recommendation Summary</h3>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-5">
          <div className="text-[10px] text-accent-blue font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Info size={14} /> Why this recommendation?
          </div>
          <p className="text-sm text-text-secondary leading-relaxed bg-bg-primary p-3 rounded-lg border border-border-color">
            {reason}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-5">
          <div className="text-[10px] text-green-500 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Map size={14} /> Suggested Strategy
          </div>
          <p className="text-sm text-text-secondary leading-relaxed bg-bg-primary p-3 rounded-lg border border-border-color">
            {strategy}
          </p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-2">
        <div className="text-[10px] text-purple-500 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Target size={14} /> Study Goal
        </div>
        <p className="text-sm font-semibold text-text-primary bg-bg-primary p-3 rounded-lg border border-border-color border-l-4 border-l-purple-500">
          {goal}
        </p>
      </motion.div>
    </div>
  );
}
