import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  TrendingUp,
  Clock,
  Trophy,
  BookOpen,
  Target,
  Calendar,
  Star,
  Award,
  Users,
  Mail,
  Phone,
  Bell,
  Settings,
  Download,
  Eye,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useCloudSync, CloudProgress } from '@/hooks/useCloudSync';
import { springPresets, staggerContainer, staggerItem } from '@/lib/motion';

interface ChildProgress {
  student_id: string;
  display_name: string;
  email: string;
  progress: CloudProgress;
  class_name?: string;
  teacher_name?: string;
}

interface WeeklyReport {
  week: string;
  totalStudyTime: number;
  challengesCompleted: number;
  averageScore: number;
  improvements: string[];
  concerns: string[];
}

export function ParentDashboard() {
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

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStreakStatus = (streak: number) => {
    if (streak >= 7) return { color: 'text-purple-600', label: '優秀', icon: '🔥' };
    if (streak >= 3) return { color: 'text-blue-600', label: '良好', icon: '⭐' };
    if (streak >= 1) return { color: 'text-green-600', label: '持續', icon: '✅' };
    return { color: 'text-gray-600', label: '需要鼓勵', icon: '💪' };
  };

  if (profile?.role !== 'parent') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">家長監控中心</h2>
            <p className="text-muted-foreground">此功能僅供家長使用。</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* 頁面標題 */}
        <motion.div variants={staggerItem} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Heart className="w-8 h-8 text-red-500" />
              家長監控中心
            </h1>
            <p className="text-muted-foreground mt-2">
              關心孩子的學習進度，陪伴成長每一步
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Bell className="w-4 h-4 mr-2" />
              通知設定
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              下載報告
            </Button>
          </div>
        </motion.div>

        {/* 通知區域 */}
        {notifications.filter(n => !n.read).length > 0 && (
          <motion.div variants={staggerItem}>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                您有 {notifications.filter(n => !n.read).length} 條未讀通知
                <Button variant="link" className="p-0 ml-2 h-auto">
                  查看全部
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {loading ? (
          <motion.div variants={staggerItem} className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">載入中...</p>
          </motion.div>
        ) : (
          <>
            {/* 孩子選擇器 */}
            {children.length > 1 && (
              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader>
                    <CardTitle>選擇孩子</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      {children.map((child) => (
                        <Button
                          key={child.student_id}
                          variant={selectedChild?.student_id === child.student_id ? 'default' : 'outline'}
                          onClick={() => {
                            setSelectedChild(child);
                            generateWeeklyReport(child);
                          }}
                        >
                          {child.display_name}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {selectedChild && (
              <>
                {/* 孩子基本資訊 */}
                <motion.div variants={staggerItem}>
                  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-2xl font-bold text-primary">
                              {selectedChild.display_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold">{selectedChild.display_name}</h2>
                            <p className="text-muted-foreground">學號：{selectedChild.student_id}</p>
                            <p className="text-muted-foreground">班級：{selectedChild.class_name}</p>
                            <p className="text-muted-foreground">Email：{selectedChild.email}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-3xl font-bold text-primary">
                            {selectedChild.progress.total_score}
                          </div>
                          <p className="text-muted-foreground">總分</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-2xl">
                              {getStreakStatus(selectedChild.progress.learning_streak).icon}
                            </span>
                            <span className={`font-semibold ${getStreakStatus(selectedChild.progress.learning_streak).color}`}>
                              {selectedChild.progress.learning_streak} 天連勝
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* 學習統計 */}
                <motion.div variants={staggerItem}>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Email 學習</CardTitle>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold ${getProgressColor(selectedChild.progress.email_learning_progress)}`}>
                          {selectedChild.progress.email_learning_progress}%
                        </div>
                        <Progress value={selectedChild.progress.email_learning_progress} className="mt-2" />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">學號記憶</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold ${getProgressColor(selectedChild.progress.student_id_game_progress)}`}>
                          {selectedChild.progress.student_id_game_progress}%
                        </div>
                        <Progress value={selectedChild.progress.student_id_game_progress} className="mt-2" />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">密碼安全</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold ${getProgressColor(selectedChild.progress.password_security_progress)}`}>
                          {selectedChild.progress.password_security_progress}%
                        </div>
                        <Progress value={selectedChild.progress.password_security_progress} className="mt-2" />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">學習時間</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {Math.round(selectedChild.progress.total_study_time / 60)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          小時 ({selectedChild.progress.total_study_time % 60} 分鐘)
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>

                {/* 詳細分析 */}
                <motion.div variants={staggerItem}>
                  <Tabs defaultValue="progress" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="progress">學習進度</TabsTrigger>
                      <TabsTrigger value="achievements">成就徽章</TabsTrigger>
                      <TabsTrigger value="report">週報告</TabsTrigger>
                      <TabsTrigger value="suggestions">建議</TabsTrigger>
                    </TabsList>

                    {/* 學習進度標籤 */}
                    <TabsContent value="progress" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>學習活動時間軸</CardTitle>
                          <CardDescription>
                            最近的學習活動和進度變化
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                              <div className="flex-1">
                                <p className="font-medium">完成每日挑戰</p>
                                <p className="text-sm text-muted-foreground">2小時前</p>
                              </div>
                              <Badge className="bg-green-100 text-green-700">+50分</Badge>
                            </div>

                            <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                              <BookOpen className="w-5 h-5 text-blue-600" />
                              <div className="flex-1">
                                <p className="font-medium">完成 Email 學習模組</p>
                                <p className="text-sm text-muted-foreground">昨天</p>
                              </div>
                              <Badge className="bg-blue-100 text-blue-700">+100分</Badge>
                            </div>

                            <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg">
                              <Award className="w-5 h-5 text-purple-600" />
                              <div className="flex-1">
                                <p className="font-medium">獲得「記憶大師」成就</p>
                                <p className="text-sm text-muted-foreground">3天前</p>
                              </div>
                              <Badge className="bg-purple-100 text-purple-700">成就</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* 成就徽章標籤 */}
                    <TabsContent value="achievements" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>已獲得成就</CardTitle>
                          <CardDescription>
                            {selectedChild.display_name} 已經獲得了 {selectedChild.progress.achievements.length} 個成就
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {selectedChild.progress.achievements.map((achievement, index) => (
                              <div key={index} className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                                <div className="text-3xl mb-2">🏆</div>
                                <h3 className="font-semibold text-sm">
                                  {achievement === 'first-login' ? '首次登入' :
                                    achievement === 'email-master' ? 'Email 專家' :
                                      achievement === 'memory-champion' ? '記憶冠軍' :
                                        achievement === 'security-expert' ? '安全專家' : achievement}
                                </h3>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* 週報告標籤 */}
                    <TabsContent value="report" className="space-y-6">
                      {weeklyReport && (
                        <Card>
                          <CardHeader>
                            <CardTitle>{weeklyReport.week} 學習報告</CardTitle>
                            <CardDescription>
                              {selectedChild.display_name} 本週的學習表現總結
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-blue-700">
                                  {Math.round(weeklyReport.totalStudyTime / 60)}
                                </div>
                                <p className="text-sm text-blue-600">學習小時</p>
                              </div>
                              <div className="text-center p-4 bg-green-50 rounded-lg">
                                <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-green-700">
                                  {weeklyReport.challengesCompleted}
                                </div>
                                <p className="text-sm text-green-600">完成挑戰</p>
                              </div>
                              <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-purple-700">
                                  {weeklyReport.averageScore}
                                </div>
                                <p className="text-sm text-purple-600">平均分數</p>
                              </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4" />
                                  進步表現
                                </h4>
                                <ul className="space-y-2">
                                  {weeklyReport.improvements.map((improvement, index) => (
                                    <li key={index} className="text-sm text-green-600 flex items-start gap-2">
                                      <span className="text-green-500 mt-1">•</span>
                                      {improvement}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h4 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4" />
                                  需要關注
                                </h4>
                                <ul className="space-y-2">
                                  {weeklyReport.concerns.map((concern, index) => (
                                    <li key={index} className="text-sm text-orange-600 flex items-start gap-2">
                                      <span className="text-orange-500 mt-1">•</span>
                                      {concern}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    {/* 建議標籤 */}
                    <TabsContent value="suggestions" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>個人化學習建議</CardTitle>
                          <CardDescription>
                            基於 {selectedChild.display_name} 的學習表現，我們為您提供以下建議
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <Alert>
                            <Star className="h-4 w-4" />
                            <AlertDescription>
                              <strong>優勢領域：</strong>Email 學習表現優秀，可以嘗試更進階的挑戰。
                            </AlertDescription>
                          </Alert>

                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              <strong>需要加強：</strong>密碼安全概念需要更多練習，建議增加相關學習時間。
                            </AlertDescription>
                          </Alert>

                          <Alert>
                            <Heart className="h-4 w-4" />
                            <AlertDescription>
                              <strong>家長建議：</strong>可以在家中與孩子一起練習 Email 使用，增進親子互動。
                            </AlertDescription>
                          </Alert>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              </>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}