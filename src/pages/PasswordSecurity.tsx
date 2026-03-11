import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { PasswordCreatorGame } from '@/components/GameComponents';
import { useGameProgress } from '@/hooks/useGameProgress';
import { calculatePasswordStrength } from '@/lib/index';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Shield, Lock, Eye, EyeOff, CheckCircle2, XCircle, AlertTriangle, Sparkles, Trophy, Target } from 'lucide-react';

interface PasswordTip {
  id: string;
  title: string;
  description: string;
  example: string;
  strength: 'weak' | 'medium' | 'strong';
}

const PASSWORD_TIPS: PasswordTip[] = [
  {
    id: 'tip-1',
    title: '使用混合字符',
    description: '結合大小寫字母、數字和特殊符號',
    example: 'Smes@2026!',
    strength: 'strong',
  },
  {
    id: 'tip-2',
    title: '足夠的長度',
    description: '至少 8 個字符，建議 12 個以上',
    example: 'MySchool2026',
    strength: 'medium',
  },
  {
    id: 'tip-3',
    title: '避免常見密碼',
    description: '不要使用 123456、password 等',
    example: '123456',
    strength: 'weak',
  },
  {
    id: 'tip-4',
    title: '創意組合',
    description: '用喜歡的事物創造獨特密碼',
    example: 'Basketball#7',
    strength: 'strong',
  },
  {
    id: 'tip-5',
    title: '定期更換',
    description: '建議每 3-6 個月更換一次密碼',
    example: 'Summer2026!',
    strength: 'medium',
  },
  {
    id: 'tip-6',
    title: '不要共用',
    description: '每個帳號使用不同的密碼',
    example: 'Email@Smes',
    strength: 'strong',
  },
];

const COMMON_WEAK_PASSWORDS = [
  '123456',
  'password',
  '12345678',
  'qwerty',
  'abc123',
  // 預設密碼由老師教授，不在網站中顯示
];

