import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { StudentIdMemoryGame } from '@/components/GameComponents';
import { useGameProgress } from '@/hooks/useGameProgress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, Trophy, Target, Sparkles, ArrowRight, CheckCircle2, Lightbulb } from 'lucide-react';
import { IMAGES } from '@/assets/images';

interface MemoryTechnique {
  id: string;
  title: string;
  description: string;
  example: string;
  icon: typeof Brain;
}

const memoryTechniques: MemoryTechnique[] = [
  {
    id: 'chunking',
    title: '分段記憶法',
    description: '將學號分成幾個小段，每段 2-3 位數字，更容易記憶',
    example: '學號 1234567 → 123-4567',
    icon: Brain,
  },
  {
    id: 'story',
    title: '故事聯想法',
    description: '為數字編一個有趣的故事，讓記憶更生動',
    example: '1234567 → 我(1)有(2)三(3)隻(4)五(5)彩(6)奇(7)鳥',
    icon: Sparkles,
  },
  {
    id: 'pattern',
    title: '規律發現法',
    description: '找出學號中的數字規律或特殊組合',
    example: '112233 → 11、22、33 的重複模式',
    icon: Target,
  },
  {
    id: 'visual',
    title: '視覺圖像法',
    description: '將數字轉換成圖像或形狀來記憶',
    example: '8 像雪人、0 像圓圈、1 像鉛筆',
    icon: Lightbulb,
  },
];

const studentIdFormat = [
  {
    title: '學號格式',
    description: '學號由 7 位數字組成',
    example: '例如：1234567',
  },
  {
    title: 'Email 組成',
    description: '學號 + @mail2.smes.tyc.edu.tw',
    example: '1234567@mail2.smes.tyc.edu.tw',
  },
  {
    title: '重要性',
    description: '學號是你的唯一識別碼，用於登入學校所有系統',
    example: '記住學號 = 輕鬆使用所有學校服務',
  },
];

export default function StudentIdGame() {
  const { progress, studentInfo, updateModuleProgress, addScore, completeLevel } = useGameProgress();
  const [gameStarted, setGameStarted] = useState(false);
  const [showTechniques, setShowTechniques] = useState(true);
  const [completedGame, setCompletedGame] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const currentProgress = progress?.studentIdGameProgress || 0;

  useEffect(() => {
    if (completedGame && finalScore > 0) {
      const newProgress = Math.min(100, currentProgress + 25);
      updateModuleProgress('studentId', newProgress);
      addScore(finalScore);

      if (finalScore >= 80) {
        completeLevel('student-id-master');
      }
    }
  }, [completedGame, finalScore]);

  const handleGameComplete = (score: number) => {
    setFinalScore(score);
    setCompletedGame(true);
    setGameStarted(false);
  };

  const handleStartGame = () => {
    setGameStarted(true);
    setShowTechniques(false);
    setCompletedGame(false);
  };

  const handleBackToTechniques = () => {
    setGameStarted(false);
    setShowTechniques(true);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
        <div className="relative">
          <div className="absolute inset-0 z-0 opacity-30">
            <img
              src={IMAGES.KIDS_LEARNING_COMPUTERS_20260310_002533_73}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/70" />

          <div className="relative z-10 container mx-auto px-4 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
                <Brain className="w-5 h-5" />
                <span className="font-medium">學號記憶遊戲</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                輕鬆記住你的學號
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                透過有趣的記憶技巧和互動遊戲，讓學號記憶變得簡單又好玩
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="max-w-4xl mx-auto mb-8"
            >
              <Card className="bg-card/80 backdrop-blur-sm border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-accent" />
                        學習進度
                      </CardTitle>
                      <CardDescription>你已經完成 {currentProgress}% 的學號記憶訓練</CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {currentProgress}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={currentProgress} className="h-3" />
                </CardContent>
              </Card>
            </motion.div>

            <AnimatePresence mode="wait">
              {showTechniques && !gameStarted && (
                <motion.div
                  key="techniques"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Lightbulb className="w-6 h-6 text-accent" />
                      學號格式說明
                    </h2>
                    <div className="grid md:grid-cols-3 gap-4 mb-8">
                      {studentIdFormat.map((item, index) => (
                        <motion.div
                          key={item.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                        >
                          <Card className="h-full bg-gradient-to-br from-card to-card/50 border-2 hover:border-primary/50 transition-all duration-300">
                            <CardHeader>
                              <CardTitle className="text-lg">{item.title}</CardTitle>
                              <CardDescription>{item.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="bg-muted/50 rounded-lg p-3 font-mono text-sm">
                                {item.example}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>

                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Brain className="w-6 h-6 text-primary" />
                      記憶技巧
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      {memoryTechniques.map((technique, index) => {
                        const Icon = technique.icon;
                        return (
                          <motion.div
                            key={technique.id}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                          >
                            <Card className="h-full bg-gradient-to-br from-primary/5 to-accent/5 border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                              <CardHeader>
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-primary/10 rounded-lg">
                                    <Icon className="w-6 h-6 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <CardTitle className="text-lg mb-2">{technique.title}</CardTitle>
                                    <CardDescription className="text-sm">
                                      {technique.description}
                                    </CardDescription>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="bg-background/50 rounded-lg p-3 border border-primary/20">
                                  <p className="text-sm font-medium text-muted-foreground mb-1">範例：</p>
                                  <p className="text-sm font-mono">{technique.example}</p>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                      className="text-center"
                    >
                      <Button
                        size="lg"
                        onClick={handleStartGame}
                        className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl text-lg px-8 py-6"
                        disabled={!studentInfo?.studentId}
                      >
                        {studentInfo?.studentId ? (
                          <>
                            開始記憶遊戲
                            <ArrowRight className="ml-2 w-5 h-5" />
                          </>
                        ) : (
                          '請先在首頁設定學號'
                        )}
                      </Button>
                      {!studentInfo?.studentId && (
                        <p className="text-sm text-muted-foreground mt-4">
                          提示：請先回到首頁輸入你的學號
                        </p>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {gameStarted && studentInfo?.studentId && (
                <motion.div
                  key="game"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-4xl mx-auto"
                >
                  <div className="mb-6">
                    <Button
                      variant="outline"
                      onClick={handleBackToTechniques}
                      className="mb-4"
                    >
                      ← 返回技巧說明
                    </Button>
                  </div>
                  <StudentIdMemoryGame
                    studentId={studentInfo.studentId}
                    onComplete={handleGameComplete}
                  />
                </motion.div>
              )}

              {completedGame && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-2xl mx-auto"
                >
                  <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border-2 border-accent/50">
                    <CardHeader className="text-center">
                      <div className="flex justify-center mb-4">
                        <div className="p-4 bg-accent/20 rounded-full">
                          <CheckCircle2 className="w-12 h-12 text-accent" />
                        </div>
                      </div>
                      <CardTitle className="text-2xl">遊戲完成！</CardTitle>
                      <CardDescription className="text-lg">
                        你的得分：{finalScore} 分
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-background/50 rounded-lg p-4 text-center">
                        <p className="text-muted-foreground mb-2">學習進度已更新</p>
                        <Progress value={currentProgress} className="h-3" />
                        <p className="text-sm text-muted-foreground mt-2">{currentProgress}% 完成</p>
                      </div>
                      <div className="flex gap-4">
                        <Button
                          onClick={handleBackToTechniques}
                          variant="outline"
                          className="flex-1"
                        >
                          查看技巧
                        </Button>
                        <Button
                          onClick={handleStartGame}
                          className="flex-1 bg-gradient-to-r from-primary to-accent"
                        >
                          再玩一次
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  );
}
