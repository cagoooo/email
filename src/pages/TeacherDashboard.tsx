import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { TeacherDashboard } from '@/components/TeacherDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useLeaderboard, LeaderboardEntry } from '@/hooks/useLeaderboard';

export interface StudentDetail extends LeaderboardEntry {
  email?: string;
  parent_email?: string;
  last_login?: string;
  completion_rate?: number;
}

export interface ClassStats {
  totalStudents: number;
  activeToday: number;
  averageProgress: number;
  totalChallengesCompleted: number;
  averageStudyTime: number;
}

export default function TeacherDashboardPage() {
  const { profile } = useAuth();
  const { stats, loading, fetchLeaderboard, getClassActivitySummary } = useLeaderboard();
  const [students, setStudents] = useState<StudentDetail[]>([]);
  const [classStats, setClassStats] = useState<ClassStats | null>(null);

  useEffect(() => {
    if (profile?.role === 'teacher' && profile.class_id) {
      loadDashboardData();
    }
  }, [profile]);

  const loadDashboardData = async () => {
    if (!profile?.class_id) return;

    // 獲取排行榜數據
    const leaderboardData = await fetchLeaderboard(profile.class_id);

    // 轉換為學生詳情格式
    const studentDetails: StudentDetail[] = leaderboardData.map((entry: LeaderboardEntry) => ({
      ...entry,
      email: `${entry.student_id}@mail2.smes.tyc.edu.tw`,
      completion_rate: Math.round(
        ((entry.total_score || 0) / 1000) * 100 // 假設滿分1000
      ),
    }));

    setStudents(studentDetails);

    // 獲取班級活動摘要
    const activitySummary = await getClassActivitySummary(profile.class_id);

    if (stats && activitySummary) {
      setClassStats({
        totalStudents: stats.totalStudents,
        activeToday: activitySummary.todayActiveStudents,
        averageProgress: Math.round((stats.averageScore / 1000) * 100),
        totalChallengesCompleted: activitySummary.weekChallengesCompleted,
        averageStudyTime: Math.round(stats.totalStudyTime / stats.totalStudents),
      });
    }
  };

  return (
    <Layout>
      <TeacherDashboard
        profile={profile}
        loading={loading}
        students={students}
        classStats={classStats}
        onRefresh={loadDashboardData}
      />
    </Layout>
  );
}