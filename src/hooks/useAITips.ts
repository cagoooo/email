import { useState, useEffect } from 'react';
import type { AITip, GameProgress } from '@/lib/index';

const AI_TIPS: AITip[] = [
  // 鼓勵類提示
  {
    id: 'encourage_start',
    type: 'encouragement',
    message: '太棒了！你已經開始學習石門國小的 Email 系統了！🎉',
    context: 'first_visit',
    priority: 1,
  },
  {
    id: 'encourage_progress',
    type: 'encouragement',
    message: '你做得很好！繼續保持這個學習節奏！💪',
    context: 'good_progress',
    priority: 2,
  },
  {
    id: 'encourage_comeback',
    type: 'encouragement',
    message: '歡迎回來！讓我們繼續你的學習之旅吧！✨',
    context: 'return_user',
    priority: 1,
  },
  
  // 提示類
  {
    id: 'hint_email_structure',
    type: 'hint',
    message: '記住：Email 地址 = 學號 + @ + mail.smes.tyc.edu.tw',
    context: 'email_learning',
    priority: 3,
  },
  {
    id: 'hint_student_id',
    type: 'hint',
    message: '小技巧：可以把學號編成一個小故事來記憶喔！',
    context: 'student_id_game',
    priority: 3,
  },
  {
    id: 'hint_password_safety',
    type: 'hint',
    message: '安全提醒：好的密碼要包含大小寫字母、數字和符號！',
    context: 'password_security',
    priority: 4,
  },
  
  // 糾正類
  {
    id: 'correct_email_format',
    type: 'correction',
    message: '注意：@ 符號不能忘記，它是連接學號和網域的橋樑！',
    context: 'email_error',
    priority: 5,
  },
  {
    id: 'correct_domain',
    type: 'correction',
    message: '記住我們學校的網域：mail.smes.tyc.edu.tw（不是 gmail 喔！）',
    context: 'domain_error',
    priority: 5,
  },
  
  // 慶祝類
  {
    id: 'celebrate_first_complete',
    type: 'celebration',
    message: '🎊 恭喜！你完成了第一個學習模組！',
    context: 'first_completion',
    priority: 1,
  },
  {
    id: 'celebrate_perfect_score',
    type: 'celebration',
    message: '🌟 太厲害了！滿分通過！你是石門國小的 Email 小專家！',
    context: 'perfect_score',
    priority: 1,
  },
  {
    id: 'celebrate_streak',
    type: 'celebration',
    message: '🔥 連續學習 3 天！你的堅持讓人佩服！',
    context: 'learning_streak',
    priority: 2,
  },
];

export function useAITips() {
  const [currentTip, setCurrentTip] = useState<AITip | null>(null);
  const [tipHistory, setTipHistory] = useState<string[]>([]);

  const getTipForContext = (context: string, progress?: GameProgress): AITip | null => {
    // 過濾已顯示過的提示
    const availableTips = AI_TIPS.filter(tip => 
      tip.context === context && !tipHistory.includes(tip.id)
    );

    if (availableTips.length === 0) return null;

    // 根據優先級排序，選擇最高優先級的提示
    availableTips.sort((a, b) => a.priority - b.priority);
    return availableTips[0];
  };

  const showTip = (context: string, progress?: GameProgress) => {
    const tip = getTipForContext(context, progress);
    if (tip) {
      setCurrentTip(tip);
      setTipHistory(prev => [...prev, tip.id]);
      
      // 自動隱藏提示（除了重要提示）
      if (tip.priority > 2) {
        setTimeout(() => {
          setCurrentTip(null);
        }, 5000);
      }
    }
  };

  const dismissTip = () => {
    setCurrentTip(null);
  };

  const getSmartRecommendation = (progress: GameProgress): string => {
    const totalProgress = progress.emailLearningProgress + 
                         progress.studentIdGameProgress + 
                         progress.passwordSecurityProgress;

    if (totalProgress < 50) {
      return '建議先完成 Email 學習模組，這是基礎中的基礎！';
    } else if (progress.emailLearningProgress > progress.studentIdGameProgress) {
      return '你的 Email 知識很棒！現在來挑戰學號記憶遊戲吧！';
    } else if (progress.passwordSecurityProgress < 50) {
      return '密碼安全很重要！建議學習如何創建安全的密碼。';
    } else {
      return '你已經掌握了所有基礎知識！可以挑戰更高難度的題目了！';
    }
  };

  return {
    currentTip,
    showTip,
    dismissTip,
    getSmartRecommendation,
  };
}