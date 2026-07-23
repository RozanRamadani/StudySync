import { StudySession } from "@/components/providers/StudySyncProvider";
import { format, subDays, startOfWeek, endOfWeek, isSameDay, differenceInDays } from "date-fns";

export interface LearningProfile {
  preferredDuration: number;
  averageFocus: number;
  averageFatigue: number;
  averageComplexity: number;
  mostProductiveDay: string;
  preferredTimeOfDay: string;
  currentStreak: number;
  consistencyScore: number;
  weeklyCompletionRate: number;
}

export interface PatternInsight {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
  evidence: string;
}

export interface HabitScore {
  consistency: number;
  discipline: number;
  recoveryBalance: number;
  studyFrequency: number;
  overallScore: number;
  explanations: Record<string, string>;
}

export interface BurnoutStatus {
  riskLevel: 'Low' | 'Medium' | 'High';
  indicators: string[];
  recommendations: string[];
}

export interface WeeklyReflection {
  totalStudyTime: number;
  averageFocus: number;
  averageFatigue: number;
  mostProductiveDay: string;
  consistency: number;
  longestSession: number;
  shortestSession: number;
  positiveReflection: string;
  areasToImprove: string;
  suggestionsForNextWeek: string;
}

export interface SessionComparison {
  today: Partial<StudySession>;
  yesterday: Partial<StudySession>;
  average: Partial<StudySession>;
  focusTrend: 'up' | 'down' | 'stable';
  fatigueTrend: 'up' | 'down' | 'stable';
}

export interface AIMemory {
  preferredStudyTime: string;
  preferredSessionLength: string;
  mostEffectiveStrategy: string;
  typicalFatiguePattern: string;
  preferredDifficulty: string;
}

// Helpers
const getDayName = (date: Date) => format(date, 'EEEE');
const getTimeOfDay = (date: Date) => {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 17) return 'Afternoon';
  if (hour >= 17 && hour < 21) return 'Evening';
  return 'Night';
};

