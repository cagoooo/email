# 📧 石門國小電子郵件學習平台 — 完整使用說明手冊

> 版本：v1.0.1 ｜ 更新日期：2026-03-12  
> 適用對象：教師、管理員、開發人員

---

## 📋 目錄

1. [專案簡介](#1-專案簡介)
2. [技術架構](#2-技術架構)
3. [目錄結構說明](#3-目錄結構說明)
4. [功能頁面詳解](#4-功能頁面詳解)
5. [環境設定與本機啟動](#5-環境設定與本機啟動)
6. [Supabase 後端設定](#6-supabase-後端設定)
7. [認證系統說明](#7-認證系統說明)
8. [PWA 與 Service Worker](#8-pwa-與-service-worker)
9. [常見問題 FAQ](#9-常見問題-faq)

---

## 1. 專案簡介

**石門國小電子郵件學習平台** 是一個專為國小學生設計的互動式數位教育平台，幫助學生：

- 🎓 **學習學校 Email（`@mail2.smes.tyc.edu.tw`）** 的組成結構與使用方式
- 🆔 **透過遊戲記憶學號**，強化身份識別概念
- 🔐 **學習密碼安全知識**，建立良好的資安習慣
- 🏆 **收集成就與點數**，提升學習動機
- 📊 **教師/家長端儀表板**，即時掌握學習進度

---

## 2. 技術架構

| 層級 | 使用技術 |
|------|----------|
| 前端框架 | React 18 + TypeScript 5 |
| 建構工具 | Vite 5 + `@vitejs/plugin-react-swc` |
| UI 元件庫 | shadcn-ui（基於 Radix UI）|
| 樣式系統 | Tailwind CSS v4 |
| 狀態管理 | React Query（伺服器狀態）+ Zustand（本地狀態）|
| 路由系統 | React Router DOM v6（HashRouter 模式）|
| 後端服務 | Supabase（資料庫 + 認證 + Edge Functions）|
| 動畫效果 | Framer Motion |
| PWA 支援 | 自訂 Service Worker |
| 圖示庫 | Lucide React + React Icons + Iconify |

---

## 3. 目錄結構說明

```
h:\email\
├── .env                          # ⚠️ 環境變數（勿上傳 Git）
├── .gitignore                    # Git 排除規則
├── index.html                    # HTML 進入點
├── vite.config.ts                # Vite 設定（含 CDN 圖片替換 Plugin）
├── package.json                  # 套件設定
├── tsconfig.app.json             # TypeScript 設定
├── components.json               # shadcn-ui 設定
│
├── public/                       # 靜態資源（不經 Vite 處理）
│   ├── sw.js                     # Service Worker（PWA 離線快取）
│   ├── manifest.json             # PWA 應用程式清單
│   ├── offline.html              # 離線備用頁面
│   ├── favicon.ico / favicon.png
│   ├── og-image.png              # 社群分享預覽圖
│   └── images/                   # 公開圖片資料夾（支援 CDN 替換）
│
├── src/
│   ├── main.tsx                  # 應用程式根入口點
│   ├── App.tsx                   # 路由設定 + Supabase 認證 Handler
│   ├── index.css                 # 全域樣式
│   ├── vite-env.d.ts             # Vite 型別宣告
│   ├── serviceWorker.ts          # SW 管理工具（開發環境排除）
│   │
│   ├── pages/                    # 各頁面（每頁為獨立 TSX 元件）
│   │   ├── Home.tsx              # 首頁（學習中心）
│   │   ├── EmailLearning.tsx     # Email 學習頁面
│   │   ├── StudentIdGame.tsx     # 學號記憶遊戲
│   │   ├── PasswordSecurity.tsx  # 密碼安全頁面
│   │   ├── Achievements.tsx      # 成就系統頁面
│   │   ├── LearningAnalytics.tsx # 學習分析儀表板
│   │   ├── Leaderboard.tsx       # 排行榜頁面
│   │   ├── Shop.tsx              # 商店頁面（用點數購買外觀）
│   │   ├── TeacherDashboard.tsx  # 教師管理介面
│   │   └── ParentDashboard.tsx   # 家長監控介面
│   │
│   ├── components/               # 可重用元件
│   │   ├── Layout.tsx            # 頁面外框（導覽列 + 頁尾）
│   │   ├── GameComponents.tsx    # 遊戲相關元件
│   │   ├── GameCards.tsx         # 關卡卡片元件
│   │   ├── AITipCard.tsx         # AI 建議卡片
│   │   ├── DailyChallengeCard.tsx# 每日挑戰卡片
│   │   ├── ClassLeaderboard.tsx  # 班級排行榜
│   │   ├── LearningDashboard.tsx # 學習儀表板
│   │   ├── TeacherDashboard.tsx  # 教師儀表板元件
│   │   ├── ParentDashboard.tsx   # 家長儀表板元件
│   │   ├── ErrorBoundary.tsx     # 錯誤邊界元件
│   │   └── ui/                   # shadcn-ui 基礎元件（49 個）
│   │
│   ├── hooks/                    # React Custom Hooks
│   │   ├── useAuth.ts            # 認證狀態（登入/登出/Google OAuth）
│   │   ├── useGameProgress.ts    # 遊戲進度管理
│   │   ├── useLeaderboard.ts     # 排行榜資料
│   │   ├── useLearningAnalytics.ts # 學習分析
│   │   ├── useCloudSync.ts       # 雲端同步
│   │   ├── useAITips.ts          # AI 提示系統
│   │   ├── useDailyChallenges.ts # 每日挑戰系統
│   │   ├── use-mobile.tsx        # 響應式斷點偵測
│   │   └── use-toast.ts          # 吐司通知
│   │
│   ├── data/
│   │   └── index.ts              # 靜態資料（題庫、成就、商品、關卡定義）
│   │
│   ├── lib/
│   │   ├── index.ts              # 型別定義 + 工具函數 + 路由路徑常數
│   │   ├── motion.ts             # Framer Motion 動畫設定
│   │   ├── react-router-dom-proxy.tsx # 路由訊息傳遞代理
│   │   └── utils.ts              # 通用工具（cn 函數）
│   │
│   ├── api/                      # API 模組（Supabase 呼叫封裝）
│   ├── assets/                   # 靜態資源（由 Vite 打包處理）
│   └── integrations/
│       └── supabase/
│           └── client.ts         # Supabase Client 初始化
│
├── supabase/                     # Supabase 專案設定
│   ├── migrations/               # 資料庫遷移 SQL 腳本（4個）
│   └── edge_function/            # Deno Edge Functions
│
└── examples/                     # 第三方整合範例
    └── third-party-integrations/
```

---

## 4. 功能頁面詳解

### 🏠 首頁（Home）— `/`
- 學習中心入口，顯示三大學習模組卡片
- 顯示個人學習進度摘要（已解鎖成就數、總點數）
- 提供每日挑戰入口與 AI 建議提示
- 快速跳轉至各功能頁面

### 📧 Email 學習（EmailLearning）— `/email-learning`
- **10 題 Email 知識測驗**（單選題 + 解析說明）
- 學習學校 Email 格式：`學號@mail2.smes.tyc.edu.tw`
- 每題完成後即時顯示正確/錯誤的動畫回饋
- 通關後解鎖「Email 大師」成就 + 獲得點數

### 🎓 學號記憶遊戲（StudentIdGame）— `/student-id-game`
- 互動遊戲幫助學生記憶自己的 7 位數學號
- 包含多種記憶練習模式
- 滿分可解鎖「學號專家」成就

### 🔐 密碼安全（PasswordSecurity）— `/password-security`
- 密碼安全知識教學（10 個密碼安全技巧）
- 即時密碼強度計算器（弱/中/強三級評估）
- 強度規則：長度8+、大小寫、數字、特殊符號
- 通關可解鎖「密碼守護者」成就

### 🏆 成就系統（Achievements）— `/achievements`
共 10 個可解鎖成就：

| 成就名稱 | 觸發條件 |
|----------|----------|
| 初次登入 | 完成第一次學習 |
| Email 大師 | 完成所有 Email 關卡 |
| 學號專家 | 學號遊戲滿分 |
| 密碼守護者 | 創建強度「強」的密碼 |
| 速度學習者 | 10 分鐘內完成一個關卡 |
| 完美分數 | 任一測驗 100 分 |
| 堅持學習 | 連續 3 天登入 |
| 全能學習者 | 完成所有學習模組 |
| 樂於助人 | 幫助 5 位同學 |
| 終極冠軍 | 解鎖所有成就 |

### 🛒 商店（Shop）— `/shop`
使用學習獲得的「點數」購買外觀自定義物品：

| 物品 | 點數 | 類型 |
|------|------|------|
| 霓虹電光框 | 300 | 頭像框 |
| 黃金榮耀框 | 500 | 頭像框 |
| 矩陣代碼框 | 800 | 頭像框 |
| 青空之藍 | 150 | 學號顏色 |
| 幻紫星雲 | 150 | 學號顏色 |
| 烈焰之紅 | 200 | 學號顏色 |

### 📊 學習分析（LearningAnalytics）— `/learning-analytics`
- 個人學習報告（總學習時間、連續天數）
- 強弱項分析與改善建議
- 每週進度圖表（Recharts）
- 常見錯誤模式分析

### 🏅 排行榜（Leaderboard）— `/leaderboard`
- 班級點數排行榜
- 即時更新（Supabase Realtime）

### 👩‍🏫 教師儀表板（TeacherDashboard）— `/teacher`
- 班級整體學習進度一覽
- 個別學生詳細報告
- 家長聯絡管理

### 👨‍👧 家長儀表板（ParentDashboard）— `/parent`
- 子女學習成果追蹤
- 成就解鎖通知

---

## 5. 環境設定與本機啟動

### 前置需求

| 工具 | 版本需求 |
|------|----------|
| Node.js | ≥ 18.0.0 |
| npm | ≥ 9.0.0（或 pnpm） |
| Supabase CLI | 最新版（選用，用於 Edge Functions）|

### 步驟一：安裝依賴套件

```bash
# 進入專案目錄
cd h:\email

# 安裝依賴（使用 npm）
npm install
```

### 步驟二：設定環境變數

在專案根目錄建立或確認 `.env` 檔案存在：

```env
# Supabase 連線設定
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Google OAuth（可選）
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret
```

> ⚠️ **重要**：`.env` 已列於 `.gitignore`，請勿將真實金鑰上傳至 Git。

### 步驟三：啟動開發伺服器

```bash
npm run dev
```

瀏覽器開啟 `http://localhost:8080`

### 常用指令

| 指令 | 說明 |
|------|------|
| `npm run dev` | 啟動開發伺服器（含路由訊息功能）|
| `npm run build` | 正式打包（輸出至 `dist/`）|
| `npm run build:dev` | 開發模式打包（含 sourcemap）|
| `npm run preview` | 預覽打包結果 |
| `npm run lint` | 執行 ESLint 程式碼檢查 |
| `npm run test:edge-functions` | 測試 Supabase Edge Functions |

---

## 6. Supabase 後端設定

### 資料庫資料表（由遷移 SQL 建立）

| 資料表名稱 | 說明 |
|-----------|------|
| `user_profiles_20260310` | 使用者基本資料（角色、學號、班級等）|
| `classes_20260310` | 班級資料（年級、班名、授課教師）|
| 其他工具資料表 | 根據遷移 SQL 建立 |

### 執行資料庫遷移

```bash
# 使用 Supabase CLI 執行遷移
supabase db push

# 或直接在 Supabase Dashboard 的 SQL Editor 貼入以下檔案內容：
# 1. supabase/migrations/create_user_management_tables_20260310.sql
# 2. supabase/migrations/create_utility_functions_20260310.sql
# 3. supabase/migrations/setup_rls_policies_20260310.sql
# 4. supabase/migrations/insert_demo_data_20260310.sql
```

### RLS（行列安全政策）
專案已設定 RLS 政策：
- 學生只能讀取/修改自己的資料
- 教師可讀取所屬班級學生資料
- 家長只能查看連結子女的資料

---

## 7. 認證系統說明

### 支援的登入方式

1. **Email + 密碼**：直接使用 Supabase Auth
2. **Google OAuth**：透過 `supabase.auth.signInWithOAuth({ provider: 'google' })`

### 使用者角色

```typescript
type UserRole = 'student' | 'teacher' | 'parent';
```

**學生**：可使用所有學習功能、商店、成就  
**教師**：額外可查看教師儀表板  
**家長**：可查看家長儀表板

### HashRouter 相容性說明

本專案使用 `HashRouter`（URL 格式：`https://domain.com/#/page`）以確保 GitHub Pages 部署時路由正常運作。`App.tsx` 中的 `AuthHandler` 元件會自動處理 Supabase OAuth 回傳的 `access_token` 與 Hash 路由的衝突。

---

## 8. PWA 與 Service Worker

### 功能

- **離線瀏覽**：已快取的靜態資源可在斷線時使用
- **離線頁面**：無網路時顯示 `public/offline.html`
- **PWA 安裝**：使用者可將網站加入手機主畫面（`public/manifest.json`）

### 開發環境注意事項

Service Worker 在 `localhost` 開發時會自動停用（避免 Vite HMR 衝突），只在正式部署環境（非 localhost）啟用。詳見 `src/serviceWorker.ts`。

---

## 9. 常見問題 FAQ

**Q：學生無法登入，一直顯示「讀取個人資料失敗」？**  
A：確認 Supabase 中的 `user_profiles_20260310` 資料表 RLS 政策是否已允許新使用者自動建立 Profile。

**Q：Google 登入後頁面一直跳轉？**  
A：確認 Supabase Dashboard 中已設定正確的「Redirect URLs」，並加入部署網址（如 `https://username.github.io/repo-name/`）。

**Q：`npm run dev` 後畫面全白？**  
A：確認 `.env` 是否存在且 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 已正確填入。

**Q：如何新增 Email 題目？**  
A：編輯 `src/data/index.ts` 中的 `EMAIL_QUESTIONS` 陣列，依照現有格式新增物件即可。

**Q：如何修改學校 Email 網域？**  
A：編輯 `src/lib/index.ts` 中的 `EMAIL_DOMAIN` 常數。

---

## 10. 更新日誌 (Changelog)

### v1.0.1 (2026-03-12)
- **UI & UX 優化**：
  - 首頁排版調整：移除跑馬燈上方多餘留白、縮減英雄區塊與建議區塊間的間隔。
  - Header 導覽列優化：限制超長 Email 在行動裝置顯示（截斷過長字元並修改為保留 ID）。
  - Google 登入卡片升級：加入動畫過渡與清楚的狀態提示。
  - 登出流程簡化：移除頁面內不必要的重複登出按鈕，統一於右上角操作。
- **系統與快取修復**：
  - 修復 Service Worker 在 localhost 環境下的 HMR 雷達衝突問題。
  - 調整 `loginStep` 動畫超時時間為 1000ms（防止畫面卡住）。
