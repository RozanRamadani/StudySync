import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { PatternInsight } from '@/lib/adaptive-engine';

export function PatternRecognitionCard({ patterns }: { patterns: PatternInsight[] }) {
  if (patterns.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-secondary border border-border-color rounded-2xl p-6 shadow-sm flex flex-col items-center text-center text-text-muted"
      >
        <Info size={32} className="mb-3 opacity-50" />
        <p>More study sessions are needed before learning patterns can be identified.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-secondary border border-border-color rounded-2xl p-6 shadow-sm h-full"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-accent-blue/10 p-2 rounded-lg">
          <Lightbulb className="text-accent-blue" size={24} />
        </div>
        <h3 className="text-xl font-bold">Pattern Recognition</h3>
      </div>

      <div className="flex flex-col gap-4">
        {patterns.map((pattern, i) => (
          <motion.div 
            key={pattern.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-4 rounded-xl border ${
              pattern.type === 'positive' 
                ? 'bg-green-500/5 border-green-500/20' 
                : pattern.type === 'negative'
                ? 'bg-red-500/5 border-red-500/20'
                : 'bg-bg-primary border-border-color'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {pattern.type === 'positive' ? (
                  <TrendingUp className="text-green-500" size={18} />
                ) : pattern.type === 'negative' ? (
                  <TrendingDown className="text-red-500" size={18} />
                ) : (
                  <Info className="text-accent-blue" size={18} />
                )}
              </div>
              <div>
                <h4 className="font-semibold text-text-primary mb-1">{pattern.title}</h4>
                <p className="text-sm text-text-secondary mb-2">{pattern.description}</p>
                <div className="inline-block px-2 py-1 bg-bg-primary border border-border-color rounded text-xs text-text-muted">
                  Evidence: {pattern.evidence}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
