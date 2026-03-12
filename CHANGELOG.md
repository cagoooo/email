# 個人化優化與獎勵系統擴展 (v1.0.3)
2026-03-12

本次更新重點在於提升使用者的「歸屬感」與「互動行為動機」。透過修正個人資料顯示錯誤，並提供更多樣化的商城獎勵（主題與游標），讓學習過程更具趣味性。

## 1. 使用者個人化修正 (Identity Fix)
修正了先前版本中，使用者姓名顯示不正確或頭像載入失敗的問題：
- **姓名顯示優化**：現在首頁歡迎詞會優先抓取 Google Profile 的真實姓名，而非僅顯示信箱 ID。
- **頭像顯示修復**：
  - 增加對 Google 帳號 `picture` 欄位的備援檢查。
  - 加入 `referrerPolicy="no-referrer"` 屬性，成功解決 Google 頭像連結因安全性限制導致的 403 Forbidden 錯誤。

## 2. 商城獎勵系統擴展 (Shop Expansion)
為了增加點數（代幣）的實用性，商城新增了兩大類別的數位商品：
- **背景主題 (Themes)**：
  - 加入「賽博龐克 (Cyberpunk)」：霓虹漸層與科幻氛圍。
  - 加入「夢幻星空 (Deep Space)」：深邃宇宙背景。
- **游標特效 (Cursor Effects)**：
  - 加入「魔法足跡 (Magic Trail)」：滑鼠移動時會產生動態粒子特效。

## 3. 即時廣播系統 (Realtime Notification)
導入了 **Supabase Realtime** 機制，強化校園學習的共時感：
- 當其他同學在商城購買稀有物品或達成重大成就時，全站頂部會出現即時跑馬燈廣播。
- 營造「大家都在努力學習」的氛圍。

## 4. 路由延遲載入 (Lazy Loading)
為了進一步優化前端載入效能，我們實作了程式碼切分（Code Splitting）：
- 教師後台、家長後台、商城與排行榜等非核心頁面現在改為非同步載入。
- 首屏加載體積顯著減少，學生進入首頁的速度更快。

---

# 效能優化與架構重構報告 (v1.0.2)
2026-03-12

本次的更新任務涵蓋了「Bundle 分析與載入最佳化」以及「Dashboard 元件架構整理」兩項主要目標。以下是已完成的詳細修改：

## 1. 效能優化 (Bundle Splitting)
為了加快網頁在各類設備上的首次載入速度，我們對 Vite 進行了底層打包設定的調校。

- **`vite.config.ts` 修改**：
  加入了 `build.rollupOptions.output.manualChunks`，將龐大的 `node_modules` 切分為數個獨立的 chunk：
  - `vendor-react`：包含 `react`, `react-dom`, `react-router`
  - `vendor-supabase`：集中所有與資料庫相關的 SDK
  - `vendor-motion`：獨立打包 `framer-motion` 動畫引擎
  - `vendor-recharts`：獨立處理圖表庫
  - `vendor-ui`：將 `@radix-ui`, `lucide-react`, `tailwind` 等專案 UI 必要套件整合

此舉能大幅提升快取利用率，當使用者更新應用程式時，若這幾項核心依賴沒有變動，瀏覽器將不需重新下載相同的函式庫。

## 2. 儀表板架構整理 (Smart/Dumb Pattern)
藉由導入 Container / Presenter 模式，將「資料獲取」與「介面呈現」解耦。現在以下幾個儀表板都有著更清晰、易於測試和維護的結構：

- **Teacher Dashboard**
  - **Page (`TeacherDashboard.tsx`)**：集中負責載入教師資料、學生概況等資料獲取與 API 錯誤處理。
  - **Component (`TeacherDashboard.tsx`)**：變成一個純粹的 Presentational Component，只負責接收 `students`, `classStats` 等狀態並進行畫面繪製。

- **Leaderboard**
  - **Page (`Leaderboard.tsx`)**：負責集中處理 `useLeaderboard` 的狀態，包含目前排名、各分類統計等。
  - **Component (`ClassLeaderboard.tsx`)**：獨立接受 `displayData` 並觸發父層傳遞的 `setActiveTab` 進行切換顯示。

- **Parent Dashboard**
  - **Page (`ParentDashboard.tsx`)**：承接學生進度資料與周報生成的職責（目前使用模擬資料，未來可串接真實後端資料來源）。
  - **Component (`ParentDashboard.tsx`)**：改為純接收事件與狀態的 UI 元件，增強了展示邏輯。

## 3. 型別防禦與編譯錯誤修復
修復了之前於開發階段遇到的 `Implicit any` 型別錯誤，包含 Babel 定義檔缺失以及 Vite 設定檔中的潛在錯誤。

- 已安裝 `@types/babel__traverse` 與 `@types/babel__generator` 解決 TS 警告。
- 修復 `vite.config.ts` 中的 AST 解析參數型別推導與 `ParentDashboard` Callback 預設 `any` 問題。

## 4. UI 互動性修復
- 修正了首頁「每日挑戰」卡牌中，因背景裝飾層遮擋住 `Button` 點擊事件的問題，現在使用者已經可以順利點擊觸發挑戰。

### 驗證結果
- ✅ **Bundle 產出測試**: 執行 `npm run build` 確認各項 vendor 檔案皆被成功獨立分離出來，顯著降低打包單一檔案的體積。
- ✅ **介面互動邏輯**: 所有分離後的組件互動正常，包含資料載入處理、分頁狀態切換與 API 觸發皆能跨組件安全傳遞。
- ✅ **UI 互動事件**: 首頁按鈕點擊等所有滑鼠事件皆可正常運作無阻擋。
