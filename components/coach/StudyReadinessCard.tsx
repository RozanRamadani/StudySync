"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Activity, Battery, CheckCircle2 } from "lucide-react";
import { FuzzyResult } from "@/lib/fuzzy-engine";

interface StudyReadinessCardProps {
  input: { focus: number; fatigue: number; complexity: number };
  fuzzyResult: FuzzyResult;
}

export function StudyReadinessCard({ input }: StudyReadinessCardProps) {
  // Calculate raw mental energy: Focus increases it, Fatigue heavily drains it, Complexity slightly drains it.
  const mentalEnergy = useMemo(() => {
    let energy = input.focus - (input.fatigue * 0.8) - (input.complexity * 0.3);
    // Normalize to 0-100
    // Max possible is 100 - 0 - 0 = 100
    // Min possible is 0 - 80 - 30 = -110
    // Let's re-calculate a simpler heuristic:
    // Base 50 + Focus/2 - Fatigue/1.5
    energy = 50 + (input.focus * 0.6) - (input.fatigue * 0.7);
    return Math.max(5, Math.min(100, Math.round(energy)));
  }, [input]);

  const readinessScore = useMemo(() => {
    if (mentalEnergy >= 75) return { label: "High", color: "text-green-500", stroke: "#10B981" };
    if (mentalEnergy >= 40) return { label: "Medium", color: "text-orange-500", stroke: "#F59E0B" };
    return { label: "Low", color: "text-red-500", stroke: "#EF4444" };
  }, [mentalEnergy]);

  // Circular progress math
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (mentalEnergy / 100) * circumference;

  return (
    <div className="bg-bg-secondary p-6 rounded-2xl border border-border-color shadow-sm h-full flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-6">
        <Activity size={20} className="text-accent-blue" />
        <h3 className="text-lg font-bold font-serif">Study Readiness</h3>
      </div>

      <div className="flex items-center justify-between gap-4 mb-6 bg-bg-primary p-4 rounded-xl border border-border-color">
        <div className="flex flex-col">
          <span className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-1">Readiness Level</span>
          <span className={`text-2xl font-bold font-serif ${readinessScore.color}`}>
            {readinessScore.label}
          </span>
          <p className="text-[10px] text-text-muted mt-1 leading-tight max-w-[140px]">
            Based entirely on your current fuzzy inputs.
          </p>
        </div>

        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="30" strokeWidth="6" stroke="var(--border-color)" fill="transparent" />
            <motion.circle 
              cx="40" cy="40" r="30" strokeWidth="6" stroke={readinessScore.stroke} fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold font-mono">{mentalEnergy}%</span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
            <Battery size={14} className="text-accent-blue" />
            Mental Energy
          </div>
          <span className="text-xs font-mono font-bold">{mentalEnergy}%</span>
        </div>
        
        {/* Visual Energy Meter (Blocks) */}
        <div className="flex gap-1 h-3 w-full">
          {[...Array(10)].map((_, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`flex-1 rounded-sm ${i < Math.round(mentalEnergy / 10) ? 'bg-accent-blue' : 'bg-border-color'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
