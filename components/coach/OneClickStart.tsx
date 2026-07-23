"use client";

import { motion } from "framer-motion";
import { Play, Lock, CheckCircle2 } from "lucide-react";

interface OneClickStartProps {
  onStart: () => void;
  isReady: boolean;
  estimatedFinishTime: string;
}

export function OneClickStart({ onStart, isReady, estimatedFinishTime }: OneClickStartProps) {
  return (
    <motion.button
      whileHover={isReady ? { scale: 1.01 } : {}}
      whileTap={isReady ? { scale: 0.99 } : {}}
      onClick={isReady ? onStart : undefined}
      disabled={!isReady}
      className={`w-full p-4 sm:p-5 rounded-xl border-none cursor-pointer flex flex-col items-center justify-center gap-2 font-serif transition-all shadow-md overflow-hidden relative ${
        isReady 
          ? 'bg-accent-blue hover:bg-accent-blue-hover text-white' 
          : 'bg-bg-tertiary text-text-muted cursor-not-allowed'
      }`}
      aria-label={isReady ? "Start Study Session" : "Complete checklist to start"}
    >
      {!isReady && (
        <div className="absolute inset-0 bg-striped-pattern opacity-5 mix-blend-overlay" />
      )}
      
      <div className="flex items-center gap-3 relative z-10">
        {isReady ? <Play size={24} /> : <Lock size={20} />}
        <span className="text-xl font-bold">{isReady ? "Start Session" : "Checklist Incomplete"}</span>
      </div>
      
      {isReady && (
        <div className="flex items-center gap-2 text-sm font-sans font-medium text-white/80 mt-1 relative z-10">
          <CheckCircle2 size={14} /> Ready to finish by {estimatedFinishTime}
        </div>
      )}
    </motion.button>
  );
}
