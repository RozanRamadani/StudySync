import { motion } from 'framer-motion';
import { CalendarRange } from 'lucide-react';
import { WeeklyReflection as ReflectionData } from '@/lib/adaptive-engine';

export function WeeklyReflection({ data }: { data: ReflectionData | null }) {
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-secondary border border-border-color rounded-2xl p-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-accent-blue/10 p-2 rounded-lg">
          <CalendarRange className="text-accent-blue" size={24} />
        </div>
        <h3 className="text-xl font-bold">Weekly Reflection</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 border-b border-border-color pb-6">
        <StatItem label="Total Study Time" value={`${data.totalStudyTime}m`} />
        <StatItem label="Avg Focus" value={`${data.averageFocus}%`} />
        <StatItem label="Most Productive" value={data.mostProductiveDay} />
        <StatItem label="Longest Session" value={`${data.longestSession}m`} />
      </div>

      <div className="space-y-4">
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <h4 className="text-sm font-bold text-green-500 mb-1">Highlight</h4>
          <p className="text-sm text-text-secondary">{data.positiveReflection}</p>
        </div>
        
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
          <h4 className="text-sm font-bold text-orange-500 mb-1">Area to Improve</h4>
          <p className="text-sm text-text-secondary">{data.areasToImprove}</p>
        </div>

        <div className="bg-accent-blue/10 border border-accent-blue/20 rounded-xl p-4">
          <h4 className="text-sm font-bold text-accent-blue mb-1">Next Week</h4>
          <p className="text-sm text-text-secondary">{data.suggestionsForNextWeek}</p>
        </div>
      </div>
    </motion.div>
  );
}

function StatItem({ label, value }: { label: string, value: string | number }) {
  return (
    <div>
      <span className="block text-xs text-text-muted mb-1">{label}</span>
      <span className="block text-lg font-bold font-serif">{value}</span>
    </div>
  );
}
