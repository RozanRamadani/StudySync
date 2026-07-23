import { motion } from 'framer-motion';
import { Award, Zap, Shield, Repeat } from 'lucide-react';
import { HabitScore } from '@/lib/adaptive-engine';

export function HabitScoreCard({ score }: { score: HabitScore | null }) {
  if (!score || score.overallScore === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-secondary border border-border-color rounded-2xl p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-accent-blue/10 p-2 rounded-lg">
            <Award className="text-accent-blue" size={24} />
          </div>
          <h3 className="text-xl font-bold">Habit Score</h3>
        </div>
        <div className="text-3xl font-serif font-bold text-accent-blue">
          {score.overallScore}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <ScoreBar label="Consistency" value={score.consistency} icon={<Repeat size={16} />} info={score.explanations['Consistency']} />
        <ScoreBar label="Discipline" value={score.discipline} icon={<Zap size={16} />} info={score.explanations['Discipline']} />
        <ScoreBar label="Recovery Balance" value={score.recoveryBalance} icon={<Shield size={16} />} info={score.explanations['Recovery Balance']} />
      </div>
    </motion.div>
  );
}

function ScoreBar({ label, value, icon, info }: { label: string, value: number, icon: React.ReactNode, info: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2 text-sm font-medium text-text-secondary group relative">
          {icon} {label}
          <div className="absolute left-0 bottom-6 w-48 bg-bg-secondary border border-border-color shadow-lg p-2 rounded text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
            {info}
          </div>
        </div>
        <span className="text-xs font-bold">{value}/100</span>
      </div>
      <div className="w-full bg-border-color h-2 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-accent-blue rounded-full"
        />
      </div>
    </div>
  );
}
