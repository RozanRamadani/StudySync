"use client";

import { useMemo } from "react";
import { FuzzyResult, MembershipDegrees } from "@/lib/fuzzy-engine";

interface RuleStatisticsDashboardProps {
  fuzzyResult: FuzzyResult;
  focusMems: MembershipDegrees;
  fatigueMems: MembershipDegrees;
  complexityMems: MembershipDegrees;
}

export function RuleStatisticsDashboard({ fuzzyResult, focusMems, fatigueMems, complexityMems }: RuleStatisticsDashboardProps) {
  
  const activeCount = fuzzyResult.activeRules.length;
  const totalCount = fuzzyResult.allRules.length;
  const inactiveCount = totalCount - activeCount;

  const maxAlpha = useMemo(() => {
    if (activeCount === 0) return 0;
    return Math.max(...fuzzyResult.activeRules.map((r) => r.strength));
  }, [fuzzyResult, activeCount]);

  const avgAlpha = useMemo(() => {
    if (activeCount === 0) return 0;
    return fuzzyResult.activeRules.reduce((sum, r) => sum + r.strength, 0) / activeCount;
  }, [fuzzyResult, activeCount]);

  const dominantCategory = useMemo(() => {
    const categoryCount: Record<string, number> = {};
    if (activeCount === 0) return "N/A";
    fuzzyResult.activeRules.forEach((r) => {
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

    switch (dominant) {
      case "sangatPendek": return "Very Short";
      case "pendek": return "Short";
      case "sedang": return "Medium";
      case "panjang": return "Long";
      case "sangatPanjang": return "Very Long";
      default: return dominant;
    }
  }, [fuzzyResult, activeCount]);

  const avgMembership = useMemo(() => {
    const sum = focusMems.low + focusMems.medium + focusMems.high +
                fatigueMems.low + fatigueMems.medium + fatigueMems.high +
                complexityMems.low + complexityMems.medium + complexityMems.high;
    return (sum / 9).toFixed(2);
  }, [focusMems, fatigueMems, complexityMems]);

  const stats = [
    { label: "Total Rules", value: totalCount, highlight: false },
    { label: "Active Rules", value: activeCount, color: "text-green-500", highlight: true },
    { label: "Inactive Rules", value: inactiveCount, highlight: false },
    { label: "Highest α (Strength)", value: maxAlpha.toFixed(2), color: "text-accent-blue", mono: true, highlight: true },
    { label: "Average α", value: avgAlpha.toFixed(2), color: "text-accent-blue", mono: true, highlight: false },
    { label: "Average Membership", value: avgMembership, mono: true, highlight: false },
    { label: "Dominant Output", value: dominantCategory, color: "text-warning", highlight: true },
    { label: "Centroid Value (z*)", value: fuzzyResult.duration.toFixed(1), mono: true, highlight: true },
    { label: "Recommendation", value: fuzzyResult.category, color: "text-text-primary", highlight: true },
  ];

  return (
    <div className="mb-12">
      <h2 className="text-xl sm:text-2xl font-bold font-serif mb-6">Rule Statistics Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3">
        {stats.map((stat, idx) => (
          <div key={idx} className={`bg-bg-secondary rounded-xl p-4 border transition-colors shadow-sm ${stat.highlight ? 'border-border-color hover:border-accent-blue/50' : 'border-border-color'}`}>
            <span className="text-[9px] text-text-muted uppercase tracking-wider font-bold block mb-1.5 leading-tight">{stat.label}</span>
            <span className={`text-base sm:text-lg font-bold block truncate ${stat.color || 'text-text-primary'} ${stat.mono ? 'font-mono' : 'font-sans'}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
