import { useMemo } from 'react';
import { useStudySync } from '@/components/providers/StudySyncProvider';
import {
  calculateLearningProfile,
  detectPatterns,
  calculateHabitScore,
  detectBurnout,
  generateWeeklyReflection,
  extractAIMemory,
  compareSessions
} from './index';

export function useAdaptiveIntelligence() {
  const { sessions, isLoadingSessions } = useStudySync();

  const adaptiveData = useMemo(() => {
    if (!sessions || sessions.length === 0) {
      return {
        hasData: false,
        profile: null,
        patterns: [],
        habitScore: null,
        burnoutStatus: null,
        weeklyReflection: null,
        aiMemory: null,
        sessionComparison: null
      };
    }

    return {
      hasData: true,
      profile: calculateLearningProfile(sessions),
      patterns: detectPatterns(sessions),
      habitScore: calculateHabitScore(sessions),
      burnoutStatus: detectBurnout(sessions),
      weeklyReflection: generateWeeklyReflection(sessions),
      aiMemory: extractAIMemory(sessions),
      sessionComparison: compareSessions(sessions)
    };
  }, [sessions]);

  return {
    ...adaptiveData,
    isLoading: isLoadingSessions
  };
}
