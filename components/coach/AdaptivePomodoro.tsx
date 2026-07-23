"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Timer, ArrowRight, LayoutList } from "lucide-react";
import { FuzzyResult } from "@/lib/fuzzy-engine";

interface AdaptivePomodoroProps {
  fuzzyResult: FuzzyResult;
}

export function AdaptivePomodoro({ fuzzyResult }: AdaptivePomodoroProps) {
  
  const schedule = useMemo(() => {
    const blocks = [];
    const dur = fuzzyResult.duration;
    
    // Determine block size based on total duration
    let studyBlock = 25;
    let breakBlock = 5;

    if (dur >= 90) {
      studyBlock = 30;
      breakBlock = 5;
    } else if (dur <= 30) {
      studyBlock = 15;
      breakBlock = 3;
    }

    let remaining = dur;
    while (remaining > 0) {
      if (remaining <= studyBlock + breakBlock) {
        // Last block
        blocks.push({ type: "study", duration: remaining });
        remaining = 0;
      } else {
        blocks.push({ type: "study", duration: studyBlock });
        remaining -= studyBlock;
        blocks.push({ type: "break", duration: breakBlock });
        remaining -= breakBlock;
      }
    }

    return { studyBlock, breakBlock, blocks };
  }, [fuzzyResult]);

  return (
    <div className="bg-bg-secondary p-6 rounded-2xl border border-border-color shadow-sm h-full">
      <div className="flex items-center gap-2 mb-4">
        <LayoutList size={20} className="text-accent-blue" />
        <h3 className="text-lg font-bold font-serif">Adaptive Pomodoro</h3>
      </div>
      
      <p className="text-xs text-text-secondary mb-6 leading-relaxed bg-bg-primary p-3 rounded-lg border border-border-color">
        Based on your recommended duration of <strong>{fuzzyResult.duration} minutes</strong>, the AI suggests a structure of <strong>{schedule.studyBlock} min study / {schedule.breakBlock} min breaks</strong>.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {schedule.blocks.map((block, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl border shadow-sm ${block.type === 'study' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-0.5">{block.type === 'study' ? 'STDY' : 'BRK'}</span>
              <span className="text-sm font-mono font-bold">{block.duration}</span>
            </motion.div>
            
            {idx < schedule.blocks.length - 1 && (
              <ArrowRight size={14} className="text-text-muted shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
