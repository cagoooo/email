import { Layout } from '@/components/Layout';
import { AchievementBadge, ProgressCard } from '@/components/GameCards';
import { useGameProgress } from '@/hooks/useGameProgress';
import { ACHIEVEMENTS } from '@/data/index';
import { getProgressPercentage, formatDate } from '@/lib/index';
import { IMAGES } from '@/assets/images';
import { Trophy, Target, Zap, Award, TrendingUp, Calendar, Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Achievements() {
  const { progress, isLoading } = useGameProgress();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">載入中...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const unlockedAchievements = ACHIEVEMENTS.map(achievement => ({
    ...achievement,
    unlocked: progress?.achievements.includes(achievement.id) || false,
    unlockedAt: progress?.achievements.includes(achievement.id) ? progress.lastUpdated : undefined,
  }));

  const totalAchievements = ACHIEVEMENTS.length;
  const unlockedCount = unlockedAchievements.filter(a => a.unlocked).length;
  const achievementProgress = getProgressPercentage(unlockedCount, totalAchievements);

  const totalScore = progress?.totalScore || 0;
  const completedLevels = progress?.completedLevels.length || 0;
  const totalLevels = 6;

  const overallProgress = progress
    ? Math.round(
      (progress.emailLearningProgress +
        progress.studentIdGameProgress +
        progress.passwordSecurityProgress) /
      3
    )
    : 0;

  const stats = [
    {
      title: '總分數',
      value: totalScore,
      icon: <Trophy className="w-5 h-5" />,
      color: 'from-yellow-500 to-orange-500',
    },
    {
      title: '可用代幣',
      value: progress?.coins || 0,
      icon: <Coins className="w-5 h-5" />,
      color: 'from-amber-400 to-yellow-600',
    },
    {
      title: '完成關卡',
      value: `${completedLevels}/${totalLevels}`,
      icon: <Target className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: '解鎖成就',
      value: `${unlockedCount}/${totalAchievements}`,
      icon: <Award className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: '整體進度',
      value: `${overallProgress}%`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 p-8 md:p-12">
            <div className="absolute inset-0 opacity-30">
              <img
                src={IMAGES.KIDS_PLAYING_GAMES_20260310_002534_75}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/70" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold">成就系統</h1>
                  <p className="text-lg text-muted-foreground mt-1">
                    追蹤你的學習成果和獎勵
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}>
                            {stat.icon}
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{stat.title}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <Tabs defaultValue="achievements" className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="achievements" className="gap-2">
                <Award className="w-4 h-4" />
                成就徽章
              </TabsTrigger>
              <TabsTrigger value="progress" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                學習進度
              </TabsTrigger>
            </TabsList>

            <TabsContent value="achievements" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">成就收藏</CardTitle>
                      <CardDescription className="mt-2">
                        已解鎖 {unlockedCount} / {totalAchievements} 個成就
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {achievementProgress}%
                    </Badge>
                  </div>
                  <Progress value={achievementProgress} className="mt-4" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {unlockedAchievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <AchievementBadge achievement={achievement} size="lg" />
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {unlockedCount > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      最近解鎖
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {unlockedAchievements
                        .filter(a => a.unlocked)
                        .slice(0, 5)
                        .map(achievement => (
                          <div
                            key={achievement.id}
                            className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className="text-4xl">{achievement.icon}</div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{achievement.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {achievement.description}
                              </p>
                            </div>
                            {achievement.unlockedAt && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                {formatDate(achievement.unlockedAt)}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <ProgressCard
                  title="Email 學習"
                  description="學習學校 Email 地址的組成和使用"
                  progress={progress?.emailLearningProgress || 0}
                  icon={<div className="text-2xl">📧</div>}
                  color="from-blue-500 to-cyan-500"
                />
                <ProgressCard
                  title="學號記憶"
                  description="透過遊戲記住你的學號"
                  progress={progress?.studentIdGameProgress || 0}
                  icon={<div className="text-2xl">🎓</div>}
                  color="from-purple-500 to-pink-500"
                />
                <ProgressCard
                  title="密碼安全"
                  description="創建安全又好記的密碼"
                  progress={progress?.passwordSecurityProgress || 0}
                  icon={<div className="text-2xl">🔐</div>}
                  color="from-green-500 to-emerald-500"
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">學習統計</CardTitle>
                  <CardDescription>
                    你的整體學習表現和進度追蹤
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">整體完成度</span>
                        <span className="text-sm text-muted-foreground">{overallProgress}%</span>
                      </div>
                      <Progress value={overallProgress} className="h-3" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">關卡進度</span>
                        <span className="text-sm text-muted-foreground">
                          {completedLevels}/{totalLevels}
                        </span>
                      </div>
                      <Progress
                        value={getProgressPercentage(completedLevels, totalLevels)}
                        className="h-3"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                    <div className="text-center p-4 rounded-2xl bg-muted/50">
                      <p className="text-3xl font-bold text-primary">{totalScore}</p>
                      <p className="text-sm text-muted-foreground mt-1">總積分</p>
                    </div>
                    <div className="text-center p-4 rounded-2xl bg-muted/50">
                      <p className="text-3xl font-bold text-accent">{unlockedCount}</p>
                      <p className="text-sm text-muted-foreground mt-1">解鎖成就</p>
                    </div>
                    <div className="text-center p-4 rounded-2xl bg-muted/50">
                      <p className="text-3xl font-bold text-primary">{completedLevels}</p>
                      <p className="text-sm text-muted-foreground mt-1">完成關卡</p>
                    </div>
                    <div className="text-center p-4 rounded-2xl bg-muted/50">
                      <p className="text-3xl font-bold text-accent">{overallProgress}%</p>
                      <p className="text-sm text-muted-foreground mt-1">整體進度</p>
                    </div>
                  </div>

                  {progress?.lastUpdated && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t">
                      <Calendar className="w-4 h-4" />
                      <span>最後更新：{formatDate(progress.lastUpdated)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </Layout>
  );
}
