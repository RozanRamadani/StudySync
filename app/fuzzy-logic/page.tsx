"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight, Download, Play, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { fuzzifyFocus, fuzzifyFatigue, fuzzifyComplexity, outputMembershipFn, FuzzyRule } from "@/lib/fuzzy-engine";
import { useStudySync } from "@/components/providers/StudySyncProvider";

import { ExplainableInsightPanel } from "@/components/fuzzy/ExplainableInsightPanel";
import { InteractiveRuleTree } from "@/components/fuzzy/InteractiveRuleTree";
import { DefuzzificationWalkthrough } from "@/components/fuzzy/DefuzzificationWalkthrough";
import { MembershipHeatmap } from "@/components/fuzzy/MembershipHeatmap";
import { RuleExplanationDialog } from "@/components/fuzzy/RuleExplanationDialog";
import { RuleStatisticsDashboard } from "@/components/fuzzy/RuleStatisticsDashboard";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function FuzzyLogicPage() {
  const { focus, fatigue, complexity, fuzzyResult } = useStudySync();
  const [learningMode, setLearningMode] = useState(false);
  const [graphTab, setGraphTab] = useState<"focus" | "fatigue" | "complexity" | "output">("focus");
  
  const [ruleSearch, setRuleSearch] = useState("");
  const [ruleFilter, setRuleFilter] = useState<"all" | "active" | "inactive" | "highestAlpha">("all");
  const [outputFilter, setOutputFilter] = useState<string>("all");
  
  const [selectedRule, setSelectedRule] = useState<FuzzyRule | null>(null);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);

  const hasError = !fuzzyResult || !fuzzyResult.allRules;

  const focusMems = useMemo(() => fuzzifyFocus(focus), [focus]);
  const fatigueMems = useMemo(() => fuzzifyFatigue(fatigue), [fatigue]);
  const complexityMems = useMemo(() => fuzzifyComplexity(complexity), [complexity]);

  const sortedRules = useMemo(() => {
    if (hasError) return [];
    const all = fuzzyResult.allRules;
    const active = all.filter((r) => r.strength > 0).sort((a, b) => b.strength - a.strength);
    const inactive = all.filter((r) => r.strength === 0);
    return [...active, ...inactive];
  }, [fuzzyResult, hasError]);

  const filteredRules = useMemo(() => {
    return sortedRules.filter((rule) => {
      const searchString = `rule ${rule.id} focus ${rule.focus} fatigue ${rule.fatigue} complexity ${rule.complexity} output ${rule.output}`.toLowerCase();
      if (!searchString.includes(ruleSearch.toLowerCase())) return false;

      const isActive = rule.strength > 0;
      if (ruleFilter === "active" && !isActive) return false;
      if (ruleFilter === "inactive" && isActive) return false;
      if (ruleFilter === "highestAlpha") {
        const activeList = sortedRules.filter(r => r.strength > 0);
        const maxVal = activeList.length > 0 ? Math.max(...activeList.map(r => r.strength)) : 0;
        if (rule.strength !== maxVal || rule.strength === 0) return false;
      }
      if (outputFilter !== "all" && rule.output !== outputFilter) return false;

      return true;
    });
  }, [sortedRules, ruleSearch, ruleFilter, outputFilter]);

  const handleExport = async () => {
    const reportElement = document.getElementById("exportable-report");
    if (!reportElement) return;
    try {
      const canvas = await html2canvas(reportElement, { scale: 2, backgroundColor: "#000000" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("StudySync_XAI_Report.pdf");
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const openRuleDialog = (rule: FuzzyRule) => {
    setSelectedRule(rule);
    setIsRuleDialogOpen(true);
  };

  const formatOutputCategory = (category: string) => {
    switch (category) {
      case "sangatPendek": return "Very Short (Sangat Pendek)";
      case "pendek": return "Short (Pendek)";
      case "sedang": return "Medium (Sedang)";
      case "panjang": return "Long (Panjang)";
      case "sangatPanjang": return "Very Long (Sangat Panjang)";
      default: return category;
    }
  };

  // SVG Graph logic (Preserved from existing UI)
  const graphWidth = 600;
  const graphHeight = 200;
  const xMin = graphTab === "output" ? 15 : 0;
  const xMax = graphTab === "output" ? 150 : 100;
  const graphPoints = useMemo(() => {
    const points = [];
    for (let x = xMin; x <= xMax; x += 2) {
      if (graphTab === "focus") {
        const mem = fuzzifyFocus(x);
        points.push({ x, lines: [{ label: "Low", y: mem.low, color: "#3B82F6" }, { label: "Medium", y: mem.medium, color: "#10B981" }, { label: "High", y: mem.high, color: "#EF4444" }]});
      } else if (graphTab === "fatigue") {
        const mem = fuzzifyFatigue(x);
        points.push({ x, lines: [{ label: "Low", y: mem.low, color: "#3B82F6" }, { label: "Medium", y: mem.medium, color: "#10B981" }, { label: "High", y: mem.high, color: "#EF4444" }]});
      } else if (graphTab === "complexity") {
        const mem = fuzzifyComplexity(x);
        points.push({ x, lines: [{ label: "Easy", y: mem.low, color: "#3B82F6" }, { label: "Medium", y: mem.medium, color: "#10B981" }, { label: "Hard", y: mem.high, color: "#EF4444" }]});
      } else {
        points.push({ x, lines: [{ label: "S.Pendek", y: outputMembershipFn(x, "sangatPendek"), color: "#EF4444" }, { label: "Pendek", y: outputMembershipFn(x, "pendek"), color: "#F59E0B" }, { label: "Sedang", y: outputMembershipFn(x, "sedang"), color: "#10B981" }, { label: "Panjang", y: outputMembershipFn(x, "panjang"), color: "#3B82F6" }, { label: "S.Panjang", y: outputMembershipFn(x, "sangatPanjang"), color: "#8B5CF6" }]});
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
    return fuzzyResult?.duration || 45;
  }, [graphTab, focus, fatigue, complexity, fuzzyResult?.duration]);

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
    return (
      <div className="page-wrapper flex items-center justify-center min-h-[400px]">
        <div className="bg-bg-secondary p-8 rounded-2xl border text-center">
          <p className="text-red-500 font-bold mb-2">Unable to generate fuzzy inference.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
      <div className="w-full">
        {/* Header & Learning Mode Toggle */}
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <div className="flex items-center gap-2 bg-green-500/10 text-green-500 border border-green-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm">
            <span>🟢 Live Mamdani Engine</span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-text-muted">Learning Mode</span>
            <button 
              onClick={() => setLearningMode(!learningMode)}
              className={`w-10 h-5 rounded-full relative transition-colors ${learningMode ? 'bg-accent-blue' : 'bg-bg-tertiary'}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${learningMode ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8 mb-12 items-center">
          <div>
            <span className="inline-block bg-accent-blue-soft text-accent-blue px-3.5 py-1 rounded-full text-xs font-bold mb-4 shadow-sm border border-border-color">
              ✨ Explainable AI Dashboard
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif leading-tight mb-3">Understanding Fuzzy Logic</h1>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-6 max-w-lg">
              Explore how StudySync uses the Mamdani method to transform ambiguous study habits into precise, actionable academic recommendations.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="/calculator" className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-accent-blue hover:bg-accent-blue-hover text-white rounded-lg text-sm font-semibold no-underline transition-colors shadow-sm">
                <Play size={16} /> Start Simulation
              </a>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#F59E0B22] to-[#8B5CF622] rounded-2xl h-48 flex items-center justify-center border border-border-color">
            <div className="text-6xl sm:text-7xl opacity-30 drop-shadow-md">🧠</div>
          </div>
        </motion.div>

        {/* Explainable Insight Panel */}
        <ExplainableInsightPanel 
          fuzzyResult={fuzzyResult} 
          learningMode={learningMode} 
          onExport={handleExport}
          input={{ focus, fatigue, complexity }}
        />

        {/* Defuzzification Walkthrough (Timeline Animation) */}
        <DefuzzificationWalkthrough 
          fuzzyResult={fuzzyResult}
          input={{ focus, fatigue, complexity }}
        />

        {/* Interactive Decision Tree */}
        <InteractiveRuleTree 
          fuzzyResult={fuzzyResult}
          learningMode={learningMode}
          input={{ focus, fatigue, complexity }}
        />

        {/* Rule Statistics Dashboard */}
        <RuleStatisticsDashboard 
          fuzzyResult={fuzzyResult}
          focusMems={focusMems}
          fatigueMems={fatigueMems}
          complexityMems={complexityMems}
        />

        {/* Membership Graphs & Heatbars */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-bg-secondary rounded-2xl p-6 sm:p-8 border border-border-color mb-8 shadow-sm w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold mb-1 font-serif">Fuzzy Memberships</h2>
              <p className="text-xs sm:text-sm text-text-muted">Visualizing input & output variables.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {([{ id: "focus", label: "Focus" }, { id: "fatigue", label: "Fatigue" }, { id: "complexity", label: "Complexity" }, { id: "output", label: "Output Duration" }] as const).map((tab) => (
                <button key={tab.id} onClick={() => setGraphTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${graphTab === tab.id ? 'bg-accent-blue text-white border-accent-blue' : 'bg-transparent text-text-secondary border-border-color hover:bg-bg-tertiary'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="w-full overflow-x-auto scrollbar-hide bg-bg-primary p-4 rounded-xl border border-border-color">
                <div className="min-w-[400px]">
                  <svg viewBox={`0 0 ${graphWidth} ${graphHeight + 30}`} className="w-full h-auto">
                    {[0, 0.25, 0.5, 0.75, 1].map((y) => (
                      <line key={y} x1={0} y1={toSvgY(y)} x2={graphWidth} y2={toSvgY(y)} stroke="var(--border-color)" strokeWidth={0.5} strokeDasharray={y > 0 && y < 1 ? "4,4" : "0"} />
                    ))}
                    {uniqueLabels.map((line, li) => {
                      const points = graphPoints.map((p) => `${toSvgX(p.x)},${toSvgY(p.lines[li].y)}`).join(" ");
                      return (
                        <g key={li}>
                          <polyline points={points} fill="none" stroke={line.color} strokeWidth={2} opacity={0.8} />
                          <polyline points={`${toSvgX(graphPoints[0].x)},${graphHeight} ${points} ${toSvgX(graphPoints[graphPoints.length - 1].x)},${graphHeight}`} fill={line.color} opacity={0.06} />
                        </g>
                      );
                    })}
                    <motion.line animate={{ x1: toSvgX(activeGraphValue), x2: toSvgX(activeGraphValue) }} transition={{ type: "spring", stiffness: 100, damping: 15 }} y1={0} y2={graphHeight} stroke="var(--accent-blue)" strokeWidth={1.5} strokeDasharray="4,3" />
                    {activeMems && uniqueLabels.map((line, li) => (
                      <motion.circle key={`dot-${li}`} animate={{ cx: toSvgX(activeGraphValue), cy: toSvgY(getActiveYVal(line.label)) }} transition={{ type: "spring", stiffness: 100, damping: 15 }} r={5} fill={line.color} stroke="white" strokeWidth={1.5} className="drop-shadow-lg" />
                    ))}
                    {uniqueLabels.map((l, i) => (
                      <text key={i} x={graphWidth * (i / (uniqueLabels.length - 1 || 1))} y={graphHeight + 20} fontSize={10} fill="var(--text-muted)" textAnchor="middle" className="uppercase tracking-wider font-bold">{l.label}</text>
                    ))}
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <MembershipHeatmap label="Focus" mems={focusMems} learningMode={learningMode} type="focus" />
              <MembershipHeatmap label="Fatigue" mems={fatigueMems} learningMode={learningMode} type="fatigue" />
              <MembershipHeatmap label="Complexity" mems={complexityMems} learningMode={learningMode} type="complexity" />
            </div>
          </div>
        </motion.div>

        {/* Centroid Defuzzification */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 mb-12">
          <div className="bg-gradient-to-br from-[var(--accent-blue)] to-[#1D4ED8] rounded-2xl p-6 text-white shadow-md w-full overflow-hidden">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 font-serif">Centroid Defuzzification</h2>
            <p className="text-sm opacity-90 leading-relaxed mb-6">Watch how the Center of Gravity (z*) shifts dynamically.</p>
            <div className="bg-black/20 rounded-xl p-4 relative border border-white/10">
              <svg viewBox="0 0 300 120" className="w-full h-auto drop-shadow-md">
                <path d="M20,100 Q80,20 150,60 Q220,100 280,80" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={2.5} />
                <path d="M20,100 Q80,20 150,60 Q220,100 280,80 L280,100 L20,100 Z" fill="rgba(255,255,255,0.15)" />
                <motion.line animate={{ x1: centroidX, x2: centroidX }} transition={{ type: "spring", stiffness: 100, damping: 15 }} y1={0} y2={120} stroke="#EF4444" strokeWidth={2} strokeDasharray="4,3" />
                <motion.circle animate={{ cx: centroidX }} transition={{ type: "spring", stiffness: 100, damping: 15 }} cy={60} r={6} fill="#EF4444" className="drop-shadow-lg" />
                <motion.text animate={{ x: Math.max(20, Math.min(centroidX + 8, 180)) }} transition={{ type: "spring", stiffness: 100, damping: 15 }} y={55} fontSize={10} fill="white" fontWeight="bold">
                  Centroid (z*): {(fuzzyResult.duration).toFixed(1)}
                </motion.text>
              </svg>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="bg-bg-secondary rounded-xl p-6 border border-border-color shadow-sm">
              <span className="text-[10px] text-accent-blue font-bold uppercase tracking-wider mb-3 block">The Formula</span>
              <div className="font-serif text-lg text-center py-4 bg-bg-primary rounded-lg border border-border-color">
                z* = ∫ μ<sub>A</sub>(z) · z dz / ∫ μ<sub>A</sub>(z) dz
              </div>
            </div>
            <div className="bg-bg-secondary rounded-xl p-6 border border-border-color shadow-sm flex-1">
              <span className="text-[10px] text-accent-blue font-bold uppercase tracking-wider mb-3 block">Interpretation</span>
              <p className="text-sm text-text-secondary leading-relaxed">
                The result is a single crisp value mapping your personalized study plan, balancing every contributing factor.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Inference Rule Matrix Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-bold font-serif">The Inference Rule Matrix</h2>
              <div className="flex items-center gap-2 bg-bg-secondary border border-border-color rounded-lg px-3 py-2">
                <Search size={16} className="text-text-muted shrink-0" />
                <input type="text" placeholder="Search rules..." value={ruleSearch} onChange={(e) => setRuleSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm w-32 sm:w-48" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 bg-bg-secondary p-3 rounded-xl border border-border-color items-center">
              {([{ id: "all", label: "All" }, { id: "active", label: "Active" }, { id: "inactive", label: "Inactive" }, { id: "highestAlpha", label: "Max α" }] as const).map((opt) => (
                <button key={opt.id} onClick={() => setRuleFilter(opt.id)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${ruleFilter === opt.id ? 'bg-accent-blue text-white' : 'bg-bg-primary text-text-secondary border-border-color hover:bg-bg-tertiary'}`}>
                  {opt.label}
                </button>
              ))}
              <div className="h-4 w-px bg-border-color mx-2 hidden sm:block" />
              <select value={outputFilter} onChange={(e) => setOutputFilter(e.target.value)} className="bg-bg-primary border border-border-color rounded px-2 py-1 text-xs font-semibold text-text-secondary outline-none">
                <option value="all">All Outputs</option>
                <option value="sangatPendek">Very Short</option>
                <option value="pendek">Short</option>
                <option value="sedang">Medium</option>
                <option value="panjang">Long</option>
                <option value="sangatPanjang">Very Long</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRules.length === 0 ? (
              <div className="col-span-full text-center p-8 bg-bg-secondary rounded-xl border border-border-color text-text-muted text-sm">No rules match criteria.</div>
            ) : (
              filteredRules.map((rule) => {
                const isActive = rule.strength > 0;
                return (
                  <button
                    key={rule.id}
                    onClick={() => openRuleDialog(rule)}
                    className={`text-left bg-bg-secondary rounded-xl border p-4 transition-all hover:shadow-md ${isActive ? 'border-accent-blue/50 bg-accent-blue/[0.02]' : 'border-border-color hover:border-text-muted'}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isActive ? 'bg-accent-blue text-white' : 'bg-bg-primary text-text-muted border border-border-color'}`}>
                        {String(rule.id).padStart(2, "0")}
                      </span>
                      {isActive ? (
                        <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                          Active (α = {rule.strength.toFixed(2)})
                        </span>
                      ) : (
                        <span className="text-text-muted text-[10px] uppercase">Inactive</span>
                      )}
                    </div>
                    <div className="font-mono text-xs text-text-secondary space-y-1 mb-3">
                      <div><span className="text-accent-blue font-bold">IF</span> Focus: {rule.focus.toUpperCase()}</div>
                      <div><span className="text-accent-blue font-bold">AND</span> Fatigue: {rule.fatigue.toUpperCase()}</div>
                      <div><span className="text-accent-blue font-bold">AND</span> Cmplx: {rule.complexity === 'high' ? 'HARD' : rule.complexity.toUpperCase()}</div>
                      <div><span className="text-warning font-bold">THEN</span> {formatOutputCategory(rule.output)}</div>
                    </div>
                    <div className="text-[10px] text-accent-blue font-semibold hover:underline">Click for detailed explanation →</div>
                  </button>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      <RuleExplanationDialog 
        rule={selectedRule} 
        isOpen={isRuleDialogOpen} 
        onClose={() => setIsRuleDialogOpen(false)} 
        focusMems={focusMems}
        fatigueMems={fatigueMems}
        complexityMems={complexityMems}
      />
    </div>
  );
}

