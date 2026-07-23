import { motion } from 'framer-motion';
import { Sparkles, Info } from 'lucide-react';
import { useAdaptiveIntelligence } from '@/lib/adaptive-engine/hooks';
import { usePredictiveIntelligence } from '@/lib/predictive-engine/hooks';

export function AdaptiveCoachCard() {
  const { profile, hasData, sessions } = useAdaptiveIntelligence() as any;
  const { tomorrowForecast } = usePredictiveIntelligence() as any;

  if (!hasData || !profile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-secondary border border-border-color rounded-2xl p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-accent-blue/10 p-2 rounded-lg">
            <Sparkles className="text-accent-blue" size={24} />
          </div>
          <h3 className="text-xl font-bold">Adaptive AI Coach</h3>
        </div>
        <p className="text-sm text-text-muted">Start completing study sessions to receive personalized adaptive coaching.</p>
      </motion.div>
    );
  }

  // Generate adaptive & predictive advice based on history
  let advice = "You are maintaining a steady pace. Keep it up!";
  if (tomorrowForecast && tomorrowForecast.predictedFocus > profile.averageFocus + 5) {
    advice = "If your current pattern continues, your focus tomorrow will be higher than your average. You may be ready for longer deep work sessions.";
  } else if (tomorrowForecast && tomorrowForecast.predictedFatigue > 70) {
    advice = "Your historical trend suggests very high fatigue for your next session. Consider alternating difficult and moderate material to avoid burnout.";
  } else if (profile.currentStreak > 3) {
    advice = "You've been very consistent recently. If this continues, your consistency score will improve significantly next week.";
  } else if (profile.averageFatigue > 60) {
    advice = "Your average fatigue is high. Today's priority should be recovery after studying.";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-secondary border border-accent-blue/30 rounded-2xl p-6 shadow-sm relative overflow-hidden"
    >
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5 text-accent-blue pointer-events-none -mr-4 -mt-4">
        <Sparkles size={128} />
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="bg-accent-blue/10 p-2 rounded-lg">
          <Sparkles className="text-accent-blue" size={24} />
        </div>
        <h3 className="text-xl font-bold">Predictive AI Coach</h3>
      </div>

      <p className="text-lg font-serif font-medium text-text-primary mb-6 leading-relaxed">
        "{advice}"
      </p>

      {/* Explainable Personalization */}
      <div className="bg-bg-primary border border-border-color rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Info size={16} className="text-accent-blue" />
          <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Why am I seeing this?</span>
        </div>
        <ul className="text-xs text-text-muted space-y-1 ml-6 list-disc">
          <li>This recommendation is based on {sessions?.length || 0} previous study sessions.</li>
          <li>Your average focus is {profile.averageFocus}%.</li>
          <li>Your predicted future fatigue trend is {tomorrowForecast ? tomorrowForecast.predictedFatigue : profile.averageFatigue}%.</li>
        </ul>
      </div>
    </motion.div>
  );
}