export default function PasswordSecurity() {
  const { progress, updateModuleProgress, addScore, unlockAchievement } = useGameProgress();
  const [currentSection, setCurrentSection] = useState<'learn' | 'create' | 'test'>('learn');
  const [testPassword, setTestPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [testResult, setTestResult] = useState<{
    strength: 'weak' | 'medium' | 'strong';
    feedback: string[];
    score: number;
  } | null>(null);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);

  useEffect(() => {
    if (progress && progress.passwordSecurityProgress < 10) {
      updateModuleProgress('password', 10);
    }
  }, [progress, updateModuleProgress]);

  const handlePasswordCreated = (score: number, password: string) => {
    setCreatedPassword(password);
    addScore(score);
    updateModuleProgress('password', Math.max(progress?.passwordSecurityProgress || 0, 50));
    
    if (calculatePasswordStrength(password) === 'strong') {
      unlockAchievement('password-master');
    }
  };

  const analyzePassword = (password: string) => {
    const feedback: string[] = [];
    let score = 0;

    if (COMMON_WEAK_PASSWORDS.includes(password.toLowerCase())) {
      feedback.push('❌ 這是常見的弱密碼，請避免使用');
      return { strength: 'weak' as const, feedback, score: 0 };
    }

    if (password.length >= 8) {
      feedback.push('✅ 長度足夠（8+ 字符）');
      score += 20;
    } else {
      feedback.push('❌ 密碼太短（建議至少 8 字符）');
    }

    if (password.length >= 12) {
      feedback.push('✅ 長度優秀（12+ 字符）');
      score += 10;
    }

    if (/[a-z]/.test(password)) {
      feedback.push('✅ 包含小寫字母');
      score += 15;
    } else {
      feedback.push('❌ 缺少小寫字母');
    }

    if (/[A-Z]/.test(password)) {
      feedback.push('✅ 包含大寫字母');
      score += 15;
    } else {
      feedback.push('⚠️ 建議加入大寫字母');
    }

    if (/[0-9]/.test(password)) {
      feedback.push('✅ 包含數字');
      score += 15;
    } else {
      feedback.push('⚠️ 建議加入數字');
    }

    if (/[^a-zA-Z0-9]/.test(password)) {
      feedback.push('✅ 包含特殊符號');
      score += 25;
    } else {
      feedback.push('⚠️ 建議加入特殊符號（如 !@#$%）');
    }

    const strength = calculatePasswordStrength(password);
    return { strength, feedback, score };
  };

  const handleTestPassword = () => {
    if (!testPassword) return;
    
    const result = analyzePassword(testPassword);
    setTestResult(result);
    
    if (result.strength === 'strong') {
      addScore(50);
      updateModuleProgress('password', 100);
      unlockAchievement('security-expert');
    } else if (result.strength === 'medium') {
      addScore(25);
      updateModuleProgress('password', Math.max(progress?.passwordSecurityProgress || 0, 75));
    }
  };

  const getStrengthColor = (strength: 'weak' | 'medium' | 'strong') => {
    switch (strength) {
      case 'weak':
        return 'text-destructive';
      case 'medium':
        return 'text-yellow-500';
      case 'strong':
        return 'text-green-500';
    }
  };

  const getStrengthBadge = (strength: 'weak' | 'medium' | 'strong') => {
    switch (strength) {
      case 'weak':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />弱</Badge>;
      case 'medium':
        return <Badge className="gap-1 bg-yellow-500 hover:bg-yellow-600"><AlertTriangle className="w-3 h-3" />中</Badge>;
      case 'strong':
        return <Badge className="gap-1 bg-green-500 hover:bg-green-600"><CheckCircle2 className="w-3 h-3" />強</Badge>;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
              <Shield className="w-5 h-5" />
              <span className="font-medium">密碼安全學習</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              創建安全密碼
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              學習如何創建強大且容易記憶的密碼，保護你的學校帳號安全
            </p>
            {progress && (
              <div className="mt-6 max-w-md mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">學習進度</span>
                  <span className="text-sm text-muted-foreground">{progress.passwordSecurityProgress}%</span>
                </div>
                <Progress value={progress.passwordSecurityProgress} className="h-2" />
              </div>
            )}
          </motion.div>

          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <Button
              variant={currentSection === 'learn' ? 'default' : 'outline'}
              onClick={() => setCurrentSection('learn')}
              className="gap-2"
            >
              <Target className="w-4 h-4" />
              密碼知識
            </Button>
            <Button
              variant={currentSection === 'create' ? 'default' : 'outline'}
              onClick={() => setCurrentSection('create')}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              創建密碼
            </Button>
            <Button
              variant={currentSection === 'test' ? 'default' : 'outline'}
              onClick={() => setCurrentSection('test')}
              className="gap-2"
            >
              <Trophy className="w-4 h-4" />
              測試密碼
            </Button>
          </div>

          {currentSection === 'learn' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" />
                    為什麼密碼安全很重要？
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    你的學校 Email 帳號包含重要的個人資料和學習記錄。一個強大的密碼可以：
                  </p>
                  <ul className="space-y-2 ml-6">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>保護你的個人資料不被他人盜用</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>防止他人冒用你的身份發送郵件</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>確保你的學習記錄和成績安全</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>養成良好的網路安全習慣</span>
                    </li>
                  </ul>
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">預設密碼提醒</p>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          學校會提供預設密碼，請向老師詢問。建議你在預設密碼基礎上加上個人化元素，
                          請務必在第一次登入後立即更改！
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PASSWORD_TIPS.map((tip, index) => (
                  <motion.div
                    key={tip.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{tip.title}</CardTitle>
                          {getStrengthBadge(tip.strength)}
                        </div>
                        <CardDescription>{tip.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">範例：</p>
                          <code className="font-mono text-sm">{tip.example}</code>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {currentSection === 'create' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto"
            >
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    創意密碼生成器
                  </CardTitle>
                  <CardDescription>
                    使用遊戲化的方式創建一個既安全又容易記憶的密碼
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PasswordCreatorGame onComplete={handlePasswordCreated} />
                  {createdPassword && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-6 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-green-900 dark:text-green-100 mb-2">密碼創建成功！</p>
                          <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                            你已經創建了一個安全的密碼。請記住這個密碼，並在登入學校 Email 時使用。
                          </p>
                          <div className="bg-white dark:bg-green-900/30 rounded p-3">
                            <p className="text-xs text-green-700 dark:text-green-300 mb-1">你的密碼：</p>
                            <code className="font-mono text-sm text-green-900 dark:text-green-100">{createdPassword}</code>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentSection === 'test' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    密碼強度測試
                  </CardTitle>
                  <CardDescription>
                    輸入一個密碼，看看它的安全程度如何
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">測試密碼</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={testPassword}
                        onChange={(e) => setTestPassword(e.target.value)}
                        placeholder="輸入要測試的密碼..."
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button onClick={handleTestPassword} disabled={!testPassword} className="w-full">
                    分析密碼強度
                  </Button>
                </CardContent>
              </Card>

              {testResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="border-2">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>分析結果</CardTitle>
                        {getStrengthBadge(testResult.strength)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">安全分數</span>
                          <span className={`text-sm font-bold ${getStrengthColor(testResult.strength)}`}>
                            {testResult.score}/100
                          </span>
                        </div>
                        <Progress value={testResult.score} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">詳細分析：</p>
                        <ul className="space-y-2">
                          {testResult.feedback.map((item, index) => (
                            <li key={index} className="text-sm text-muted-foreground">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {testResult.strength === 'strong' && (
                        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-green-900 dark:text-green-100 mb-1">太棒了！</p>
                              <p className="text-sm text-green-800 dark:text-green-200">
                                這是一個非常安全的密碼！繼續保持這個好習慣。
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      {testResult.strength === 'weak' && (
                        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                          <div className="flex items-start gap-2">
                            <XCircle className="w-5 h-5 text-red-600 dark:text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-red-900 dark:text-red-100 mb-1">需要改進</p>
                              <p className="text-sm text-red-800 dark:text-red-200">
                                這個密碼太弱了，建議參考密碼知識頁面的建議來創建更安全的密碼。
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}