"use client";

import { motion } from "framer-motion";
import { Lightbulb, Target, Battery, BrainCircuit, ArrowRight } from "lucide-react";
import { FuzzyResult } from "@/lib/fuzzy-engine";
import { useMemo } from "react";

interface SmartStudyTipsProps {
  fuzzyResult: FuzzyResult;
  input: { focus: number; fatigue: number; complexity: number };
}

export function SmartStudyTips({ fuzzyResult, input }: SmartStudyTipsProps) {
  const tips = useMemo(() => {
    const list: { title: string; steps: string[]; icon: React.ReactNode; color: string }[] = [];

    // Focus driven tips
    if (fuzzyResult.focusMembership.high >= 0.5) {
      list.push({
        title: "High Focus (Deep Work)",
        steps: ["Disable all notifications", "Use website blockers", "Start with most difficult material"],
        icon: <Target size={20} />,
        color: "text-blue-500 bg-blue-500/10 border-blue-500/20"
      });
    } else if (fuzzyResult.focusMembership.low >= 0.5) {
      list.push({
        title: "Low Focus (Quick Wins)",
        steps: ["Use Pomodoro (15-20 min)", "Change study environment", "Break tasks into micro-steps"],
        icon: <Target size={20} />,
        color: "text-orange-500 bg-orange-500/10 border-orange-500/20"
      });
    }

    // Fatigue driven tips
    if (fuzzyResult.fatigueMembership.high >= 0.5) {
      list.push({
        title: "High Fatigue (Recovery)",
        steps: ["Rest 15 mins first", "Drink plenty of water", "Study easier, familiar material"],
        icon: <Battery size={20} />,
        color: "text-red-500 bg-red-500/10 border-red-500/20"
      });
    } else if (fuzzyResult.fatigueMembership.low >= 0.5) {
      list.push({
        title: "Fresh State (High Energy)",
        steps: ["Tackle new concepts", "Engage in active recall", "Do practice tests"],
        icon: <Battery size={20} />,
        color: "text-green-500 bg-green-500/10 border-green-500/20"
      });
    }

    // Complexity driven tips
    if (fuzzyResult.complexityMembership.high >= 0.5) {
      list.push({
        title: "High Complexity (Mastery)",
        steps: ["Use the Feynman Technique", "Create mind maps", "Explain to a rubber duck"],
        icon: <BrainCircuit size={20} />,
        color: "text-purple-500 bg-purple-500/10 border-purple-500/20"
      });
    }

    // Default if somehow none match
    if (list.length === 0) {
      list.push({
        title: "Moderate Condition (Steady Pace)",
        steps: ["Maintain steady pace", "Use Spaced Repetition", "Review flashcards"],
        icon: <Lightbulb size={20} />,
        color: "text-accent-blue bg-accent-blue-soft border-border-color"
      });
    }

    return list.slice(0, 3); // Max 3 tips
  }, [fuzzyResult]);

  return (
    <div className="bg-bg-secondary p-6 rounded-2xl border border-border-color shadow-sm h-full">
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb size={20} className="text-warning" />
        <h3 className="text-lg font-bold font-serif">Smart Study Tips</h3>
      </div>

      <div className="flex flex-col gap-4">
        {tips.map((tip, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
            className="flex flex-col gap-3"
          >
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold w-fit ${tip.color}`}>
              {tip.icon} {tip.title}
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary pl-2 flex-wrap">
              {tip.steps.map((step, sIdx) => (
                <div key={sIdx} className="flex items-center gap-2">
                  <span className="font-medium bg-bg-primary px-2 py-1 rounded border border-border-color">{step}</span>
                  {sIdx < tip.steps.length - 1 && <ArrowRight size={14} className="text-text-muted" />}
                </div>
              ))}
            </div>
            {idx < tips.length - 1 && <div className="w-full h-px bg-border-color/50 my-1" />}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
