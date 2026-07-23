"use client";

import { motion } from "framer-motion";
import { ClipboardList, Clock, CheckCircle2 } from "lucide-react";
import { FuzzyResult } from "@/lib/fuzzy-engine";

interface SessionOverviewCardProps {
  fuzzyResult: FuzzyResult;
  breakDuration: number;
  reviewDuration: number;
  estimatedFinishTime: string;
}

export function SessionOverviewCard({ fuzzyResult, breakDuration, reviewDuration, estimatedFinishTime }: SessionOverviewCardProps) {
  
  return (
    <div className="bg-bg-secondary p-6 rounded-2xl border border-border-color shadow-sm h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-6">
          <ClipboardList size={20} className="text-purple-500" />
          <h3 className="text-lg font-bold font-serif">Session Overview</h3>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-bg-primary p-3 rounded-xl border border-border-color">
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold mb-1 block">Study</span>
            <span className="text-lg font-bold font-mono">{fuzzyResult.duration} <span className="text-xs font-sans font-normal text-text-muted">min</span></span>
          </div>
          <div className="bg-bg-primary p-3 rounded-xl border border-border-color">
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold mb-1 block">Break</span>
            <span className="text-lg font-bold font-mono text-green-500">{breakDuration} <span className="text-xs font-sans font-normal text-text-muted">min</span></span>
          </div>
          <div className="bg-bg-primary p-3 rounded-xl border border-border-color">
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold mb-1 block">Review</span>
            <span className="text-lg font-bold font-mono text-purple-500">{reviewDuration} <span className="text-xs font-sans font-normal text-text-muted">min</span></span>
          </div>
          <div className="bg-bg-primary p-3 rounded-xl border border-border-color">
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold mb-1 block">Blocks</span>
            <span className="text-lg font-bold font-mono text-accent-blue">{Math.max(1, Math.round(fuzzyResult.duration / 30))} <span className="text-xs font-sans font-normal text-text-muted">sets</span></span>
          </div>
        </div>
      </div>

      <div className="mt-2 bg-gradient-to-r from-accent-blue/10 to-transparent p-4 rounded-xl border-l-4 border-l-accent-blue flex items-center justify-between">
        <div className="flex items-center gap-2 text-text-primary font-semibold text-sm">
          <Clock size={16} className="text-accent-blue" />
          Estimated Finish
        </div>
        <span className="font-mono font-bold text-lg">{estimatedFinishTime}</span>
      </div>
    </div>
  );
}
