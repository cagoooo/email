import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, User, Lock, Check, X, Shuffle, Trophy, Lightbulb, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { springPresets, fadeInUp, hoverLift } from '@/lib/motion';
import { 
  EMAIL_DOMAIN, 
  // DEFAULT_PASSWORD, // 預設密碼由老師教授
  validateStudentId, 
  generateEmailAddress, 
  calculatePasswordStrength,
  shuffleArray,
  type EmailQuestion 
} from '@/lib/index';
import { EMAIL_QUESTIONS, PASSWORD_TIPS } from '@/data/index';

interface EmailBuilderGameProps {
  onComplete: (score: number) => void;
  studentId?: string;
}

export function EmailBuilderGame({ onComplete, studentId = '' }: EmailBuilderGameProps) {
  const [inputStudentId, setInputStudentId] = useState(studentId);
  const [emailParts, setEmailParts] = useState({ username: '', domain: '' });
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const checkEmail = useCallback(() => {
    if (!validateStudentId(inputStudentId)) {
      setIsCorrect(false);
      setAttempts(prev => prev + 1);
      return;
    }

    const correctEmail = generateEmailAddress(inputStudentId);
    const userEmail = `${emailParts.username}${emailParts.domain}`;
    const correct = userEmail === correctEmail;
    
    setIsCorrect(correct);
    setAttempts(prev => prev + 1);

    if (correct) {
      const score = Math.max(100 - (attempts * 10), 50);
      setTimeout(() => onComplete(score), 1500);
    }
  }, [inputStudentId, emailParts, attempts, onComplete]);

  const handleDomainClick = () => {
    setEmailParts(prev => ({ ...prev, domain: EMAIL_DOMAIN }));
  };

  const handleUsernameChange = (value: string) => {
    setEmailParts(prev => ({ ...prev, username: value }));
    setInputStudentId(value);
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-6 h-6 text-primary" />
            Email 組成遊戲
          </CardTitle>
          <CardDescription>
            將你的學號和學校網域組合成完整的 Email 地址
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="student-id">輸入你的學號</Label>
              <Input
                id="student-id"
                type="text"
                placeholder="例如：123456"
                value={inputStudentId}
                onChange={(e) => setInputStudentId(e.target.value)}
                className="font-mono text-lg"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Label>Email 帳號部分</Label>
                <Input
                  type="text"
                  value={emailParts.username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="學號"
                  className="font-mono text-lg"
                />
              </div>
              <span className="text-2xl font-bold text-muted-foreground mt-6">@</span>
              <div className="flex-1">
                <Label>Email 網域部分</Label>
                <Button
                  variant="outline"
                  onClick={handleDomainClick}
                  className="w-full font-mono text-sm h-10"
                >
                  {emailParts.domain || '點擊選擇網域'}
                </Button>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">完整的 Email 地址：</p>
              <p className="font-mono text-xl font-semibold">
                {emailParts.username || '___'}{emailParts.domain || '___'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={checkEmail} className="flex-1">
              <Check className="w-4 h-4 mr-2" />
              檢查答案
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowHint(!showHint)}
            >
              <Lightbulb className="w-4 h-4" />
            </Button>
          </div>

          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Alert>
                  <Lightbulb className="w-4 h-4" />
                  <AlertDescription>
                    提示：Email 地址格式是「學號@mail2.smes.tyc.edu.tw」
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {isCorrect !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Alert variant={isCorrect ? 'default' : 'destructive'}>
                  {isCorrect ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  <AlertDescription>
                    {isCorrect
                      ? '太棒了！你成功組成了正確的 Email 地址！'
                      : '再試試看！檢查學號和網域是否正確。'}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-sm text-muted-foreground text-center">
            嘗試次數：{attempts}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface StudentIdMemoryGameProps {
  onComplete: (score: number) => void;
  studentId: string;
}

export function StudentIdMemoryGame({ onComplete, studentId }: StudentIdMemoryGameProps) {
  const [displayTime, setDisplayTime] = useState(5);
  const [isMemorizing, setIsMemorizing] = useState(true);
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [shuffledDigits, setShuffledDigits] = useState<string[]>([]);

  useEffect(() => {
    if (isMemorizing && displayTime > 0) {
      const timer = setTimeout(() => setDisplayTime(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (displayTime === 0) {
      setIsMemorizing(false);
      setShuffledDigits(shuffleArray(studentId.split('')));
    }
  }, [displayTime, isMemorizing, studentId]);

  const handleDigitClick = (digit: string) => {
    if (userInput.length < studentId.length) {
      setUserInput(prev => prev + digit);
    }
  };

  const handleCheck = () => {
    const correct = userInput === studentId;
    setIsCorrect(correct);
    setAttempts(prev => prev + 1);

    if (correct) {
      const score = Math.max(100 - (attempts * 15), 50);
      setTimeout(() => onComplete(score), 1500);
    }
  };

  const handleReset = () => {
    setUserInput('');
    setIsCorrect(null);
  };

  const handleRestart = () => {
    setDisplayTime(5);
    setIsMemorizing(true);
    setUserInput('');
    setIsCorrect(null);
    setAttempts(0);
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-6 h-6 text-primary" />
            學號記憶挑戰
          </CardTitle>
          <CardDescription>
            記住你的學號，然後用點擊的方式輸入
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isMemorizing ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-4"
            >
              <div className="text-6xl font-bold font-mono text-primary">
                {displayTime}
              </div>
              <div className="text-8xl font-bold font-mono tracking-wider">
                {studentId}
              </div>
              <p className="text-muted-foreground">
                請記住這個學號，倒數結束後開始測驗
              </p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <div className="p-6 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">你輸入的學號：</p>
                <div className="font-mono text-4xl font-bold tracking-wider min-h-[3rem] flex items-center justify-center">
                  {userInput || '___'}
                </div>
                <Progress 
                  value={(userInput.length / studentId.length) * 100} 
                  className="mt-4"
                />
              </div>

              <div className="grid grid-cols-5 gap-2">
                {shuffledDigits.map((digit, index) => (
                  <motion.div
                    key={`${digit}-${index}`}
                    variants={hoverLift}
                    initial="rest"
                    whileHover="hover"
                  >
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handleDigitClick(digit)}
                      disabled={userInput.length >= studentId.length}
                      className="w-full h-16 text-2xl font-mono font-bold"
                    >
                      {digit}
                    </Button>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleReset} variant="outline" className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  清除
                </Button>
                <Button 
                  onClick={handleCheck} 
                  className="flex-1"
                  disabled={userInput.length !== studentId.length}
                >
                  <Check className="w-4 h-4 mr-2" />
                  檢查答案
                </Button>
              </div>

              <AnimatePresence>
                {isCorrect !== null && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Alert variant={isCorrect ? 'default' : 'destructive'}>
                      {isCorrect ? (
                        <Trophy className="w-4 h-4" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                      <AlertDescription>
                        {isCorrect
                          ? '完美！你成功記住了學號！'
                          : '再試一次！仔細回想學號的順序。'}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>嘗試次數：{attempts}</span>
                <Button variant="ghost" size="sm" onClick={handleRestart}>
                  <Shuffle className="w-4 h-4 mr-2" />
                  重新開始
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface PasswordCreatorGameProps {
  onComplete: (score: number, password: string) => void;
}

export function PasswordCreatorGame({ onComplete }: PasswordCreatorGameProps) {
  const [password, setPassword] = useState(''); // 不顯示預設密碼
  const [showPassword, setShowPassword] = useState(true);
  const [selectedTips, setSelectedTips] = useState<string[]>([]);
  const strength = calculatePasswordStrength(password);

  const strengthConfig = {
    weak: { color: 'text-red-600', bg: 'bg-red-100', label: '弱', progress: 33 },
    medium: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: '中', progress: 66 },
    strong: { color: 'text-green-600', bg: 'bg-green-100', label: '強', progress: 100 },
  };

  const currentStrength = strengthConfig[strength];

  const handleTipClick = (tipId: string) => {
    setSelectedTips(prev => 
      prev.includes(tipId) 
        ? prev.filter(id => id !== tipId)
        : [...prev, tipId]
    );
  };

  const handleComplete = () => {
    const score = strength === 'strong' ? 100 : strength === 'medium' ? 75 : 50;
    onComplete(score, password);
  };

  const strongTips = PASSWORD_TIPS.filter(tip => tip.strength === 'strong');

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-6 h-6 text-primary" />
            創意密碼生成器
          </CardTitle>
          <CardDescription>
            創造一個安全又好記的密碼
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">你的密碼</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="font-mono text-lg pr-10"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? '隱藏' : '顯示'}
                </Button>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">密碼強度：</span>
                <Badge className={`${currentStrength.bg} ${currentStrength.color}`}>
                  {currentStrength.label}
                </Badge>
              </div>
              <Progress value={currentStrength.progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                密碼長度：{password.length} 個字符
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              密碼安全建議
            </h4>
            <div className="grid gap-2">
              {strongTips.map((tip) => (
                <motion.div
                  key={tip.id}
                  variants={hoverLift}
                  initial="rest"
                  whileHover="hover"
                >
                  <Card
                    className={`cursor-pointer transition-colors ${
                      selectedTips.includes(tip.id)
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => handleTipClick(tip.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h5 className="font-medium mb-1">{tip.title}</h5>
                          <p className="text-sm text-muted-foreground mb-2">
                            {tip.description}
                          </p>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {tip.example}
                          </code>
                        </div>
                        {selectedTips.includes(tip.id) && (
                          <Check className="w-5 h-5 text-primary flex-shrink-0" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <Alert>
            <Lightbulb className="w-4 h-4" />
            <AlertDescription>
              學校會提供預設密碼，請向老師詢問。建議在預設密碼基礎上加上個人化元素，
              建議你在此基礎上加入個人元素，創造一個更安全的密碼！
            </AlertDescription>
          </Alert>

          <Button 
            onClick={handleComplete} 
            className="w-full"
            disabled={strength === 'weak'}
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            {strength === 'weak' ? '密碼強度太弱' : '完成密碼設定'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface QuizComponentProps {
  questions: EmailQuestion[];
  onComplete: (score: number, correctCount: number) => void;
  title?: string;
  description?: string;
}

export function QuizComponent({ 
  questions, 
  onComplete, 
  title = 'Email 知識測驗',
  description = '測試你對 Email 的了解程度'
}: QuizComponentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [shuffledQuestions] = useState(() => shuffleArray(questions).slice(0, 5));

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    setIsAnswered(true);
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      const finalScore = Math.round((correctCount / shuffledQuestions.length) * 100);
      onComplete(finalScore, correctCount);
    }
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          <Progress value={progress} className="mt-4" />
          <p className="text-sm text-muted-foreground mt-2">
            題目 {currentQuestionIndex + 1} / {shuffledQuestions.length}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {currentQuestion.question}
            </h3>

            <RadioGroup
              value={selectedAnswer?.toString()}
              onValueChange={(value) => handleAnswerSelect(parseInt(value))}
              disabled={isAnswered}
            >
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrectAnswer = index === currentQuestion.correctAnswer;
                  const showCorrect = isAnswered && isCorrectAnswer;
                  const showIncorrect = isAnswered && isSelected && !isCorrect;

                  return (
                    <motion.div
                      key={index}
                      variants={hoverLift}
                      initial="rest"
                      whileHover={!isAnswered ? "hover" : "rest"}
                    >
                      <Label
                        htmlFor={`option-${index}`}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                          showCorrect
                            ? 'border-green-500 bg-green-50'
                            : showIncorrect
                            ? 'border-red-500 bg-red-50'
                            : isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem
                          value={index.toString()}
                          id={`option-${index}`}
                          disabled={isAnswered}
                        />
                        <span className="flex-1">{option}</span>
                        {showCorrect && <Check className="w-5 h-5 text-green-600" />}
                        {showIncorrect && <X className="w-5 h-5 text-red-600" />}
                      </Label>
                    </motion.div>
                  );
                })}
              </div>
            </RadioGroup>
          </div>

          <AnimatePresence>
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Alert variant={isCorrect ? 'default' : 'destructive'}>
                  {isCorrect ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  <AlertDescription>
                    <p className="font-semibold mb-2">
                      {isCorrect ? '答對了！' : '答錯了！'}
                    </p>
                    <p className="text-sm">{currentQuestion.explanation}</p>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2">
            {!isAnswered ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className="w-full"
              >
                <Check className="w-4 h-4 mr-2" />
                提交答案
              </Button>
            ) : (
              <Button onClick={handleNextQuestion} className="w-full">
                {currentQuestionIndex < shuffledQuestions.length - 1 ? (
                  <>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    下一題
                  </>
                ) : (
                  <>
                    <Trophy className="w-4 h-4 mr-2" />
                    查看成績
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            目前答對：{correctCount} / {currentQuestionIndex + (isAnswered ? 1 : 0)} 題
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}