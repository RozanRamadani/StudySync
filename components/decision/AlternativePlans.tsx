import { motion } from 'framer-motion';
import { StudyPlan } from '@/lib/decision-engine';
import { Info, Zap, Shield, Sparkles } from 'lucide-react';

interface Props {
  plans: StudyPlan[];
  selectedPlanId: string;
  onSelect: (id: string) => void;
}

export function AlternativePlans({ plans, selectedPlanId, onSelect }: Props) {
  const getIcon = (type: string) => {
    if (type === 'Deep Work') return <Zap size={24} className="text-orange-500" />;
    if (type === 'Recovery') return <Shield size={24} className="text-green-500" />;
    return <Sparkles size={24} className="text-accent-blue" />;
  };

  const getColors = (type: string, isSelected: boolean) => {
    if (!isSelected) return 'border-border-color bg-bg-secondary hover:border-text-muted';
    if (type === 'Deep Work') return 'border-orange-500 bg-orange-500/5 ring-1 ring-orange-500';
    if (type === 'Recovery') return 'border-green-500 bg-green-500/5 ring-1 ring-green-500';
    return 'border-accent-blue bg-accent-blue/5 ring-1 ring-accent-blue';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {plans.map((plan, i) => (
        <motion.div
          key={plan.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          onClick={() => onSelect(plan.id)}
          className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${getColors(plan.type, selectedPlanId === plan.id)}`}
        >
          {plan.rankTitle && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-bg-primary border border-border-color px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm z-10 whitespace-nowrap">
              {plan.rankTitle}
            </div>
          )}

          <div className="flex items-center justify-between mb-4 mt-2">
            <div className="flex items-center gap-2">
              {getIcon(plan.type)}
              <h3 className="font-bold text-lg">{plan.type}</h3>
            </div>
            <div className="text-2xl font-black font-serif">{plan.duration}m</div>
          </div>
          
          <p className="text-xs text-text-secondary mb-4 min-h-[32px]">{plan.description}</p>
          
          <div className="space-y-3 pt-4 border-t border-border-color">
            <div>
              <div className="text-[10px] uppercase font-bold text-green-500 tracking-wider mb-1">Gain</div>
              <ul className="text-xs text-text-primary space-y-1">
                {plan.pros.map((pro, j) => <li key={j} className="flex items-start gap-1"><span>•</span> {pro}</li>)}
              </ul>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-red-500 tracking-wider mb-1">Sacrifice</div>
              <ul className="text-xs text-text-primary space-y-1">
                {plan.cons.map((con, j) => <li key={j} className="flex items-start gap-1"><span>•</span> {con}</li>)}
              </ul>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-1.5 text-text-muted">
            <Info size={12} className="shrink-0 mt-0.5" />
            <p className="text-[9px] leading-tight group relative">
              <span className="underline cursor-help decoration-dashed">How was this generated?</span>
              <span className="hidden group-hover:block absolute bottom-full left-0 w-48 bg-bg-primary border border-border-color p-2 rounded shadow-xl text-[10px] text-text-primary z-50 mb-1">
                Based on scalar variations of the Mamdani Fuzzy Recommendation applied against your Learning Profile.
              </span>
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
