import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, CalendarDays } from 'lucide-react';
import { useStudySync } from '@/components/providers/StudySyncProvider';
import { format, subDays, isAfter } from 'date-fns';

export function ImprovementTimeline() {
  const { sessions } = useStudySync();
  const [range, setRange] = useState<7 | 30 | 90>(7);

  const data = useMemo(() => {
    if (!sessions || sessions.length === 0) return [];

    const cutoff = subDays(new Date(), range);
    const recentSessions = sessions
      .filter(s => isAfter(new Date(s.timestamp), cutoff))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Group by day for simple representation
    const grouped: Record<string, { focus: number, fatigue: number, count: number }> = {};
    recentSessions.forEach(s => {
      const day = format(new Date(s.timestamp), 'MMM dd');
      if (!grouped[day]) grouped[day] = { focus: 0, fatigue: 0, count: 0 };
      grouped[day].focus += s.focus;
      grouped[day].fatigue += s.fatigue;
      grouped[day].count += 1;
    });

    return Object.entries(grouped).map(([day, stats]) => ({
      day,
      focus: Math.round(stats.focus / stats.count),
      fatigue: Math.round(stats.fatigue / stats.count)
    }));
  }, [sessions, range]);

  if (data.length === 0) return null;

  const maxPoints = Math.max(...data.map(d => Math.max(d.focus, d.fatigue)), 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-secondary border border-border-color rounded-2xl p-6 shadow-sm col-span-1 md:col-span-2"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-accent-blue/10 p-2 rounded-lg">
            <LineChart className="text-accent-blue" size={24} />
          </div>
          <h3 className="text-xl font-bold">Improvement Timeline</h3>
        </div>
        <div className="flex bg-bg-primary rounded-lg p-1 border border-border-color text-xs">
          {[7, 30, 90].map(r => (
            <button
              key={r}
              onClick={() => setRange(r as any)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${range === r ? 'bg-accent-blue text-white' : 'text-text-secondary hover:text-text-primary'}`}
            >
              {r} Days
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-end gap-2 h-48 mt-4 pt-4 relative">
        {data.map((point, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end items-center gap-1 group relative h-full">
            {/* Tooltip */}
            <div className="absolute -top-12 opacity-0 group-hover:opacity-100 bg-bg-secondary border border-border-color shadow-lg p-2 rounded-lg text-xs z-10 transition-opacity flex flex-col gap-1 whitespace-nowrap">
              <span className="font-bold">{point.day}</span>
              <span className="text-accent-blue">Focus: {point.focus}%</span>
              <span className="text-orange-500">Fatigue: {point.fatigue}%</span>
            </div>
            
            {/* Bars */}
            <div className="w-full flex items-end justify-center gap-1 h-full">
              <motion.div 
                initial={{ height: 0 }} 
                animate={{ height: `${(point.focus / maxPoints) * 100}%` }} 
                className="w-1/2 max-w-[12px] bg-accent-blue rounded-t-sm opacity-80 group-hover:opacity-100" 
              />
              <motion.div 
                initial={{ height: 0 }} 
                animate={{ height: `${(point.fatigue / maxPoints) * 100}%` }} 
                className="w-1/2 max-w-[12px] bg-orange-400 rounded-t-sm opacity-80 group-hover:opacity-100" 
              />
            </div>
            
            {/* X Axis Label */}
            {(range === 7 || i % Math.ceil(data.length / 7) === 0) && (
              <span className="text-[10px] text-text-muted mt-2 rotate-45 sm:rotate-0 origin-left">{point.day}</span>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-6 mt-6">
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <div className="w-3 h-3 bg-accent-blue rounded-sm"></div> Focus
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <div className="w-3 h-3 bg-orange-400 rounded-sm"></div> Fatigue
        </div>
      </div>
    </motion.div>
  );
}
