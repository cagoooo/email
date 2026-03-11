export const ROUTE_PATHS = {
  HOME: '/',
  EMAIL_LEARNING: '/email-learning',
  STUDENT_ID_GAME: '/student-id-game',
  PASSWORD_SECURITY: '/password-security',
  ACHIEVEMENTS: '/achievements',
  LEARNING_ANALYTICS: '/learning-analytics',
  LEADERBOARD: '/leaderboard',
  TEACHER_DASHBOARD: '/teacher',
  PARENT_DASHBOARD: '/parent',
  SHOP: '/shop',
} as const;

export const EMAIL_DOMAIN = '@mail2.smes.tyc.edu.tw';
// 預設密碼由老師在課堂上教授，不在網站中顯示
export const DEFAULT_PASSWORD = ''; // 隱藏預設密碼

export interface StudentInfo {
  studentId: string;
  email: string;
  hasCustomPassword: boolean;
}

export interface GameProgress {
  studentId: string;
  completedLevels: string[];
  achievements: string[];
  emailLearningProgress: number;
  studentIdGameProgress: number;
  passwordSecurityProgress: number;
  totalScore: number;
  coins: number; // 新增：可用於商城的點數
  customization: {
    avatarFrame?: string;
    nameColor?: string;
  }; // 新增：外觀自定義
  ownedItems: string[]; // 新增：已購買物品列表
  lastUpdated: Date;
}

export interface GameLevel {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  requiredScore: number;
  isLocked: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface EmailQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface PasswordTip {
  id: string;
  title: string;
  description: string;
  example: string;
  strength: 'weak' | 'medium' | 'strong';
}

export interface ShopItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: 'avatarFrame' | 'nameColor';
  preview: string; // 預覽顏色或網址
  value: string; // 實際應用的 CSS 值
}

// 新增：AI 智能提示系統
export interface AITip {
  id: string;
  type: 'encouragement' | 'hint' | 'correction' | 'celebration';
  message: string;
  context: string;
  priority: number;
}

// 新增：每日挑戰任務
export interface DailyChallenge {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'email' | 'studentId' | 'password' | 'mixed';
  difficulty: 'easy' | 'medium' | 'hard';
  reward: number;
  completed: boolean;
  completedAt?: Date;
}

// 新增：學習分析數據
export interface LearningAnalytics {
  studentId: string;
  totalStudyTime: number; // 分鐘
  averageSessionTime: number;
  strongestArea: string;
  weakestArea: string;
  improvementSuggestions: string[];
  learningStreak: number; // 連續學習天數
  lastActiveDate: Date;
  weeklyProgress: number[];
  mistakePatterns: { [key: string]: number };
}

// 新增：智能學習建議
export interface LearningRecommendation {
  id: string;
  type: 'next_lesson' | 'review' | 'practice' | 'break';
  title: string;
  description: string;
  priority: number;
  estimatedTime: number; // 分鐘
}

export function validateStudentId(studentId: string): boolean {
  const pattern = /^\d{7}$/;
  return pattern.test(studentId);
}

export function generateEmailAddress(studentId: string): string {
  if (!validateStudentId(studentId)) {
    throw new Error('無效的學號格式');
  }
  return `${studentId}${EMAIL_DOMAIN}`;
}

export function calculatePasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getProgressPercentage(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
