import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, XCircle, Lightbulb, Trophy, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { EmailBuilderGame, QuizComponent } from '@/components/GameComponents';
import { useGameProgress } from '@/hooks/useGameProgress';
import { EMAIL_DOMAIN, generateEmailAddress, type EmailQuestion } from '@/lib/index';
import { IMAGES } from '@/assets/images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const EMAIL_QUIZ_QUESTIONS: EmailQuestion[] = [
  {
    id: 'q1',
    question: '我們學校的 Email 網域是什麼？',
    options: [
      '@gmail.com',
      '@mail2.smes.tyc.edu.tw',
      '@yahoo.com.tw',
      '@outlook.com'
    ],
    correctAnswer: 1,
    explanation: '我們學校使用的是 @mail2.smes.tyc.edu.tw 作為 Email 網域，這是學校專屬的郵件系統。'
  },
  {
    id: 'q2',
    question: 'Email 地址的帳號部分是什麼？',
    options: [
      '學生姓名',
      '學生學號',
      '出生日期',
      '班級座號'
    ],
    correctAnswer: 1,
    explanation: 'Email 帳號就是你的學號，這樣可以確保每個學生都有唯一的 Email 地址。'
  },
  {
    id: 'q3',
    question: '完整的 Email 地址由哪些部分組成？',
    options: [
      '只有帳號',
      '帳號 + @ + 網域',
      '只有網域',
      '密碼 + 帳號'
    ],
    correctAnswer: 1,
    explanation: 'Email 地址由三個部分組成：帳號（學號）+ @ 符號 + 網域（mail2.smes.tyc.edu.tw）。'
  },
  {
    id: 'q4',
    question: '如果學號是 123456，完整的 Email 地址是？',
    options: [
      '123456@gmail.com',
      'mail2.smes.tyc.edu.tw@123456',
      '123456@mail2.smes.tyc.edu.tw',
      '@123456mail2.smes.tyc.edu.tw'
    ],
    correctAnswer: 2,
    explanation: '正確的格式是：學號 + @ + 網域，所以是 123456@mail2.smes.tyc.edu.tw。'
  },
  {
    id: 'q5',
    question: '@ 符號在 Email 地址中的作用是什麼？',
    options: [
      '裝飾用途',
      '分隔帳號和網域',
      '代表密碼',
      '沒有特別意義'
    ],
    correctAnswer: 1,
    explanation: '@ 符號是 Email 地址的重要組成部分，用來分隔使用者帳號和郵件伺服器網域。'
  }
];

