"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, BookOpen, ChevronDown, ChevronUp, Search, ArrowRight, Download, Play, Target, Layers, BarChart3, GitBranch } from "lucide-react";
import { fuzzifyFocus, fuzzifyFatigue, fuzzifyComplexity, outputMembershipFn } from "@/lib/fuzzy-engine";

const pipelineSteps = [
  { icon: <Cpu size={24} />, title: "Fuzzification", desc: "Converting crisp input data into degrees of membership across sets.", step: "Step 01" },
  { icon: <GitBranch size={24} />, title: "Rule Base", desc: "Applying 'If-Then' logic to the fuzzy inputs to determine outcomes.", step: "Step 02" },
  { icon: <Layers size={24} />, title: "Aggregation", desc: "Combining outputs of all evaluated rules into a single fuzzy set.", step: "Step 03" },
  { icon: <BarChart3 size={24} />, title: "Defuzzification", desc: "Calculating final crisp numerical values using the Centroid method.", step: "Step 04" },
];

const ruleGroups = [
  {
    id: 1, title: "Rule Set: Low Engagement (ACTIVE)", active: true,
    rules: [
      { condition: 'If Study Hours are LOW and Focus is LOW, then Recommendation is URGENT REVIEW.', inputStrength: 0.82, outcomeWeight: 0.95 },
    ]
  },
  { id: 2, title: "Rule Set: Moderate Progress", active: false, rules: [{ condition: 'If Study Hours are MEDIUM and Focus is MEDIUM, then Recommendation is MAINTAIN PACE.', inputStrength: 0.60, outcomeWeight: 0.70 }] },
  { id: 3, title: "Rule Set: Peak Optimization", active: false, rules: [{ condition: 'If Study Hours are HIGH and Focus is HIGH, then Recommendation is OPTIMIZE DEEP WORK.', inputStrength: 0.45, outcomeWeight: 0.55 }] },
];

