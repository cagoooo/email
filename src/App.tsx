import { useState, useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { ROUTE_PATHS } from "@/lib/index";
import { Loader2 } from "lucide-react";

// 核心頁面保持靜態導入，確保首屏速度
import Home from "@/pages/Home";

// 非核心/管理端頁面改為延遲載入 (Lazy Loading)
const EmailLearning = lazy(() => import("@/pages/EmailLearning"));
const StudentIdGame = lazy(() => import("@/pages/StudentIdGame"));
const PasswordSecurity = lazy(() => import("@/pages/PasswordSecurity"));
const Achievements = lazy(() => import("@/pages/Achievements"));
const LearningAnalytics = lazy(() => import("@/pages/LearningAnalytics"));
const Leaderboard = lazy(() => import("@/pages/Leaderboard"));
const TeacherDashboard = lazy(() => import("@/pages/TeacherDashboard"));
const ParentDashboard = lazy(() => import("@/pages/ParentDashboard"));
const Shop = lazy(() => import("@/pages/Shop"));

// 統一的載入轉場元件
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <Loader2 className="w-10 h-10 text-primary animate-spin" />
    <p className="text-sm font-bold text-muted-foreground animate-pulse">正在載入冒險關卡...</p>
  </div>
);

const queryClient = new QueryClient();

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// 處理 Supabase 認證後的 Hash 網址衝突 (HashRouter 相容性)
const AuthHandler = (): null => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 5;

    const handleAuthRedirect = async () => {
      // 檢查 Hash 中是否包含 access_token (Supabase 回傳格式)
      if (window.location.hash.includes("access_token=")) {
        console.log("偵測到認證 Token，正在等待 Supabase 處理...");

        // 嘗試獲取 Session，確保 SDK 已經解析了 Hash
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          console.log("認證成功，正在清理網址並跳轉...");
          toast.success("登入成功！");
          // 清理 Hash 並導向首頁，讓 Supabase SDK 能在背景處理 Token
          navigate("/", { replace: true });
        } else if (retryCount < maxRetries) {
          // 如果還沒拿到 session，稍微等一下再試
          retryCount++;
          console.log(`尚未取得 Session，第 ${retryCount} 次重試...`);
          setTimeout(handleAuthRedirect, 500);
        } else {
          console.warn("已達最大重試次數，仍未取得 Session。");
        }
      }
    };

    handleAuthRedirect();
  }, [location, navigate]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <AuthHandler />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path={ROUTE_PATHS.HOME} element={<Home />} />
            <Route path={ROUTE_PATHS.EMAIL_LEARNING} element={<EmailLearning />} />
            <Route path={ROUTE_PATHS.STUDENT_ID_GAME} element={<StudentIdGame />} />
            <Route path={ROUTE_PATHS.PASSWORD_SECURITY} element={<PasswordSecurity />} />
            <Route path={ROUTE_PATHS.LEARNING_ANALYTICS} element={<LearningAnalytics />} />
            <Route path={ROUTE_PATHS.ACHIEVEMENTS} element={<Achievements />} />
            <Route path={ROUTE_PATHS.LEADERBOARD} element={<Leaderboard />} />
            <Route path={ROUTE_PATHS.TEACHER_DASHBOARD} element={<TeacherDashboard />} />
            <Route path={ROUTE_PATHS.PARENT_DASHBOARD} element={<ParentDashboard />} />
            <Route path={ROUTE_PATHS.SHOP} element={<Shop />} />
          </Routes>
        </Suspense>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;