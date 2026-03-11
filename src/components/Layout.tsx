import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Trophy, Mail, Lock, User, Home, BarChart3, ShoppingBag, Coins, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTE_PATHS } from '@/lib/index';
import { useGameProgress } from '@/hooks/useGameProgress';
import { useAuth } from '@/hooks/useAuth';
import { IMAGES } from '@/assets/images';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { springPresets } from '@/lib/motion';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: ROUTE_PATHS.HOME, label: '首頁', icon: Home },
  { path: ROUTE_PATHS.EMAIL_LEARNING, label: 'Email 學習', icon: Mail },
  { path: ROUTE_PATHS.STUDENT_ID_GAME, label: '學號記憶', icon: User },
  { path: ROUTE_PATHS.PASSWORD_SECURITY, label: '密碼安全', icon: Lock },
  { path: ROUTE_PATHS.LEARNING_ANALYTICS, label: '學習分析', icon: BarChart3 },
  { path: ROUTE_PATHS.LEADERBOARD, label: '班級排行榜', icon: Trophy },
  { path: ROUTE_PATHS.ACHIEVEMENTS, label: '成就', icon: Trophy },
  { path: ROUTE_PATHS.SHOP, label: '霓虹商城', icon: ShoppingBag },
];

export function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const { progress, studentInfo, setStudentInfo } = useGameProgress();
  const { profile, user, signOut } = useAuth();

  // 點外部關閉帳號選單
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalProgress = progress
    ? Math.round(
      (progress.emailLearningProgress +
        progress.studentIdGameProgress +
        progress.passwordSecurityProgress) /
      3
    )
    : 0;

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20 selection:text-primary">
      {/* Global Background Decorations */}
      <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[120px]" />
      </div>
      <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <NavLink
              to={ROUTE_PATHS.HOME}
              className="flex items-center gap-3 transition-transform hover:scale-105"
            >
              <div className="relative h-10 w-10 overflow-hidden rounded-xl">
                <img
                  src={IMAGES.CUTE_SCHOOL_BUILDING_20260310_002534_72}
                  alt="學校標誌"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground">Email 學習遊樂園</span>
                <span className="text-xs text-muted-foreground">桃園市石門國小</span>
              </div>
            </NavLink>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-300 relative group ${isActive
                        ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)] scale-105'
                        : 'text-muted-foreground hover:bg-primary/10 hover:text-primary hover:scale-105'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              {studentInfo && (
                <div className="hidden lg:flex items-center gap-3">
                  <NavLink to={ROUTE_PATHS.SHOP}>
                    <Card className="flex items-center gap-2 px-3 py-2 hover:bg-muted transition-colors cursor-pointer border-primary/20 bg-primary/5">
                      <Coins className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-black text-primary">{progress?.coins || 0}</span>
                    </Card>
                  </NavLink>

                  <Card className="flex items-center gap-3 px-4 py-2 bg-background/40 backdrop-blur-md border-primary/10 hover:border-primary/30 transition-all group">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-black">Student ID</span>
                      <span
                        className="font-mono text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent"
                        style={{ color: progress?.customization?.nameColor ? undefined : undefined, backgroundImage: progress?.customization?.nameColor ? `linear-gradient(to right, ${progress.customization.nameColor}, ${progress.customization.nameColor}dd)` : undefined }}
                      >
                        {studentInfo.studentId}
                      </span>
                    </div>
                    <div className="h-8 w-px bg-primary/10" />
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center w-24">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-black">Progress</span>
                        <span className="text-[10px] font-bold text-primary">{totalProgress}%</span>
                      </div>
                      <Progress value={totalProgress} className="h-1.5 w-24 bg-primary/10" />
                    </div>

                    <div className="h-8 w-px bg-border ml-1" />
                    {/* 帳號頭像 + 下拉選單 */}
                    <div className="relative" ref={accountMenuRef}>
                      <button
                        onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                        className={`w-10 h-10 rounded-xl overflow-hidden border-2 flex items-center justify-center bg-muted/50 transition-all hover:scale-105 focus:outline-none ${progress?.customization?.avatarFrame === 'neon-frame' ? 'border-cyan-400 shadow-[0_0_10px_#22d3ee]'
                          : progress?.customization?.avatarFrame === 'gold-frame' ? 'border-yellow-400 shadow-[0_0_10px_#facc15]'
                            : progress?.customization?.avatarFrame === 'matrix-frame' ? 'border-green-500 shadow-[0_0_10px_#22c55e]'
                              : 'border-border hover:border-primary/50'
                          }`}
                        title="帳號選單"
                      >
                        {(profile?.avatar_url || user?.user_metadata?.avatar_url) ? (
                          <img
                            src={profile?.avatar_url || user?.user_metadata?.avatar_url}
                            alt="大頭照"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <User className="w-6 h-6 text-muted-foreground" />
                        )}
                      </button>

                      {/* 下拉帳號選單 */}
                      <AnimatePresence>
                        {isAccountMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -8 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-12 w-52 bg-background/95 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl overflow-hidden z-50"
                          >
                            <div className="p-4 border-b border-primary/10">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-primary/20 flex-shrink-0">
                                  {(profile?.avatar_url || user?.user_metadata?.avatar_url) ? (
                                    <img
                                      src={profile?.avatar_url || user?.user_metadata?.avatar_url}
                                      alt="大頭照"
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-muted">
                                      <User className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                  <span className="text-sm font-bold text-foreground truncate">
                                    {profile?.display_name || user?.user_metadata?.full_name || '使用者'}
                                  </span>
                                  <span className="text-xs text-muted-foreground truncate">
                                    {user?.email || ''}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="p-2">
                              <button
                                onClick={async () => {
                                  setStudentInfo(null);
                                  await signOut();
                                  setIsAccountMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                              >
                                <LogOut className="w-4 h-4" />
                                登出帳號
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Card>
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={springPresets.gentle}
            className="md:hidden border-b border-primary/20 bg-background/90 backdrop-blur-xl"
          >
            <nav className="container mx-auto px-4 py-6 flex flex-col gap-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-4 rounded-xl px-5 py-4 text-base font-bold transition-all ${isActive
                        ? 'bg-primary text-primary-foreground shadow-lg scale-[1.02]'
                        : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                      }`
                    }
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </NavLink>
                );
              })}

              {studentInfo && (
                <Card className="mt-6 p-5 bg-primary/5 border-primary/20 shadow-inner">
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-black">Student ID</span>
                        <p
                          className="font-mono text-lg font-bold"
                          style={{ color: progress?.customization?.nameColor }}
                        >
                          {studentInfo.studentId}
                        </p>
                      </div>
                      <div className="bg-primary/20 px-4 py-2 rounded-2xl flex items-center gap-2 border border-primary/30 shadow-sm">
                        <Coins className="w-4 h-4 text-amber-500 animate-pulse" />
                        <span className="text-lg font-black text-primary">{progress?.coins || 0}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-black">Total Progress</span>
                        <span className="text-sm font-bold text-primary">{totalProgress}%</span>
                      </div>
                      <Progress value={totalProgress} className="h-2.5 bg-primary/10" />
                    </div>
                  </div>
                </Card>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="container mx-auto px-4 py-8 relative z-10"
      >
        {children}
      </motion.main>

      <footer className="border-t border-border bg-muted/30 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-2">
                <div className="relative h-8 w-8 overflow-hidden rounded-lg">
                  <img
                    src={IMAGES.CUTE_SCHOOL_BUILDING_20260310_002534_72}
                    alt="學校標誌"
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="font-semibold">桃園市石門國小</span>
              </div>
              <p className="text-sm text-muted-foreground text-center md:text-left">
                透過遊戲化學習，輕鬆記住學校 Email 信箱
              </p>
            </div>

            <div className="flex flex-col items-center md:items-end gap-2">
              <p className="text-sm text-muted-foreground">
                Email: <span className="font-mono">@mail2.smes.tyc.edu.tw</span>
              </p>
              <p className="text-xs text-muted-foreground">© 2026 桃園市石門國小. 版權所有</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
