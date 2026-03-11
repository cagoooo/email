import React from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { LearningDashboard } from '@/components/LearningDashboard';
import { useGameProgress } from '@/hooks/useGameProgress';
import { useLearningAnalytics } from '@/hooks/useLearningAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Brain } from 'lucide-react';
import { springPresets, staggerContainer, staggerItem } from '@/lib/motion';

export default function LearningAnalytics() {
  const { progress, studentInfo } = useGameProgress();
  const { 
    analytics, 
    getLearningRecommendations, 
    getStudyTimeToday, 
    getWeeklyStudyPattern 
  } = useLearningAnalytics(studentInfo?.studentId || '');

  if (!studentInfo || !analytics) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                學習分析
              </CardTitle>
              <CardDescription>
                請先開始學習以查看你的學習分析數據
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                當你開始使用學習模組後，這裡會顯示詳細的學習分析和個人化建議。
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const recommendations = getLearningRecommendations();
  const studyTimeToday = getStudyTimeToday();
  const weeklyPattern = getWeeklyStudyPattern();

  return (
    <Layout>
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
              學習分析中心
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              深入了解你的學習模式，獲得個人化的學習建議
            </p>
          </motion.div>

          {/* 學習分析儀表板 */}
          <motion.div variants={staggerItem}>
            <LearningDashboard
              analytics={analytics}
              recommendations={recommendations}
              studyTimeToday={studyTimeToday}
              weeklyPattern={weeklyPattern}
            />
          </motion.div>

          {/* 學習建議卡片 */}
          {recommendations.length > 0 && (
            <motion.div variants={staggerItem}>
              <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    AI 學習建議
                  </CardTitle>
                  <CardDescription>
                    基於你的學習數據，我們為你準備了以下建議
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {recommendations.map((rec) => (
                      <motion.div
                        key={rec.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={springPresets.gentle}
                        className="p-4 bg-card rounded-lg border border-border/50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-sm">{rec.title}</h4>
                          <span className="text-xs text-muted-foreground">
                            {rec.estimatedTime}分鐘
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {rec.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* 學習成就展示 */}
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  學習成就
                </CardTitle>
                <CardDescription>
                  你在石門國小 Email 學習中的表現
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-primary">
                      {Math.round(analytics.totalStudyTime / 60 * 10) / 10}
                    </div>
                    <p className="text-sm text-muted-foreground">學習小時數</p>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-accent">
                      {analytics.learningStreak}
                    </div>
                    <p className="text-sm text-muted-foreground">連續學習天數</p>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-green-600">
                      {Object.keys(analytics.mistakePatterns).length}
                    </div>
                    <p className="text-sm text-muted-foreground">已改進的錯誤類型</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
}