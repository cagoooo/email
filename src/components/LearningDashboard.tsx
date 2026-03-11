import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Clock, 
  TrendingUp, 
  Target, 
  Brain, 
  Calendar,
  Award,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { LearningAnalytics, LearningRecommendation } from '@/lib/index';
import { springPresets, staggerContainer, staggerItem } from '@/lib/motion';

interface LearningDashboardProps {
  analytics: LearningAnalytics;
  recommendations: LearningRecommendation[];
  studyTimeToday: number;
  weeklyPattern: { day: string; minutes: number }[];
}

export function LearningDashboard({ 
  analytics, 
  recommendations, 
  studyTimeToday, 
  weeklyPattern 
}: LearningDashboardProps) {
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}小時${mins}分鐘`;
    }
    return `${mins}分鐘`;
  };

  const getStreakColor = (streak: number): string => {
    if (streak >= 7) return 'text-purple-600 bg-purple-100';
    if (streak >= 3) return 'text-blue-600 bg-blue-100';
    if (streak >= 1) return 'text-green-600 bg-green-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* 學習概覽 */}
      <motion.div variants={staggerItem}>
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              學習分析總覽
            </CardTitle>
            <CardDescription>
              你的學習數據和進步軌跡
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center space-y-2">
                <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatTime(analytics.totalStudyTime)}
                  </p>
                  <p className="text-sm text-muted-foreground">總學習時間</p>
                </div>
              </div>

              <div className="text-center space-y-2">
                <div className="p-3 bg-green-100 rounded-full w-fit mx-auto">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {formatTime(analytics.averageSessionTime)}
                  </p>
                  <p className="text-sm text-muted-foreground">平均學習時長</p>
                </div>
              </div>

              <div className="text-center space-y-2">
                <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <Badge className={`text-lg px-3 py-1 ${getStreakColor(analytics.learningStreak)}`}>
                    {analytics.learningStreak} 天
                  </Badge>
                  <p className="text-sm text-muted-foreground">連續學習</p>
                </div>
              </div>

              <div className="text-center space-y-2">
                <div className="p-3 bg-orange-100 rounded-full w-fit mx-auto">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatTime(studyTimeToday)}
                  </p>
                  <p className="text-sm text-muted-foreground">今日學習</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 學習領域分析 */}
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                學習領域分析
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">最強領域</span>
                  <Badge className="bg-green-100 text-green-700">
                    {analytics.strongestArea || '尚未確定'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">需要加強</span>
                  <Badge className="bg-orange-100 text-orange-700">
                    {analytics.weakestArea || '尚未確定'}
                  </Badge>
                </div>
              </div>

              {/* 每週學習模式 */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">每週學習模式</h4>
                <div className="grid grid-cols-7 gap-1">
                  {weeklyPattern.map((day, index) => (
                    <div key={day.day} className="text-center">
                      <div 
                        className="h-8 bg-primary/20 rounded flex items-end justify-center mb-1"
                        style={{ 
                          background: `linear-gradient(to top, hsl(var(--primary)) ${Math.min(day.minutes / 60 * 100, 100)}%, transparent ${Math.min(day.minutes / 60 * 100, 100)}%)` 
                        }}
                      >
                        <span className="text-xs text-primary-foreground font-medium">
                          {day.minutes > 0 ? day.minutes : ''}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {day.day.slice(-1)}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  每日學習時間（分鐘）
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 智能建議 */}
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                個人化建議
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 改進建議 */}
              {analytics.improvementSuggestions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">學習建議</h4>
                  <div className="space-y-2">
                    {analytics.improvementSuggestions.slice(0, 3).map((suggestion, index) => (
                      <div 
                        key={index}
                        className="flex items-start gap-2 p-2 bg-muted/50 rounded-lg"
                      >
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI 推薦 */}
              {recommendations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">AI 推薦</h4>
                  <div className="space-y-2">
                    {recommendations.slice(0, 2).map((rec) => (
                      <div 
                        key={rec.id}
                        className="p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="text-sm font-semibold">{rec.title}</h5>
                          <Badge variant="outline" className="text-xs">
                            {rec.estimatedTime}分鐘
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {rec.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 錯誤模式分析 */}
      {Object.keys(analytics.mistakePatterns).length > 0 && (
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                學習重點分析
              </CardTitle>
              <CardDescription>
                根據你的學習記錄，這些是需要特別注意的地方
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(analytics.mistakePatterns)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 3)
                  .map(([pattern, count]) => {
                    const [category, type] = pattern.split('_');
                    return (
                      <div key={pattern} className="text-center space-y-2">
                        <div className="relative">
                          <Progress 
                            value={Math.min((count / 10) * 100, 100)} 
                            className="h-2"
                          />
                          <span className="absolute -top-6 right-0 text-xs text-muted-foreground">
                            {count} 次
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium capitalize">
                            {category === 'email' ? 'Email 相關' : 
                             category === 'password' ? '密碼相關' : 
                             category === 'studentId' ? '學號相關' : category}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            需要加強練習
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}