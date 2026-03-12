import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { ClassLeaderboard } from '@/components/ClassLeaderboard';
import { useAuth } from '@/hooks/useAuth';
import { useLeaderboard, LeaderboardEntry } from '@/hooks/useLeaderboard';

export default function LeaderboardPage() {
  const { user, profile } = useAuth();
  const {
    stats,
    currentUserRank,
    loading,
    fetchLeaderboard,
    fetchWeeklyLeaderboard,
    fetchStudyTimeLeaderboard,
    fetchStreakLeaderboard
  } = useLeaderboard();

  const [activeTab, setActiveTab] = useState<'score' | 'streak' | 'time' | 'weekly'>('score');
  const [displayData, setDisplayData] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (profile?.role === 'student' && profile.class_id) {
      loadLeaderboardData();
    }
  }, [profile, activeTab]);

  const loadLeaderboardData = async () => {
    if (!profile?.class_id) return;

    let data: LeaderboardEntry[] = [];

    switch (activeTab) {
      case 'score':
        data = await fetchLeaderboard(profile.class_id);
        break;
      case 'streak':
        data = await fetchStreakLeaderboard(profile.class_id);
        break;
      case 'time':
        data = await fetchStudyTimeLeaderboard(profile.class_id);
        break;
      case 'weekly':
        data = await fetchWeeklyLeaderboard(profile.class_id);
        break;
    }

    setDisplayData(data);
  };

  return (
    <Layout>
      <ClassLeaderboard
        user={user}
        profile={profile}
        stats={stats}
        currentUserRank={currentUserRank}
        loading={loading}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        displayData={displayData}
      />
    </Layout>
  );
}