export function calculateLearningProfile(sessions: StudySession[]): LearningProfile | null {
  if (sessions.length === 0) return null;

  const validSessions = sessions.filter(s => s.duration > 0);
  if (validSessions.length === 0) return null;

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

  const daysCount: Record<string, number> = {};
  const timesCount: Record<string, number> = {};
  
  validSessions.forEach(s => {
    const day = getDayName(s.timestamp);
    const time = getTimeOfDay(s.timestamp);
    daysCount[day] = (daysCount[day] || 0) + 1;
    timesCount[time] = (timesCount[time] || 0) + 1;
  });

  const mostProductiveDay = Object.entries(daysCount).sort((a, b) => b[1] - a[1])[0][0];
  const preferredTimeOfDay = Object.entries(timesCount).sort((a, b) => b[1] - a[1])[0][0];

  // Calculate Streak
  let currentStreak = 0;
  let currentDate = new Date();
  
  // Sort descending by date
  const sortedDates = [...new Set(validSessions.map(s => format(s.timestamp, 'yyyy-MM-dd')))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  for (const dateStr of sortedDates) {
    const date = new Date(dateStr);
    const diff = differenceInDays(currentDate, date);
    if (diff === 0 || diff === 1) {
      currentStreak++;
      currentDate = date;
    } else {
      break;
    }
  }

  // If didn't study today or yesterday, streak is broken
  const daysSinceLastSession = differenceInDays(new Date(), new Date(sortedDates[0] || new Date()));
  if (daysSinceLastSession > 1) {
    currentStreak = 0;
  }

  return {
    preferredDuration: Math.round(avg(validSessions.map(s => s.duration))),
    averageFocus: Math.round(avg(validSessions.map(s => s.focus))),
    averageFatigue: Math.round(avg(validSessions.map(s => s.fatigue))),
    averageComplexity: Math.round(avg(validSessions.map(s => s.complexity))),
    mostProductiveDay,
    preferredTimeOfDay,
    currentStreak,
    consistencyScore: Math.min(100, Math.round((currentStreak / 7) * 100)),
    weeklyCompletionRate: Math.round((validSessions.slice(0, 7).filter(s => s.focus > 50).length / 7) * 100) || 0
  };
}

export function detectPatterns(sessions: StudySession[]): PatternInsight[] {
  if (sessions.length < 5) return [];
  
  const insights: PatternInsight[] = [];
  
  // Morning focus pattern
  const morningSessions = sessions.filter(s => getTimeOfDay(s.timestamp) === 'Morning');
  const otherSessions = sessions.filter(s => getTimeOfDay(s.timestamp) !== 'Morning');
  
  if (morningSessions.length >= 3 && otherSessions.length >= 3) {
    const morningFocus = morningSessions.reduce((sum, s) => sum + s.focus, 0) / morningSessions.length;
    const otherFocus = otherSessions.reduce((sum, s) => sum + s.focus, 0) / otherSessions.length;
    
    if (morningFocus > otherFocus + 15) {
      insights.push({
        id: 'morning-focus',
        title: 'Morning Productivity',
        description: 'Your focus is generally higher during morning sessions.',
        type: 'positive',
        evidence: `Based on your history, morning focus averages ${Math.round(morningFocus)}% compared to ${Math.round(otherFocus)}% at other times.`
      });
    }
  }
  
  // Fatigue from long sessions
  const longSessions = sessions.filter(s => s.duration > 60);
  if (longSessions.length >= 3) {
    const avgFatigue = longSessions.reduce((sum, s) => sum + s.fatigue, 0) / longSessions.length;
    if (avgFatigue > 70) {
      insights.push({
        id: 'long-session-fatigue',
        title: 'Session Length Limit',
        description: 'Long sessions tend to significantly increase your fatigue.',
        type: 'negative',
        evidence: `Sessions over 60 minutes result in an average fatigue of ${Math.round(avgFatigue)}%.`
      });
    }
  }
  
  return insights;
}

export function calculateHabitScore(sessions: StudySession[]): HabitScore {
  if (sessions.length < 3) {
    return {
      consistency: 0, discipline: 0, recoveryBalance: 0, studyFrequency: 0, overallScore: 0,
      explanations: { 'Info': 'Need more sessions to calculate habits.' }
    };
  }

  const sortedDates = [...new Set(sessions.map(s => format(s.timestamp, 'yyyy-MM-dd')))].sort();
  const consistency = Math.min(100, (sortedDates.length / 7) * 100);
  
  // Discipline: Studying even when complexity is high or fatigue is moderate
  const challengingSessions = sessions.filter(s => s.complexity > 60 || s.fatigue > 40);
  const discipline = Math.min(100, (challengingSessions.length / sessions.length) * 100 + 40);
  
  // Recovery: Avoiding studying when fatigue is extremely high
  const extremeFatigueSessions = sessions.filter(s => s.fatigue > 85);
  const recoveryBalance = Math.max(0, 100 - (extremeFatigueSessions.length * 15));

  const studyFrequency = Math.min(100, sessions.length * 5); // Rough metric

  const overallScore = Math.round((consistency * 0.4) + (discipline * 0.3) + (recoveryBalance * 0.3));

  return {
    consistency: Math.round(consistency),
    discipline: Math.round(discipline),
    recoveryBalance: Math.round(recoveryBalance),
    studyFrequency: Math.round(studyFrequency),
    overallScore,
    explanations: {
      'Consistency': 'Based on your recent daily study streaks.',
      'Discipline': 'Derived from sessions completed with high complexity.',
      'Recovery Balance': 'Calculated by your ability to avoid burnout and rest.'
    }
  };
}

export function detectBurnout(sessions: StudySession[]): BurnoutStatus {
  if (sessions.length < 5) return { riskLevel: 'Low', indicators: [], recommendations: [] };

  const recent = sessions.slice(0, 5);
  const avgFatigue = recent.reduce((sum, s) => sum + s.fatigue, 0) / recent.length;
  const decliningFocus = recent[0].focus < recent[recent.length - 1].focus - 15;
  const longDurations = recent.filter(s => s.duration > 90).length >= 3;

  const indicators = [];
  const recommendations = [];

  if (avgFatigue > 75) indicators.push('Fatigue remains high for consecutive sessions.');
  if (decliningFocus) indicators.push('Focus is decreasing despite study efforts.');
  if (longDurations) indicators.push('Study durations are extremely long without sufficient breaks.');

  let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
  
  if (indicators.length === 1) riskLevel = 'Medium';
  if (indicators.length >= 2) riskLevel = 'High';

  if (riskLevel === 'High') {
    recommendations.push('Consider reducing study intensity immediately.');
    recommendations.push('Schedule more frequent, longer breaks.');
    recommendations.push('Take a full recovery day tomorrow.');
  } else if (riskLevel === 'Medium') {
    recommendations.push('Monitor your energy levels closely.');
    recommendations.push('Try using the Pomodoro technique to ensure rest.');
  } else {
    recommendations.push('You are maintaining a healthy balance. Keep it up!');
  }

  return { riskLevel, indicators, recommendations };
}

export function generateWeeklyReflection(sessions: StudySession[]): WeeklyReflection | null {
  if (sessions.length === 0) return null;

  const oneWeekAgo = subDays(new Date(), 7);
  const weeklySessions = sessions.filter(s => new Date(s.timestamp) >= oneWeekAgo);
  
  if (weeklySessions.length === 0) return null;

  const totalTime = weeklySessions.reduce((sum, s) => sum + s.duration, 0);
  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  
  const daysCount: Record<string, number> = {};
  weeklySessions.forEach(s => {
    const day = getDayName(s.timestamp);
    daysCount[day] = (daysCount[day] || 0) + 1;
  });
  
  const mostProductiveDay = Object.keys(daysCount).length > 0 
    ? Object.entries(daysCount).sort((a, b) => b[1] - a[1])[0][0]
    : 'N/A';

  const durations = weeklySessions.map(s => s.duration);
  
  return {
    totalStudyTime: totalTime,
    averageFocus: Math.round(avg(weeklySessions.map(s => s.focus))),
    averageFatigue: Math.round(avg(weeklySessions.map(s => s.fatigue))),
    mostProductiveDay,
    consistency: Math.round((Object.keys(daysCount).length / 7) * 100),
    longestSession: Math.max(...durations, 0),
    shortestSession: Math.min(...durations, 0),
    positiveReflection: 'You showed great dedication this week by consistently showing up.',
    areasToImprove: 'Try to maintain a slightly higher focus level during longer sessions.',
    suggestionsForNextWeek: 'Aim to balance your long sessions with shorter, high-focus bursts.'
  };
}

export function extractAIMemory(sessions: StudySession[]): AIMemory {
  const profile = calculateLearningProfile(sessions);
  
  return {
    preferredStudyTime: profile?.preferredTimeOfDay || 'Unknown',
    preferredSessionLength: profile?.preferredDuration ? `${profile.preferredDuration} mins` : 'Unknown',
    mostEffectiveStrategy: 'Interval studying', // Mocked based on rules
    typicalFatiguePattern: profile && profile.averageFatigue > 60 ? 'High' : 'Moderate',
    preferredDifficulty: profile && profile.averageComplexity > 70 ? 'Advanced' : 'Standard'
  };
}

export function compareSessions(sessions: StudySession[]): SessionComparison | null {
  if (sessions.length < 2) return null;

  const sorted = [...sessions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const today = sorted[0];
  const yesterday = sorted.find(s => !isSameDay(s.timestamp, today.timestamp)) || sorted[1];
  
  const avgFocus = sessions.reduce((sum, s) => sum + s.focus, 0) / sessions.length;
  const avgFatigue = sessions.reduce((sum, s) => sum + s.fatigue, 0) / sessions.length;

  return {
    today,
    yesterday,
    average: { focus: avgFocus, fatigue: avgFatigue },
    focusTrend: today.focus > yesterday.focus ? 'up' : today.focus < yesterday.focus ? 'down' : 'stable',
    fatigueTrend: today.fatigue > yesterday.fatigue ? 'up' : today.fatigue < yesterday.fatigue ? 'down' : 'stable',
  };
}
