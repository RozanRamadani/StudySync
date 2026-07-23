"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Coffee, Droplets, EyeOff, Dumbbell, Wind } from "lucide-react";
import { FuzzyResult } from "@/lib/fuzzy-engine";

interface AdaptiveBreakProps {
  input: { focus: number; fatigue: number; complexity: number };
}

export function AdaptiveBreak({ input }: AdaptiveBreakProps) {
  
  const recommendations = useMemo(() => {
    let duration = 5;
    if (input.fatigue >= 70) duration = 15;
    else if (input.fatigue >= 40) duration = 10;

    const activities = [
      { id: "water", label: "Drink Water", icon: <Droplets size={16} /> },
    ];

    if (input.fatigue >= 70) {
      activities.push({ id: "eyes", label: "Rest Eyes", icon: <EyeOff size={16} /> });
      activities.push({ id: "breathe", label: "Deep Breathing", icon: <Wind size={16} /> });
    } else {
      activities.push({ id: "stretch", label: "Stretch", icon: <Dumbbell size={16} /> });
    }

    return { duration, activities };
  }, [input]);

  return (
    <div className="bg-bg-secondary p-6 rounded-2xl border border-border-color shadow-sm h-full">
      <div className="flex items-center gap-2 mb-4">
        <Coffee size={20} className="text-green-500" />
        <h3 className="text-lg font-bold font-serif">Adaptive Break</h3>
      </div>
      
      <div className="mb-4 flex items-center justify-between bg-bg-primary p-3 rounded-xl border border-border-color">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Suggested Break</span>
        <span className="text-lg font-bold font-mono text-green-500">{recommendations.duration} Min</span>
      </div>

      <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold mb-2 block">Activities for Fatigue Level {input.fatigue}%</span>
      
      <div className="flex flex-col gap-2">
        {recommendations.activities.map((act, idx) => (
          <motion.div 
            key={act.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * idx }}
            className="flex items-center gap-3 bg-green-500/5 border border-green-500/20 p-2.5 rounded-lg text-sm text-text-primary font-medium"
          >
            <div className="text-green-500">{act.icon}</div>
            {act.label}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
