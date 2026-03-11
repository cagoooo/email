import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  TrendingUp,
  Clock,
  Trophy,
  BookOpen,
  Target,
  Calendar,
  BarChart3,
  Download,
  Filter,
  Search,
  Eye,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useLeaderboard, LeaderboardEntry } from '@/hooks/useLeaderboard';
import { springPresets, staggerContainer, staggerItem } from '@/lib/motion';

interface StudentDetail extends LeaderboardEntry {
  email?: string;
  parent_email?: string;
  last_login?: string;
  completion_rate?: number;
}

interface ClassStats {
  totalStudents: number;
  activeToday: number;
  averageProgress: number;
  totalChallengesCompleted: number;
  averageStudyTime: number;
}

export function TeacherDashboard() {
  const { profile } = useAuth();
  const { leaderboard, stats, loading, fetchLeaderboard, getClassActivitySummary } = useLeaderboard();
  const [students, setStudents] = useState<StudentDetail[]>([]);
  const [classStats, setClassStats] = useState<ClassStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

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

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id.includes(searchTerm);

    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'active' && new Date(student.last_active) > new Date(Date.now() - 24 * 60 * 60 * 1000)) ||
      (filterStatus === 'inactive' && new Date(student.last_active) <= new Date(Date.now() - 24 * 60 * 60 * 1000));

    return matchesSearch && matchesFilter;
  });

  const getProgressColor = (score: number) => {
    if (score >= 700) return 'text-green-600 bg-green-100';
    if (score >= 400) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStreakBadge = (streak: number) => {
    if (streak >= 7) return 'bg-purple-100 text-purple-700';
    if (streak >= 3) return 'bg-blue-100 text-blue-700';
    if (streak >= 1) return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (profile?.role !== 'teacher') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">存取被拒</h2>
            <p className="text-muted-foreground">此頁面僅供教師使用。</p>
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
            <h1 className="text-3xl font-bold">教師管理後台</h1>
            <p className="text-muted-foreground mt-2">
              管理班級學生的學習進度和表現
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadDashboardData}>
              <BarChart3 className="w-4 h-4 mr-2" />
              重新整理
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              匯出報告
            </Button>
          </div>
        </motion.div>

        {/* 班級統計卡片 */}
        {classStats && (
          <motion.div variants={staggerItem}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">總學生數</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{classStats.totalStudents}</div>
                  <p className="text-xs text-muted-foreground">
                    今日活躍：{classStats.activeToday} 人
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">平均進度</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{classStats.averageProgress}%</div>
                  <Progress value={classStats.averageProgress} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">本週挑戰</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{classStats.totalChallengesCompleted}</div>
                  <p className="text-xs text-muted-foreground">
                    已完成挑戰數
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">平均學習時間</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{classStats.averageStudyTime}</div>
                  <p className="text-xs text-muted-foreground">分鐘/人</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* 主要內容區域 */}
        <motion.div variants={staggerItem}>
          <Tabs defaultValue="students" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="students">學生管理</TabsTrigger>
              <TabsTrigger value="analytics">學習分析</TabsTrigger>
              <TabsTrigger value="challenges">挑戰管理</TabsTrigger>
            </TabsList>

            {/* 學生管理標籤 */}
            <TabsContent value="students" className="space-y-6">
              {/* 搜尋和篩選 */}
              <Card>
                <CardHeader>
                  <CardTitle>學生列表</CardTitle>
                  <CardDescription>
                    查看和管理班級學生的學習狀況
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="搜尋學生姓名或學號..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={filterStatus === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterStatus('all')}
                      >
                        全部
                      </Button>
                      <Button
                        variant={filterStatus === 'active' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterStatus('active')}
                      >
                        今日活躍
                      </Button>
                      <Button
                        variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterStatus('inactive')}
                      >
                        需要關注
                      </Button>
                    </div>
                  </div>

                  {/* 學生列表 */}
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-muted-foreground mt-2">載入中...</p>
                      </div>
                    ) : filteredStudents.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">沒有找到符合條件的學生</p>
                      </div>
                    ) : (
                      filteredStudents.map((student) => (
                        <motion.div
                          key={student.user_id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={springPresets.gentle}
                        >
                          <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-semibold text-primary">
                                      {student.display_name?.charAt(0) || student.student_id.slice(-2)}
                                    </span>
                                  </div>
                                  <div>
                                    <h3 className="font-semibold">
                                      {student.display_name || `學生 ${student.student_id}`}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                      學號：{student.student_id}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                  <div className="text-right">
                                    <Badge className={getProgressColor(student.total_score)}>
                                      {student.total_score} 分
                                    </Badge>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      排名：#{student.score_rank}
                                    </p>
                                  </div>

                                  <div className="text-right">
                                    <Badge className={getStreakBadge(student.learning_streak)}>
                                      {student.learning_streak} 天連勝
                                    </Badge>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {Math.round(student.total_study_time / 60)}小時學習
                                    </p>
                                  </div>

                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedStudent(student)}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    詳情
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 學習分析標籤 */}
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>班級學習分析</CardTitle>
                  <CardDescription>
                    深入了解班級的整體學習表現和趨勢
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">學習分析功能</h3>
                    <p className="text-muted-foreground mb-4">
                      詳細的學習分析圖表和報告即將推出
                    </p>
                    <Button variant="outline">
                      <Calendar className="w-4 h-4 mr-2" />
                      查看學習日曆
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 挑戰管理標籤 */}
            <TabsContent value="challenges" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>挑戰管理</CardTitle>
                  <CardDescription>
                    管理和自定義班級的學習挑戰
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">挑戰管理功能</h3>
                    <p className="text-muted-foreground mb-4">
                      自定義挑戰和作業指派功能即將推出
                    </p>
                    <Button variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      設定挑戰
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>

      {/* 學生詳情彈窗 */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-background rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {selectedStudent.display_name || `學生 ${selectedStudent.student_id}`}
                </h2>
                <Button
                  variant="outline"
                  onClick={() => setSelectedStudent(null)}
                >
                  關閉
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">基本資訊</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">學號：</span>{selectedStudent.student_id}</p>
                      <p><span className="font-medium">Email：</span>{selectedStudent.email}</p>
                      <p><span className="font-medium">最後活動：</span>
                        {new Date(selectedStudent.last_active).toLocaleString('zh-TW')}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">學習統計</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">總分：</span>{selectedStudent.total_score} 分</p>
                      <p><span className="font-medium">班級排名：</span>#{selectedStudent.score_rank}</p>
                      <p><span className="font-medium">學習連勝：</span>{selectedStudent.learning_streak} 天</p>
                      <p><span className="font-medium">學習時間：</span>
                        {Math.round(selectedStudent.total_study_time / 60)} 小時 {selectedStudent.total_study_time % 60} 分鐘
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">學習進度</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>整體完成度</span>
                          <span>{selectedStudent.completion_rate}%</span>
                        </div>
                        <Progress value={selectedStudent.completion_rate} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">排名表現</h3>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-muted rounded">
                        <div className="text-lg font-bold">#{selectedStudent.score_rank}</div>
                        <div className="text-xs text-muted-foreground">總分排名</div>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <div className="text-lg font-bold">#{selectedStudent.streak_rank}</div>
                        <div className="text-xs text-muted-foreground">連勝排名</div>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <div className="text-lg font-bold">#{selectedStudent.time_rank}</div>
                        <div className="text-xs text-muted-foreground">時間排名</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}