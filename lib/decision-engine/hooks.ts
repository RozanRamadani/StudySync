import { useMemo } from 'react';
import { useStudySync } from '@/components/providers/StudySyncProvider';
import { useAdaptiveIntelligence } from '@/lib/adaptive-engine/hooks';
import { usePredictiveIntelligence } from '@/lib/predictive-engine/hooks';
import { generateAlternativePlans, generateDecisionAdvice, DecisionContext } from './index';

export function useDecisionSupport() {
  const { fuzzyResult } = useStudySync();
  const { profile } = useAdaptiveIntelligence() as any;
  const { tomorrowForecast } = usePredictiveIntelligence() as any;

  const decisionData = useMemo(() => {
    const context: DecisionContext = {
      fuzzyResult,
      profile: profile || null,
      forecast: tomorrowForecast || null
    };

    const plans = generateAlternativePlans(context);
    const topPlan = plans[0];
    const assistant = generateDecisionAdvice(context, topPlan);

    return {
      plans,
      assistant,
      context
    };
  }, [fuzzyResult, profile, tomorrowForecast]);

  return decisionData;
}
