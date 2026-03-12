import { useState, useEffect, useCallback } from 'react';
import type { GameProgress, StudentInfo } from '@/lib/index';

const STORAGE_KEY = 'email_game_progress';
const STUDENT_INFO_KEY = 'email_game_student_info';

interface UseGameProgressReturn {
  progress: GameProgress | null;
  studentInfo: StudentInfo | null;
  isLoading: boolean;
  updateProgress: (updates: Partial<GameProgress>) => void;
  completeLevel: (levelId: string) => void;
  unlockAchievement: (achievementId: string) => void;
  updateModuleProgress: (module: 'email' | 'studentId' | 'password', progress: number) => void;
  addScore: (points: number) => void;
  purchaseItem: (item: { id: string, price: number }) => boolean;
  updateCustomization: (updates: Partial<GameProgress['customization']>) => void;
  setStudentInfo: (info: StudentInfo) => void;
  resetProgress: () => void;
}

function getStoredProgress(): GameProgress | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return {
      ...parsed,
      coins: parsed.coins ?? 0,
      ownedItems: parsed.ownedItems ?? [],
      customization: parsed.customization ?? {},
      lastUpdated: new Date(parsed.lastUpdated),
    };
  } catch {
    return null;
  }
}

function getStoredStudentInfo(): StudentInfo | null {
  try {
    const stored = localStorage.getItem(STUDENT_INFO_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function createInitialProgress(studentId: string): GameProgress {
  return {
    studentId,
    completedLevels: [],
    achievements: [],
    emailLearningProgress: 0,
    studentIdGameProgress: 0,
    passwordSecurityProgress: 0,
    totalScore: 0,
    coins: 0,
    customization: {},
    ownedItems: [],
    lastUpdated: new Date(),
  };
}

export function useGameProgress(): UseGameProgressReturn {
  const [progress, setProgress] = useState<GameProgress | null>(null);
  const [studentInfo, setStudentInfoState] = useState<StudentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedProgress = getStoredProgress();
    const storedInfo = getStoredStudentInfo();

    setProgress(storedProgress);
    setStudentInfoState(storedInfo);
    setIsLoading(false);

    // 監聽同頁面其他 hook 實例發出的學生資訊變更事件（解決登出不同步問題）
    const handleStudentInfoChanged = () => {
      setStudentInfoState(getStoredStudentInfo());
    };

    window.addEventListener('studentInfoChanged', handleStudentInfoChanged);
    return () => {
      window.removeEventListener('studentInfoChanged', handleStudentInfoChanged);
    };
  }, []);

  const saveProgress = useCallback((newProgress: GameProgress) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
      setProgress(newProgress);
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, []);

  const setStudentInfo = useCallback((info: StudentInfo | null) => {
    try {
      if (!info) {
        localStorage.removeItem(STUDENT_INFO_KEY);
        setStudentInfoState(null);
        // 廣播變更給同頁面所有其他 hook 實例
        window.dispatchEvent(new CustomEvent('studentInfoChanged'));
        return;
      }

      localStorage.setItem(STUDENT_INFO_KEY, JSON.stringify(info));
      setStudentInfoState(info);
      // 廣播變更給同頁面所有其他 hook 實例
      window.dispatchEvent(new CustomEvent('studentInfoChanged'));

      if (!progress || progress.studentId !== info.studentId) {
        const newProgress = createInitialProgress(info.studentId);
        saveProgress(newProgress);
      }
    } catch (error) {
      console.error('Failed to save student info:', error);
    }
  }, [progress, saveProgress]);

  const updateProgress = useCallback((updates: Partial<GameProgress>) => {
    if (!progress) return;

    const newProgress: GameProgress = {
      ...progress,
      ...updates,
      lastUpdated: new Date(),
    };
    saveProgress(newProgress);
  }, [progress, saveProgress]);

  const completeLevel = useCallback((levelId: string) => {
    if (!progress) return;

    if (!progress.completedLevels.includes(levelId)) {
      const newProgress: GameProgress = {
        ...progress,
        completedLevels: [...progress.completedLevels, levelId],
        lastUpdated: new Date(),
      };
      saveProgress(newProgress);
    }
  }, [progress, saveProgress]);

  const unlockAchievement = useCallback((achievementId: string) => {
    if (!progress) return;

    if (!progress.achievements.includes(achievementId)) {
      const newProgress: GameProgress = {
        ...progress,
        achievements: [...progress.achievements, achievementId],
        totalScore: progress.totalScore + 100,
        coins: progress.coins + 50, // 解鎖成就額外獎勵 50 枚代幣
        lastUpdated: new Date(),
      };
      saveProgress(newProgress);
    }
  }, [progress, saveProgress]);

  const updateModuleProgress = useCallback(
    (module: 'email' | 'studentId' | 'password', moduleProgress: number) => {
      if (!progress) return;

      const clampedProgress = Math.max(0, Math.min(100, moduleProgress));
      const newProgress: GameProgress = {
        ...progress,
        emailLearningProgress: module === 'email' ? clampedProgress : progress.emailLearningProgress,
        studentIdGameProgress: module === 'studentId' ? clampedProgress : progress.studentIdGameProgress,
        passwordSecurityProgress: module === 'password' ? clampedProgress : progress.passwordSecurityProgress,
        lastUpdated: new Date(),
      };
      saveProgress(newProgress);
    },
    [progress, saveProgress]
  );

  const addScore = useCallback((points: number) => {
    if (!progress) return;

    const newProgress: GameProgress = {
      ...progress,
      totalScore: progress.totalScore + points,
      coins: progress.coins + points, // 積分與代幣 1:1 增加
      lastUpdated: new Date(),
    };
    saveProgress(newProgress);
  }, [progress, saveProgress]);

  const purchaseItem = useCallback((item: { id: string, price: number }) => {
    if (!progress || progress.coins < item.price || progress.ownedItems.includes(item.id)) return false;

    const newProgress: GameProgress = {
      ...progress,
      coins: progress.coins - item.price,
      ownedItems: [...progress.ownedItems, item.id],
      lastUpdated: new Date(),
    };
    saveProgress(newProgress);
    return true;
  }, [progress, saveProgress]);

  const updateCustomization = useCallback((updates: Partial<GameProgress['customization']>) => {
    if (!progress) return;

    const newProgress: GameProgress = {
      ...progress,
      customization: {
        ...progress.customization,
        ...updates,
      },
      lastUpdated: new Date(),
    };
    saveProgress(newProgress);
  }, [progress, saveProgress]);

  const resetProgress = useCallback(() => {
    if (!studentInfo) return;

    const newProgress = createInitialProgress(studentInfo.studentId);
    saveProgress(newProgress);
  }, [studentInfo, saveProgress]);

  return {
    progress,
    studentInfo,
    isLoading,
    updateProgress,
    completeLevel,
    unlockAchievement,
    updateModuleProgress,
    addScore,
    purchaseItem,
    updateCustomization,
    setStudentInfo,
    resetProgress,
  };
}
