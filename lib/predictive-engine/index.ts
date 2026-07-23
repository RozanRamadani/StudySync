import { StudySession } from "@/components/providers/StudySyncProvider";
import { format, differenceInDays, isSameDay, subDays } from "date-fns";
import { calculateFuzzy } from "@/lib/fuzzy-engine";

export type Reliability = 'Low' | 'Medium' | 'High';

export interface TomorrowForecast {
  predictedFocus: number;
  predictedFatigue: number;
  predictedComplexity: number;
  estimatedDuration: number;
  reliability: Reliability;
  evidence: string;
}

export interface WeeklyForecast {
  optimistic: number;
  expected: number;
  conservative: number;
  expectedGoals: number;
  evidence: string;
}

export interface PredictionAccuracy {
  date: string;
  predictedFocus: number;
  actualFocus: number;
  predictedFatigue: number;
  actualFatigue: number;
  errorMargin: number;
}

// Simple moving average
const calculateSMA = (data: number[], period: number) => {
  if (data.length < period) return data.reduce((a, b) => a + b, 0) / data.length;
  const recent = data.slice(-period);
  return recent.reduce((a, b) => a + b, 0) / period;
};

// Calculate Standard Deviation to determine Reliability
const calculateStdDev = (data: number[]) => {
  if (data.length <= 1) return 0;
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (data.length - 1);
  return Math.sqrt(variance);
};

const getReliability = (stdDev: number, sampleSize: number): Reliability => {
  if (sampleSize < 3) return 'Low';
  if (stdDev > 20) return 'Low';
  if (stdDev > 10) return 'Medium';
  return 'High';
};

export function forecastTomorrow(sessions: StudySession[]): TomorrowForecast | null {
  if (sessions.length === 0) return null;

  const validSessions = [...sessions].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  const focusData = validSessions.map(s => s.focus);
  const fatigueData = validSessions.map(s => s.fatigue);
  const complexityData = validSessions.map(s => s.complexity);

  // We use SMA of last 3 sessions + a slight trend adjustment
  const last3Focus = focusData.slice(-3);
  let trend = 0;
  if (last3Focus.length >= 2) {
    trend = last3Focus[last3Focus.length - 1] - last3Focus[0];
  }

  const predictedFocus = Math.min(100, Math.max(0, Math.round(calculateSMA(focusData, 3) + (trend * 0.2))));
  
  // Fatigue tends to carry over slightly but rests recover it. We just use SMA.
  const predictedFatigue = Math.min(100, Math.max(0, Math.round(calculateSMA(fatigueData, 3))));
  
  // Complexity is usually chosen by user, we estimate average
  const predictedComplexity = Math.round(calculateSMA(complexityData, 5));

  // Run through fuzzy engine
  const result = calculateFuzzy({ focus: predictedFocus, fatigue: predictedFatigue, complexity: predictedComplexity });

  const stdDevFocus = calculateStdDev(focusData);
  const stdDevFatigue = calculateStdDev(fatigueData);
  const avgStdDev = (stdDevFocus + stdDevFatigue) / 2;
  const reliability = getReliability(avgStdDev, validSessions.length);

  return {
    predictedFocus,
    predictedFatigue,
    predictedComplexity,
    estimatedDuration: result.duration,
    reliability,
    evidence: `Based on a moving average of your last ${Math.min(3, validSessions.length)} sessions. ${reliability} reliability due to historical variance.`
  };
}

export function forecastWeek(sessions: StudySession[]): WeeklyForecast | null {
  if (sessions.length < 3) return null;

  const daysWithSessions = new Set(sessions.map(s => format(new Date(s.timestamp), 'yyyy-MM-dd'))).size;
  const firstSession = new Date(sessions[sessions.length - 1].timestamp); // Assumes sorted desc, wait, it's not guaranteed. Let's sort.
  
  const sorted = [...sessions].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const historyDays = Math.max(1, differenceInDays(new Date(), new Date(sorted[0].timestamp)));
  
  const sessionFrequencyPerDay = daysWithSessions / historyDays; // e.g. 0.7 sessions/day
  const avgDurationMinutes = sorted.reduce((sum, s) => sum + s.duration, 0) / sorted.length;

  const expectedSessionsPerWeek = sessionFrequencyPerDay * 7;
  const expectedHours = (expectedSessionsPerWeek * avgDurationMinutes) / 60;

  return {
    expected: Math.round(expectedHours * 10) / 10,
    optimistic: Math.round((expectedHours * 1.2) * 10) / 10,
    conservative: Math.round((expectedHours * 0.8) * 10) / 10,
    expectedGoals: Math.round(expectedSessionsPerWeek),
    evidence: `Extrapolated from your historical rate of ${Math.round(sessionFrequencyPerDay * 7)} sessions per week.`
  };
}

export function calculatePredictionAccuracy(sessions: StudySession[]): PredictionAccuracy | null {
  // Retrospective analysis: What would we have predicted for yesterday?
  if (sessions.length < 3) return null;

  const sorted = [...sessions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  // Find yesterday (or the most recent session before today)
  const todaySession = sorted[sorted.length - 1];
  const priorSessions = sorted.slice(0, sorted.length - 1);
  
  if (priorSessions.length < 2) return null;

  const retroForecast = forecastTomorrow(priorSessions);
  if (!retroForecast) return null;

  const errorMargin = Math.abs(retroForecast.predictedFocus - todaySession.focus) + 
                      Math.abs(retroForecast.predictedFatigue - todaySession.fatigue);

  return {
    date: format(new Date(todaySession.timestamp), 'MMM dd, yyyy'),
    predictedFocus: retroForecast.predictedFocus,
    actualFocus: todaySession.focus,
    predictedFatigue: retroForecast.predictedFatigue,
    actualFatigue: todaySession.fatigue,
    errorMargin: Math.round(errorMargin / 2) // Average error %
  };
}
