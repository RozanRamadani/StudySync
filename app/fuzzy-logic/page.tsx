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
    <div className="page-wrapper px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
      <div className="w-full">
        {/* Hero Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8 mb-12 items-center"
        >
          <div>
            <span className="inline-block bg-accent-blue-soft text-accent-blue px-3.5 py-1 rounded-full text-xs font-bold mb-4 shadow-sm border border-border-color">
              ✨ AI Core Concepts
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif leading-tight mb-3">Understanding Fuzzy Logic</h1>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-6 max-w-lg">
              Explore how StudySync uses the Mamdani method to transform ambiguous study habits into precise, actionable academic recommendations.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="/calculator" className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-accent-blue hover:bg-accent-blue-hover text-white rounded-lg text-sm font-semibold no-underline transition-colors shadow-sm">
                <Play size={16} /> Start Simulation
              </a>
              <button className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-bg-secondary hover:bg-bg-tertiary text-text-primary rounded-lg text-sm font-medium border border-border-color cursor-pointer transition-colors shadow-sm">
                <Download size={16} /> Download Guide
              </button>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#F59E0B22] to-[#8B5CF622] rounded-2xl h-48 sm:h-64 flex items-center justify-center overflow-hidden border border-border-color">
            <div className="text-6xl sm:text-7xl opacity-30 drop-shadow-md">🧠</div>
          </div>
        </motion.div>

        {/* Mamdani Pipeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 font-serif">The Mamdani Inference Pipeline</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pipelineSteps.map((step, i) => (
              <motion.div key={i} whileHover={{ y: -4 }}
                className="bg-bg-secondary rounded-xl p-6 border border-border-color text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="text-accent-blue mx-auto mb-3 w-12 h-12 rounded-lg bg-accent-blue-soft flex items-center justify-center">{step.icon}</div>
                <h3 className="text-base font-bold mb-1.5">{step.title}</h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">{step.desc}</p>
                <span className="text-[10px] sm:text-xs text-accent-blue font-bold mt-3 block uppercase tracking-wider">{step.step}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Membership Graphs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-bg-secondary rounded-2xl p-6 sm:p-8 border border-border-color mb-8 shadow-sm w-full"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold mb-1 font-serif">Fuzzy Membership Graphs</h2>
              <p className="text-xs sm:text-sm text-text-muted">Visualizing input variables. <strong className="text-text-primary">Drag the slider</strong> to see membership degrees update.</p>
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {(["input", "output"] as const).map((mode) => (
                <button key={mode} onClick={() => setGraphMode(mode)}
                  className={`flex-1 md:flex-none px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${graphMode === mode ? 'bg-accent-blue text-white border-accent-blue' : 'bg-transparent text-text-secondary border-border-color hover:bg-bg-tertiary'}`}
                >
                  {mode === "input" ? "Input: Study Duration" : "Output: Score"}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Graph */}
          <div className="w-full overflow-x-auto scrollbar-hide bg-bg-primary p-4 rounded-xl border border-border-color">
            <div className="min-w-[500px]">
              <svg viewBox={`0 0 ${graphWidth} ${graphHeight + 30}`} className="w-full h-auto">
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
                  <text key={i} x={graphWidth * (i / (uniqueLabels.length - 1 || 1))} y={graphHeight + 20} fontSize={10} fill="var(--text-muted)" textAnchor="middle" className="uppercase tracking-wider font-bold">{l.label}</text>
                ))}
              </svg>
            </div>
          </div>
          <div className="mt-6 px-2">
            <input type="range" min={xMin} max={xMax} value={graphValue} onChange={(e) => setGraphValue(Number(e.target.value))}
              className="w-full"
              style={{ background: `linear-gradient(to right, var(--accent-blue) ${((graphValue - xMin) / (xMax - xMin)) * 100}%, var(--border-color) ${((graphValue - xMin) / (xMax - xMin)) * 100}%)` }}
            />
            <p className="text-center text-xs font-semibold text-text-muted mt-2 bg-bg-secondary inline-block px-3 py-1 rounded-full mx-auto w-max border border-border-color">Value: {graphValue}</p>
          </div>
        </motion.div>

        {/* Centroid Visualization */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 mb-12"
        >
          <div className="bg-gradient-to-br from-[var(--accent-blue)] to-[#1D4ED8] rounded-2xl p-6 sm:p-8 text-white shadow-md w-full overflow-hidden">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 font-serif">Centroid Visualization</h2>
            <p className="text-sm opacity-90 leading-relaxed mb-6">
              Watch how the &quot;Center of Gravity&quot; (z*) shifts as the rule strengths fluctuate. The red marker represents your final actionable StudySync recommendation score.
            </p>
            <div className="bg-black/20 rounded-xl p-4 sm:p-6 relative border border-white/10">
              <svg viewBox="0 0 300 120" className="w-full h-auto drop-shadow-md">
                <path d="M20,100 Q80,20 150,60 Q220,100 280,80" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={2.5} />
                <path d="M20,100 Q80,20 150,60 Q220,100 280,80 L280,100 L20,100 Z" fill="rgba(255,255,255,0.15)" />
                <line x1={150} y1={0} x2={150} y2={120} stroke="#EF4444" strokeWidth={2} strokeDasharray="4,3" />
                <circle cx={150} cy={60} r={6} fill="#EF4444" className="drop-shadow-lg" />
                <text x={158} y={55} fontSize={10} fill="white" fontWeight="bold">Centroid Point (z*)</text>
              </svg>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-bg-secondary rounded-xl p-6 border border-border-color shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Target size={18} className="text-accent-blue" />
                <span className="text-[10px] sm:text-xs text-accent-blue font-bold uppercase tracking-wider">The Formula</span>
              </div>
              <div className="font-serif text-lg sm:text-xl text-center py-4 bg-bg-primary rounded-lg border border-border-color">
                z* = ∫ μ<sub>A</sub>(z) · z dz / ∫ μ<sub>A</sub>(z) dz
              </div>
            </div>
            <div className="bg-bg-secondary rounded-xl p-6 border border-border-color shadow-sm flex-1">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={18} className="text-accent-blue" />
                <span className="text-[10px] sm:text-xs text-accent-blue font-bold uppercase tracking-wider">Interpretation</span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                The result is a single crisp value that maps onto your personalized study plan, balancing every contributing factor from focus depth to break frequency.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Inference Rule Matrix */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold font-serif">The Inference Rule Matrix</h2>
            <div className="flex w-full sm:w-auto items-center gap-2 bg-bg-secondary border border-border-color rounded-lg px-3 py-2 shadow-sm">
              <Search size={16} className="text-text-muted shrink-0" />
              <input type="text" placeholder="Search logic rules..." value={ruleSearch} onChange={(e) => setRuleSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-text-primary w-full sm:w-48"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {ruleGroups.filter(g => g.title.toLowerCase().includes(ruleSearch.toLowerCase())).map((group) => (
              <div key={group.id} className={`bg-bg-secondary rounded-xl border overflow-hidden transition-colors ${group.active ? 'border-accent-blue shadow-sm' : 'border-border-color'}`}>
                <button
                  onClick={() => setExpandedRule(expandedRule === group.id ? null : group.id)}
                  className="w-full p-4 sm:px-5 flex items-center justify-between bg-transparent border-none cursor-pointer text-text-primary hover:bg-bg-tertiary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${group.active ? 'bg-accent-blue text-white' : 'bg-bg-primary text-text-muted border border-border-color'}`}>
                      {String(group.id).padStart(2, "0")}
                    </span>
                    <span className="font-semibold text-sm sm:text-base text-left">{group.title}</span>
                  </div>
                  <div className="shrink-0 text-text-muted">
                    {expandedRule === group.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>
                <AnimatePresence>
                  {expandedRule === group.id && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-2 border-t border-border-color">
                        {group.rules.map((rule, ri) => (
                          <div key={ri}>
                            <p className="text-sm text-text-secondary mb-4 leading-relaxed p-3 bg-bg-primary rounded-lg border border-border-light">
                              {rule.condition.split(/(LOW|MEDIUM|HIGH|URGENT REVIEW|MAINTAIN PACE|OPTIMIZE DEEP WORK)/).map((part, pi) => {
                                const highlighted = ["LOW", "MEDIUM", "HIGH", "URGENT REVIEW", "MAINTAIN PACE", "OPTIMIZE DEEP WORK"].includes(part);
                                return highlighted ? (
                                  <span key={pi} className={`px-1.5 py-0.5 rounded font-bold text-xs uppercase tracking-wider ${part === "URGENT REVIEW" ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>{part}</span>
                                ) : <span key={pi}>{part}</span>;
                              })}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              <div className="bg-bg-primary rounded-xl p-4 border border-border-color">
                                <div className="flex justify-between text-[10px] text-text-muted uppercase tracking-wider font-bold mb-1">
                                  <span>Input Strength</span><span>{Math.round(rule.inputStrength * 100)}%</span>
                                </div>
                                <p className="text-2xl font-bold font-serif">{rule.inputStrength.toFixed(2)} <span className="text-xs font-normal text-text-muted font-sans">Membership</span></p>
                                <div className="w-full h-1.5 bg-border-color rounded-full mt-2 overflow-hidden">
                                  <div className="h-full bg-accent-blue rounded-full" style={{ width: `${rule.inputStrength * 100}%` }} />
                                </div>
                              </div>
                              <div className="bg-bg-primary rounded-xl p-4 border border-border-color">
                                <div className="flex justify-between text-[10px] text-text-muted uppercase tracking-wider font-bold mb-1">
                                  <span>Outcome Weight</span><span>{Math.round(rule.outcomeWeight * 100)}%</span>
                                </div>
                                <p className="text-2xl font-bold font-serif">{rule.outcomeWeight.toFixed(2)} <span className="text-xs font-normal text-text-muted font-sans">Influence</span></p>
                                <div className="w-full h-1.5 bg-border-color rounded-full mt-2 overflow-hidden">
                                  <div className="h-full bg-warning rounded-full" style={{ width: `${rule.outcomeWeight * 100}%` }} />
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
          </div>

          <div className="text-center mt-6">
            <a href="/calculator" className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent-blue hover:bg-accent-blue-hover text-white rounded-full text-sm font-semibold no-underline transition-colors shadow-sm">
              View All 27 Logic Rules <ArrowRight size={16} />
            </a>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-accent-blue-soft rounded-2xl p-8 sm:p-12 text-center mb-12 border border-border-color shadow-sm"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 font-serif">Experience the Precision</h2>
          <p className="text-sm sm:text-base text-text-secondary max-w-2xl mx-auto mb-8 leading-relaxed">
            StudySync&apos;s fuzzy logic engine is currently processing over 1.2 million study sessions per day. Join the future of personalized education with Mamdani-based optimization.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/calculator" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent-blue hover:bg-accent-blue-hover text-white rounded-lg text-sm font-semibold no-underline transition-colors shadow-sm">Start Simulator</a>
            <button className="px-6 py-3 bg-bg-secondary hover:bg-bg-tertiary text-text-primary rounded-lg text-sm font-semibold border border-border-color cursor-pointer transition-colors shadow-sm">Contact Research Team</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
