"use client";

import { motion } from "framer-motion";
import { useAdaptiveIntelligence } from "@/lib/adaptive-engine/hooks";
import { LearningProfileCard } from "@/components/dashboard/LearningProfileCard";
import { PatternRecognitionCard } from "@/components/dashboard/PatternRecognitionCard";
import { HabitScoreCard } from "@/components/dashboard/HabitScoreCard";
import { BurnoutWarning } from "@/components/dashboard/BurnoutWarning";
import { ImprovementTimeline } from "@/components/dashboard/ImprovementTimeline";
import { SessionComparison } from "@/components/dashboard/SessionComparison";
import { WeeklyReflection } from "@/components/dashboard/WeeklyReflection";
import { PrivacySettings } from "@/components/dashboard/PrivacySettings";
import { AdaptiveCoachCard } from "@/components/dashboard/AdaptiveCoachCard";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

export default function DashboardPage() {
  const { 
    hasData, 
    profile, 
    patterns, 
    habitScore, 
    burnoutStatus, 
    weeklyReflection, 
    sessionComparison, 
    isLoading 
  } = useAdaptiveIntelligence();

  if (isLoading) {
    return <div className="p-8 text-center text-text-muted animate-pulse">Loading Adaptive Intelligence...</div>;
  }

  return (
    <div className="page-wrapper pb-20">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
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
              Welcome back to your personalized StudySync dashboard.
            </motion.p>
          </div>

          <Link href="/calculator">
            <motion.button 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-accent-blue text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-accent-blue/20"
            >
              <BookOpen size={18} /> New Session <ArrowRight size={18} />
            </motion.button>
          </Link>
        </div>

        {!hasData ? (
          <div className="bg-bg-secondary border border-border-color rounded-2xl p-12 text-center flex flex-col items-center">
            <h3 className="text-2xl font-bold mb-3">No study history yet</h3>
            <p className="text-text-muted max-w-md mb-6">Start a new study session to unlock Adaptive Learning Intelligence. StudySync will learn your habits over time.</p>
            <Link href="/calculator" className="text-accent-blue font-bold flex items-center gap-2 hover:underline">
              Go to Calculator <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            {/* Top Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <LearningProfileCard profile={profile} />
              </div>
              <div className="lg:col-span-1">
                <AdaptiveCoachCard />
              </div>
            </div>

            {/* Warning Row */}
            {burnoutStatus && burnoutStatus.riskLevel !== 'Low' && (
              <BurnoutWarning status={burnoutStatus} />
            )}

            {/* Insights Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PatternRecognitionCard patterns={patterns} />
              <HabitScoreCard score={habitScore} />
            </div>

            {/* Timeline */}
            <ImprovementTimeline />

            {/* Comparison & Reflection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SessionComparison data={sessionComparison} />
              <WeeklyReflection data={weeklyReflection} />
            </div>

            {/* Settings */}
            <div className="mt-8">
              <PrivacySettings />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
