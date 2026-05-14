"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, Clock, Zap, BookOpen, Play, Brain, Timer, Lightbulb } from "lucide-react";
import { calculateFuzzy, generateStudyTips, getCategoryLabel, FuzzyResult } from "@/lib/fuzzy-engine";
import { useStudySync } from "@/components/providers/StudySyncProvider";
import { ConfidenceRing } from "@/components/ui/ConfidenceRing";
import { TimerModal } from "@/components/timer/TimerModal";

const loadingSteps = [
  "Analyzing focus intensity...",
  "Evaluating fuzzy membership...",
  "Applying Mamdani inference...",
  "Calculating optimal duration...",
  "Generating AI recommendation...",
];

export default function CalculatorPage() {
  const [focus, setFocus] = useState(85);
  const [fatigue, setFatigue] = useState(20);
  const [complexity, setComplexity] = useState(40);
  const [result, setResult] = useState<FuzzyResult | null>(null);
  const [tips, setTips] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  const { addSession, setLastResult, setLastInput } = useStudySync();

  const handleCalculate = useCallback(() => {
    setLoading(true);
    setLoadingStep(0);
    setResult(null);

    const stepDuration = 500;
    loadingSteps.forEach((_, i) => {
      setTimeout(() => setLoadingStep(i), i * stepDuration);
    });

    setTimeout(() => {
      const input = { focus, fatigue, complexity };
      const res = calculateFuzzy(input);
      const genTips = generateStudyTips(res, input);
      setResult(res);
      setTips(genTips);
      setLastResult(res);
      setLastInput(input);
      setLoading(false);
      addSession({
        focus, fatigue, complexity,
        duration: res.duration,
        category: res.category,
        confidence: res.confidence,
      });
    }, loadingSteps.length * stepDuration + 300);
  }, [focus, fatigue, complexity, addSession, setLastResult, setLastInput]);

  const categoryLabel = result ? getCategoryLabel(result.category) : null;
  const strongestRule = result?.activeRules.sort((a, b) => b.strength - a.strength)[0];

  return (
    <div className="page-wrapper">
      <div className="grid-calc" style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* LEFT: Input Panel */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-xl)", padding: "2rem", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-md)", position: "relative", overflow: "hidden" }}
          >
            {/* Decorative */}
            <div style={{ position: "absolute", top: 0, right: 0, width: 120, height: 120, opacity: 0.05, fontSize: 100, lineHeight: 1, fontFamily: "monospace", color: "var(--accent-blue)" }}>{"{ }"}</div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.75rem" }}>
              <SlidersHorizontal size={20} color="var(--accent-blue)" />
              <h2 style={{ fontSize: "1.35rem", fontWeight: 700 }}>Input Parameter</h2>
            </div>

            {/* Sliders */}
            {[
              { label: "Tingkat Fokus", value: focus, set: setFocus, low: "Rendah", high: "Tinggi", color: "#2563EB" },
              { label: "Tingkat Kelelahan", value: fatigue, set: setFatigue, low: "Segar", high: "Lelah", color: "#2563EB" },
              { label: "Kompleksitas Materi", value: complexity, set: setComplexity, low: "Mudah", high: "Rumit", color: "#2563EB" },
            ].map((slider, i) => (
              <div key={i} style={{ marginBottom: i < 2 ? "1.75rem" : "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--text-primary)" }}>{slider.label}</span>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "white", background: "var(--accent-blue)", borderRadius: 20, padding: "2px 12px" }}>{slider.value}%</span>
                </div>
                <input
                  type="range" min={0} max={100} value={slider.value}
                  onChange={(e) => slider.set(Number(e.target.value))}
                  style={{ width: "100%", background: `linear-gradient(to right, ${slider.color} ${slider.value}%, var(--border-color) ${slider.value}%)` }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{slider.low}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{slider.high}</span>
                </div>
              </div>
            ))}

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleCalculate} disabled={loading}
              style={{ width: "100%", padding: "16px", borderRadius: "var(--radius-md)", background: loading ? "var(--text-muted)" : "var(--accent-blue)", color: "white", border: "none", cursor: loading ? "not-allowed" : "pointer", fontSize: "1rem", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.2s" }}
            >
              <Clock size={18} /> Hitung Durasi
            </motion.button>
          </motion.div>

          {/* AI Insights Card */}
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.2 }}
                style={{ marginTop: "1.5rem", background: "var(--accent-blue)", borderRadius: "var(--radius-xl)", padding: "1.5rem", color: "white" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <Lightbulb size={18} />
                  <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>AI Study Insights</span>
                </div>
                <p style={{ fontSize: "0.85rem", opacity: 0.9, lineHeight: 1.6, fontStyle: "italic" }}>
                  &quot;{tips}&quot;
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT: Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Loading State */}
          <AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-xl)", padding: "3rem 2rem", border: "1px solid var(--border-color)", textAlign: "center" }}
              >
                <Brain size={40} color="var(--accent-blue)" style={{ margin: "0 auto 1rem" }} className="animate-pulse" />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {loadingSteps.map((step, i) => (
                    <motion.div key={i} initial={{ opacity: 0.3 }} animate={{ opacity: i <= loadingStep ? 1 : 0.3 }}
                      style={{ fontSize: "0.85rem", color: i <= loadingStep ? "var(--accent-blue)" : "var(--text-muted)", fontWeight: i === loadingStep ? 600 : 400, transition: "all 0.3s" }}
                    >
                      {i < loadingStep ? "✓" : i === loadingStep ? "⟳" : "○"} {step}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recommendation Panel */}
          {!loading && result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-xl)", padding: "2rem", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-md)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 4, fontFamily: "'Playfair Display', serif" }}>Rekomendasi</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontSize: "3.5rem", fontWeight: 700, fontFamily: "'Playfair Display', serif", color: "var(--text-primary)" }}>{result.duration}</span>
                    <span style={{ fontSize: "1.5rem", fontWeight: 600, fontFamily: "'Playfair Display', serif", color: "var(--accent-blue)" }}>Menit</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    {(["Pendek", "Ideal", "Panjang"] as const).map((cat) => (
                      <span key={cat} style={{ padding: "4px 16px", borderRadius: 20, fontSize: "0.8rem", fontWeight: 500, background: cat === categoryLabel ? "var(--accent-blue)" : "var(--bg-primary)", color: cat === categoryLabel ? "white" : "var(--text-secondary)", border: `1px solid ${cat === categoryLabel ? "var(--accent-blue)" : "var(--border-color)"}` }}>
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
                <ConfidenceRing value={result.confidence} />
              </div>

              {/* Membership Analytics */}
              <div style={{ marginTop: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
                  <BookOpen size={16} color="var(--accent-blue)" />
                  <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>Membership Analytics</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem" }}>
                  {[
                    { label: "Fokus: " + (focus >= 50 ? "Tinggi" : focus >= 25 ? "Sedang" : "Rendah"), mu: Math.max(result.focusMembership.low, result.focusMembership.medium, result.focusMembership.high) },
                    { label: "Lelah: " + (fatigue >= 50 ? "Tinggi" : fatigue >= 25 ? "Sedang" : "Rendah"), mu: Math.max(result.fatigueMembership.low, result.fatigueMembership.medium, result.fatigueMembership.high) },
                    { label: "Materi: " + (complexity >= 50 ? "Sulit" : complexity >= 25 ? "Sedang" : "Mudah"), mu: Math.max(result.complexityMembership.low, result.complexityMembership.medium, result.complexityMembership.high) },
                  ].map((item, i) => (
                    <div key={i} style={{ background: "var(--bg-primary)", borderRadius: "var(--radius-md)", padding: "1rem", border: "1px solid var(--border-color)" }}>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 8 }}>{item.label}</p>
                      <div style={{ width: "100%", height: 4, background: "var(--border-color)", borderRadius: 2 }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${item.mu * 100}%` }} transition={{ duration: 0.8 }} style={{ height: "100%", background: "var(--accent-blue)", borderRadius: 2 }} />
                      </div>
                      <p style={{ fontSize: "0.75rem", color: "var(--accent-blue)", marginTop: 6, fontWeight: 500 }}>μ = {item.mu.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Active Logic Path */}
          {!loading && result && strongestRule && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-xl)", padding: "1.5rem", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                <span style={{ background: "var(--accent-blue)", color: "white", padding: "2px 10px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 700 }}>RULE #{strongestRule.id}</span>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.05em", color: "var(--text-muted)" }}>ACTIVE LOGIC PATH</span>
                <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "var(--accent-blue)" }}>● Alpha: {strongestRule.strength.toFixed(2)}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--warning)" }}>● Inf: {result.confidence}%</span>
              </div>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontStyle: "italic" }}>
                &quot;IF <span style={{ color: "var(--accent-blue)", textDecoration: "underline" }}>Fokus {strongestRule.focus === "high" ? "Tinggi" : strongestRule.focus === "medium" ? "Sedang" : "Rendah"}</span> AND{" "}
                <span style={{ color: "var(--accent-blue)", textDecoration: "underline" }}>Kelelahan {strongestRule.fatigue === "high" ? "Tinggi" : strongestRule.fatigue === "medium" ? "Sedang" : "Rendah"}</span> THEN{" "}
                <span style={{ color: "var(--accent-blue)", textDecoration: "underline" }}>Durasi {strongestRule.output === "sangatPanjang" ? "Sangat Lama" : strongestRule.output === "panjang" ? "Lama" : strongestRule.output === "sedang" ? "Sedang" : strongestRule.output === "pendek" ? "Pendek" : "Sangat Pendek"}</span>&quot;
              </p>
            </motion.div>
          )}

          {/* Stats Cards & Start Session */}
          {!loading && result && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
                {[
                  { icon: <Zap size={22} color="var(--accent-blue)" />, value: `${Math.round(result.confidence * 0.95)}%`, label: "Focus Efficiency", bars: result.confidence },
                  { icon: <Timer size={22} color="var(--accent-blue)" />, value: `${Math.max(5, Math.round(result.duration * 0.1))}m`, label: "Suggested Break", bars: 60 },
                  { icon: <BookOpen size={22} color="var(--accent-blue)" />, value: result.duration >= 90 ? "Deep" : result.duration >= 50 ? "Moderate" : "Light", label: "Study Mode", bars: Math.min(100, result.duration) },
                ].map((card, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }}
                    style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-lg)", padding: "1.25rem", border: "1px solid var(--border-color)", textAlign: "center" }}
                  >
                    <div style={{ margin: "0 auto 8px" }}>{card.icon}</div>
                    <p style={{ fontSize: "1.6rem", fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{card.value}</p>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 8 }}>{card.label}</p>
                    <div style={{ display: "flex", justifyContent: "center", gap: 3 }}>
                      {[...Array(5)].map((_, j) => (
                        <div key={j} style={{ width: 6, height: 16, borderRadius: 2, background: j < Math.ceil(card.bars / 20) ? "var(--accent-blue)" : "var(--border-color)" }} />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={() => setShowTimer(true)}
                style={{ width: "100%", padding: "18px", borderRadius: "var(--radius-lg)", background: "var(--accent-blue)", color: "white", border: "none", cursor: "pointer", fontSize: "1.05rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "'Playfair Display', serif" }}
              >
                <Play size={20} /> Start Study Session
              </motion.button>
            </>
          )}

          {/* Empty State */}
          {!loading && !result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-xl)", padding: "4rem 2rem", border: "1px solid var(--border-color)", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}
            >
              <Brain size={48} color="var(--border-color)" />
              <h3 style={{ fontSize: "1.1rem", color: "var(--text-muted)" }}>Set your parameters and click &quot;Hitung Durasi&quot;</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: 400 }}>
                Our AI-powered fuzzy logic engine will analyze your inputs and recommend the optimal study duration.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showTimer && result && (
          <TimerModal duration={result.duration} onClose={() => setShowTimer(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
