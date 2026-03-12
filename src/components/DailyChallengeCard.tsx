import { motion } from 'framer-motion';
import { Calendar, Trophy, Flame, Star, Clock, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { DailyChallenge } from '@/lib/index';
import { springPresets, hoverLift } from '@/lib/motion';

interface DailyChallengeCardProps {
  challenge: DailyChallenge;
  streak: number;
  onStart: () => void;
  className?: string;
}

const DIFFICULTY_COLORS = {
  easy: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  hard: 'bg-red-100 text-red-700 border-red-200',
};

const DIFFICULTY_LABELS = {
  easy: '簡單',
  medium: '中等',
  hard: '困難',
};

const TYPE_ICONS = {
  email: '📧',
  studentId: '🎓',
  password: '🔐',
  mixed: '🌟',
};

const TYPE_LABELS = {
  email: 'Email 學習',
  studentId: '學號記憶',
  password: '密碼安全',
  mixed: '綜合挑戰',
};

export function DailyChallengeCard({ challenge, streak, onStart, className = '' }: DailyChallengeCardProps) {
  const difficultyClass = DIFFICULTY_COLORS[challenge.difficulty];
  const difficultyLabel = DIFFICULTY_LABELS[challenge.difficulty];
  const typeIcon = TYPE_ICONS[challenge.type];
  const typeLabel = TYPE_LABELS[challenge.type];

  return (
    <motion.div
      variants={hoverLift}
      initial="rest"
      whileHover="hover"
      className={`h-full ${className}`}
    >
      <Card className="h-full relative overflow-hidden border-2 transition-all duration-200">
        {/* 背景裝飾 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

        {/* 完成狀態指示器 */}
        {challenge.completed && (
          <div className="absolute top-4 right-4 z-10">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={springPresets.bouncy}
              className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <Trophy className="w-4 h-4 text-white" />
            </motion.div>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{typeIcon}</span>
              <div>
                <Badge variant="outline" className="text-xs mb-1">
                  {typeLabel}
                </Badge>
                <CardTitle className="text-lg leading-tight">
                  {challenge.title}
                </CardTitle>
              </div>
            </div>
          </div>

          <CardDescription className="text-sm mt-2">
            {challenge.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 挑戰詳情 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge className={`text-xs border ${difficultyClass}`}>
                {difficultyLabel}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold text-yellow-600">{challenge.reward}</span>
              </div>
            </div>
          </div>

          {/* 行動按鈕 */}
          <div className="pt-2">
            {challenge.completed ? (
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <Trophy className="w-4 h-4" />
                  <span className="text-sm font-semibold">挑戰完成！</span>
                </div>
                {challenge.completedAt && (
                  <p className="text-xs text-muted-foreground">
                    完成時間：{new Date(challenge.completedAt).toLocaleTimeString('zh-TW')}
                  </p>
                )}
              </div>
            ) : (
              <Button
                onClick={onStart}
                className="w-full group"
                size="sm"
              >
                <Target className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                開始挑戰
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface ChallengeStreakProps {
  streak: number;
  totalRewards: number;
  className?: string;
}

export function ChallengeStreak({ streak, totalRewards, className = '' }: ChallengeStreakProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springPresets.gentle}
      className={`${className}`}
    >
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-full">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-800">連續挑戰</h3>
                <p className="text-sm text-orange-600">
                  已連續 <span className="font-bold text-lg">{streak}</span> 天完成挑戰
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 text-yellow-600">
                <Star className="w-4 h-4" />
                <span className="font-bold">{totalRewards}</span>
              </div>
              <p className="text-xs text-muted-foreground">總獎勵</p>
            </div>
          </div>

          {/* 連勝進度條 */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-orange-600 mb-1">
              <span>連勝進度</span>
              <span>{streak}/7 天</span>
            </div>
            <Progress
              value={(streak % 7) * (100 / 7)}
              className="h-2 bg-orange-100"
            />
            <p className="text-xs text-orange-500 mt-1">
              {streak >= 7 ? '🎉 恭喜達成一週連勝！' : `還需 ${7 - (streak % 7)} 天達成週連勝`}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface WeeklyChallengeProgressProps {
  weeklyProgress: DailyChallenge[];
  className?: string;
}

export function WeeklyChallengeProgress({ weeklyProgress, className = '' }: WeeklyChallengeProgressProps) {
  const days = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];
  const today = new Date().getDay();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springPresets.gentle}
      className={`${className}`}
    >
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            本週挑戰進度
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              const dayIndex = index === 6 ? 0 : index + 1; // 調整週日為 0
              const isToday = dayIndex === today;
              const isCompleted = weeklyProgress.some(c =>
                new Date(c.date).getDay() === dayIndex && c.completed
              );

              return (
                <motion.div
                  key={day}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1, ...springPresets.bouncy }}
                  className={`
                    aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium
                    ${isCompleted
                      ? 'bg-green-100 text-green-700 border-2 border-green-300'
                      : isToday
                        ? 'bg-primary/10 text-primary border-2 border-primary/30'
                        : 'bg-muted text-muted-foreground border-2 border-transparent'
                    }
                  `}
                >
                  <span className="text-xs">{day}</span>
                  {isCompleted && (
                    <Trophy className="w-3 h-3 mt-1" />
                  )}
                  {isToday && !isCompleted && (
                    <Clock className="w-3 h-3 mt-1" />
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              本週完成 <span className="font-semibold text-primary">{weeklyProgress.length}</span>/7 個挑戰
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}