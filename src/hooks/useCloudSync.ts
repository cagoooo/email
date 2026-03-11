import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CloudProgress {
  id: string;
  user_id: string;
  student_id: string;
  email_learning_progress: number;
  student_id_game_progress: number;
  password_security_progress: number;
  total_score: number;
  completed_levels: string[];
  achievements: string[];
  daily_challenges_completed: number;
  learning_streak: number;
  total_study_time: number;
  last_active: string;
  created_at: string;
  updated_at: string;
}

export interface DailyChallengeRecord {
  id: string;
  user_id: string;
  challenge_date: string;
  challenge_type: string;
  challenge_title: string;
  challenge_description: string;
  difficulty: string;
  reward_points: number;
  completed: boolean;
  completed_at?: string;
}

export function useCloudSync() {
  const { user, profile } = useAuth();
  const [cloudProgress, setCloudProgress] = useState<CloudProgress | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // 從雲端獲取學習進度
  const fetchCloudProgress = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('learning_progress_20260310')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      setCloudProgress(data);
      return data;
    } catch (error) {
      console.error('Error fetching cloud progress:', error);
      return null;
    }
  };

  // 同步本地進度到雲端
  const syncToCloud = async (localProgress: {
    studentId: string;
    emailLearningProgress: number;
    studentIdGameProgress: number;
    passwordSecurityProgress: number;
    totalScore: number;
    completedLevels: string[];
    achievements: string[];
    studyTime: number;
  }) => {
    if (!user) return { success: false, error: 'No user logged in' };

    setSyncing(true);
    try {
      const { data, error } = await supabase.rpc('sync_learning_progress', {
        p_student_id: localProgress.studentId,
        p_email_progress: localProgress.emailLearningProgress,
        p_studentid_progress: localProgress.studentIdGameProgress,
        p_password_progress: localProgress.passwordSecurityProgress,
        p_total_score: localProgress.totalScore,
        p_completed_levels: localProgress.completedLevels,
        p_achievements: localProgress.achievements,
        p_study_time: localProgress.studyTime,
      });

      if (error) throw error;

      // 重新獲取雲端數據
      await fetchCloudProgress();
      setLastSyncTime(new Date());

      return { success: true, data };
    } catch (error) {
      console.error('Error syncing to cloud:', error);
      return { success: false, error };
    } finally {
      setSyncing(false);
    }
  };

  // 從雲端下載進度到本地
  const downloadFromCloud = async () => {
    const progress = await fetchCloudProgress();
    if (progress) {
      // 更新本地存儲
      const localData = {
        studentId: progress.student_id,
        email: `${progress.student_id}@mail2.smes.tyc.edu.tw`,
        hasCustomPassword: false,
      };

      const progressData = {
        studentId: progress.student_id,
        completedLevels: progress.completed_levels,
        achievements: progress.achievements,
        emailLearningProgress: progress.email_learning_progress,
        studentIdGameProgress: progress.student_id_game_progress,
        passwordSecurityProgress: progress.password_security_progress,
        totalScore: progress.total_score,
        lastUpdated: new Date(progress.updated_at),
      };

      localStorage.setItem('studentInfo', JSON.stringify(localData));
      localStorage.setItem('gameProgress', JSON.stringify(progressData));

      return { success: true, data: { studentInfo: localData, progress: progressData } };
    }

    return { success: false, error: 'No cloud data found' };
  };

  // 獲取今日挑戰
  const getTodayChallenge = async () => {
    if (!user) return null;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_challenges_20260310')
        .select('*')
        .eq('user_id', user.id)
        .eq('challenge_date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching today challenge:', error);
      return null;
    }
  };

  // 生成今日挑戰
  const generateTodayChallenge = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.rpc('generate_daily_challenge', {
        p_user_id: user.id,
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const challenge = data[0];
        const today = new Date().toISOString().split('T')[0];

        // 插入挑戰記錄
        const { data: insertData, error: insertError } = await supabase
          .from('daily_challenges_20260310')
          .insert({
            user_id: user.id,
            challenge_date: today,
            challenge_type: challenge.challenge_type,
            challenge_title: challenge.challenge_title,
            challenge_description: challenge.challenge_description,
            difficulty: challenge.difficulty,
            reward_points: challenge.reward_points,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return insertData;
      }

      return null;
    } catch (error) {
      console.error('Error generating today challenge:', error);
      return null;
    }
  };

  // 完成每日挑戰
  const completeDailyChallenge = async (challengeType: string = 'mixed') => {
    if (!user) return { success: false, error: 'No user logged in' };

    try {
      const { data, error } = await supabase.rpc('complete_daily_challenge', {
        p_challenge_type: challengeType,
      });

      if (error) throw error;

      // 重新獲取進度
      await fetchCloudProgress();

      return { success: true, data };
    } catch (error) {
      console.error('Error completing daily challenge:', error);
      return { success: false, error };
    }
  };

  // 自動同步（當用戶登入時）
  useEffect(() => {
    if (user && profile?.role === 'student') {
      fetchCloudProgress();
    }
  }, [user, profile]);

  return {
    cloudProgress,
    syncing,
    lastSyncTime,
    fetchCloudProgress,
    syncToCloud,
    downloadFromCloud,
    getTodayChallenge,
    generateTodayChallenge,
    completeDailyChallenge,
  };
}