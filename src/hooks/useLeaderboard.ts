import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  student_id: string;
  total_score: number;
  learning_streak: number;
  total_study_time: number;
  score_rank: number;
  streak_rank: number;
  time_rank: number;
  last_active: string;
}

export interface LeaderboardStats {
  totalStudents: number;
  averageScore: number;
  topStreak: number;
  totalStudyTime: number;
}

export function useLeaderboard() {
  const { user, profile } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardEntry | null>(null);

  // 獲取班級排行榜
  const fetchLeaderboard = async (classId?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_class_leaderboard', {
        p_class_id: classId || null,
      });

      if (error) throw error;

      const leaderboardData = data || [];
      setLeaderboard(leaderboardData);

      // 計算統計數據
      if (leaderboardData.length > 0) {
        const totalStudents = leaderboardData.length;
        const averageScore = Math.round(
          leaderboardData.reduce((sum: number, entry: LeaderboardEntry) => sum + entry.total_score, 0) / totalStudents
        );
        const topStreak = Math.max(...leaderboardData.map((entry: LeaderboardEntry) => entry.learning_streak));
        const totalStudyTime = leaderboardData.reduce((sum: number, entry: LeaderboardEntry) => sum + entry.total_study_time, 0);

        setStats({
          totalStudents,
          averageScore,
          topStreak,
          totalStudyTime,
        });
      }

      // 找到當前用戶的排名
      if (user) {
        const userEntry = leaderboardData.find((entry: LeaderboardEntry) => entry.user_id === user.id);
        setCurrentUserRank(userEntry || null);
      }

      return leaderboardData;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // 獲取週排行榜（最近7天活躍的學生）
  const fetchWeeklyLeaderboard = async (classId?: string) => {
    setLoading(true);
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('class_leaderboard_20260310')
        .select('*')
        .eq('class_id', classId || profile?.class_id)
        .gte('last_active', oneWeekAgo.toISOString())
        .order('total_score', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching weekly leaderboard:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // 獲取學習時間排行榜
  const fetchStudyTimeLeaderboard = async (classId?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('class_leaderboard_20260310')
        .select('*')
        .eq('class_id', classId || profile?.class_id)
        .order('total_study_time', { ascending: false })
        .limit(10);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching study time leaderboard:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // 獲取連勝排行榜
  const fetchStreakLeaderboard = async (classId?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('class_leaderboard_20260310')
        .select('*')
        .eq('class_id', classId || profile?.class_id)
        .order('learning_streak', { ascending: false })
        .limit(10);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching streak leaderboard:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // 獲取班級學習活動摘要
  const getClassActivitySummary = async (classId?: string) => {
    try {
      const targetClassId = classId || profile?.class_id;
      if (!targetClassId) return null;

      // 獲取今日活躍學生數
      const today = new Date().toISOString().split('T')[0];
      const { data: classStudents } = await supabase
        .from('user_profiles_20260310')
        .select('id')
        .eq('class_id', targetClassId)
        .eq('role', 'student');

      const classStudentIds = classStudents?.map(s => s.id) || [];

      const { data: todayActive, error: todayError } = await supabase
        .from('learning_progress_20260310')
        .select('user_id')
        .gte('last_active', today)
        .in('user_id', classStudentIds);

      if (todayError) throw todayError;

      // 獲取本週完成挑戰數
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: weekChallenges, error: challengeError } = await supabase
        .from('daily_challenges_20260310')
        .select('id')
        .eq('completed', true)
        .gte('completed_at', oneWeekAgo.toISOString())
        .in('user_id', classStudentIds);

      if (challengeError) throw challengeError;

      return {
        todayActiveStudents: todayActive?.length || 0,
        weekChallengesCompleted: weekChallenges?.length || 0,
        classId: targetClassId,
      };
    } catch (error) {
      console.error('Error fetching class activity summary:', error);
      return null;
    }
  };

  // 監聽全站即時動態
  useEffect(() => {
    const channel = supabase
      .channel('public:learning_progress_20260310')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'learning_progress_20260310',
        },
        (payload) => {
          // 當積分增加超過 50 分時轉發為全站廣播事件
          const oldScore = payload.old.total_score || 0;
          const newScore = payload.new.total_score || 0;

          if (newScore > oldScore + 5) {
            window.dispatchEvent(new CustomEvent('live_broadcast', {
              detail: {
                student_id: payload.new.student_id || '神秘同學',
                points: newScore - oldScore,
                type: 'score_up'
              }
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 自動獲取排行榜（當用戶登入且有班級時）
  useEffect(() => {
    if (user && profile?.class_id) {
      fetchLeaderboard(profile.class_id);
    }
  }, [user, profile?.class_id]);

  return {
    leaderboard,
    stats,
    currentUserRank,
    loading,
    fetchLeaderboard,
    fetchWeeklyLeaderboard,
    fetchStudyTimeLeaderboard,
    fetchStreakLeaderboard,
    getClassActivitySummary,
  };
}