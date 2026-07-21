"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronDown, ChevronUp, Search, ArrowRight, Download, Play, Target } from "lucide-react";
import { fuzzifyFocus, fuzzifyFatigue, fuzzifyComplexity, outputMembershipFn } from "@/lib/fuzzy-engine";
import { useStudySync } from "@/components/providers/StudySyncProvider";
import { Tooltip } from "@/components/ui/Tooltip";

export default function FuzzyLogicPage() {
  const { focus, fatigue, complexity, fuzzyResult } = useStudySync();
  const [graphTab, setGraphTab] = useState<"focus" | "fatigue" | "complexity" | "output">("focus");
  const [manualExpanded, setManualExpanded] = useState<Record<number, boolean>>({});
  const [ruleSearch, setRuleSearch] = useState("");
  const [ruleFilter, setRuleFilter] = useState<"all" | "active" | "inactive" | "highestAlpha">("all");
  const [outputFilter, setOutputFilter] = useState<string>("all");

  // Error handling detection
  const hasError = !fuzzyResult || !fuzzyResult.allRules;

  // Fuzzified inputs for membership list visualization
  const focusMems = useMemo(() => fuzzifyFocus(focus), [focus]);
  const fatigueMems = useMemo(() => fuzzifyFatigue(fatigue), [fatigue]);
  const complexityMems = useMemo(() => fuzzifyComplexity(complexity), [complexity]);

  // Sort: Active rules first (by descending strength), then inactive rules
  const sortedRules = useMemo(() => {
    if (hasError) return [];
    const all = fuzzyResult.allRules;
    const active = all.filter((r) => r.strength > 0).sort((a, b) => b.strength - a.strength);
    const inactive = all.filter((r) => r.strength === 0);
    return [...active, ...inactive];
  }, [fuzzyResult, hasError]);

  const toggleRule = (id: number, isActive: boolean) => {
    setManualExpanded((prev) => {
      const wasExpanded = prev[id] !== undefined ? prev[id] : isActive;
      return {
        ...prev,
        [id]: !wasExpanded,
      };
    });
  };

  const formatOutputCategory = (category: string): string => {
    switch (category) {
      case "sangatPendek": return "Very Short (Sangat Pendek)";
      case "pendek": return "Short (Pendek)";
      case "sedang": return "Medium (Sedang)";
      case "panjang": return "Long (Panjang)";
      case "sangatPanjang": return "Very Long (Sangat Panjang)";
      default: return category;
    }
  };

  const getMembershipExpl = (varName: string, level: string, val: number): string => {
    const roundedVal = val.toFixed(2);
    let status = "does not belong to";
    if (val > 0.7) status = "strongly belongs to";
    else if (val > 0.3) status = "moderately belongs to";
    else if (val > 0) status = "weakly belongs to";

    return `${varName} ${level}: (${roundedVal}) - This input ${status} the ${level} fuzzy set.`;
  };

  // Filtered Rules
  const filteredRules = useMemo(() => {
    return sortedRules.filter((rule) => {
      // 1. Search Box Filter
      const searchString = `rule ${rule.id} focus ${rule.focus} fatigue ${rule.fatigue} complexity ${rule.complexity} output ${rule.output} ${formatOutputCategory(rule.output)}`.toLowerCase();
      if (!searchString.includes(ruleSearch.toLowerCase())) return false;

      // 2. Active/Inactive/HighestAlpha Filter
      const isActive = rule.strength > 0;
      if (ruleFilter === "active" && !isActive) return false;
      if (ruleFilter === "inactive" && isActive) return false;
      if (ruleFilter === "highestAlpha") {
        const activeList = sortedRules.filter(r => r.strength > 0);
        const maxVal = activeList.length > 0 ? Math.max(...activeList.map(r => r.strength)) : 0;
        if (rule.strength !== maxVal || rule.strength === 0) return false;
      }

      // 3. Output Category Filter
      if (outputFilter !== "all" && rule.output !== outputFilter) return false;

      return true;
    });
  }, [sortedRules, ruleSearch, ruleFilter, outputFilter]);

  const activeCount = useMemo(() => {
    if (hasError) return 0;
    return fuzzyResult.allRules.filter((r) => r.strength > 0).length;
  }, [fuzzyResult, hasError]);

  const maxAlpha = useMemo(() => {
    if (hasError) return 0;
    const active = fuzzyResult.allRules.filter((r) => r.strength > 0);
    if (active.length === 0) return 0;
    return Math.max(...active.map((r) => r.strength));
  }, [fuzzyResult, hasError]);

  const avgAlpha = useMemo(() => {
    if (hasError) return 0;
    const active = fuzzyResult.allRules.filter((r) => r.strength > 0);
    if (active.length === 0) return 0;
    return active.reduce((sum, r) => sum + r.strength, 0) / active.length;
  }, [fuzzyResult, hasError]);

  const dominantCategory = useMemo(() => {
    if (hasError) return "N/A";
    const categoryCount: Record<string, number> = {};
    const active = fuzzyResult.allRules.filter((r) => r.strength > 0);
    if (active.length === 0) return "N/A";
    active.forEach((r) => {
      categoryCount[r.output] = (categoryCount[r.output] || 0) + r.strength;
    });
    let dominant = "N/A";
    let maxVal = -1;
    Object.entries(categoryCount).forEach(([cat, val]) => {
      if (val > maxVal) {
        maxVal = val;
        dominant = cat;
      }
    });
    return formatOutputCategory(dominant);
  }, [fuzzyResult, hasError]);

  // Generate SVG graph points dynamically based on selected tab
  const graphWidth = 600;
  const graphHeight = 200;
  const xMin = graphTab === "output" ? 15 : 0;
  const xMax = graphTab === "output" ? 150 : 100;

  const graphPoints = useMemo(() => {
    const points = [];
    const step = 2;
    for (let x = xMin; x <= xMax; x += step) {
      if (graphTab === "focus") {
        const mem = fuzzifyFocus(x);
        points.push({
          x,
          lines: [
            { label: "Low", y: mem.low, color: "#3B82F6" },
            { label: "Medium", y: mem.medium, color: "#10B981" },
            { label: "High", y: mem.high, color: "#EF4444" },
          ],
        });
      } else if (graphTab === "fatigue") {
        const mem = fuzzifyFatigue(x);
        points.push({
          x,
          lines: [
            { label: "Low", y: mem.low, color: "#3B82F6" },
            { label: "Medium", y: mem.medium, color: "#10B981" },
            { label: "High", y: mem.high, color: "#EF4444" },
          ],
        });
      } else if (graphTab === "complexity") {
        const mem = fuzzifyComplexity(x);
        points.push({
          x,
          lines: [
            { label: "Easy", y: mem.low, color: "#3B82F6" },
            { label: "Medium", y: mem.medium, color: "#10B981" },
            { label: "Hard", y: mem.high, color: "#EF4444" },
          ],
        });
      } else {
        points.push({
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
    return points;
  }, [graphTab, xMin, xMax]);

  function toSvgX(x: number) { return ((x - xMin) / (xMax - xMin)) * graphWidth; }
  function toSvgY(y: number) { return graphHeight - y * graphHeight; }

  const uniqueLabels = graphPoints[0]?.lines.map(l => ({ label: l.label, color: l.color })) || [];

  const activeGraphValue = useMemo(() => {
    if (graphTab === "focus") return focus;
    if (graphTab === "fatigue") return fatigue;
    if (graphTab === "complexity") return complexity;
    return fuzzyResult.duration;
  }, [graphTab, focus, fatigue, complexity, fuzzyResult.duration]);

  const activeMems = useMemo(() => {
    if (graphTab === "focus") return fuzzifyFocus(focus);
    if (graphTab === "fatigue") return fuzzifyFatigue(fatigue);
    if (graphTab === "complexity") return fuzzifyComplexity(complexity);
    return null;
  }, [graphTab, focus, fatigue, complexity]);

  const getActiveYVal = (label: string) => {
    if (!activeMems) return 0;
    const cleanLabel = label.toLowerCase();
    if (cleanLabel.includes("low") || cleanLabel.includes("easy")) return activeMems.low;
    if (cleanLabel.includes("medium")) return activeMems.medium;
    if (cleanLabel.includes("high") || cleanLabel.includes("hard")) return activeMems.high;
    return 0;
  };

  const centroidX = useMemo(() => {
    if (hasError) return 20;
    return 20 + ((fuzzyResult.duration - 15) / (150 - 15)) * 260;
  }, [fuzzyResult, hasError]);

  if (hasError) {
    console.error("FuzzyLogicPage: fuzzyResult or allRules is missing.");
    return (
      <div className="page-wrapper flex items-center justify-center min-h-[400px] px-4">
        <div className="bg-bg-secondary p-8 rounded-2xl border border-border-color text-center max-w-md shadow-md">
          <p className="text-red-500 font-bold text-lg mb-2">Unable to generate fuzzy inference.</p>
          <p className="text-text-muted text-sm">Please check the fuzzy logic engine configuration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
      <div className="w-full">
        
        {/* Live Status Badge */}
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <div className="flex items-center gap-2 bg-green-500/10 text-green-500 border border-green-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm">
            <span>🟢 Live Mamdani Engine</span>
          </div>
          <div className="text-xs font-semibold text-text-muted">
            ✓ Synced with Calculator (Focus: {focus}%, Fatigue: {fatigue}%, Complexity: {complexity}%)
          </div>
        </div>

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

        {/* Live Inference Pipeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 font-serif">Mamdani Inference Pipeline</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { title: "Inputs", val: `Focus: ${focus} | Fatigue: ${fatigue} | Complexity: ${complexity}`, desc: "Crisp conditions" },
              { title: "Fuzzification", val: `Focus High: ${focusMems.high.toFixed(2)}`, desc: "Convert to fuzzy sets" },
              { title: "Rule Evaluation", val: `${activeCount} Active Rules`, desc: "Check if-then firing" },
              { title: "Aggregation", val: `Max α: ${maxAlpha.toFixed(2)}`, desc: "Combine output sets" },
              { title: "Defuzzification", val: `z* = ${(fuzzyResult.duration).toFixed(1)}m`, desc: "Calculate Centroid" },
              { title: "Recommendation", val: `${fuzzyResult.duration} Min (${fuzzyResult.category})`, desc: "Final outcome" },
            ].map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * idx }}
                className="bg-bg-secondary p-4 rounded-xl border border-border-color text-center flex flex-col justify-between shadow-sm hover:shadow"
              >
                <div>
                  <span className="text-[9px] text-accent-blue font-bold uppercase tracking-wider block mb-1">Step {idx + 1}</span>
                  <h3 className="text-xs font-bold mb-1">{step.title}</h3>
                  <p className="text-[10px] text-text-muted mb-2 leading-tight">{step.desc}</p>
                </div>
                <div className="bg-bg-primary px-1.5 py-1 rounded border border-border-color text-[10px] font-mono font-bold text-accent-blue break-all">
                  {step.val}
                </div>
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
              <p className="text-xs sm:text-sm text-text-muted">Visualizing input & output variables. Choose a tab to track live membership values.</p>
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {([
                { id: "focus", label: "Focus" },
                { id: "fatigue", label: "Fatigue" },
                { id: "complexity", label: "Complexity" },
                { id: "output", label: "Output Duration" }
              ] as const).map((tab) => (
                <button key={tab.id} onClick={() => setGraphTab(tab.id)}
                  className={`flex-1 md:flex-none px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${graphTab === tab.id ? 'bg-accent-blue text-white border-accent-blue' : 'bg-transparent text-text-secondary border-border-color hover:bg-bg-tertiary'}`}
                >
                  {tab.label}
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
                {/* Active value line */}
                <motion.line 
                  animate={{ x1: toSvgX(activeGraphValue), x2: toSvgX(activeGraphValue) }} 
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  y1={0} 
                  y2={graphHeight} 
                  stroke="var(--accent-blue)" 
                  strokeWidth={1.5} 
                  strokeDasharray="4,3" 
                />
                
                {/* Dots on active lines */}
                {activeMems && uniqueLabels.map((line, li) => {
                  const yVal = getActiveYVal(line.label);
                  const activeY = toSvgY(yVal);
                  return (
                    <g key={`dot-${li}`}>
                      <motion.circle 
                        animate={{ cx: toSvgX(activeGraphValue), cy: activeY }} 
                        transition={{ type: "spring", stiffness: 100, damping: 15 }}
                        r={5} 
                        fill={line.color} 
                        stroke="white" 
                        strokeWidth={1.5} 
                        className="drop-shadow-lg" 
                      />
                    </g>
                  );
                })}

                {/* Labels */}
                {uniqueLabels.map((l, i) => (
                  <text key={i} x={graphWidth * (i / (uniqueLabels.length - 1 || 1))} y={graphHeight + 20} fontSize={10} fill="var(--text-muted)" textAnchor="middle" className="uppercase tracking-wider font-bold">{l.label}</text>
                ))}
              </svg>
            </div>
          </div>
          
          {/* Live Membership values details bar */}
          <div className="mt-4 bg-bg-primary p-4 rounded-xl border border-border-color grid grid-cols-2 md:grid-cols-4 gap-4">
            {graphTab !== "output" ? (
              <>
                <div className="text-center md:border-r md:border-border-color">
                  <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold block mb-1">Current {graphTab.toUpperCase()}</span>
                  <span className="text-base font-bold text-text-primary">{activeGraphValue}%</span>
                </div>
                {uniqueLabels.map((line, li) => {
                  const yVal = getActiveYVal(line.label);
                  return (
                    <div key={li} className="text-center md:border-r last:border-none md:border-border-color">
                      <span className="text-[10px] uppercase tracking-wider font-bold block mb-1" style={{ color: line.color }}>{line.label} Membership</span>
                      <span className="text-base font-bold font-mono text-text-primary">{yVal.toFixed(2)}</span>
                    </div>
                  );
                })}
              </>
            ) : (
              <>
                <div className="text-center border-r border-border-color">
                  <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold block mb-1">Centroid Point (z*)</span>
                  <span className="text-base font-bold font-mono text-text-primary">{(fuzzyResult.duration).toFixed(1)}</span>
                </div>
                <div className="text-center md:col-span-3">
                  <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold block mb-1">Recommended Duration Category</span>
                  <span className="text-base font-bold text-warning">{fuzzyResult.category}</span>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Centroid Visualization */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 mb-12"
        >
          <div className="bg-gradient-to-br from-[var(--accent-blue)] to-[#1D4ED8] rounded-2xl p-6 sm:p-8 text-white shadow-md w-full overflow-hidden">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 font-serif">Centroid Defuzzification</h2>
            <p className="text-sm opacity-90 leading-relaxed mb-6">
              Watch how the &quot;Center of Gravity&quot; (z*) shifts dynamically as the rule strengths fluctuate. The red marker represents your final actionable StudySync recommendation score.
            </p>
            <div className="bg-black/20 rounded-xl p-4 sm:p-6 relative border border-white/10">
              <svg viewBox="0 0 300 120" className="w-full h-auto drop-shadow-md">
                <path d="M20,100 Q80,20 150,60 Q220,100 280,80" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={2.5} />
                <path d="M20,100 Q80,20 150,60 Q220,100 280,80 L280,100 L20,100 Z" fill="rgba(255,255,255,0.15)" />
                <motion.line 
                  animate={{ x1: centroidX, x2: centroidX }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  y1={0} 
                  y2={120} 
                  stroke="#EF4444" 
                  strokeWidth={2} 
                  strokeDasharray="4,3" 
                />
                <motion.circle 
                  animate={{ cx: centroidX }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  cy={60} 
                  r={6} 
                  fill="#EF4444" 
                  className="drop-shadow-lg" 
                />
                <motion.text 
                  animate={{ x: Math.max(20, Math.min(centroidX + 8, 180)) }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  y={55} 
                  fontSize={10} 
                  fill="white" 
                  fontWeight="bold"
                >
                  Centroid (z*): {(fuzzyResult.duration).toFixed(1)}
                </motion.text>
              </svg>
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/15 text-xs text-white/80">
              <div>Centroid: <span className="font-mono font-bold">{(fuzzyResult.duration).toFixed(1)}</span></div>
              <div className="flex items-center gap-1">
                <span>Recommendation:</span> 
                <span className="font-bold bg-white/20 px-2 py-0.5 rounded text-white">{fuzzyResult.duration} Minutes</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-bg-secondary rounded-xl p-6 border border-border-color shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Target size={18} className="text-accent-blue" />
                <span className="text-[10px] sm:text-xs text-accent-blue font-bold uppercase tracking-wider">The Formula</span>
              </div>
              <div className="font-serif text-lg sm:text-xl text-center py-4 bg-bg-primary rounded-lg border border-border-color text-text-primary">
                z* = ∫ μ<sub>A</sub>(z) · z dz / ∫ μ<sub>A</sub>(z) dz
              </div>
            </div>
            <div className="bg-bg-secondary rounded-xl p-6 border border-border-color shadow-sm flex-1">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={18} className="text-accent-blue" />
                <span className="text-[10px] sm:text-xs text-accent-blue font-bold uppercase tracking-wider">Interpretation</span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                The result is a single crisp value that maps onto your personalized study plan, balancing every contributing factor from focus depth to fatigue.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Rule Summary & Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-bg-secondary rounded-xl p-4 border border-border-color shadow-sm">
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold block mb-1">Total Rules</span>
            <span className="text-xl font-bold font-serif text-text-primary">{fuzzyResult.allRules.length}</span>
          </div>
          <div className="bg-bg-secondary rounded-xl p-4 border border-border-color shadow-sm">
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold block mb-1">Active Rules</span>
            <span className="text-xl font-bold font-serif text-green-500">{activeCount}</span>
          </div>
          <div className="bg-bg-secondary rounded-xl p-4 border border-border-color shadow-sm">
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold block mb-1">Inactive Rules</span>
            <span className="text-xl font-bold font-serif text-text-muted">{fuzzyResult.allRules.length - activeCount}</span>
          </div>
          <div className="bg-bg-secondary rounded-xl p-4 border border-border-color shadow-sm">
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold block mb-1">Highest Firing (α)</span>
            <span className="text-xl font-bold font-mono text-accent-blue">{maxAlpha.toFixed(2)}</span>
          </div>
          <div className="bg-bg-secondary rounded-xl p-4 border border-border-color shadow-sm">
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold block mb-1">Average (α)</span>
            <span className="text-xl font-bold font-mono text-accent-blue">{avgAlpha.toFixed(2)}</span>
          </div>
          <div className="bg-bg-secondary rounded-xl p-4 border border-border-color shadow-sm">
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold block mb-1">Dominant Output</span>
            <span className="text-[11px] font-bold text-warning truncate block leading-tight">{dominantCategory}</span>
          </div>
        </div>

        {/* Inference Rule Matrix Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-12">
          
          {/* Filters Bar */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold font-serif">The Inference Rule Matrix</h2>
              <div className="flex w-full sm:w-auto items-center gap-2 bg-bg-secondary border border-border-color rounded-lg px-3 py-2 shadow-sm">
                <Search size={16} className="text-text-muted shrink-0" />
                <input type="text" placeholder="Search rules (ID, output)..." value={ruleSearch} onChange={(e) => setRuleSearch(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-text-primary w-full sm:w-48"
                />
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="flex flex-wrap gap-2.5 items-center bg-bg-secondary p-3 rounded-xl border border-border-color">
              <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold mr-2">Filter Matrix:</span>
              {([
                { id: "all", label: "All Rules" },
                { id: "active", label: "Active Rules" },
                { id: "inactive", label: "Inactive Rules" },
                { id: "highestAlpha", label: "Highest Firing (α)" }
              ] as const).map((opt) => (
                <button key={opt.id} onClick={() => setRuleFilter(opt.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${ruleFilter === opt.id ? 'bg-accent-blue text-white border-accent-blue' : 'bg-bg-primary text-text-secondary border-border-color hover:bg-bg-tertiary'}`}
                >
                  {opt.label}
                </button>
              ))}
              
              <div className="h-4 w-px bg-border-color mx-2 hidden sm:block" />

              <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold mr-1">Output:</span>
              <select value={outputFilter} onChange={(e) => setOutputFilter(e.target.value)}
                className="bg-bg-primary border border-border-color rounded px-2 py-1 text-xs font-semibold text-text-secondary outline-none cursor-pointer"
              >
                <option value="all">All Outputs</option>
                <option value="sangatPendek">Very Short</option>
                <option value="pendek">Short</option>
                <option value="sedang">Medium</option>
                <option value="panjang">Long</option>
                <option value="sangatPanjang">Very Long</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {filteredRules.length === 0 ? (
              <div className="text-center p-12 bg-bg-secondary rounded-xl border border-border-color text-text-muted font-medium text-sm">
                No active rules for the current input. Adjust focus, fatigue, or complexity to activate rules.
              </div>
            ) : (
              filteredRules.map((rule) => {
                const isActive = rule.strength > 0;
                const isExpanded = manualExpanded[rule.id] !== undefined ? manualExpanded[rule.id] : isActive;
                return (
                  <div key={rule.id} className={`bg-bg-secondary rounded-xl border overflow-hidden transition-all duration-200 ${isActive ? 'border-accent-blue bg-accent-blue/[0.01] shadow-sm' : 'border-border-color'}`}>
                    
                    {/* Header bar */}
                    <button
                      onClick={() => toggleRule(rule.id, isActive)}
                      className="w-full p-4 sm:px-5 flex items-center justify-between bg-transparent border-none cursor-pointer text-text-primary hover:bg-bg-tertiary transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isActive ? 'bg-accent-blue text-white' : 'bg-bg-primary text-text-muted border border-border-color'}`}>
                          {String(rule.id).padStart(2, "0")}
                        </span>
                        <span className="font-semibold text-sm sm:text-base text-left">
                          Rule {rule.id}: Focus {rule.focus.toUpperCase()} | Fatigue {rule.fatigue.toUpperCase()} | Complexity {rule.complexity === 'high' ? 'HARD' : rule.complexity.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {isActive ? (
                          <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                            Active (α = {rule.strength.toFixed(2)})
                          </span>
                        ) : (
                          <span className="text-text-muted text-xs">
                            Inactive
                          </span>
                        )}
                        <div className="shrink-0 text-text-muted">
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                      </div>
                    </button>

                    {/* Expandable details panel */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-2 border-t border-border-color bg-bg-primary/20">
                            
                            {/* Rule detail statement */}
                            <div className="mb-4">
                              <h4 className="text-xs uppercase tracking-wider font-bold text-text-muted mb-2">IF-THEN Logic Formula</h4>
                              <div className="p-4 bg-bg-primary rounded-lg border border-border-color font-mono text-sm leading-relaxed text-text-secondary">
                                <span className="text-accent-blue font-bold">IF</span> Focus = <span className="font-bold text-text-primary">{rule.focus.toUpperCase()}</span> ({focusMems[rule.focus].toFixed(2)})<br />
                                <span className="text-accent-blue font-bold">AND</span> Fatigue = <span className="font-bold text-text-primary">{rule.fatigue.toUpperCase()}</span> ({fatigueMems[rule.fatigue].toFixed(2)})<br />
                                <span className="text-accent-blue font-bold">AND</span> Complexity = <span className="font-bold text-text-primary">{rule.complexity === 'high' ? 'HARD' : rule.complexity.toUpperCase()}</span> ({complexityMems[rule.complexity].toFixed(2)})<br />
                                <span className="text-warning font-bold">THEN</span> Study Duration = <span className="font-bold text-green-500">{formatOutputCategory(rule.output)}</span>
                              </div>
                            </div>

                            {/* Live Membership Table with Tooltips */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                              <div className="bg-bg-primary p-3 rounded-lg border border-border-color">
                                <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold block mb-2">Focus Membership</span>
                                <div className="text-xs space-y-1.5 text-text-secondary">
                                  <div className="flex justify-between items-center">
                                    <span>Low:</span> 
                                    <Tooltip content={getMembershipExpl("Focus", "Low", focusMems.low)}>
                                      <span className="font-mono font-bold cursor-help border-b border-dashed border-border-color">{focusMems.low.toFixed(2)}</span>
                                    </Tooltip>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span>Medium:</span> 
                                    <Tooltip content={getMembershipExpl("Focus", "Medium", focusMems.medium)}>
                                      <span className="font-mono font-bold cursor-help border-b border-dashed border-border-color">{focusMems.medium.toFixed(2)}</span>
                                    </Tooltip>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span>High:</span> 
                                    <Tooltip content={getMembershipExpl("Focus", "High", focusMems.high)}>
                                      <span className="font-mono font-bold cursor-help border-b border-dashed border-border-color">{focusMems.high.toFixed(2)}</span>
                                    </Tooltip>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-bg-primary p-3 rounded-lg border border-border-color">
                                <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold block mb-2">Fatigue Membership</span>
                                <div className="text-xs space-y-1.5 text-text-secondary">
                                  <div className="flex justify-between items-center">
                                    <span>Low:</span> 
                                    <Tooltip content={getMembershipExpl("Fatigue", "Low", fatigueMems.low)}>
                                      <span className="font-mono font-bold cursor-help border-b border-dashed border-border-color">{fatigueMems.low.toFixed(2)}</span>
                                    </Tooltip>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span>Medium:</span> 
                                    <Tooltip content={getMembershipExpl("Fatigue", "Medium", fatigueMems.medium)}>
                                      <span className="font-mono font-bold cursor-help border-b border-dashed border-border-color">{fatigueMems.medium.toFixed(2)}</span>
                                    </Tooltip>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span>High:</span> 
                                    <Tooltip content={getMembershipExpl("Fatigue", "High", fatigueMems.high)}>
                                      <span className="font-mono font-bold cursor-help border-b border-dashed border-border-color">{fatigueMems.high.toFixed(2)}</span>
                                    </Tooltip>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-bg-primary p-3 rounded-lg border border-border-color">
                                <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold block mb-2">Complexity Membership</span>
                                <div className="text-xs space-y-1.5 text-text-secondary">
                                  <div className="flex justify-between items-center">
                                    <span>Easy (Low):</span> 
                                    <Tooltip content={getMembershipExpl("Complexity", "Low", complexityMems.low)}>
                                      <span className="font-mono font-bold cursor-help border-b border-dashed border-border-color">{complexityMems.low.toFixed(2)}</span>
                                    </Tooltip>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span>Medium:</span> 
                                    <Tooltip content={getMembershipExpl("Complexity", "Medium", complexityMems.medium)}>
                                      <span className="font-mono font-bold cursor-help border-b border-dashed border-border-color">{complexityMems.medium.toFixed(2)}</span>
                                    </Tooltip>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span>Hard (High):</span> 
                                    <Tooltip content={getMembershipExpl("Complexity", "High", complexityMems.high)}>
                                      <span className="font-mono font-bold cursor-help border-b border-dashed border-border-color">{complexityMems.high.toFixed(2)}</span>
                                    </Tooltip>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Firing Strength Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              <div className="bg-bg-primary rounded-xl p-4 border border-border-color">
                                <div className="text-[10px] text-text-muted uppercase tracking-wider font-bold mb-1">
                                  Firing Strength (α) Formula
                                </div>
                                <p className="text-xs font-bold font-mono">
                                  α = min(Focus {rule.focus} [{focusMems[rule.focus].toFixed(2)}], Fatigue {rule.fatigue} [{fatigueMems[rule.fatigue].toFixed(2)}], Complexity {rule.complexity} [{complexityMems[rule.complexity].toFixed(2)}]) = {rule.strength.toFixed(2)}
                                </p>
                                <div className="w-full h-1.5 bg-border-color rounded-full mt-2 overflow-hidden">
                                  <div className="h-full bg-accent-blue rounded-full" style={{ width: `${rule.strength * 100}%` }} />
                                </div>
                              </div>
                              <div className="bg-bg-primary rounded-xl p-4 border border-border-color">
                                <div className="text-[10px] text-text-muted uppercase tracking-wider font-bold mb-1">
                                  Output Fuzzy Set / Centroid Weight
                                </div>
                                <p className="text-sm font-bold text-text-primary">
                                  {formatOutputCategory(rule.output)} {isActive && `(clipped at α = ${rule.strength.toFixed(2)})`}
                                </p>
                                <div className="w-full h-1.5 bg-border-color rounded-full mt-2 overflow-hidden">
                                  <div className="h-full bg-warning rounded-full" style={{ width: isActive ? "100%" : "0%" }} />
                                </div>
                              </div>
                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>

          <div className="text-center mt-6">
            <a href="/calculator" className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent-blue hover:bg-accent-blue-hover text-white rounded-full text-sm font-semibold no-underline transition-colors shadow-sm">
              Run Simulator <ArrowRight size={16} />
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
