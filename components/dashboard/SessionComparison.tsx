import { motion } from 'framer-motion';
import { ArrowRightLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SessionComparison as ComparisonData } from '@/lib/adaptive-engine';

export function SessionComparison({ data }: { data: ComparisonData | null }) {
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-secondary border border-border-color rounded-2xl p-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-accent-blue/10 p-2 rounded-lg">
          <ArrowRightLeft className="text-accent-blue" size={24} />
        </div>
        <h3 className="text-xl font-bold">Session Comparison</h3>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center border-b border-border-color pb-3 mb-4 text-xs font-semibold text-text-muted">
        <div>Metric</div>
        <div>Yesterday</div>
        <div>Today</div>
      </div>

      <ComparisonRow 
        label="Focus" 
        val1={`${data.yesterday.focus || 0}%`} 
        val2={`${data.today.focus || 0}%`} 
        trend={data.focusTrend} 
        positiveIsUp={true} 
      />
      <ComparisonRow 
        label="Fatigue" 
        val1={`${data.yesterday.fatigue || 0}%`} 
        val2={`${data.today.fatigue || 0}%`} 
        trend={data.fatigueTrend} 
        positiveIsUp={false} 
      />
      <ComparisonRow 
        label="Duration" 
        val1={`${data.yesterday.duration || 0}m`} 
        val2={`${data.today.duration || 0}m`} 
        trend={(data.today.duration || 0) > (data.yesterday.duration || 0) ? 'up' : 'down'} 
        positiveIsUp={true} 
      />

    </motion.div>
  );
}

function ComparisonRow({ label, val1, val2, trend, positiveIsUp }: { label: string, val1: string, val2: string, trend: 'up' | 'down' | 'stable', positiveIsUp: boolean }) {
  const isPositive = (trend === 'up' && positiveIsUp) || (trend === 'down' && !positiveIsUp);
  const isNeutral = trend === 'stable';
  
  return (
    <div className="grid grid-cols-3 gap-2 text-center py-3 items-center border-b border-border-color/50 last:border-0">
      <div className="text-left font-medium text-text-secondary text-sm">{label}</div>
      <div className="text-sm font-serif">{val1}</div>
      <div className={`text-sm font-serif font-bold flex items-center justify-center gap-1 ${isNeutral ? 'text-text-primary' : isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {val2}
        {trend === 'up' ? <TrendingUp size={14} /> : trend === 'down' ? <TrendingDown size={14} /> : <Minus size={14} />}
      </div>
    </div>
  );
}
