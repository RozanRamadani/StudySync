"use client";

import { useMemo } from "react";
import { FuzzyResult } from "@/lib/fuzzy-engine";
import { Info, Download, AlertCircle } from "lucide-react";

interface ExplainableInsightPanelProps {
  fuzzyResult: FuzzyResult;
  learningMode: boolean;
  onExport: () => void;
  input: { focus: number; fatigue: number; complexity: number };
}

export function ExplainableInsightPanel({ fuzzyResult, learningMode, onExport, input }: ExplainableInsightPanelProps) {
  const { focus, fatigue, complexity } = input;

  const insights = useMemo(() => {
    const lines = [];
    if (focus >= 70) {
      lines.push({ title: `Your Focus is HIGH (${(focus / 100).toFixed(2)})`, desc: "You are currently able to maintain concentration for a long period." });
    } else if (focus <= 30) {
      lines.push({ title: `Your Focus is LOW (${(focus / 100).toFixed(2)})`, desc: "Low focus requires shorter study sessions to maximize retention." });
    } else {
      lines.push({ title: `Your Focus is MEDIUM (${(focus / 100).toFixed(2)})`, desc: "Moderate focus supports an average study duration." });
    }

    if (fatigue >= 70) {
      lines.push({ title: `Your Fatigue is HIGH (${(fatigue / 100).toFixed(2)})`, desc: "High fatigue drastically limits effective study time." });
    } else if (fatigue <= 30) {
      lines.push({ title: `Your Fatigue is LOW (${(fatigue / 100).toFixed(2)})`, desc: "Low fatigue allows a longer continuous study session." });
    } else {
      lines.push({ title: `Your Fatigue is MEDIUM (${(fatigue / 100).toFixed(2)})`, desc: "Moderate fatigue suggests a balanced study approach." });
    }

    if (complexity >= 70) {
      lines.push({ title: `Your Material Complexity is HARD (${(complexity / 100).toFixed(2)})`, desc: "Complex learning material requires additional study time." });
    } else if (complexity <= 30) {
      lines.push({ title: `Your Material Complexity is EASY (${(complexity / 100).toFixed(2)})`, desc: "Easier material can be processed more quickly." });
    } else {
      lines.push({ title: `Your Material Complexity is MEDIUM (${(complexity / 100).toFixed(2)})`, desc: "Average complexity calls for a standard duration." });
    }

    return lines;
  }, [focus, fatigue, complexity]);

  const activeCount = fuzzyResult.activeRules.length;

  return (
    <div className="bg-bg-secondary border border-border-color rounded-xl p-6 shadow-sm mb-8 relative" id="exportable-report">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif flex items-center gap-2">
            Why This Recommendation?
            {learningMode && (
              <div className="group relative cursor-help text-text-muted hover:text-accent-blue">
                <Info size={16} />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-bg-tertiary border border-border-color text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center text-text-primary">
                  This panel breaks down the fuzzy inputs and explains how they influence the final decision.
                </div>
              </div>
            )}
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Understanding the logic behind your {fuzzyResult.duration}-minute study session.
          </p>
        </div>
        <button 
          onClick={onExport}
          className="flex items-center gap-2 px-3 py-1.5 bg-bg-primary hover:bg-bg-tertiary text-text-primary text-xs font-semibold rounded-md border border-border-color transition-colors"
        >
          <Download size={14} /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Insight Chain */}
        <div className="space-y-4">
          <div className="bg-bg-primary rounded-lg p-4 border border-border-color">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Input Analysis</h3>
            
            <div className="space-y-4">
              {insights.map((insight, idx) => (
                <div key={idx} className="relative pl-4 border-l-2 border-accent-blue/30">
                  <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-bg-secondary border-2 border-accent-blue" />
                  <h4 className="text-sm font-bold text-text-primary">{insight.title}</h4>
                  <p className="text-xs text-text-secondary mt-1">{insight.desc}</p>
                </div>
              ))}
              
              <div className="relative pl-4 border-l-2 border-dashed border-border-color text-center py-2">
                <span className="text-xs font-bold text-text-muted">↓</span>
              </div>
              
              <div className="relative pl-4 border-l-2 border-warning/50">
                <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-bg-secondary border-2 border-warning" />
                <h4 className="text-sm font-bold text-text-primary">{activeCount} fuzzy rules became active.</h4>
                <p className="text-xs text-text-secondary mt-1">Based on these conditions.</p>
              </div>

              <div className="relative pl-4 border-l-2 border-dashed border-border-color text-center py-2">
                <span className="text-xs font-bold text-text-muted">↓</span>
              </div>

              <div className="relative pl-4 border-l-2 border-green-500/50">
                <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-bg-secondary border-2 border-green-500" />
                <h4 className="text-sm font-bold text-text-primary">Centroid Defuzzification</h4>
                <p className="text-xs text-text-secondary mt-1">Aggregating outputs to find the center of gravity.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendation Summary */}
        <div className="flex flex-col gap-4">
          <div className="bg-accent-blue/5 border border-accent-blue/20 rounded-lg p-5 flex-1">
            <h3 className="text-xs font-bold text-accent-blue uppercase tracking-wider mb-2">Final Recommendation</h3>
            <div className="text-4xl font-bold font-mono text-text-primary mb-1">
              {fuzzyResult.duration} <span className="text-lg text-text-secondary font-sans font-medium">Minutes</span>
            </div>
            
            <div className="mt-4 pt-4 border-t border-accent-blue/10">
              <h4 className="text-xs font-bold text-text-primary mb-2">Suggested Strategy</h4>
              <ul className="text-sm text-text-secondary space-y-2 list-disc pl-4 marker:text-accent-blue/50">
                <li>Study continuously for {fuzzyResult.duration} minutes.</li>
                {fuzzyResult.duration >= 90 && <li>Consider splitting this into two sessions if fatigue sets in early.</li>}
                {fuzzyResult.duration >= 60 && <li>Take a 10-minute break after completion.</li>}
                {fuzzyResult.duration < 60 && <li>Use this focused short burst efficiently, take a 5-minute break afterwards.</li>}
                <li>Continue if concentration remains high, otherwise switch tasks.</li>
              </ul>
            </div>
          </div>

          <div className="bg-bg-primary rounded-lg p-4 border border-border-color flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                Confidence Score
                {learningMode && (
                  <Tooltip text="Represents the strength of the current fuzzy inference based on active rule contributions, not model accuracy.">
                    <Info size={14} className="text-text-muted cursor-help hover:text-text-primary" />
                  </Tooltip>
                )}
              </h4>
              <div className="text-xl font-bold font-mono text-text-primary mt-1">
                {fuzzyResult.confidence}%
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                fuzzyResult.confidence > 75 ? 'bg-green-500/10 text-green-500' :
                fuzzyResult.confidence > 40 ? 'bg-warning/10 text-warning' : 'bg-red-500/10 text-red-500'
              }`}>
                {fuzzyResult.confidence > 75 ? 'High Confidence' :
                 fuzzyResult.confidence > 40 ? 'Medium Confidence' : 'Low Confidence'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Tooltip({ children, text }: { children: React.ReactNode; text: string }) {
  return (
    <div className="group relative inline-flex">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-bg-tertiary border border-border-color text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center text-text-primary">
        {text}
      </div>
    </div>
  );
}
