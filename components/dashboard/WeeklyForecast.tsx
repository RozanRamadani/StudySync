import { motion } from 'framer-motion';
import { TrendingUp, Info } from 'lucide-react';
import { WeeklyForecast as ForecastData } from '@/lib/predictive-engine';

export function WeeklyForecast({ data }: { data: ForecastData | null }) {
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-secondary border border-border-color rounded-2xl p-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-500/10 p-2 rounded-lg">
          <TrendingUp className="text-purple-500" size={24} />
        </div>
        <h3 className="text-xl font-bold">Weekly Projection</h3>
      </div>

      <div className="space-y-4 mb-4">
        <ScenarioRow label="Optimistic Scenario" value={`${data.optimistic} hrs`} color="text-green-500" />
        <ScenarioRow label="Expected Trend" value={`${data.expected} hrs`} color="text-purple-500" highlight />
        <ScenarioRow label="Conservative Scenario" value={`${data.conservative} hrs`} color="text-orange-500" />
      </div>

      <div className="flex items-center justify-between p-3 bg-bg-primary border border-border-color rounded-xl mb-4">
        <span className="text-sm font-medium text-text-secondary">Expected Goal Completions</span>
        <span className="text-lg font-bold text-text-primary">{data.expectedGoals} Sessions</span>
      </div>

      <div className="flex items-start gap-2">
        <Info size={14} className="text-purple-500 shrink-0 mt-0.5" />
        <p className="text-[11px] text-text-muted leading-tight">
          {data.evidence} Estimates assume current habits continue.
        </p>
      </div>
    </motion.div>
  );
}

function ScenarioRow({ label, value, color, highlight }: { label: string, value: string, color: string, highlight?: boolean }) {
  return (
    <div className={`flex justify-between items-center p-3 rounded-lg border ${highlight ? 'bg-purple-500/5 border-purple-500/20' : 'bg-transparent border-transparent'}`}>
      <span className={`text-sm ${highlight ? 'font-bold text-text-primary' : 'font-medium text-text-secondary'}`}>{label}</span>
      <span className={`font-serif font-bold ${color}`}>{value}</span>
    </div>
  );
}
