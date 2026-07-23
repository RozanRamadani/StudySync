"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FuzzyResult } from "@/lib/fuzzy-engine";
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react";

interface DefuzzificationWalkthroughProps {
  fuzzyResult: FuzzyResult;
  input: { focus: number; fatigue: number; complexity: number };
}

export function DefuzzificationWalkthrough({ fuzzyResult, input }: DefuzzificationWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps = [
    {
      id: "input",
      title: "Input Retrieval",
      desc: "Capturing crisp values from the calculator.",
      visual: `Focus: ${input.focus} | Fatigue: ${input.fatigue} | Complexity: ${input.complexity}`
    },
    {
      id: "fuzzification",
      title: "Membership Calculation",
      desc: "Mapping crisp values to fuzzy sets (Low, Medium, High).",
      visual: "μ(Focus) = [L, M, H], μ(Fatigue) = [L, M, H]..."
    },
    {
      id: "evaluation",
      title: "Rule Evaluation",
      desc: "Applying IF-THEN rules and finding firing strengths using MIN.",
      visual: `${fuzzyResult.activeRules.length} active rules generated.`
    },
    {
      id: "aggregation",
      title: "Aggregation",
      desc: "Combining all rule outputs into a single fuzzy shape using MAX.",
      visual: `Maximum firing strength (α): ${Math.max(...(fuzzyResult.activeRules.map(r => r.strength) || [0]), 0).toFixed(2)}`
    },
    {
      id: "centroid",
      title: "Centroid Calculation",
      desc: "Finding the center of gravity of the aggregated shape.",
      visual: `∫ z·μ(z) dz / ∫ μ(z) dz = ${fuzzyResult.duration}`
    },
    {
      id: "output",
      title: "Final Recommendation",
      desc: "Mapping the centroid value back to a category.",
      visual: `${fuzzyResult.duration} Min (${fuzzyResult.category})`
    }
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      if (currentStep < steps.length - 1) {
        timer = setTimeout(() => {
          setCurrentStep(s => s + 1);
        }, 2000);
      } else {
        setIsPlaying(false);
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length]);

  return (
    <div className="bg-bg-secondary border border-border-color rounded-xl p-6 shadow-sm mb-8 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif">Timeline Animation</h2>
          <p className="text-sm text-text-muted mt-1">Step-by-step walkthrough of the Mamdani process.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-bg-primary p-1.5 rounded-lg border border-border-color">
          <button 
            onClick={() => setCurrentStep(0)}
            disabled={currentStep === 0}
            className="p-1.5 rounded hover:bg-bg-tertiary disabled:opacity-30 transition-colors"
          >
            <SkipBack size={16} />
          </button>
          
          <button 
            onClick={() => {
              if (currentStep === steps.length - 1) setCurrentStep(0);
              setIsPlaying(!isPlaying);
            }}
            className="p-1.5 rounded hover:bg-bg-tertiary bg-accent-blue/10 text-accent-blue transition-colors"
          >
            {isPlaying ? <Pause size={16} /> : currentStep === steps.length - 1 ? <RotateCcw size={16} /> : <Play size={16} />}
          </button>

          <button 
            onClick={() => setCurrentStep(s => Math.min(steps.length - 1, s + 1))}
            disabled={currentStep === steps.length - 1}
            className="p-1.5 rounded hover:bg-bg-tertiary disabled:opacity-30 transition-colors"
          >
            <SkipForward size={16} />
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Progress bar background */}
        <div className="absolute top-4 left-0 right-0 h-1 bg-border-color rounded-full z-0" />
        
        {/* Active progress */}
        <div 
          className="absolute top-4 left-0 h-1 bg-accent-blue rounded-full z-0 transition-all duration-500 ease-in-out"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />

        <div className="flex justify-between relative z-10">
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentStep;
            const isActive = idx === currentStep;
            
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 w-16 cursor-pointer group" onClick={() => { setIsPlaying(false); setCurrentStep(idx); }}>
                <motion.div 
                  initial={false}
                  animate={{ 
                    scale: isActive ? 1.2 : 1,
                    backgroundColor: isActive ? 'var(--accent-blue)' : isCompleted ? 'var(--accent-blue)' : 'var(--bg-primary)',
                    borderColor: isActive ? 'var(--accent-blue)' : isCompleted ? 'var(--accent-blue)' : 'var(--border-color)'
                  }}
                  className={`w-3 h-3 rounded-full border-2 transition-colors duration-300 ${isCompleted ? 'text-white' : ''}`}
                />
                <span className={`text-[10px] font-bold text-center transition-colors hidden sm:block ${isActive ? 'text-accent-blue' : isCompleted ? 'text-text-primary' : 'text-text-muted'}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 bg-bg-primary rounded-xl p-6 border border-border-color min-h-[140px] flex items-center justify-center relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-center w-full"
          >
            <h3 className="text-lg font-bold text-accent-blue mb-2">{steps[currentStep].title}</h3>
            <p className="text-sm text-text-secondary mb-4">{steps[currentStep].desc}</p>
            <div className="inline-block bg-bg-secondary border border-border-color px-4 py-2 rounded-lg font-mono text-xs text-text-primary font-bold">
              {steps[currentStep].visual}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
