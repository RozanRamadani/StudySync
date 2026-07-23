import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, BarChart2 } from 'lucide-react';
import { useStudySync } from '@/components/providers/StudySyncProvider';
import { format, subDays, isAfter, addDays } from 'date-fns';
import { forecastTomorrow } from '@/lib/predictive-engine';

export function TrendForecast() {
  const { sessions } = useStudySync();

  const data = useMemo(() => {
    if (!sessions || sessions.length < 3) return [];

    const cutoff = subDays(new Date(), 7); // Last 7 days
    const recentSessions = sessions
      .filter(s => isAfter(new Date(s.timestamp), cutoff))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Group by day for simple representation
    const grouped: Record<string, { focus: number, count: number, isForecast: boolean }> = {};
    recentSessions.forEach(s => {
      const day = format(new Date(s.timestamp), 'MMM dd');
      if (!grouped[day]) grouped[day] = { focus: 0, count: 0, isForecast: false };
      grouped[day].focus += s.focus;
      grouped[day].count += 1;
    });

    const chartData = Object.entries(grouped).map(([day, stats]) => ({
      day,
      focus: Math.round(stats.focus / stats.count),
      isForecast: false
    }));

    // Add forecast for tomorrow
    const forecast = forecastTomorrow(sessions);
    if (forecast) {
      chartData.push({
        day: format(addDays(new Date(), 1), 'MMM dd') + ' (Est)',
        focus: forecast.predictedFocus,
        isForecast: true
      });
    }

    return chartData;
  }, [sessions]);

  if (data.length < 3) return null;

  const maxPoints = 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-secondary border border-border-color rounded-2xl p-6 shadow-sm col-span-1 md:col-span-2 relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-purple-500/10 p-2 rounded-lg">
            <LineChart className="text-purple-500" size={24} />
          </div>
          <h3 className="text-xl font-bold">Trend Forecast</h3>
        </div>
      </div>

      <div className="flex items-end gap-2 h-48 mt-4 pt-4 relative">
        {/* Forecast Zone Background */}
        <div className="absolute right-0 top-0 bottom-0 w-[16%] bg-purple-500/5 border-l border-dashed border-purple-500/30 z-0">
           <span className="absolute top-2 left-2 text-[10px] font-bold text-purple-500 uppercase tracking-wider">Forecast Zone</span>
        </div>

        {data.map((point, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end items-center gap-1 group relative h-full z-10">
            <div className="absolute -top-12 opacity-0 group-hover:opacity-100 bg-bg-secondary border border-border-color shadow-lg p-2 rounded-lg text-xs z-20 transition-opacity flex flex-col gap-1 whitespace-nowrap">
              <span className="font-bold">{point.day}</span>
              <span className={point.isForecast ? 'text-purple-500' : 'text-accent-blue'}>Focus: {point.focus}%</span>
            </div>
            
            <div className="w-full flex items-end justify-center gap-1 h-full">
              <motion.div 
                initial={{ height: 0 }} 
                animate={{ height: `${(point.focus / maxPoints) * 100}%` }} 
                className={`w-1/2 max-w-[16px] rounded-t-sm opacity-80 group-hover:opacity-100 ${point.isForecast ? 'bg-purple-500' : 'bg-accent-blue'}`} 
              />
            </div>
            
            <span className={`text-[10px] mt-2 rotate-45 sm:rotate-0 origin-left ${point.isForecast ? 'text-purple-500 font-bold' : 'text-text-muted'}`}>{point.day}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-6 mt-6">
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <div className="w-3 h-3 bg-accent-blue rounded-sm"></div> Historical Focus
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <div className="w-3 h-3 bg-purple-500 rounded-sm"></div> Estimated Focus
        </div>
      </div>
    </motion.div>
  );
}
