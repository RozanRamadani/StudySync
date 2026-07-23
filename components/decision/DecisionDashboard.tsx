"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDecisionSupport } from '@/lib/decision-engine/hooks';
import { StudyPlan } from '@/lib/decision-engine';
import { AlternativePlans } from './AlternativePlans';
import { DecisionMatrix } from './DecisionMatrix';
import { DecisionAssistant } from './DecisionAssistant';
import { Download, ChevronDown, ChevronUp } from 'lucide-react';

export function DecisionDashboard({ onSelectPlan }: { onSelectPlan: (duration: number) => void }) {
  const { plans, assistant } = useDecisionSupport();
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0].id);
  const [showDetails, setShowDetails] = useState(false);

  const selectedPlan = plans.find(p => p.id === selectedPlanId) || plans[0];

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="w-full space-y-6 print:space-y-4">
      {/* Print Header - Only visible when printing */}
      <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-bold font-serif mb-2">StudySync Decision Report</h1>
        <p className="text-sm text-text-muted">Generated on {new Date().toLocaleDateString()}</p>
        <hr className="mt-4 border-border-color" />
      </div>

      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-2xl font-bold font-serif">Decision Support</h2>
          <p className="text-sm text-text-muted">Evaluate alternative strategies before starting</p>
        </div>
        <button 
          onClick={handleExportPDF}
          className="bg-bg-secondary border border-border-color px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-bg-primary transition-colors"
        >
          <Download size={16} /> Export PDF
        </button>
      </div>

      <DecisionAssistant assistant={assistant} />

      <AlternativePlans 
        plans={plans} 
        selectedPlanId={selectedPlanId} 
        onSelect={setSelectedPlanId} 
      />

      <div className="flex justify-center print:hidden">
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="text-accent-blue font-bold text-sm flex items-center gap-1 hover:underline"
        >
          {showDetails ? <><ChevronUp size={16} /> Hide Advanced Matrix</> : <><ChevronDown size={16} /> Show Advanced Matrix</>}
        </button>
      </div>

      <AnimatePresence>
        {(showDetails || typeof window !== 'undefined' && window.matchMedia('print').matches) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden print:!h-auto print:!opacity-100"
          >
            <DecisionMatrix plans={plans} selectedPlanId={selectedPlanId} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Start Action */}
      <div className="pt-6 border-t border-border-color flex flex-col items-center gap-3 print:hidden">
        <p className="text-sm text-text-muted">The final decision always belongs to you.</p>
        <button 
          onClick={() => onSelectPlan(selectedPlan.duration)}
          className="w-full md:w-auto bg-accent-blue hover:bg-blue-600 text-white font-bold py-4 px-12 rounded-xl shadow-lg transition-all transform active:scale-95 text-lg"
        >
          Start {selectedPlan.type} ({selectedPlan.duration}m)
        </button>
      </div>
    </div>
  );
}
