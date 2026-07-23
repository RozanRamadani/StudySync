import { motion } from 'framer-motion';
import { CalendarClock, Info, Activity, Clock, Crosshair } from 'lucide-react';
import { TomorrowForecast as ForecastData } from '@/lib/predictive-engine';

export function TomorrowForecast({ data }: { data: ForecastData | null }) {
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-secondary border border-border-color rounded-2xl p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-purple-500/10 p-2 rounded-lg">
            <CalendarClock className="text-purple-500" size={24} />
          </div>
          <h3 className="text-xl font-bold">Tomorrow's Forecast</h3>
        </div>
        <div className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
          data.reliability === 'High' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
          data.reliability === 'Medium' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
          'bg-red-500/10 text-red-500 border-red-500/20'
        }`}>
          {data.reliability} Reliability
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <ForecastStat label="Est. Focus" value={`${data.predictedFocus}%`} icon={<Crosshair size={14}/>} />
        <ForecastStat label="Est. Fatigue" value={`${data.predictedFatigue}%`} icon={<Activity size={14}/>} />
        <ForecastStat label="Est. Complexity" value={`${data.predictedComplexity}`} icon={<Activity size={14}/>} />
        <ForecastStat label="Est. Duration" value={`${data.estimatedDuration}m`} icon={<Clock size={14}/>} highlight />
      </div>

      <div className="bg-bg-primary border border-border-color rounded-xl p-3 flex items-start gap-2">
        <Info size={16} className="text-purple-500 shrink-0 mt-0.5" />
        <p className="text-xs text-text-muted">
          {data.evidence} These forecasts are estimates based on your historical learning patterns, not a guarantee.
        </p>
      </div>
    </motion.div>
  );
}

function ForecastStat({ label, value, icon, highlight }: { label: string, value: string, icon: React.ReactNode, highlight?: boolean }) {
  return (
    <div className={`p-3 rounded-xl border ${highlight ? 'bg-purple-500/5 border-purple-500/20' : 'bg-bg-primary border-border-color'}`}>
      <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-1">
        {icon} {label}
      </div>
      <div className={`text-lg font-bold font-serif ${highlight ? 'text-purple-500' : 'text-text-primary'}`}>
        {value}
      </div>
    </div>
  );
}