export default function FuzzyLogicPage() {
  const [graphMode, setGraphMode] = useState<"input" | "output">("input");
  const [graphValue, setGraphValue] = useState(50);
  const [expandedRule, setExpandedRule] = useState<number | null>(1);
  const [ruleSearch, setRuleSearch] = useState("");

  // Generate graph data
  const graphPoints: { x: number; lines: { label: string; y: number; color: string }[] }[] = [];
  
  if (graphMode === "input") {
    for (let x = 0; x <= 100; x += 2) {
      const mem = fuzzifyFocus(x);
      graphPoints.push({
        x,
        lines: [
          { label: "Low", y: mem.low, color: "#3B82F6" },
          { label: "Medium", y: mem.medium, color: "#10B981" },
          { label: "High", y: mem.high, color: "#EF4444" },
        ],
      });
    }
  } else {
    for (let x = 15; x <= 150; x += 2) {
      graphPoints.push({
        x,
        lines: [
          { label: "S.Pendek", y: outputMembershipFn(x, "sangatPendek"), color: "#EF4444" },
          { label: "Pendek", y: outputMembershipFn(x, "pendek"), color: "#F59E0B" },
          { label: "Sedang", y: outputMembershipFn(x, "sedang"), color: "#10B981" },
          { label: "Panjang", y: outputMembershipFn(x, "panjang"), color: "#3B82F6" },
          { label: "S.Panjang", y: outputMembershipFn(x, "sangatPanjang"), color: "#8B5CF6" },
        ],
      });
    }
  }

  const graphWidth = 600;
  const graphHeight = 200;
  const xMin = graphMode === "input" ? 0 : 15;
  const xMax = graphMode === "input" ? 100 : 150;

  function toSvgX(x: number) { return ((x - xMin) / (xMax - xMin)) * graphWidth; }
  function toSvgY(y: number) { return graphHeight - y * graphHeight; }

  const uniqueLabels = graphPoints[0]?.lines.map(l => ({ label: l.label, color: l.color })) || [];

  return (
    <div className="page-wrapper">
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* Hero Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem", marginBottom: "3rem", alignItems: "center" }}
          className="grid-hero"
        >
          <div>
            <span style={{ display: "inline-block", background: "var(--accent-blue-soft)", color: "var(--accent-blue)", padding: "4px 14px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, marginBottom: 16 }}>
              ✨ AI Core Concepts
            </span>
            <h1 style={{ fontSize: "2.5rem", lineHeight: 1.2, marginBottom: 12 }}>Understanding Fuzzy Logic</h1>
            <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 24, maxWidth: 500 }}>
              Explore how StudySync uses the Mamdani method to transform ambiguous study habits into precise, actionable academic recommendations.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <a href="/calculator" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", background: "var(--accent-blue)", color: "white", borderRadius: "var(--radius-md)", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none" }}>
                <Play size={14} /> Start Simulation
              </a>
              <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", background: "var(--bg-secondary)", color: "var(--text-primary)", borderRadius: "var(--radius-md)", fontSize: "0.85rem", fontWeight: 500, border: "1px solid var(--border-color)", cursor: "pointer" }}>
                <Download size={14} /> Download Guide
              </button>
            </div>
          </div>
          <div style={{ background: "linear-gradient(135deg, #F59E0B22, #8B5CF622)", borderRadius: "var(--radius-xl)", height: 200, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <div style={{ fontSize: "4rem", opacity: 0.3 }}>🧠</div>
          </div>
        </motion.div>

        {/* Mamdani Pipeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 style={{ fontSize: "1.5rem", textAlign: "center", marginBottom: "2rem" }}>The Mamdani Inference Pipeline</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "3rem" }}>
            {pipelineSteps.map((step, i) => (
              <motion.div key={i} whileHover={{ y: -4 }}
                style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-lg)", padding: "1.5rem", border: "1px solid var(--border-color)", textAlign: "center" }}
              >
                <div style={{ color: "var(--accent-blue)", margin: "0 auto 12px", width: 48, height: 48, borderRadius: "var(--radius-md)", background: "var(--accent-blue-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>{step.icon}</div>
                <h3 style={{ fontSize: "1rem", marginBottom: 6, fontFamily: "Inter, sans-serif", fontWeight: 600 }}>{step.title}</h3>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{step.desc}</p>
                <span style={{ fontSize: "0.7rem", color: "var(--accent-blue)", fontWeight: 600, marginTop: 8, display: "inline-block" }}>{step.step}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Membership Graphs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-xl)", padding: "2rem", border: "1px solid var(--border-color)", marginBottom: "2rem" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <h2 style={{ fontSize: "1.3rem", marginBottom: 4 }}>Fuzzy Membership Graphs</h2>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Visualizing input variables. <strong>Drag the slider</strong> to see membership degrees update.</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {(["input", "output"] as const).map((mode) => (
                <button key={mode} onClick={() => setGraphMode(mode)}
                  style={{ padding: "6px 16px", borderRadius: 20, fontSize: "0.8rem", fontWeight: 500, border: "1px solid var(--border-color)", cursor: "pointer", background: graphMode === mode ? "var(--accent-blue)" : "transparent", color: graphMode === mode ? "white" : "var(--text-secondary)" }}
                >
                  {mode === "input" ? "Input: Study Duration" : "Output: Score"}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Graph */}
          <div style={{ overflowX: "auto" }}>
            <svg viewBox={`0 0 ${graphWidth} ${graphHeight + 30}`} style={{ width: "100%", maxWidth: graphWidth }}>
              {/* Grid */}
              {[0, 0.25, 0.5, 0.75, 1].map((y) => (
                <line key={y} x1={0} y1={toSvgY(y)} x2={graphWidth} y2={toSvgY(y)} stroke="var(--border-color)" strokeWidth={0.5} strokeDasharray={y > 0 && y < 1 ? "4,4" : "0"} />
              ))}
              {/* Lines */}
              {uniqueLabels.map((line, li) => {
                const points = graphPoints.map((p) => `${toSvgX(p.x)},${toSvgY(p.lines[li].y)}`).join(" ");
                return (
                  <g key={li}>
                    <polyline points={points} fill="none" stroke={line.color} strokeWidth={2} opacity={0.8} />
                    <polyline points={`${toSvgX(graphPoints[0].x)},${graphHeight} ${points} ${toSvgX(graphPoints[graphPoints.length - 1].x)},${graphHeight}`} fill={line.color} opacity={0.06} />
                  </g>
                );
              })}
              {/* Value line */}
              <line x1={toSvgX(graphValue)} y1={0} x2={toSvgX(graphValue)} y2={graphHeight} stroke="var(--accent-blue)" strokeWidth={1.5} strokeDasharray="4,3" />
              <circle cx={toSvgX(graphValue)} cy={graphHeight / 2} r={5} fill="var(--accent-blue)" />
              {/* Labels */}
              {uniqueLabels.map((l, i) => (
                <text key={i} x={graphWidth * (i / (uniqueLabels.length - 1 || 1))} y={graphHeight + 20} fontSize={10} fill="var(--text-muted)" textAnchor="middle" style={{ textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{l.label}</text>
              ))}
            </svg>
          </div>
          <div style={{ marginTop: "1rem" }}>
            <input type="range" min={xMin} max={xMax} value={graphValue} onChange={(e) => setGraphValue(Number(e.target.value))}
              style={{ width: "100%", background: `linear-gradient(to right, var(--accent-blue) ${((graphValue - xMin) / (xMax - xMin)) * 100}%, var(--border-color) ${((graphValue - xMin) / (xMax - xMin)) * 100}%)` }}
            />
            <p style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 4 }}>Value: {graphValue}</p>
          </div>
        </motion.div>

        {/* Centroid Visualization */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem", marginBottom: "2rem" }} className="grid-centroid"
        >
          <div style={{ background: "linear-gradient(135deg, var(--accent-blue), #1D4ED8)", borderRadius: "var(--radius-xl)", padding: "2rem", color: "white" }}>
            <h2 style={{ fontSize: "1.3rem", marginBottom: 8 }}>Centroid Visualization</h2>
            <p style={{ fontSize: "0.82rem", opacity: 0.85, lineHeight: 1.6, marginBottom: "1.5rem" }}>
              Watch how the &quot;Center of Gravity&quot; (z*) shifts as the rule strengths fluctuate. The red marker represents your final actionable StudySync recommendation score.
            </p>
            <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "var(--radius-lg)", padding: "1.5rem", position: "relative" }}>
              <svg viewBox="0 0 300 120" style={{ width: "100%" }}>
                <path d="M20,100 Q80,20 150,60 Q220,100 280,80" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
                <path d="M20,100 Q80,20 150,60 Q220,100 280,80 L280,100 L20,100 Z" fill="rgba(255,255,255,0.1)" />
                <line x1={150} y1={0} x2={150} y2={120} stroke="#EF4444" strokeWidth={1.5} strokeDasharray="4,3" />
                <circle cx={150} cy={60} r={6} fill="#EF4444" />
                <text x={155} y={55} fontSize={9} fill="white">Centroid Point (z*)</text>
              </svg>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-lg)", padding: "1.5rem", border: "1px solid var(--border-color)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Target size={16} color="var(--accent-blue)" />
                <span style={{ fontSize: "0.75rem", color: "var(--accent-blue)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>The Formula</span>
              </div>
              <div style={{ fontFamily: "serif", fontSize: "1.2rem", textAlign: "center", padding: "0.5rem 0" }}>
                z* = ∫ μ<sub>A</sub>(z) · z dz / ∫ μ<sub>A</sub>(z) dz
              </div>
            </div>
            <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-lg)", padding: "1.5rem", border: "1px solid var(--border-color)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <BookOpen size={16} color="var(--accent-blue)" />
                <span style={{ fontSize: "0.75rem", color: "var(--accent-blue)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Interpretation</span>
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                The result is a single crisp value that maps onto your personalized study plan, balancing every contributing factor from focus depth to break frequency.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Inference Rule Matrix */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ marginBottom: "2rem" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <h2 style={{ fontSize: "1.3rem" }}>The Inference Rule Matrix</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "6px 14px" }}>
              <Search size={14} color="var(--text-muted)" />
              <input type="text" placeholder="Search logic rules..." value={ruleSearch} onChange={(e) => setRuleSearch(e.target.value)}
                style={{ border: "none", outline: "none", background: "none", fontSize: "0.82rem", color: "var(--text-primary)", width: 160 }}
              />
            </div>
          </div>

          {ruleGroups.filter(g => g.title.toLowerCase().includes(ruleSearch.toLowerCase())).map((group) => (
            <div key={group.id} style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-lg)", border: `1px solid ${group.active ? "var(--accent-blue)" : "var(--border-color)"}`, marginBottom: "0.75rem", overflow: "hidden" }}>
              <button
                onClick={() => setExpandedRule(expandedRule === group.id ? null : group.id)}
                style={{ width: "100%", padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 28, height: 28, borderRadius: "50%", background: group.active ? "var(--accent-blue)" : "var(--bg-primary)", color: group.active ? "white" : "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700 }}>
                    {String(group.id).padStart(2, "0")}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{group.title}</span>
                </div>
                {expandedRule === group.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              <AnimatePresence>
                {expandedRule === group.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} style={{ overflow: "hidden" }}>
                    <div style={{ padding: "0 1.25rem 1.25rem" }}>
                      {group.rules.map((rule, ri) => (
                        <div key={ri}>
                          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem", lineHeight: 1.6 }}>
                            {rule.condition.split(/(LOW|MEDIUM|HIGH|URGENT REVIEW|MAINTAIN PACE|OPTIMIZE DEEP WORK)/).map((part, pi) => {
                              const highlighted = ["LOW", "MEDIUM", "HIGH", "URGENT REVIEW", "MAINTAIN PACE", "OPTIMIZE DEEP WORK"].includes(part);
                              return highlighted ? (
                                <span key={pi} style={{ background: part === "URGENT REVIEW" ? "#FEE2E2" : "var(--accent-blue-light)", color: part === "URGENT REVIEW" ? "var(--danger)" : "var(--accent-blue)", padding: "1px 8px", borderRadius: 4, fontWeight: 600, fontSize: "0.82rem" }}>{part}</span>
                              ) : <span key={pi}>{part}</span>;
                            })}
                          </p>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                            <div style={{ background: "var(--bg-primary)", borderRadius: "var(--radius-md)", padding: "1rem" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                                <span>Input Strength</span><span>{Math.round(rule.inputStrength * 100)}%</span>
                              </div>
                              <p style={{ fontSize: "1.5rem", fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{rule.inputStrength.toFixed(2)} <span style={{ fontSize: "0.8rem", fontWeight: 400, color: "var(--text-muted)" }}>Membership</span></p>
                              <div style={{ width: "100%", height: 4, background: "var(--border-color)", borderRadius: 2, marginTop: 8 }}>
                                <div style={{ width: `${rule.inputStrength * 100}%`, height: "100%", background: "var(--accent-blue)", borderRadius: 2 }} />
                              </div>
                            </div>
                            <div style={{ background: "var(--bg-primary)", borderRadius: "var(--radius-md)", padding: "1rem" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                                <span>Outcome Weight</span><span>{Math.round(rule.outcomeWeight * 100)}%</span>
                              </div>
                              <p style={{ fontSize: "1.5rem", fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{rule.outcomeWeight.toFixed(2)} <span style={{ fontSize: "0.8rem", fontWeight: 400, color: "var(--text-muted)" }}>Influence</span></p>
                              <div style={{ width: "100%", height: 4, background: "var(--border-color)", borderRadius: 2, marginTop: 8 }}>
                                <div style={{ width: `${rule.outcomeWeight * 100}%`, height: "100%", background: "var(--warning)", borderRadius: 2 }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <a href="/calculator" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 24px", background: "var(--accent-blue)", color: "white", borderRadius: 24, fontSize: "0.85rem", fontWeight: 600, textDecoration: "none" }}>
              View All 27 Logic Rules <ArrowRight size={14} />
            </a>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ background: "var(--accent-blue-soft)", borderRadius: "var(--radius-xl)", padding: "3rem 2rem", textAlign: "center", marginBottom: "2rem" }}
        >
          <h2 style={{ fontSize: "1.5rem", marginBottom: 8 }}>Experience the Precision</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", maxWidth: 500, margin: "0 auto 1.5rem", lineHeight: 1.6 }}>
            StudySync&apos;s fuzzy logic engine is currently processing over 1.2 million study sessions per day. Join the future of personalized education with Mamdani-based optimization.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/calculator" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 24px", background: "var(--accent-blue)", color: "white", borderRadius: "var(--radius-md)", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none" }}>Start Simulator</a>
            <button style={{ padding: "10px 24px", background: "var(--bg-secondary)", color: "var(--text-primary)", borderRadius: "var(--radius-md)", fontSize: "0.85rem", fontWeight: 500, border: "1px solid var(--border-color)", cursor: "pointer" }}>Contact Research Team</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
