import { motion } from 'framer-motion';
import { Target, CheckCircle2 } from 'lucide-react';
import { PredictionAccuracy as AccuracyData } from '@/lib/predictive-engine';

export function PredictionAccuracyCard({ data }: { data: AccuracyData | null }) {
  if (!data) return null;

  const isHighlyAccurate = data.errorMargin <= 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-secondary border border-border-color rounded-2xl p-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-500/10 p-2 rounded-lg">
          <Target className="text-purple-500" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold">Prediction History</h3>
          <p className="text-xs text-text-muted">Retrospective analysis of {data.date}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-bg-primary border border-border-color p-4 rounded-xl text-center">
          <div className="text-xs text-text-muted mb-2">Focus Estimate vs Actual</div>
          <div className="flex justify-center items-center gap-2 font-serif">
            <span className="text-purple-500 font-bold text-lg">{data.predictedFocus}%</span>
            <span className="text-text-muted">→</span>
            <span className="text-text-primary font-bold text-lg">{data.actualFocus}%</span>
          </div>
        </div>
        <div className="bg-bg-primary border border-border-color p-4 rounded-xl text-center">
          <div className="text-xs text-text-muted mb-2">Fatigue Estimate vs Actual</div>
          <div className="flex justify-center items-center gap-2 font-serif">
            <span className="text-purple-500 font-bold text-lg">{data.predictedFatigue}%</span>
            <span className="text-text-muted">→</span>
            <span className="text-text-primary font-bold text-lg">{data.actualFatigue}%</span>
          </div>
        </div>
      </div>

      <div className={`p-3 rounded-xl border flex items-center justify-between ${isHighlyAccurate ? 'bg-green-500/10 border-green-500/20' : 'bg-orange-500/10 border-orange-500/20'}`}>
        <div className="flex items-center gap-2 text-sm font-medium">
          {isHighlyAccurate && <CheckCircle2 size={16} className="text-green-500" />}
          <span className={isHighlyAccurate ? 'text-green-500' : 'text-orange-500'}>
            Average Error Margin: {data.errorMargin}%
          </span>
        </div>
        <span className="text-xs text-text-muted">Dynamic Backtest</span>
      </div>
    </motion.div>
  );
}
