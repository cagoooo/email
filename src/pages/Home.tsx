import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Trophy, Lock, Target, ArrowRight, Sparkles, Calendar, Brain, User, ShoppingBag } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { ProgressCard, LearningModuleCard } from '@/components/GameCards';
import { DailyChallengeCard, ChallengeStreak } from '@/components/DailyChallengeCard';
import { AITipCard, SmartRecommendation } from '@/components/AITipCard';
import { useGameProgress } from '@/hooks/useGameProgress';
import { useAITips } from '@/hooks/useAITips';
import { useDailyChallenges } from '@/hooks/useDailyChallenges';
import { useLearningAnalytics } from '@/hooks/useLearningAnalytics';
import { useAuth } from '@/hooks/useAuth';
import {
  ROUTE_PATHS,
  getProgressPercentage,
  validateStudentId,
  generateEmailAddress
} from '@/lib/index';
import { IMAGES } from '@/assets/images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { springPresets, fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';

export default function Home() {
  const navigate = useNavigate();
  const { progress, studentInfo, isLoading: isProgressLoading, setStudentInfo } = useGameProgress();
  const { signInWithGoogle, user, profile, loading: isAuthLoading, signOut } = useAuth();
  const [localStudentId, setLocalStudentId] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const [loginStep, setLoginStep] = React.useState(0);
  const LOGIN_STEPS = ['連結 Google...', '驗證身份中...', '開啟大門...'];

  // 登入中循環步驟文字
  React.useEffect(() => {
    if (!isLoggingIn) { setLoginStep(0); return; }
    const iv = setInterval(() => setLoginStep(s => (s + 1) % LOGIN_STEPS.length), 1400);
    return () => clearInterval(iv);
  }, [isLoggingIn]);
  const { currentTip, showTip, dismissTip, getSmartRecommendation } = useAITips();
  const { todayChallenge, streak, getTotalRewards } = useDailyChallenges();
  const { analytics } = useLearningAnalytics(studentInfo?.studentId || '');

  // 偵錯日誌
  React.useEffect(() => {
    console.log("Home 狀態更新 - ProgressLoading:", isProgressLoading, "AuthLoading:", isAuthLoading, "HasProfile:", !!profile, "HasStudentInfo:", !!studentInfo);
  }, [isProgressLoading, isAuthLoading, !!profile, !!studentInfo]);

  // 安全機制 A：當有資料但仍在 Loading 時，3 秒後強制解除
  const [safetyCleared, setSafetyCleared] = React.useState(false);
  React.useEffect(() => {
    if ((isProgressLoading || isAuthLoading) && (profile || studentInfo)) {
      const timer = setTimeout(() => {
        console.warn("Safety timeout: Loading persists, forcing clear since data exists.");
        setSafetyCleared(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isProgressLoading, isAuthLoading, !!profile, !!studentInfo]);

  // 安全機制 B：無條件最長等待 4 秒，確保匿名訪客不會永久轉圈
  const [maxTimeoutCleared, setMaxTimeoutCleared] = React.useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => {
      console.warn("Max timeout: Forcing loading clear after 4 seconds.");
      setMaxTimeoutCleared(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []); // 只在 mount 時執行一次

  // 決定最終載入狀態：任何一個解除條件滿足就停止轉圈
  const isGlobalLoading = !safetyCleared && !maxTimeoutCleared && (isProgressLoading || isAuthLoading) && !profile;

  // 當 Supabase Profile 載入時，自動同步到 StudentInfo
  // 加入 user(登入狀態)雙重檢查：避免登出後 profile=null 前就出現重設鼓環
  React.useEffect(() => {
    if (user && profile && !studentInfo) {
      console.log("偵測到 Supabase Profile，同步至遊戲狀態:", profile.display_name);
      setStudentInfo({
        studentId: profile.student_id || profile.display_name || '使用者',
        email: user.email || '',
        hasCustomPassword: true,
      });
    }
  }, [user, profile, studentInfo, setStudentInfo]);

  const handleStartAdventure = () => {
    if (!validateStudentId(localStudentId)) {
      setError('請輸入正確的學號格式（7 位數字）');
      return;
    }
    setError('');
    setStudentInfo({
      studentId: localStudentId,
      email: generateEmailAddress(localStudentId),
      hasCustomPassword: false,
    });
  };

  const totalProgress = progress
    ? getProgressPercentage(
      progress.emailLearningProgress +
      progress.studentIdGameProgress +
      progress.passwordSecurityProgress,
      300
    )
    : 0;

  // 顯示歡迎提示
  React.useEffect(() => {
    if (studentInfo && !currentTip) {
      if (totalProgress === 0) {
        showTip('first_visit', progress);
      } else {
        showTip('return_user', progress);
      }
    }
  }, [studentInfo, totalProgress]);

  // 顯示進度鼓勵
  React.useEffect(() => {
    if (progress && totalProgress > 50 && totalProgress < 100) {
      showTip('good_progress', progress);
    }
  }, [totalProgress]);

  const modules = [
    {
      id: 'email',
      title: 'Email 學習',
      description: '學習學校 Email 地址的組成和使用方式',
      icon: <Mail className="w-6 h-6" />,
      progress: progress?.emailLearningProgress || 0,
      route: ROUTE_PATHS.EMAIL_LEARNING,
      color: 'from-primary to-accent',
    },
    {
      id: 'studentId',
      title: '學號記憶遊戲',
      description: '透過有趣的遊戲記住你的學號',
      icon: <Target className="w-6 h-6" />,
      progress: progress?.studentIdGameProgress || 0,
      route: ROUTE_PATHS.STUDENT_ID_GAME,
      color: 'from-accent to-primary',
    },
    {
      id: 'password',
      title: '密碼安全',
      description: '學習創建安全且容易記住的密碼',
      icon: <Lock className="w-6 h-6" />,
      progress: progress?.passwordSecurityProgress || 0,
      route: ROUTE_PATHS.PASSWORD_SECURITY,
      color: 'from-primary/80 to-accent/80',
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background Mesh */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px] animate-mesh-gradient" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[100px] animate-mesh-gradient [animation-delay:2s]" />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-400/5 blur-[80px] animate-pulse" />
        </div>

        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          {/* 今日之星跑馬燈 */}
          {studentInfo && (
            <div className="bg-primary/10 border-b border-primary/20 py-2 relative overflow-hidden">
              <motion.div
                className="flex whitespace-nowrap gap-12"
                animate={{ x: [0, -1000] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              >
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 text-sm font-bold text-primary">
                    <Sparkles className="w-4 h-4" />
                    <span>恭喜 1234567 同學剛剛兌換了「黃金榮耀框」！</span>
                    <Trophy className="w-4 h-4" />
                    <span>恭喜 2345678 同學完成「終極挑戰」獲得 100 積分！</span>
                    <ShoppingBag className="w-4 h-4 text-accent" />
                    <span>恭喜 {studentInfo.studentId} 同學來到霓虹商城！</span>
                  </div>
                ))}
              </motion.div>
            </div>
          )}

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="max-w-4xl mx-auto text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springPresets.gentle}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white shadow-sm border border-primary/10 text-primary mb-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={springPresets.snappy}
              >
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span className="text-sm font-bold tracking-wide">SHIMEN ELEMENTARY SCHOOL</span>
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-flow bg-[length:200%_auto]">
                  學習你的學校 Email
                </span>
              </h1>
              <p className="text-xl text-muted-foreground/80 mb-12 max-w-2xl mx-auto font-medium">
                歡迎來到 Email 學習遊樂園！<br />
                透過活潑有趣的遊戲，輕鬆掌握校園科技生活必備技能。
              </p>

              {isGlobalLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
                  </div>
                </div>
              ) : (
                <motion.div
                  className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...springPresets.gentle, delay: 0.3 }}
                >
                  {studentInfo ? (
                    <Card className="p-8 bg-white/60 backdrop-blur-xl border-white/40 shadow-xl rounded-3xl animate-float w-full max-w-md">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden border-2 border-primary/20">
                          {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-10 h-10 text-primary" />
                          )}
                        </div>
                        <h3
                          className="text-2xl font-bold mb-1"
                          style={{ color: progress?.customization?.nameColor }}
                        >
                          哈囉，{studentInfo.studentId}！
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">學號：{studentInfo.studentId}</p>
                        <div className="flex items-center gap-2 justify-center text-muted-foreground mt-2">
                          <div className="h-1.5 w-32 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary progress-bar-animated"
                              style={{ width: `${totalProgress}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold">{totalProgress}%</span>
                        </div>
                        <div className="flex gap-2 justify-center mt-6">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-primary transition-colors"
                            onClick={() => {
                              console.log("登出按鈕點擊 - 開始執行清理與登出");
                              setStudentInfo(null);
                              signOut();
                            }}
                          >
                            登出帳號
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <Card className="w-full max-w-md p-8 bg-white/40 backdrop-blur-xl border-white/40 shadow-2xl rounded-3xl hover:bg-white/60 transition-colors">
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold mb-2">開始冒險之旅</h3>
                        <p className="text-muted-foreground">輸入你的學號，開啟專屬學習地圖</p>
                      </div>
                      <div className="space-y-4">
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                          <input
                            type="text"
                            placeholder="請輸入 7 位學號"
                            className="w-full h-14 pl-12 pr-4 bg-white/50 border-2 border-primary/10 rounded-2xl focus:border-primary/40 focus:bg-white transition-all outline-none font-bold text-lg"
                            value={localStudentId}
                            onChange={(e) => setLocalStudentId(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleStartAdventure()}
                          />
                        </div>
                        {error && (
                          <motion.p
                            className="text-red-500 text-sm font-bold mt-1"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                          >
                            ⚠️ {error}
                          </motion.p>
                        )}
                        <Button
                          className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all bg-primary hover:bg-primary/90"
                          onClick={handleStartAdventure}
                          disabled={isLoggingIn}
                        >
                          立即啟程 <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>

                        <div className="relative my-6">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-muted" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white/40 px-2 text-muted-foreground font-bold">或使用第三方登入</span>
                          </div>
                        </div>

                        {/* Google 登入按鈕 - 全面升級版 */}
                        <div className="relative">
                          {/* 脆財光環 - 登入中時顯示 */}
                          {isLoggingIn && (
                            <div className="absolute -inset-1 rounded-3xl overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 opacity-60 animate-spin [animation-duration:3s]" style={{ filter: 'blur(8px)' }} />
                            </div>
                          )}
                          <motion.button
                            className={`relative w-full h-14 text-base font-bold rounded-2xl border-2 flex items-center justify-center gap-3 transition-colors overflow-hidden ${isLoggingIn
                              ? 'bg-white border-white/80 text-gray-500 cursor-not-allowed shadow-lg'
                              : 'bg-white/80 border-white/60 hover:bg-white hover:border-primary/30 shadow-md hover:shadow-xl text-gray-700'
                              }`}
                            whileHover={!isLoggingIn ? { scale: 1.02 } : {}}
                            whileTap={!isLoggingIn ? { scale: 0.97 } : {}}
                            onClick={() => {
                              if (isLoggingIn) return;
                              setIsLoggingIn(true);
                              signInWithGoogle().finally(() => setIsLoggingIn(false));
                            }}
                            disabled={isLoggingIn}
                          >
                            {/* 登入中: 動態內容 */}
                            <AnimatePresence mode="wait">
                              {isLoggingIn ? (
                                <motion.div
                                  key="loading"
                                  className="flex items-center gap-3"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {/* Google 彩色圓形轉圈 */}
                                  <div className="relative w-6 h-6">
                                    <svg className="absolute inset-0 animate-spin" viewBox="0 0 24 24" fill="none">
                                      <circle cx="12" cy="12" r="10" stroke="#e5e7eb" strokeWidth="3" />
                                      <path d="M12 2a10 10 0 0 1 10 10" stroke="url(#g)" strokeWidth="3" strokeLinecap="round" />
                                      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#4285F4" /><stop offset="100%" stopColor="#EA4335" /></linearGradient></defs>
                                    </svg>
                                  </div>
                                  <motion.span
                                    key={loginStep}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.3 }}
                                    className="font-bold text-gray-600"
                                  >
                                    {LOGIN_STEPS[loginStep]}
                                  </motion.span>
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="idle"
                                  className="flex items-center gap-3"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                  </svg>
                                  <span>使用 Google 帳號登入</span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        </div>

                        {/* 登入中提示文字 */}
                        <AnimatePresence>
                          {isLoggingIn && (
                            <motion.p
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              className="text-center text-xs text-muted-foreground mt-2"
                            >
                              ⏳ 即將跳轉到 Google 登入頁面，請稍候...
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </Card>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        {/* AI 提示卡片 */}
        {
          currentTip && (
            <AITipCard tip={currentTip} onDismiss={dismissTip} />
          )
        }

        {
          studentInfo && progress && (
            <>
              {/* 智能推薦區塊 */}
              <section className="py-8">
                <div className="container mx-auto px-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={springPresets.gentle}
                  >
                    <SmartRecommendation
                      recommendation={getSmartRecommendation(progress)}
                      className="max-w-4xl mx-auto"
                    />
                  </motion.div>
                </div>
              </section>

              {/* 每日挑戰區塊 */}
              {todayChallenge && (
                <section className="py-8 bg-gradient-to-r from-primary/5 to-accent/5">
                  <div className="container mx-auto px-4">
                    <motion.div
                      className="max-w-6xl mx-auto"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={springPresets.gentle}
                    >
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                          <Calendar className="w-6 h-6" />
                          今日挑戰
                        </h2>
                        <p className="text-muted-foreground">
                          完成每日挑戰，獲得額外獎勵！
                        </p>
                      </div>

                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                          <DailyChallengeCard
                            challenge={todayChallenge}
                            streak={streak}
                            onStart={() => {
                              // 根據挑戰類型導航到對應頁面
                              // mixed（綜合挑戰）導向 Email 學習，不再導回首頁
                              const routes: Record<string, string> = {
                                email: ROUTE_PATHS.EMAIL_LEARNING,
                                studentId: ROUTE_PATHS.STUDENT_ID_GAME,
                                password: ROUTE_PATHS.PASSWORD_SECURITY,
                                mixed: ROUTE_PATHS.EMAIL_LEARNING,
                              };
                              navigate(routes[todayChallenge.type] || ROUTE_PATHS.EMAIL_LEARNING);
                            }}
                          />
                        </div>
                        <div>
                          <ChallengeStreak
                            streak={streak}
                            totalRewards={getTotalRewards()}
                          />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </section>
              )}

              {/* 學習進度區塊 */}
              <section className="py-16 bg-muted/30">
                <div className="container mx-auto px-4">
                  <motion.div
                    className="max-w-6xl mx-auto"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div variants={staggerItem} className="text-center mb-12">
                      <h2 className="text-3xl font-bold mb-4">你的學習進度</h2>
                      <p className="text-muted-foreground">
                        學號：{studentInfo.studentId} | Email：{studentInfo.email}
                      </p>
                    </motion.div>

                    <motion.div variants={staggerItem} className="mb-12">
                      <ProgressCard
                        title="總體進度"
                        description="完成所有學習模組以解鎖全部成就"
                        progress={totalProgress}
                        icon={<Trophy className="w-6 h-6" />}
                        color="primary"
                      />
                    </motion.div>

                    <motion.div
                      className="grid md:grid-cols-3 gap-6"
                      variants={staggerContainer}
                    >
                      {modules.map((module) => (
                        <motion.div key={module.id} variants={staggerItem}>
                          <Link to={module.route}>
                            <Card className="h-full hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer group">
                              <CardHeader>
                                <div
                                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}
                                >
                                  {module.icon}
                                </div>
                                <CardTitle className="group-hover:text-primary transition-colors">
                                  {module.title}
                                </CardTitle>
                                <CardDescription>{module.description}</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <ProgressCard
                                  title="進度"
                                  description={`${getProgressPercentage(module.progress, 100)}% 完成`}
                                  progress={getProgressPercentage(module.progress, 100)}
                                  icon={<Target className="w-4 h-4" />}
                                />
                              </CardContent>
                            </Card>
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                </div>
              </section>
            </>
          )
        }

        {/* 為什麼要學習 Email 區塊 */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-6xl mx-auto"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={springPresets.gentle}
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">為什麼要學習 Email？</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  學校 Email 是你在校園中重要的溝通工具
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-primary" />
                        接收重要通知
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        學校會透過 Email 發送課程資訊、活動通知和重要公告
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-accent" />
                        提交作業
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        許多老師會要求使用學校 Email 提交作業和報告
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-primary" />
                        安全通訊
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        學校 Email 提供安全的通訊環境，保護你的個人資訊
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="relative">
                  <img
                    src={IMAGES.KIDS_PLAYING_GAMES_20260310_002534_75}
                    alt="遊戲化學習"
                    className="w-full h-auto rounded-2xl shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent rounded-2xl" />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 開始學習 CTA */}
        {
          studentInfo && (
            <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
              <div className="container mx-auto px-4">
                <motion.div
                  className="max-w-4xl mx-auto text-center"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={springPresets.gentle}
                >
                  <h2 className="text-3xl font-bold mb-6">準備好開始了嗎？</h2>
                  <p className="text-xl text-muted-foreground mb-8">
                    選擇一個學習模組，開始你的 Email 學習之旅
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center">
                    {modules.map((module) => (
                      <Link key={module.id} to={module.route}>
                        <Button size="lg" variant="outline" className="group">
                          {module.icon}
                          <span className="ml-2">{module.title}</span>
                          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              </div>
            </section>
          )
        }
      </div >
    </Layout >
  );
}