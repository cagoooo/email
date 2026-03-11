import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lock, Trophy, TrendingUp, Clock, Star, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { IMAGES } from '@/assets/images';
import type { GameLevel, Achievement } from '@/lib/index';
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS, LEARNING_MODULES } from '@/data/index';
import { springPresets, hoverLift } from '@/lib/motion';

interface LevelCardProps {
  level: GameLevel;
  isCompleted: boolean;
  currentScore?: number;
  onStart: () => void;
}

export function LevelCard({ level, isCompleted, currentScore = 0, onStart }: LevelCardProps) {
  const difficultyClass = DIFFICULTY_COLORS[level.difficulty];
  const difficultyLabel = DIFFICULTY_LABELS[level.difficulty];
  const canStart = !level.isLocked;
  const scorePercentage = (currentScore / level.requiredScore) * 100;

  return (
    <motion.div
      variants={hoverLift}
      initial="rest"
      whileHover={canStart ? "hover" : "rest"}
      className="h-full"
    >
      <Card className="h-full relative overflow-hidden border-2 transition-all duration-200">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />

        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2 flex items-center gap-2">
                {isCompleted && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                {level.title}
              </CardTitle>
              <CardDescription className="text-sm">
                {level.description}
              </CardDescription>
            </div>
            {level.isLocked && (
              <Lock className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge className={difficultyClass}>
              {difficultyLabel}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Star className="w-3 h-3" />
              需要 {level.requiredScore} 分
            </Badge>
          </div>

          {currentScore > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">目前分數</span>
                <span className="font-semibold">{currentScore} / {level.requiredScore}</span>
              </div>
              <Progress value={scorePercentage} className="h-2" />
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button
            onClick={onStart}
            disabled={level.isLocked}
            className="w-full"
            variant={isCompleted ? "outline" : "default"}
          >
            {level.isLocked ? '尚未解鎖' : isCompleted ? '重新挑戰' : '開始學習'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
}

export function AchievementBadge({ achievement, size = 'md' }: AchievementBadgeProps) {
  const sizeClasses = {
    sm: 'w-16 h-16 text-2xl',
    md: 'w-24 h-24 text-4xl',
    lg: 'w-32 h-32 text-5xl',
  };

  const containerSize = sizeClasses[size];

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={springPresets.bouncy}
      className="flex flex-col items-center gap-2"
    >
      <div
        className={`${containerSize} rounded-full flex items-center justify-center transition-all duration-300 ${achievement.unlocked
            ? 'bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30'
            : 'bg-muted/50 grayscale opacity-50'
          }`}
      >
        <span className="filter drop-shadow-sm">{achievement.icon}</span>
      </div>
      <div className="text-center">
        <p className={`font-semibold ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
          }`}>
          {achievement.title}
        </p>
        <p className={`text-muted-foreground ${size === 'sm' ? 'text-xs' : 'text-xs'
          }`}>
          {achievement.description}
        </p>
        {achievement.unlocked && achievement.unlockedAt && (
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(achievement.unlockedAt).toLocaleDateString('zh-TW')}
          </p>
        )}
      </div>
    </motion.div>
  );
}

interface ProgressCardProps {
  title: string;
  description: string;
  progress: number;
  icon: React.ReactNode;
  color?: string;
}

export function ProgressCard({ title, description, progress, icon, color = 'from-primary to-accent' }: ProgressCardProps) {
  return (
    <motion.div
      variants={hoverLift}
      initial="rest"
      whileHover="hover"
    >
      <Card className="overflow-hidden border-2 transition-all duration-200">
        <div className={`h-2 bg-gradient-to-r ${color}`} />

        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg`}>
              {icon}
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription className="text-sm">{description}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">完成度</span>
              <span className="text-2xl font-bold">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface LearningModuleCardProps {
  moduleId: string;
  progress: number;
}

export function LearningModuleCard({ moduleId, progress }: LearningModuleCardProps) {
  const module = LEARNING_MODULES.find(m => m.id === moduleId);

  if (!module) return null;

  const isCompleted = progress >= 100;

  return (
    <motion.div
      variants={hoverLift}
      initial="rest"
      whileHover="hover"
      className="h-full"
    >
      <Link to={module.route} className="block h-full">
        <Card className="h-full overflow-hidden border-2 transition-all duration-200 hover:shadow-xl">
          <div className="relative h-48 overflow-hidden">
            <img
              src={moduleId === 'email-learning' ? IMAGES.CUTE_EMAIL_ICON_20260310_002532_74 : IMAGES.KIDS_PLAYING_GAMES_20260310_002534_75}
              alt={module.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            />
            <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-60`} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-7xl filter drop-shadow-lg">{module.icon}</span>
            </div>
            {isCompleted && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-green-600 text-white gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  已完成
                </Badge>
              </div>
            )}
          </div>

          <CardHeader>
            <CardTitle className="text-xl">{module.title}</CardTitle>
            <CardDescription>{module.description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>預計時間：{module.estimatedTime}</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">學習進度</span>
                <span className="font-semibold">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>

          <CardFooter>
            <Button className="w-full" variant={isCompleted ? "outline" : "default"}>
              {isCompleted ? '複習課程' : progress > 0 ? '繼續學習' : '開始學習'}
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
