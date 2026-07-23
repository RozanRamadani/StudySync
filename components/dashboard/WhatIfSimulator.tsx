import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Beaker, Play, Info } from 'lucide-react';
import { calculateFuzzy, FuzzyResult } from '@/lib/fuzzy-engine';

export function WhatIfSimulator() {
  const [simFocus, setSimFocus] = useState(85);
  const [simFatigue, setSimFatigue] = useState(20);
  const [simComplexity, setSimComplexity] = useState(40);
  const [simResult, setSimResult] = useState<FuzzyResult | null>(null);

  const handleSimulate = () => {
    const result = calculateFuzzy({ focus: simFocus, fatigue: simFatigue, complexity: simComplexity });
    setSimResult(result);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-secondary border border-purple-500/30 rounded-2xl p-6 shadow-sm relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5 text-purple-500 pointer-events-none -mr-4 -mt-4">
        <Beaker size={128} />
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-500/10 p-2 rounded-lg">
          <Beaker className="text-purple-500" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold">What-If Simulator</h3>
          <p className="text-xs text-text-muted">Simulate conditions without saving to history</p>
        </div>
      </div>

      <div className="space-y-4 mb-6 relative z-10">
        <Slider label="Hypothetical Focus" value={simFocus} setter={setSimFocus} />
        <Slider label="Hypothetical Fatigue" value={simFatigue} setter={setSimFatigue} />
        <Slider label="Hypothetical Complexity" value={simComplexity} setter={setSimComplexity} />
      </div>

      <button
        onClick={handleSimulate}
        className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors relative z-10"
      >
        <Play size={18} /> Run Simulation
      </button>

      {simResult && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 pt-6 border-t border-border-color"
        >
          <h4 className="text-sm font-bold text-text-secondary mb-3">Simulation Output</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg-primary border border-border-color rounded-xl p-4 text-center">
              <span className="block text-xs text-text-muted mb-1">Est. Recommendation</span>
              <span className="block text-3xl font-bold font-serif text-purple-500">{simResult.duration}m</span>
            </div>
            <div className="bg-bg-primary border border-border-color rounded-xl p-4 text-center">
              <span className="block text-xs text-text-muted mb-1">Est. Readiness / Confidence</span>
              <span className="block text-3xl font-bold font-serif text-accent-blue">{simResult.confidence}%</span>
            </div>
          </div>
          <div className="mt-4 bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg flex items-start gap-2">
            <Info size={16} className="text-purple-500 shrink-0 mt-0.5" />
            <p className="text-xs text-text-secondary">
              This result is simulated based on the current fuzzy logic rule base and your chosen hypothetical inputs. No data was saved.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function Slider({ label, value, setter }: { label: string, value: number, setter: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-medium text-text-secondary mb-2">
        <span>{label}</span>
        <span className="text-purple-500 font-bold">{value}%</span>
      </div>
      <input
        type="range" min={0} max={100} value={value}
        onChange={(e) => setter(Number(e.target.value))}
        className="w-full h-2 bg-border-color rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );
}
