import { useMemo } from 'react';
import { useStudySync } from '@/components/providers/StudySyncProvider';
import {
  forecastTomorrow,
  forecastWeek,
  calculatePredictionAccuracy
} from './index';

export function usePredictiveIntelligence() {
  const { sessions, isLoadingSessions } = useStudySync();

  const predictiveData = useMemo(() => {
    if (!sessions || sessions.length === 0) {
      return {
        hasData: false,
        tomorrowForecast: null,
        weeklyForecast: null,
        predictionAccuracy: null,
      };
    }

    return {
      hasData: true,
      tomorrowForecast: forecastTomorrow(sessions),
      weeklyForecast: forecastWeek(sessions),
      predictionAccuracy: calculatePredictionAccuracy(sessions),
    };
  }, [sessions]);

  return {
    ...predictiveData,
    isLoading: isLoadingSessions
  };
}
