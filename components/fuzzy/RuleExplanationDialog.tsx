"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FuzzyRule, MembershipDegrees } from "@/lib/fuzzy-engine";
import { X, CheckCircle2, XCircle, Info } from "lucide-react";

interface RuleExplanationDialogProps {
  rule: FuzzyRule | null;
  isOpen: boolean;
  onClose: () => void;
  focusMems: MembershipDegrees;
  fatigueMems: MembershipDegrees;
  complexityMems: MembershipDegrees;
}

export function RuleExplanationDialog({ rule, isOpen, onClose, focusMems, fatigueMems, complexityMems }: RuleExplanationDialogProps) {
  if (!rule) return null;

  const isActive = rule.strength > 0;

  const formatOutputCategory = (category: string) => {
    switch (category) {
      case "sangatPendek": return "Very Short";
      case "pendek": return "Short";
      case "sedang": return "Medium";
      case "panjang": return "Long";
      case "sangatPanjang": return "Very Long";
      default: return category;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={onClose} 
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-2xl bg-bg-secondary rounded-2xl shadow-2xl border border-border-color overflow-hidden z-10 max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-bg-secondary/95 backdrop-blur-md border-b border-border-color p-4 sm:p-6 flex justify-between items-center z-20">
              <div>
                <h3 className="text-xl font-bold font-serif flex items-center gap-2 text-text-primary">
                  Rule {rule.id} Explanation
                </h3>
                <p className="text-sm text-text-muted mt-1 flex items-center gap-1.5">
                  Status: 
                  {isActive ? (
                    <span className="text-green-500 font-bold flex items-center gap-1"><CheckCircle2 size={14} /> Active</span>
                  ) : (
                    <span className="text-text-muted font-bold flex items-center gap-1"><XCircle size={14} /> Inactive</span>
                  )}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-bg-tertiary transition-colors text-text-muted hover:text-text-primary"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* The Rule Statement */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Rule Statement</h4>
                <div className="bg-bg-primary border border-border-color p-4 rounded-xl font-mono text-sm leading-relaxed text-text-secondary">
                  <span className="text-accent-blue font-bold">IF</span> Focus is <span className="font-bold text-text-primary">{rule.focus.toUpperCase()}</span><br />
                  <span className="text-accent-blue font-bold">AND</span> Fatigue is <span className="font-bold text-text-primary">{rule.fatigue.toUpperCase()}</span><br />
                  <span className="text-accent-blue font-bold">AND</span> Complexity is <span className="font-bold text-text-primary">{rule.complexity === 'high' ? 'HARD' : rule.complexity.toUpperCase()}</span><br />
                  <span className="text-warning font-bold">THEN</span> Study Duration is <span className="font-bold text-green-500">{formatOutputCategory(rule.output)}</span>
                </div>
              </div>

              {/* Logic Evaluation */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Evaluation (Mamdani MIN operator)</h4>
                <div className="bg-bg-primary border border-border-color rounded-xl p-4 overflow-x-auto scrollbar-hide">
                  <div className="flex flex-col gap-3 min-w-[400px]">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-text-secondary">1. Focus ({rule.focus})</span>
                      <span className="font-mono font-bold">{focusMems[rule.focus].toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-text-secondary">2. Fatigue ({rule.fatigue})</span>
                      <span className="font-mono font-bold">{fatigueMems[rule.fatigue].toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pb-3 border-b border-border-color">
                      <span className="text-text-secondary">3. Complexity ({rule.complexity})</span>
                      <span className="font-mono font-bold">{complexityMems[rule.complexity].toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-text-primary">Minimum Value (α Firing Strength)</span>
                      <span className="font-mono font-bold text-accent-blue text-lg bg-accent-blue/10 px-2 py-0.5 rounded">{rule.strength.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Natural Language Explanation */}
              <div className="bg-accent-blue-soft border border-accent-blue/20 p-4 rounded-xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-accent-blue mb-2 flex items-center gap-1.5">
                  <Info size={14} /> What does this mean?
                </h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {isActive ? (
                    <>Because all three conditions have a membership greater than 0, this rule is <strong>active</strong>. It contributes to the <strong>{formatOutputCategory(rule.output)}</strong> output category with a weight of <strong>{rule.strength.toFixed(2)}</strong> (the lowest of the three input values). This will pull the final centroid recommendation towards the {formatOutputCategory(rule.output)} duration range.</>
                  ) : (
                    <>Because at least one condition has a membership of 0 (it is completely false based on your current inputs), this rule is <strong>inactive</strong>. It does not contribute to the final recommendation.</>
                  )}
                </p>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
