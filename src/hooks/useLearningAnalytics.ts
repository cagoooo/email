import { useState, useEffect } from 'react';
import type { LearningAnalytics, LearningRecommendation, GameProgress } from '@/lib/index';

export function useLearningAnalytics(studentId: string) {
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());

  useEffect(() => {
    if (studentId) {
      loadAnalytics();
      setSessionStartTime(new Date());
    }
  }, [studentId]);

  useEffect(() => {
    // 每分鐘更新一次學習時間
    const interval = setInterval(() => {
      updateStudyTime();
    }, 60000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  const loadAnalytics = () => {
    const stored = localStorage.getItem(`analytics_${studentId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      // 轉換日期字符串回 Date 對象
      parsed.lastActiveDate = new Date(parsed.lastActiveDate);
      setAnalytics(parsed);
    } else {
      // 初始化新的分析數據
      const newAnalytics: LearningAnalytics = {
        studentId,
        totalStudyTime: 0,
        averageSessionTime: 0,
        strongestArea: '',
        weakestArea: '',
        improvementSuggestions: [],
        learningStreak: 0,
        lastActiveDate: new Date(),
        weeklyProgress: [0, 0, 0, 0, 0, 0, 0], // 7天的進度
        mistakePatterns: {},
      };
      setAnalytics(newAnalytics);
    }
  };

  const updateStudyTime = () => {
    if (!analytics) return;

    const now = new Date();
    const sessionTime = Math.floor((now.getTime() - sessionStartTime.getTime()) / 60000); // 分鐘
    
    const updatedAnalytics = {
      ...analytics,
      totalStudyTime: analytics.totalStudyTime + sessionTime,
      lastActiveDate: now,
    };

    // 計算平均學習時間
    const sessions = localStorage.getItem(`sessions_${studentId}`);
    const sessionCount = sessions ? JSON.parse(sessions).length + 1 : 1;
    updatedAnalytics.averageSessionTime = updatedAnalytics.totalStudyTime / sessionCount;

    setAnalytics(updatedAnalytics);
    saveAnalytics(updatedAnalytics);
    
    // 重置會話開始時間
    setSessionStartTime(now);
  };

  const saveAnalytics = (data: LearningAnalytics) => {
    localStorage.setItem(`analytics_${studentId}`, JSON.stringify(data));
  };

  const updateProgress = (progress: GameProgress) => {
    if (!analytics) return;

    // 分析最強和最弱領域
    const areas = {
      email: progress.emailLearningProgress,
      studentId: progress.studentIdGameProgress,
      password: progress.passwordSecurityProgress,
    };

    const sortedAreas = Object.entries(areas).sort(([,a], [,b]) => b - a);
    const strongestArea = getAreaName(sortedAreas[0][0]);
    const weakestArea = getAreaName(sortedAreas[2][0]);

    // 更新每週進度
    const today = new Date().getDay(); // 0 = 週日, 1 = 週一, ...
    const weeklyProgress = [...analytics.weeklyProgress];
    const totalProgress = (areas.email + areas.studentId + areas.password) / 3;
    weeklyProgress[today] = Math.max(weeklyProgress[today], totalProgress);

    // 計算學習連勝
    const lastActive = new Date(analytics.lastActiveDate);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
    
    let learningStreak = analytics.learningStreak;
    if (daysDiff === 1) {
      learningStreak += 1; // 連續學習
    } else if (daysDiff > 1) {
      learningStreak = 1; // 重新開始計算
    }

    const updatedAnalytics: LearningAnalytics = {
      ...analytics,
      strongestArea,
      weakestArea,
      learningStreak,
      weeklyProgress,
      improvementSuggestions: generateImprovementSuggestions(areas, analytics.mistakePatterns),
    };

    setAnalytics(updatedAnalytics);
    saveAnalytics(updatedAnalytics);
  };

  const recordMistake = (category: string, type: string) => {
    if (!analytics) return;

    const key = `${category}_${type}`;
    const mistakePatterns = {
      ...analytics.mistakePatterns,
      [key]: (analytics.mistakePatterns[key] || 0) + 1,
    };

    const updatedAnalytics = {
      ...analytics,
      mistakePatterns,
    };

    setAnalytics(updatedAnalytics);
    saveAnalytics(updatedAnalytics);
  };

  const getAreaName = (key: string): string => {
    const names: { [key: string]: string } = {
      email: 'Email 學習',
      studentId: '學號記憶',
      password: '密碼安全',
    };
    return names[key] || key;
  };

  const generateImprovementSuggestions = (
    areas: { [key: string]: number },
    mistakes: { [key: string]: number }
  ): string[] => {
    const suggestions: string[] = [];

    // 基於進度的建議
    if (areas.email < 50) {
      suggestions.push('建議多練習 Email 地址的組成結構');
    }
    if (areas.studentId < 50) {
      suggestions.push('可以嘗試用故事記憶法來記住學號');
    }
    if (areas.password < 50) {
      suggestions.push('學習更多密碼安全知識，保護你的帳號');
    }

    // 基於錯誤模式的建議
    const topMistakes = Object.entries(mistakes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    topMistakes.forEach(([mistake, count]) => {
      if (count > 3) {
        if (mistake.includes('email')) {
          suggestions.push('注意 Email 地址中 @ 符號的正確使用');
        } else if (mistake.includes('domain')) {
          suggestions.push('記住我們學校的網域：mail.smes.tyc.edu.tw');
        } else if (mistake.includes('password')) {
          suggestions.push('密碼要包含大小寫字母、數字和特殊符號');
        }
      }
    });

    return suggestions.slice(0, 5); // 最多返回 5 個建議
  };

  const getLearningRecommendations = (): LearningRecommendation[] => {
    if (!analytics) return [];

    const recommendations: LearningRecommendation[] = [];

    // 基於學習時間的建議
    if (analytics.totalStudyTime > 60) {
      recommendations.push({
        id: 'take_break',
        type: 'break',
        title: '休息一下',
        description: '你已經學習了很久，建議休息 10 分鐘再繼續',
        priority: 1,
        estimatedTime: 10,
      });
    }

    // 基於最弱領域的建議
    if (analytics.weakestArea) {
      recommendations.push({
        id: 'improve_weak',
        type: 'practice',
        title: `加強 ${analytics.weakestArea}`,
        description: `這是你目前需要加強的領域，建議多做練習`,
        priority: 2,
        estimatedTime: 15,
      });
    }

    // 基於學習連勝的建議
    if (analytics.learningStreak >= 3) {
      recommendations.push({
        id: 'challenge_mode',
        type: 'next_lesson',
        title: '挑戰更高難度',
        description: '你的學習狀態很好！可以嘗試更有挑戰性的內容',
        priority: 3,
        estimatedTime: 20,
      });
    }

    return recommendations.sort((a, b) => a.priority - b.priority);
  };

  const getStudyTimeToday = (): number => {
    const now = new Date();
    const sessionTime = Math.floor((now.getTime() - sessionStartTime.getTime()) / 60000);
    return sessionTime;
  };

  const getWeeklyStudyPattern = (): { day: string; minutes: number }[] => {
    if (!analytics) return [];

    const days = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    return analytics.weeklyProgress.map((progress, index) => ({
      day: days[index],
      minutes: Math.round(progress * 2), // 假設進度與學習時間相關
    }));
  };

  return {
    analytics,
    updateProgress,
    recordMistake,
    getLearningRecommendations,
    getStudyTimeToday,
    getWeeklyStudyPattern,
  };
}