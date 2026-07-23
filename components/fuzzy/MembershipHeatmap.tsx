"use client";

import { motion } from "framer-motion";
import { MembershipDegrees } from "@/lib/fuzzy-engine";
import { Info } from "lucide-react";

interface MembershipHeatmapProps {
  label: string;
  mems: MembershipDegrees;
  learningMode: boolean;
  type: "focus" | "fatigue" | "complexity";
}

export function MembershipHeatmap({ label, mems, learningMode, type }: MembershipHeatmapProps) {
  const categories = [
    { key: "low", title: type === "complexity" ? "Easy" : "Low", color: "bg-blue-500" },
    { key: "medium", title: "Medium", color: "bg-green-500" },
    { key: "high", title: type === "complexity" ? "Hard" : "High", color: "bg-red-500" }
  ] as const;

  return (
    <div className="bg-bg-primary p-3 rounded-lg border border-border-color">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold block">{label}</span>
        {learningMode && (
          <div className="group relative cursor-help text-text-muted hover:text-accent-blue">
            <Info size={12} />
            <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-bg-tertiary border border-border-color text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-text-primary">
              Shows how strongly the crisp input belongs to each fuzzy category (0.0 to 1.0).
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        {categories.map((cat) => {
          const val = mems[cat.key];
          return (
            <div key={cat.key} className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px] text-text-secondary font-semibold">
                <span>{cat.title}</span>
                <span className="font-mono">{val.toFixed(2)}</span>
              </div>
              <div className="w-full h-1.5 bg-bg-secondary rounded-full overflow-hidden border border-border-color/50">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${val * 100}%` }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  className={`h-full ${cat.color} opacity-80`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