export default function EmailLearning() {
  const { progress, studentInfo, updateModuleProgress, addScore, completeLevel } = useGameProgress();
  const [currentStep, setCurrentStep] = useState<'intro' | 'structure' | 'builder' | 'quiz' | 'complete'>('intro');
  const [builderScore, setBuilderScore] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const totalProgress = progress?.emailLearningProgress || 0;

  useEffect(() => {
    if (currentStep === 'complete' && !showCelebration) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [currentStep, showCelebration]);

  const handleBuilderComplete = (score: number) => {
    setBuilderScore(score);
    addScore(score);
    updateModuleProgress('email', 50);
    completeLevel('email-builder');
    setCurrentStep('quiz');
  };

  const handleQuizComplete = (score: number, correctCount: number) => {
    setQuizScore(score);
    addScore(score);
    updateModuleProgress('email', 100);
    completeLevel('email-quiz');
    setCurrentStep('complete');
  };

  const renderIntro = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="relative h-64 rounded-2xl overflow-hidden">
        <img
          src={IMAGES.CUTE_EMAIL_ICON_20260310_002532_74}
          alt="Email 學習"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/70" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Mail className="w-20 h-20 mx-auto text-primary" />
            <h1 className="text-4xl font-bold">Email 地址學習</h1>
            <p className="text-xl text-muted-foreground">學習如何使用學校 Email 系統</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-accent" />
            學習目標
          </CardTitle>
          <CardDescription>
            完成這個模組後，你將能夠：
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span>理解 Email 地址的組成結構</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span>記住學校的 Email 網域名稱</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span>能夠正確組合自己的 Email 地址</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span>了解 Email 地址的重要性和用途</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={() => setCurrentStep('structure')}
          className="gap-2"
        >
          開始學習
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </motion.div>
  );

  const renderStructure = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Email 地址結構</h2>
        <p className="text-lg text-muted-foreground">
          讓我們一起了解 Email 地址是如何組成的
        </p>
      </div>

      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle>Email 地址的三個部分</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center space-y-3"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold text-lg">帳號（學號）</h3>
              <p className="text-sm text-muted-foreground">
                你的學號就是你的 Email 帳號
              </p>
              <Badge variant="secondary" className="font-mono">123456</Badge>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center space-y-3"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-accent">2</span>
              </div>
              <h3 className="font-semibold text-lg">@ 符號</h3>
              <p className="text-sm text-muted-foreground">
                連接帳號和網域的重要符號
              </p>
              <Badge variant="secondary" className="font-mono text-xl">@</Badge>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center space-y-3"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold text-lg">網域名稱</h3>
              <p className="text-sm text-muted-foreground">
                學校的郵件伺服器地址
              </p>
              <Badge variant="secondary" className="font-mono text-xs">
                mail2.smes.tyc.edu.tw
              </Badge>
            </motion.div>
          </div>

          <div className="pt-6 border-t">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">完整的 Email 地址範例：</p>
              <div className="inline-flex items-center gap-2 p-4 bg-muted rounded-xl">
                <span className="font-mono text-lg font-semibold text-primary">123456</span>
                <span className="font-mono text-lg font-semibold text-accent">@</span>
                <span className="font-mono text-lg font-semibold text-primary">mail2.smes.tyc.edu.tw</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Lightbulb className="w-5 h-5" />
        <AlertTitle>小提示</AlertTitle>
        <AlertDescription>
          記住：你的學號 + @ + {EMAIL_DOMAIN.slice(1)} = 你的完整 Email 地址！
        </AlertDescription>
      </Alert>

      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => setCurrentStep('intro')}
        >
          返回
        </Button>
        <Button
          onClick={() => setCurrentStep('builder')}
          className="gap-2"
        >
          開始練習
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </motion.div>
  );

  const renderBuilder = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Email 組成遊戲</h2>
        <p className="text-lg text-muted-foreground">
          動手組合你的 Email 地址
        </p>
      </div>

      <EmailBuilderGame
        onComplete={handleBuilderComplete}
        studentId={studentInfo?.studentId}
      />
    </motion.div>
  );

  const renderQuiz = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">知識測驗</h2>
        <p className="text-lg text-muted-foreground">
          測試你對 Email 地址的理解
        </p>
      </div>

      <QuizComponent
        questions={EMAIL_QUIZ_QUESTIONS}
        onComplete={handleQuizComplete}
        title="Email 知識測驗"
        description="回答以下問題來測試你的學習成果"
      />
    </motion.div>
  );

  const renderComplete = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8"
    >
      {showCelebration && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
        >
          <Alert className="border-2 border-primary bg-primary/10">
            <Trophy className="w-5 h-5 text-primary" />
            <AlertTitle>恭喜完成！</AlertTitle>
            <AlertDescription>
              你已經掌握了 Email 地址的知識！
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <Trophy className="w-24 h-24 mx-auto text-primary" />
        </motion.div>
        <h2 className="text-4xl font-bold">學習完成！</h2>
        <p className="text-xl text-muted-foreground">
          你已經成功完成 Email 學習模組
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>學習成果</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">組成遊戲得分</span>
                <Badge variant="secondary">{builderScore} 分</Badge>
              </div>
              <Progress value={(builderScore / 100) * 100} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">測驗得分</span>
                <Badge variant="secondary">{quizScore} 分</Badge>
              </div>
              <Progress value={(quizScore / 100) * 100} />
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="font-semibold">總得分</span>
              <span className="text-2xl font-bold text-primary">
                {builderScore + quizScore} 分
              </span>
            </div>
          </div>

          {studentInfo && (
            <Alert>
              <Mail className="w-5 h-5" />
              <AlertTitle>你的 Email 地址</AlertTitle>
              <AlertDescription className="font-mono text-base">
                {generateEmailAddress(studentInfo.studentId)}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => {
            setCurrentStep('intro');
            setBuilderScore(0);
            setQuizScore(0);
          }}
        >
          重新學習
        </Button>
        <Button
          onClick={() => window.location.href = '/#/student-id-game'}
          className="gap-2"
        >
          下一個模組
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </motion.div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Email 學習進度</h1>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {totalProgress}%
            </Badge>
          </div>
          <Progress value={totalProgress} className="h-3" />
        </div>

        {currentStep === 'intro' && renderIntro()}
        {currentStep === 'structure' && renderStructure()}
        {currentStep === 'builder' && renderBuilder()}
        {currentStep === 'quiz' && renderQuiz()}
        {currentStep === 'complete' && renderComplete()}
      </div>
    </Layout>
  );
}
