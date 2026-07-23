import { StudyPlan } from '@/lib/decision-engine';
import { Info } from 'lucide-react';

interface Props {
  plans: StudyPlan[];
  selectedPlanId: string;
}

export function DecisionMatrix({ plans, selectedPlanId }: Props) {
  
  const renderRow = (label: string, key: keyof StudyPlan['outcomes'] | 'duration' | 'breakTime', format: (val: any) => string, explanation: string) => {
    return (
      <tr className="border-b border-border-color last:border-0 hover:bg-bg-primary/50 transition-colors">
        <td className="py-3 px-4">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-text-secondary">{label}</span>
            <div className="group relative">
              <Info size={14} className="text-text-muted cursor-help" />
              <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 w-48 bg-bg-secondary border border-border-color p-2 rounded shadow-xl text-xs text-text-primary z-50 mb-1">
                {explanation}
              </div>
            </div>
          </div>
        </td>
        {plans.map(plan => {
          const val = key === 'duration' || key === 'breakTime' ? plan[key] : plan.outcomes[key];
          const isSelected = plan.id === selectedPlanId;
          return (
            <td key={plan.id} className={`py-3 px-4 text-center text-sm font-bold font-serif ${isSelected ? 'bg-accent-blue/5 text-accent-blue' : 'text-text-primary'}`}>
              {format(val)}
            </td>
          );
        })}
      </tr>
    );
  };

  const renderMultiCriteriaRow = (label: string, key: keyof StudyPlan['criteria'], explanation: string) => {
    return (
      <tr className="border-b border-border-color last:border-0 hover:bg-bg-primary/50 transition-colors bg-bg-primary/20">
        <td className="py-2 px-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-text-secondary">{label} Score</span>
            <div className="group relative">
              <Info size={12} className="text-text-muted cursor-help" />
              <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 w-48 bg-bg-secondary border border-border-color p-2 rounded shadow-xl text-xs text-text-primary z-50 mb-1">
                {explanation}
              </div>
            </div>
          </div>
        </td>
        {plans.map(plan => {
          const val = plan.criteria[key];
          const isSelected = plan.id === selectedPlanId;
          return (
            <td key={plan.id} className={`py-2 px-4 text-center`}>
               <div className="w-full bg-border-color h-2 rounded-full overflow-hidden">
                 <div className={`h-full ${isSelected ? 'bg-accent-blue' : 'bg-text-muted'}`} style={{ width: `${val}%` }} />
               </div>
            </td>
          );
        })}
      </tr>
    );
  };

  return (
    <div className="bg-bg-secondary border border-border-color rounded-2xl shadow-sm overflow-hidden mt-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-bg-primary border-b border-border-color">
              <th className="py-4 px-4 font-bold text-sm text-text-primary w-1/4">Comparison Matrix</th>
              {plans.map(plan => (
                <th key={plan.id} className={`py-4 px-4 text-center font-bold ${plan.id === selectedPlanId ? 'text-accent-blue' : 'text-text-secondary'}`}>
                  {plan.type}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {renderRow('Study Duration', 'duration', (v) => `${v}m`, "Calculated total study time.")}
            {renderRow('Break Time', 'breakTime', (v) => `${v}m`, "Suggested total resting period throughout the session.")}
            {renderRow('Knowledge Coverage', 'knowledgeCoverage', (v) => `${v}%`, "Estimated depth of material covered based on predictive intelligence.")}
            {renderRow('Expected Fatigue', 'expectedFatigue', (v) => `${v}%`, "Forecasted fatigue post-session.")}
            {renderRow('Completion Prob.', 'completionProbability', (v) => `${v}%`, "Likelihood of finishing without quitting early.")}
            
            {/* MultiCriteria section visually separated */}
            <tr><td colSpan={4} className="py-2 px-4 text-xs font-bold uppercase tracking-widest text-text-muted bg-bg-primary">Multi-Criteria Evaluation</td></tr>
            
            {renderMultiCriteriaRow('Efficiency', 'efficiency', 'Ratio of learning coverage to time spent.')}
            {renderMultiCriteriaRow('Recovery', 'recovery', 'How well this plan aids mental restoration.')}
            {renderMultiCriteriaRow('Consistency', 'consistency', 'Contribution to long-term habit building.')}
          </tbody>
        </table>
      </div>
    </div>
  );
}
