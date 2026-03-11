import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Flame, 
  Clock, 
  TrendingUp,
  Users,
  Star,
  Target,
  Calendar,
  Award,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useLeaderboard, LeaderboardEntry } from '@/hooks/useLeaderboard';
import { springPresets, staggerContainer, staggerItem } from '@/lib/motion';

interface RankingCardProps {
  entry: LeaderboardEntry;
  rank: number;
  type: 'score' | 'streak' | 'time';
  isCurrentUser?: boolean;
}

function RankingCard({ entry, rank, type, isCurrentUser = false }: RankingCardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-300 to-gray-500';
      case 3:
        return 'from-amber-400 to-amber-600';
      default:
        return 'from-primary/20 to-accent/20';
    }
  };

  const getDisplayValue = () => {
    switch (type) {
      case 'score':
        return `${entry.total_score} 分`;
      case 'streak':
        return `${entry.learning_streak} 天`;
      case 'time':
        return `${Math.round(entry.total_study_time / 60)}小時`;
      default:
        return '';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'score':
        return <Trophy className="w-4 h-4" />;
      case 'streak':
        return <Flame className="w-4 h-4" />;
      case 'time':
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springPresets.gentle, delay: rank * 0.1 }}
      className={`relative overflow-hidden ${isCurrentUser ? 'ring-2 ring-primary' : ''}`}
    >
      <Card className={`hover:shadow-lg transition-all duration-300 ${rank <= 3 ? 'border-2' : ''}`}>
        {rank <= 3 && (
          <div className={`absolute inset-0 bg-gradient-to-r ${getRankColor(rank)} opacity-10`} />
        )}
        
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {getRankIcon(rank)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">
                    {entry.display_name || `學生 ${entry.student_id}`}
                  </h3>
                  {isCurrentUser && (
                    <Badge variant="secondary" className="text-xs">
                      你
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  學號：{entry.student_id}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 text-sm font-semibold">
                {getTypeIcon()}
                {getDisplayValue()}
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(entry.last_active).toLocaleDateString('zh-TW')}
              </p>
            </div>
          </div>

          {rank <= 3 && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>總分：{entry.total_score}</span>
                <span>連勝：{entry.learning_streak}天</span>
                <span>時間：{Math.round(entry.total_study_time / 60)}h</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function ClassLeaderboard() {
  const { user, profile } = useAuth();
  const { 
    leaderboard, 
    stats, 
    currentUserRank, 
    loading, 
    fetchLeaderboard,
    fetchWeeklyLeaderboard,
    fetchStudyTimeLeaderboard,
    fetchStreakLeaderboard 
  } = useLeaderboard();
  
  const [activeTab, setActiveTab] = useState<'score' | 'streak' | 'time' | 'weekly'>('score');
  const [displayData, setDisplayData] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (profile?.role === 'student' && profile.class_id) {
      loadLeaderboardData();
    }
  }, [profile, activeTab]);

  const loadLeaderboardData = async () => {
    if (!profile?.class_id) return;

    let data: LeaderboardEntry[] = [];
    
    switch (activeTab) {
      case 'score':
        data = await fetchLeaderboard(profile.class_id);
        break;
      case 'streak':
        data = await fetchStreakLeaderboard(profile.class_id);
        break;
      case 'time':
        data = await fetchStudyTimeLeaderboard(profile.class_id);
        break;
      case 'weekly':
        data = await fetchWeeklyLeaderboard(profile.class_id);
        break;
    }
    
    setDisplayData(data);
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'score':
        return <Trophy className="w-4 h-4" />;
      case 'streak':
        return <Flame className="w-4 h-4" />;
      case 'time':
        return <Clock className="w-4 h-4" />;
      case 'weekly':
        return <Calendar className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getCurrentUserPosition = () => {
    if (!user || !displayData.length) return null;
    
    const userIndex = displayData.findIndex(entry => entry.user_id === user.id);
    return userIndex >= 0 ? userIndex + 1 : null;
  };

  if (profile?.role !== 'student') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">班級排行榜</h2>
            <p className="text-muted-foreground">此功能僅供學生查看班級排名。</p>
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
        <motion.div variants={staggerItem} className="text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            班級排行榜
          </h1>
          <p className="text-xl text-muted-foreground">
            與同學一起努力，爭取最佳表現！
          </p>
        </motion.div>

        {/* 班級統計 */}
        {stats && (
          <motion.div variants={staggerItem}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-700">{stats.totalStudents}</div>
                  <p className="text-sm text-blue-600">班級人數</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-700">{stats.averageScore}</div>
                  <p className="text-sm text-green-600">平均分數</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                <CardContent className="p-4 text-center">
                  <Flame className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-700">{stats.topStreak}</div>
                  <p className="text-sm text-orange-600">最高連勝</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="p-4 text-center">
                  <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-700">
                    {Math.round(stats.totalStudyTime / 60)}
                  </div>
                  <p className="text-sm text-purple-600">總學習時數</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* 你的排名 */}
        {currentUserRank && (
          <motion.div variants={staggerItem}>
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  你的排名
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">#{currentUserRank.score_rank}</div>
                    <p className="text-sm text-muted-foreground">總分排名</p>
                    <p className="text-lg font-semibold">{currentUserRank.total_score} 分</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">#{currentUserRank.streak_rank}</div>
                    <p className="text-sm text-muted-foreground">連勝排名</p>
                    <p className="text-lg font-semibold">{currentUserRank.learning_streak} 天</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">#{currentUserRank.time_rank}</div>
                    <p className="text-sm text-muted-foreground">學習時間排名</p>
                    <p className="text-lg font-semibold">{Math.round(currentUserRank.total_study_time / 60)} 小時</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 排行榜標籤 */}
        <motion.div variants={staggerItem}>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="score" className="flex items-center gap-2">
                {getTabIcon('score')}
                總分榜
              </TabsTrigger>
              <TabsTrigger value="streak" className="flex items-center gap-2">
                {getTabIcon('streak')}
                連勝榜
              </TabsTrigger>
              <TabsTrigger value="time" className="flex items-center gap-2">
                {getTabIcon('time')}
                學習時間榜
              </TabsTrigger>
              <TabsTrigger value="weekly" className="flex items-center gap-2">
                {getTabIcon('weekly')}
                本週活躍榜
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12"
                  >
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">載入排行榜中...</p>
                  </motion.div>
                ) : displayData.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12"
                  >
                    <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">暫無排行榜數據</h3>
                    <p className="text-muted-foreground">開始學習來獲得你的第一個排名吧！</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={springPresets.gentle}
                    className="space-y-4"
                  >
                    {displayData.map((entry, index) => (
                      <RankingCard
                        key={entry.user_id}
                        entry={entry}
                        rank={index + 1}
                        type={activeTab === 'weekly' ? 'score' : activeTab}
                        isCurrentUser={entry.user_id === user?.id}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Tabs>
        </motion.div>

        {/* 激勵區塊 */}
        <motion.div variants={staggerItem}>
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-6 text-center">
              <Zap className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-yellow-800 mb-2">
                繼續努力，爭取更好的排名！
              </h3>
              <p className="text-yellow-700 mb-4">
                每天完成學習挑戰，提升你的班級排名
              </p>
              <Button className="bg-yellow-600 hover:bg-yellow-700">
                <Target className="w-4 h-4 mr-2" />
                開始今日挑戰
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}