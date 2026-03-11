import { useState, useEffect } from 'react';
import type { DailyChallenge } from '@/lib/index';

const DAILY_CHALLENGES: Omit<DailyChallenge, 'id' | 'date' | 'completed' | 'completedAt'>[] = [
  // Email 相關挑戰
  {
    title: '快速組裝 Email 地址',
    description: '在 30 秒內正確組裝 3 個不同學號的 Email 地址',
    type: 'email',
    difficulty: 'easy',
    reward: 50,
  },
  {
    title: 'Email 專家挑戰',
    description: '連續答對 5 題 Email 相關問題，不能出錯！',
    type: 'email',
    difficulty: 'medium',
    reward: 100,
  },
  {
    title: 'Email 閃電戰',
    description: '在 1 分鐘內完成 Email 學習模組的所有題目',
    type: 'email',
    difficulty: 'hard',
    reward: 200,
  },

  // 學號記憶挑戰
  {
    title: '學號記憶大師',
    description: '記住並正確輸入 5 個隨機生成的學號',
    type: 'studentId',
    difficulty: 'easy',
    reward: 60,
  },
  {
    title: '數字序列挑戰',
    description: '在學號記憶遊戲中達到 10 連勝',
    type: 'studentId',
    difficulty: 'medium',
    reward: 120,
  },
  {
    title: '超級記憶王',
    description: '一次性記住 8 位數的學號並完美復述',
    type: 'studentId',
    difficulty: 'hard',
    reward: 180,
  },

  // 密碼安全挑戰
  {
    title: '密碼安全小衛士',
    description: '創建 3 個不同強度等級的安全密碼',
    type: 'password',
    difficulty: 'easy',
    reward: 70,
  },
  {
    title: '密碼強度測試',
    description: '所有創建的密碼都達到「強」等級',
    type: 'password',
    difficulty: 'medium',
    reward: 130,
  },
  {
    title: '密碼創意大師',
    description: '使用 5 種不同的密碼創建技巧',
    type: 'password',
    difficulty: 'hard',
    reward: 190,
  },

  // 綜合挑戰
  {
    title: '石門小專家',
    description: '在所有模組中都獲得 80% 以上的分數',
    type: 'mixed',
    difficulty: 'medium',
    reward: 150,
  },
  {
    title: '完美學習日',
    description: '在一天內完成所有學習模組並獲得滿分',
    type: 'mixed',
    difficulty: 'hard',
    reward: 300,
  },
  {
    title: '石門之星',
    description: '連續 7 天完成每日挑戰',
    type: 'mixed',
    difficulty: 'hard',
    reward: 500,
  },
];

export function useDailyChallenges() {
  const [todayChallenge, setTodayChallenge] = useState<DailyChallenge | null>(null);
  const [challengeHistory, setChallengeHistory] = useState<DailyChallenge[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    generateTodayChallenge();
    loadChallengeHistory();
  }, []);

  const generateTodayChallenge = () => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(`daily_challenge_${today}`);
    
    if (stored) {
      setTodayChallenge(JSON.parse(stored));
    } else {
      // 根據日期生成固定的挑戰（確保同一天所有用戶看到相同挑戰）
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
      const challengeIndex = dayOfYear % DAILY_CHALLENGES.length;
      const baseChallenge = DAILY_CHALLENGES[challengeIndex];
      
      const newChallenge: DailyChallenge = {
        ...baseChallenge,
        id: `challenge_${today}`,
        date: today,
        completed: false,
      };
      
      setTodayChallenge(newChallenge);
      localStorage.setItem(`daily_challenge_${today}`, JSON.stringify(newChallenge));
    }
  };

  const loadChallengeHistory = () => {
    const history = localStorage.getItem('challenge_history');
    if (history) {
      const parsed = JSON.parse(history);
      setChallengeHistory(parsed);
      calculateStreak(parsed);
    }
  };

  const calculateStreak = (history: DailyChallenge[]) => {
    const completedChallenges = history
      .filter(c => c.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let currentStreak = 0;
    const today = new Date();
    
    for (let i = 0; i < completedChallenges.length; i++) {
      const challengeDate = new Date(completedChallenges[i].date);
      const daysDiff = Math.floor((today.getTime() - challengeDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === i) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    setStreak(currentStreak);
  };

  const completeChallenge = (challengeId: string) => {
    if (todayChallenge && todayChallenge.id === challengeId && !todayChallenge.completed) {
      const completedChallenge = {
        ...todayChallenge,
        completed: true,
        completedAt: new Date(),
      };
      
      setTodayChallenge(completedChallenge);
      
      // 更新本地存儲
      const today = new Date().toDateString();
      localStorage.setItem(`daily_challenge_${today}`, JSON.stringify(completedChallenge));
      
      // 更新歷史記錄
      const newHistory = [...challengeHistory, completedChallenge];
      setChallengeHistory(newHistory);
      localStorage.setItem('challenge_history', JSON.stringify(newHistory));
      
      // 重新計算連勝
      calculateStreak(newHistory);
      
      return completedChallenge.reward;
    }
    return 0;
  };

  const getChallengeProgress = (type: string): number => {
    const typeHistory = challengeHistory.filter(c => c.type === type && c.completed);
    return typeHistory.length;
  };

  const getTotalRewards = (): number => {
    return challengeHistory
      .filter(c => c.completed)
      .reduce((total, c) => total + c.reward, 0);
  };

  const getWeeklyProgress = (): DailyChallenge[] => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return challengeHistory.filter(c => 
      new Date(c.date) >= oneWeekAgo && c.completed
    );
  };

  return {
    todayChallenge,
    challengeHistory,
    streak,
    completeChallenge,
    getChallengeProgress,
    getTotalRewards,
    getWeeklyProgress,
  };
}