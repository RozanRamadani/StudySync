"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, Clock, Zap, BookOpen, Play, Brain, Timer, Lightbulb } from "lucide-react";
import { generateStudyTips, getCategoryLabel, FuzzyResult } from "@/lib/fuzzy-engine";
import { useStudySync } from "@/components/providers/StudySyncProvider";
import { ConfidenceRing } from "@/components/ui/ConfidenceRing";
import { AIStudyCoachDashboard } from "@/components/coach/AIStudyCoachDashboard";
import { DecisionDashboard } from "@/components/decision/DecisionDashboard";

const loadingSteps = [
  "Menganalisis intensitas fokus...",
  "Mengevaluasi fungsi keanggotaan fuzzy...",
  "Menerapkan inferensi Mamdani...",
  "Menghitung durasi optimal...",
  "Menghasilkan rekomendasi AI...",
];

export default function CalculatorPage() {
  const {
    focus,
    setFocus,
    fatigue,
    setFatigue,
    complexity,
    setComplexity,
    fuzzyResult,
    addSession,
  } = useStudySync();

  const [result, setResult] = useState<FuzzyResult | null>(null);
  const [tips, setTips] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const handleCalculate = useCallback(() => {
    setLoading(true);
    setLoadingStep(0);
    setResult(null);

    const stepDuration = 500;
    loadingSteps.forEach((_, i) => {
      setTimeout(() => setLoadingStep(i), i * stepDuration);
    });

    setTimeout(() => {
      const genTips = generateStudyTips(fuzzyResult, { focus, fatigue, complexity });
      setResult(fuzzyResult);
      setTips(genTips);
      setLoading(false);
      // We no longer addSession here. The user must explicitly choose a plan.
    }, loadingSteps.length * stepDuration + 300);
  }, [focus, fatigue, complexity, fuzzyResult]);

  const handleAddSession = useCallback((selectedDuration: number) => {
    if (!result) return;
    addSession({
      focus,
      fatigue,
      complexity,
      duration: selectedDuration,
      category: result.category,
      confidence: result.confidence,
    });
  }, [focus, fatigue, complexity, result, addSession]);

  const categoryLabel = result ? getCategoryLabel(result.category) : null;
  const strongestRule = result?.activeRules.sort((a, b) => b.strength - a.strength)[0];

  return (
    <div className="page-wrapper">
      <div className="flex flex-col lg:grid lg:grid-cols-[420px_1fr] gap-6 max-w-[1200px] mx-auto w-full">
        {/* LEFT: Input Panel */}
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-bg-secondary rounded-2xl p-6 sm:p-8 border border-border-color shadow-md relative overflow-hidden w-full"
          >
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-5 text-8xl leading-none font-mono text-accent-blue pointer-events-none">
              {"{ }"}
            </div>

            <div className="flex items-center gap-3 mb-7">
              <SlidersHorizontal size={20} className="text-accent-blue" />
              <h2 className="text-xl sm:text-2xl font-bold">Input Parameter</h2>
            </div>

            {/* Sliders */}
            {[
              { label: "Tingkat Fokus", value: focus, set: setFocus, low: "Rendah", high: "Tinggi", color: "#2563EB" },
              { label: "Tingkat Kelelahan", value: fatigue, set: setFatigue, low: "Segar", high: "Lelah", color: "#2563EB" },
              { label: "Kompleksitas Materi", value: complexity, set: setComplexity, low: "Mudah", high: "Rumit", color: "#2563EB" },
            ].map((slider, i) => (
              <div key={i} className={`mb-${i < 2 ? '7' : '8'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-text-primary">{slider.label}</span>
                  <span className="text-xs font-semibold text-white bg-accent-blue rounded-full px-3 py-0.5">{slider.value}%</span>
                </div>
                <input
                  type="range" min={0} max={100} value={slider.value}
                  onChange={(e) => slider.set(Number(e.target.value))}
                  className="w-full"
                  style={{ background: `linear-gradient(to right, ${slider.color} ${slider.value}%, var(--border-color) ${slider.value}%)` }}
                />
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs text-text-muted">{slider.low}</span>
                  <span className="text-xs text-text-muted">{slider.high}</span>
                </div>
              </div>
            ))}

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleCalculate} disabled={loading}
              className={`w-full p-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-colors ${loading ? 'bg-text-muted cursor-not-allowed' : 'bg-accent-blue hover:bg-accent-blue-hover cursor-pointer'}`}
            >
              <Clock size={18} /> Hitung Durasi
            </motion.button>
          </motion.div>

          {/* AI Insights Card removed in favor of AIStudyCoachDashboard */}
        </div>

        {/* RIGHT: Results */}
        <div className="flex flex-col gap-6 w-full">
          {/* Loading State */}
          <AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-bg-secondary rounded-2xl p-10 sm:p-12 border border-border-color text-center w-full"
              >
                <Brain size={48} className="text-accent-blue mx-auto mb-6 animate-pulse" />
                <div className="flex flex-col gap-3 max-w-[280px] mx-auto">
                  {loadingSteps.map((step, i) => (
                    <motion.div key={i} initial={{ opacity: 0.3 }} animate={{ opacity: i <= loadingStep ? 1 : 0.3 }}
                      className={`text-sm sm:text-base text-left flex items-center gap-2 transition-all duration-300 ${i <= loadingStep ? 'text-accent-blue' : 'text-text-muted'} ${i === loadingStep ? 'font-semibold' : 'font-normal'}`}
                    >
                      <span className="shrink-0">{i < loadingStep ? "✓" : i === loadingStep ? "⟳" : "○"}</span> 
                      <span>{step}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Decision Dashboard - The core of Milestone 2 */}
          {!loading && result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
              <DecisionDashboard onSelectPlan={handleAddSession} />
            </motion.div>
          )}

          {/* Legacy Explainability (Membership & Active Rule) - Pushed to bottom as Advanced Info */}
          {!loading && result && strongestRule && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-8 pt-8 border-t border-border-color print:hidden">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-text-secondary"><Brain size={18} /> Advanced Fuzzy Logic Explainability</h3>
              <div className="bg-bg-secondary rounded-2xl p-6 border border-border-color shadow-sm w-full mb-6">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="bg-accent-blue text-white px-2.5 py-1 rounded-md text-xs font-bold shrink-0">RULE #{strongestRule.id}</span>
                  <span className="text-xs font-semibold tracking-wider text-text-muted">ACTIVE LOGIC PATH</span>
                  <div className="w-full sm:w-auto sm:ml-auto flex items-center gap-4 text-xs">
                    <span className="text-accent-blue">● Alpha: {strongestRule.strength.toFixed(2)}</span>
                    <span className="text-warning">● Inf: {result.confidence}%</span>
                  </div>
                </div>
                <p className="font-serif text-lg italic leading-relaxed text-text-primary">
                  &quot;IF <span className="text-accent-blue underline decoration-2 underline-offset-4">Fokus {strongestRule.focus === "high" ? "Tinggi" : strongestRule.focus === "medium" ? "Sedang" : "Rendah"}</span> AND{" "}
                  <span className="text-accent-blue underline decoration-2 underline-offset-4">Kelelahan {strongestRule.fatigue === "high" ? "Tinggi" : strongestRule.fatigue === "medium" ? "Sedang" : "Rendah"}</span> THEN{" "}
                  <span className="text-accent-blue underline decoration-2 underline-offset-4">Durasi {strongestRule.output === "sangatPanjang" ? "Sangat Lama" : strongestRule.output === "panjang" ? "Lama" : strongestRule.output === "sedang" ? "Sedang" : strongestRule.output === "pendek" ? "Pendek" : "Sangat Pendek"}</span>&quot;
                </p>
              </div>

              <div className="bg-bg-secondary rounded-2xl p-6 border border-border-color shadow-sm w-full">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen size={16} className="text-accent-blue" />
                  <span className="font-semibold text-base">Membership Analysis</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Focus: " + (focus >= 50 ? "Tinggi" : focus >= 25 ? "Sedang" : "Rendah"), mu: Math.max(result.focusMembership.low, result.focusMembership.medium, result.focusMembership.high) },
                    { label: "Fatigue: " + (fatigue >= 50 ? "Tinggi" : fatigue >= 25 ? "Sedang" : "Rendah"), mu: Math.max(result.fatigueMembership.low, result.fatigueMembership.medium, result.fatigueMembership.high) },
                    { label: "Complexity: " + (complexity >= 50 ? "Sulit" : complexity >= 25 ? "Sedang" : "Mudah"), mu: Math.max(result.complexityMembership.low, result.complexityMembership.medium, result.complexityMembership.high) },
                  ].map((item, i) => (
                    <div key={i} className="bg-bg-primary rounded-xl p-4 border border-border-color">
                      <p className="text-xs sm:text-sm text-text-secondary mb-2">{item.label}</p>
                      <div className="w-full h-1.5 bg-border-color rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${item.mu * 100}%` }} transition={{ duration: 0.8 }} className="h-full bg-accent-blue rounded-full" />
                      </div>
                      <p className="text-xs text-accent-blue mt-2 font-medium">μ = {item.mu.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && !result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-bg-secondary rounded-2xl p-10 sm:p-16 border border-border-color text-center flex flex-col items-center gap-4 w-full"
            >
              <Brain size={56} className="text-border-color" />
              <h3 className="text-lg font-semibold text-text-secondary">Setel parameter di samping & klik &quot;Hitung Durasi&quot;</h3>
              <p className="text-sm text-text-muted max-w-sm">
                Mesin logika fuzzy AI kami akan menganalisis input Anda dan merekomendasikan durasi belajar yang optimal.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
