import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { ParentDashboard } from '@/components/ParentDashboard';
import { useAuth } from '@/hooks/useAuth';

export interface ChildProgress {
  student_id: string;
  display_name: string;
  email: string;
  progress: any;
  class_name?: string;
  teacher_name?: string;
}

export interface WeeklyReport {
  week: string;
  totalStudyTime: number;
  challengesCompleted: number;
  averageScore: number;
  improvements: string[];
  concerns: string[];
}

export default function ParentDashboardPage() {
  const { profile } = useAuth();
  const [children, setChildren] = useState<ChildProgress[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildProgress | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role === 'parent') {
      loadParentDashboard();
    }
  }, [profile]);

  const loadParentDashboard = async () => {
    setLoading(true);
    try {
      // 這裡應該從 Supabase 獲取家長關聯的學生數據
      // 暫時使用模擬數據
      const mockChildren: ChildProgress[] = [
        {
          student_id: '1130001',
          display_name: '小明',
          email: '1130001@mail2.smes.tyc.edu.tw',
          class_name: '三年甲班',
          teacher_name: '王老師',
          progress: {
            id: '1',
            user_id: '1',
            student_id: '1130001',
            email_learning_progress: 85,
            student_id_game_progress: 90,
            password_security_progress: 75,
            total_score: 750,
            completed_levels: ['email-basic', 'email-advanced', 'studentid-memory'],
            achievements: ['first-login', 'email-master', 'memory-champion'],
            daily_challenges_completed: 12,
            learning_streak: 5,
            total_study_time: 180,
            last_active: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        }
      ];

      setChildren(mockChildren);
      if (mockChildren.length > 0) {
        setSelectedChild(mockChildren[0]);
        generateWeeklyReport(mockChildren[0]);
      }

      // 模擬通知
      setNotifications([
        {
          id: 1,
          type: 'achievement',
          title: '新成就解鎖！',
          message: '小明獲得了「Email 專家」成就',
          time: '2小時前',
          read: false,
        },
        {
          id: 2,
          type: 'concern',
          title: '學習提醒',
          message: '小明已經2天沒有完成每日挑戰了',
          time: '1天前',
          read: false,
        },
      ]);

    } catch (error) {
      console.error('Error loading parent dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateWeeklyReport = (child: ChildProgress) => {
    const report: WeeklyReport = {
      week: '2026年3月第2週',
      totalStudyTime: child.progress.total_study_time,
      challengesCompleted: child.progress.daily_challenges_completed,
      averageScore: child.progress.total_score,
      improvements: [
        'Email 學習進度提升了15%',
        '連續學習天數達到新高',
        '密碼安全意識有所提升',
      ],
      concerns: [
        '學號記憶遊戲需要更多練習',
        '建議增加每日學習時間',
      ],
    };
    setWeeklyReport(report);
  };

  return (
    <Layout>
      <ParentDashboard
        profile={profile}
        childrenList={children}
        selectedChild={selectedChild}
        weeklyReport={weeklyReport}
        notifications={notifications}
        loading={loading}
        onSelectChild={(child) => {
          setSelectedChild(child);
          generateWeeklyReport(child);
        }}
      />
    </Layout>
  );
}