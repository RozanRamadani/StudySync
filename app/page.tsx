"use client";

import { motion } from "framer-motion";
import { useAdaptiveIntelligence } from "@/lib/adaptive-engine/hooks";
import { BurnoutWarning } from "@/components/dashboard/BurnoutWarning";
import { WeeklyReflection } from "@/components/dashboard/WeeklyReflection";
import { AdaptiveCoachCard } from "@/components/dashboard/AdaptiveCoachCard";
import Link from "next/link";
import { ArrowRight, BookOpen, Brain, Clock, Zap, Target } from "lucide-react";
import { useStudySync } from "@/components/providers/StudySyncProvider";

export default function DashboardPage() {
  const { 
    hasData, 
    burnoutStatus, 
    weeklyReflection, 
    isLoading 
  } = useAdaptiveIntelligence();

  const { sessions, fuzzyResult } = useStudySync();

  if (isLoading) {
    return <div className="p-8 text-center text-text-muted animate-pulse">Loading Dashboard...</div>;
  }

  // Calculate Quick Stats
  const thisWeekSessions = sessions.filter(s => s.timestamp.getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000);
  const totalHours = Math.round(thisWeekSessions.reduce((acc, curr) => acc + curr.duration, 0) / 60);
  const avgFocus = thisWeekSessions.length ? Math.round(thisWeekSessions.reduce((acc, curr) => acc + curr.focus, 0) / thisWeekSessions.length) : 0;
  
  const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;

  return (
    <div className="page-wrapper pb-20">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-bold font-serif mb-2"
            >
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, 
              <span className="text-accent-blue"> Learner</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.1 }}
              className="text-text-secondary"
            >
              Here is your study overview for today.
            </motion.p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/calculator" className="bg-accent-blue text-white p-5 rounded-2xl flex flex-col justify-center items-start gap-2 shadow-lg shadow-accent-blue/20 hover:scale-[1.02] transition-transform">
            <BookOpen size={24} />
            <div>
              <div className="font-bold text-lg">Start New Session</div>
              <div className="text-white/80 text-xs">Get a recommendation from the Fuzzy Engine</div>
            </div>
          </Link>
          <Link href="/intelligence" className="bg-bg-secondary border border-border-color p-5 rounded-2xl flex flex-col justify-center items-start gap-2 hover:border-accent-blue transition-colors">
            <Brain className="text-accent-blue" size={24} />
            <div>
              <div className="font-bold text-lg text-text-primary">Learning Intelligence</div>
              <div className="text-text-muted text-xs">View deep analytics and future predictions</div>
            </div>
          </Link>
          <Link href="/history" className="bg-bg-secondary border border-border-color p-5 rounded-2xl flex flex-col justify-center items-start gap-2 hover:border-accent-blue transition-colors">
            <Clock className="text-purple-500" size={24} />
            <div>
              <div className="font-bold text-lg text-text-primary">Study History</div>
              <div className="text-text-muted text-xs">Review your past completed sessions</div>
            </div>
          </Link>
        </div>

        {!hasData ? (
          <div className="bg-bg-secondary border border-border-color rounded-2xl p-12 text-center flex flex-col items-center mt-4">
            <h3 className="text-2xl font-bold mb-3">No study history yet</h3>
            <p className="text-text-muted max-w-md mb-6">Start a new study session to unlock Insights. StudySync will learn your habits over time.</p>
            <Link href="/calculator" className="text-accent-blue font-bold flex items-center gap-2 hover:underline">
              Go to Calculator <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
            {/* Left Column */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                 <div className="bg-bg-secondary border border-border-color p-4 rounded-xl text-center">
                    <div className="text-xs text-text-muted mb-1">Sessions (7d)</div>
                    <div className="text-2xl font-bold font-serif">{thisWeekSessions.length}</div>
                 </div>
                 <div className="bg-bg-secondary border border-border-color p-4 rounded-xl text-center">
                    <div className="text-xs text-text-muted mb-1">Hours (7d)</div>
                    <div className="text-2xl font-bold font-serif">{totalHours}</div>
                 </div>
                 <div className="bg-bg-secondary border border-border-color p-4 rounded-xl text-center">
                    <div className="text-xs text-text-muted mb-1">Avg Focus</div>
                    <div className="text-2xl font-bold font-serif text-accent-blue">{avgFocus}%</div>
                 </div>
              </div>

              {burnoutStatus && burnoutStatus.riskLevel !== 'Low' && (
                <BurnoutWarning status={burnoutStatus} />
              )}

              <WeeklyReflection data={weeklyReflection} />
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1 flex flex-col gap-8">
              <AdaptiveCoachCard />

              {/* Last Recommendation */}
              <div className="bg-bg-secondary border border-border-color rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] text-accent-blue pointer-events-none">
                  <Brain size={128} />
                </div>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Target size={20} className="text-accent-blue" />
                  Last Recommendation
                </h3>
                {fuzzyResult ? (
                  <div className="flex flex-col gap-2">
                    <div className="text-3xl font-bold font-serif">{fuzzyResult.duration}<span className="text-sm font-sans font-normal text-text-muted ml-1">min</span></div>
                    <div className="text-xs text-text-muted">Generated by Fuzzy Engine</div>
                  </div>
                ) : (
                  <div className="text-sm text-text-muted">No recent recommendations.</div>
                )}
              </div>

              {/* Last Study Session */}
              {lastSession && (
                <div className="bg-bg-secondary border border-border-color rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-purple-500" />
                    Last Study Session
                  </h3>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-text-muted">Duration</span>
                    <span className="font-bold text-lg">{lastSession.duration}m</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-text-muted">Focus Intensity</span>
                    <span className="font-bold">{lastSession.focus}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-muted">Time</span>
                    <span className="text-xs text-text-secondary">{lastSession.timestamp.toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
