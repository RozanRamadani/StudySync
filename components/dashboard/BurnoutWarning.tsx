import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { BurnoutStatus } from '@/lib/adaptive-engine';

export function BurnoutWarning({ status }: { status: BurnoutStatus | null }) {
  if (!status) return null;

  const isHigh = status.riskLevel === 'High';
  const isMedium = status.riskLevel === 'Medium';
  const isLow = status.riskLevel === 'Low';

  const bgColor = isHigh ? 'bg-red-500/10' : isMedium ? 'bg-orange-500/10' : 'bg-green-500/10';
  const borderColor = isHigh ? 'border-red-500/20' : isMedium ? 'border-orange-500/20' : 'border-green-500/20';
  const iconColor = isHigh ? 'text-red-500' : isMedium ? 'text-orange-500' : 'text-green-500';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${bgColor} ${borderColor} border rounded-2xl p-6 shadow-sm relative overflow-hidden`}
    >
      <div className="flex items-start gap-4">
        <div className="mt-1">
          {isHigh ? <AlertTriangle className={iconColor} size={28} /> : 
           isMedium ? <AlertCircle className={iconColor} size={28} /> : 
           <CheckCircle className={iconColor} size={28} />}
        </div>
        <div>
          <h3 className={`text-lg font-bold mb-1 ${iconColor}`}>
            Burnout Risk: {status.riskLevel}
          </h3>
          
          {status.indicators.length > 0 && (
            <ul className="list-disc list-inside text-sm text-text-primary mb-3 space-y-1">
              {status.indicators.map((ind, i) => (
                <li key={i}>{ind}</li>
              ))}
            </ul>
          )}

          <div className="bg-bg-primary/50 rounded-lg p-3 border border-border-color mt-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Recommendations</h4>
            <ul className="space-y-1">
              {status.recommendations.map((rec, i) => (
                <li key={i} className="text-sm text-text-secondary flex gap-2">
                  <span className={iconColor}>→</span> {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
