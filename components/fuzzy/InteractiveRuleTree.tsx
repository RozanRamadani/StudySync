"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FuzzyResult } from "@/lib/fuzzy-engine";
import { Info, HelpCircle, X } from "lucide-react";

interface InteractiveRuleTreeProps {
  fuzzyResult: FuzzyResult;
  learningMode: boolean;
  input: { focus: number; fatigue: number; complexity: number };
}

export function InteractiveRuleTree({ fuzzyResult, learningMode, input }: InteractiveRuleTreeProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const nodes = [
    { id: "inputs", label: "Inputs", type: "Input Values (Focus, Fatigue, Complexity)" },
    { id: "membership", label: "Membership", type: "Fuzzification Stage" },
    { id: "rules", label: "Activated Rules", type: "If-Then Rule Evaluation" },
    { id: "aggregation", label: "Aggregation", type: "Combining Rule Outputs" },
    { id: "centroid", label: "Centroid", type: "Defuzzification" },
    { id: "recommendation", label: "Recommendation", type: "Final Output" },
  ];

  const getNodeExplanation = (id: string) => {
    switch (id) {
      case "inputs":
        return {
          title: "Crisp Inputs",
          desc: "These are the exact values you provided or were captured. They represent concrete measurements.",
          value: `Focus: ${input.focus}, Fatigue: ${input.fatigue}, Complexity: ${input.complexity}`
        };
      case "membership":
        return {
          title: "Membership Calculation",
          desc: "Fuzzification translates exact numbers into 'degrees of truth'. For example, a focus of 80 is 20% 'Medium' and 80% 'High'.",
          value: `Focus is currently primarily ${input.focus >= 70 ? 'High' : input.focus <= 30 ? 'Low' : 'Medium'}.`
        };
      case "rules":
        return {
          title: "Activated Rules",
          desc: "The Mamdani engine checks all 27 possible rules. Only rules where all IF conditions have a >0 membership become 'Active'.",
          value: `${fuzzyResult.activeRules.length} rules are currently active.`
        };
      case "aggregation":
        return {
          title: "Aggregation",
          desc: "This stage combines the outputs of all active rules into a single fuzzy shape by taking the maximum value across all rules.",
          value: `The combined shape peaks at an α value of ${Math.max(...fuzzyResult.activeRules.map(r => r.strength)).toFixed(2)}.`
        };
      case "centroid":
        return {
          title: "Centroid Defuzzification",
          desc: "We calculate the 'Center of Gravity' (z*) of the aggregated shape to return a single, usable number.",
          value: `Calculated z* = ${fuzzyResult.duration}`
        };
      case "recommendation":
        return {
          title: "Final Recommendation",
          desc: "The centroid value is mapped to a human-readable category and returned to the application.",
          value: `${fuzzyResult.duration} Minutes (${fuzzyResult.category})`
        };
      default:
        return null;
    }
  };

  return (
    <div className="bg-bg-secondary border border-border-color rounded-xl p-6 shadow-sm mb-8 relative">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif flex items-center gap-2">
            Interactive Decision Tree
            {learningMode && (
              <span className="text-xs font-normal px-2 py-1 bg-accent-blue/10 text-accent-blue rounded-full border border-accent-blue/20">
                Click nodes to learn more
              </span>
            )}
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Follow the data flow from your inputs to the final recommendation.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Tree Visual */}
        <div className="flex-1 relative">
          <div className="absolute left-[50%] top-0 bottom-0 w-0.5 bg-border-color -translate-x-1/2 z-0 hidden sm:block" />
          
          <div className="flex flex-col gap-4 relative z-10">
            {nodes.map((node, index) => {
              const isSelected = selectedNode === node.id;
              return (
                <div key={node.id} className="relative group">
                  {/* Desktop connector line */}
                  {index < nodes.length - 1 && (
                    <div className="absolute left-[50%] top-full h-4 w-px bg-border-color -translate-x-1/2 hidden sm:block" />
                  )}
                  {/* Mobile connector line */}
                  {index < nodes.length - 1 && (
                    <div className="absolute left-6 top-full h-4 w-px bg-border-color block sm:hidden" />
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
                    className={`w-full sm:w-64 sm:mx-auto flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200 cursor-pointer relative bg-bg-primary
                      ${isSelected 
                        ? 'border-accent-blue shadow-[0_0_15px_rgba(59,130,246,0.3)] z-20' 
                        : 'border-border-color hover:border-accent-blue/50'
                      }
                    `}
                  >
                    <span className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">{node.type}</span>
                    <span className={`font-bold ${isSelected ? 'text-accent-blue' : 'text-text-primary'}`}>
                      {node.label}
                    </span>
                    {learningMode && (
                      <HelpCircle size={14} className={`absolute top-2 right-2 ${isSelected ? 'text-accent-blue' : 'text-text-muted opacity-50'}`} />
                    )}
                  </motion.button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Explanation Panel */}
        <div className="w-full md:w-80 shrink-0">
          <AnimatePresence mode="wait">
            {selectedNode ? (
              <motion.div
                key={selectedNode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-bg-primary border border-accent-blue rounded-xl p-5 shadow-lg relative"
              >
                <button 
                  onClick={() => setSelectedNode(null)}
                  className="absolute top-3 right-3 text-text-muted hover:text-text-primary"
                >
                  <X size={16} />
                </button>
                
                {(() => {
                  const expl = getNodeExplanation(selectedNode);
                  if (!expl) return null;
                  return (
                    <>
                      <h3 className="font-bold text-accent-blue mb-2 text-lg">{expl.title}</h3>
                      <p className="text-sm text-text-secondary leading-relaxed mb-4">{expl.desc}</p>
                      <div className="bg-bg-secondary p-3 rounded-md border border-border-color font-mono text-xs text-text-primary break-words">
                        <span className="font-bold text-text-muted mb-1 block">Current State:</span>
                        {expl.value}
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex items-center justify-center p-8 border border-dashed border-border-color rounded-xl text-text-muted text-sm text-center"
              >
                Select any node in the tree to view its role in the inference process.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
