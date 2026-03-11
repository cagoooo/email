# 🚀 石門國小電子郵件學習平台 — 後續優化改良建議

> 分析日期：2026-03-11 ｜ 依優先順序與複雜度排列

---

## 📋 優化項目總覽

| 類別 | 項目數 | 預估工時 |
|------|--------|----------|
| 🔴 高優先（安全 / 穩定性）| 5 項 | 1-2 天 |
| 🟡 中優先（功能完整性）| 8 項 | 3-7 天 |
| 🟢 長期規劃（體驗升級）| 7 項 | 2-4 週 |

---

## 🔴 高優先級（建議立即處理）

### 1. 🔐 部署前敏感資訊清除

**問題**：`.env` 的 Supabase Anon Key 和 Google OAuth Secret 若不慎洩漏，將造成安全風險。

**解決方案**：
```bash
# 驗證目前是否有任何 Key 殘留在非 .env 的檔案中
python -c "
import os, re
pattern = re.compile(r'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')
found = []
for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in ['.git','node_modules','dist']]
    for fname in files:
        if fname.endswith(('.html','.js','.ts','.tsx','.json','.md')):
            with open(os.path.join(root,fname), encoding='utf-8', errors='ignore') as f:
                for i, line in enumerate(f, 1):
                    if pattern.search(line):
                        found.append(f'{root}/{fname}:{i}')
print('⚠️ 發現洩漏：' if found else '✅ 無殘留 Key')
for x in found: print(' ', x)
"
```

**預防措施**：建立 `.env.example` 作為樣板，確保協作者知道需要設定哪些變數。

---

### 2. 🏗️ 新增 GitHub Actions CI/CD 工作流

**問題**：目前缺少自動化部署流程，需要手動執行 `npm run build`。

**建議建立** `.github/workflows/deploy.yml`：

```yaml
name: 🚀 部署到 GitHub Pages
on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: ✅ 取出程式碼
        uses: actions/checkout@v4

      - name: 📦 設定 Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: 📥 安裝依賴
        run: npm ci

      - name: 🔍 執行 Lint 檢查
        run: npm run lint

      - name: 🏗️ 建置專案
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_GOOGLE_CLIENT_ID: ${{ secrets.VITE_GOOGLE_CLIENT_ID }}

      - name: 🚀 部署到 GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

### 3. 📱 修復 PWA Manifest Icon 路徑

**問題**：`manifest.json` 中的圖示路徑若與 Vite 打包路徑不符，會導致 PWA 安裝失敗。

**建議**：確認 `manifest.json` 的圖示路徑與 `public/` 下的實際檔名吻合。

```json
// public/manifest.json
{
  "name": "石門國小電子郵件學習平台",
  "short_name": "石門Email學習",
  "icons": [
    { "src": "/favicon.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/favicon.png", "sizes": "512x512", "type": "image/png" }
  ],
  "theme_color": "#6366f1",
  "background_color": "#0f172a",
  "display": "standalone",
  "start_url": "./"
}
```

---

### 4. ⚡ 補全「空殼」頁面的實作

**問題**：`Leaderboard.tsx`、`TeacherDashboard.tsx`、`ParentDashboard.tsx` 在 `pages/` 目錄下的檔案幾乎是空殼（僅 255-260 bytes），真正的邏輯放在 `components/` 裡的同名元件，但路由頁面只有 import 而沒有 Props 傳遞。

**建議**：統一由路由頁面透過 Hooks 取得資料後，以 Props 傳入 Component，降低耦合度。

---

### 5. 🌐 Supabase Google OAuth Redirect URL 設定

**問題**：使用 HashRouter，OAuth 回傳時可能因 `#` 符號導致 Redirect URL 不符。

**步驟**：
1. 至 **Supabase Dashboard → Authentication → URL Configuration**
2. 在 **Redirect URLs** 加入：
   - `http://localhost:8080`
   - `https://[你的帳號].github.io/[你的 repo 名稱]`

---

## 🟡 中優先級（1 週內建議完成）

### 6. 📦 優化 Bundle 大小

**問題**：目前依賴了大量 Radix UI 元件（49 個），可能導致初次載入緩慢。

**建議**：
- 在 `vite.config.ts` 啟用 `rollupOptions.output.manualChunks` 依功能分割 chunk
- 考慮使用動態 `import()` 對非初始頁面做懶載入

```typescript
// vite.config.ts 新增
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        'vendor-supabase': ['@supabase/supabase-js'],
        'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-select'],
        'vendor-charts': ['recharts'],
        'vendor-motion': ['framer-motion'],
      },
    },
  },
},
```

---

### 7. 🧪 新增單元測試與整合測試

**問題**：目前缺乏自動化測試，僅有 Supabase Edge Functions 的 Deno 測試。

**建議**：
- 安裝 Vitest + React Testing Library
- 針對 `src/lib/index.ts` 中的工具函數（`validateStudentId`、`calculatePasswordStrength`）撰寫單元測試
- 針對 `useAuth` 撰寫 Mock 測試

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

---

### 8. 🎨 新增深色/淺色主題切換

**問題**：目前雖安裝了 `next-themes`，但尚未確認是否有用戶可見的主題切換按鈕。

**建議**：在 `Layout.tsx` 導覽列右上角新增主題切換按鈕，提升使用者體驗。

---

### 9. 📊 完善學習分析資料持久化

**問題**：`useLearningAnalytics.ts` 的資料可能仍以 localStorage 儲存，無法跨裝置同步。

**建議**：將學習分析資料遷移至 Supabase 資料表，透過 `useCloudSync.ts` 同步。

---

### 10. 🌍 多語言支援（i18n）

**問題**：目前所有文字硬編碼於元件中，難以維護。

**建議**：安裝 `react-i18next`，將所有 UI 文字抽離至語言檔案。

```bash
npm install react-i18next i18next
```

---

### 11. ♿ 無障礙設計（Accessibility）強化

**建議清單**：
- 確認所有互動元素有 `aria-label`
- 確認顏色對比度符合 WCAG AA 標準（4.5:1 以上）
- 為圖示按鈕新增 `title` 屬性
- 鍵盤導覽支援（Tab 順序）

---

### 12. 📲 行動端互動優化

**建議**：
- 遊戲頁面新增觸控手勢支援（滑動切換題目）
- 增大所有點擊目標至 44×44px（符合 Apple HIG 規範）
- 數字輸入欄位在手機上自動開啟數字鍵盤（`inputMode="numeric"`）

---

### 13. ⏱️ 新增「每日一題」電子報功能

**概念**：透過 Supabase Edge Function + Resend/MailGun 實作每日自動發送學習題目、進度摘要至家長 Email。

---

## 🟢 長期規劃（未來 2-4 週）

### 14. 🤖 整合 Gemini AI 即時提示

**概念**：目前的 `useAITips.ts` 提示系統為靜態邏輯，可升級為呼叫 Gemini API 生成個人化學習建議。

**技術方案**：
- 建立 Supabase Edge Function 作為 AI Proxy（避免前端暴露 API Key）
- 使用 `gemini-2.5-flash-lite` 模型

```typescript
// supabase/edge_function/ai-tips/index.ts（建議實作）
const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent', {
  headers: { 'Authorization': `Bearer ${Deno.env.get('GEMINI_API_KEY')}` },
  body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
});
```

---

### 15. 🏆 班級競賽模式

**概念**：教師可發起限時班級競賽，全班同時作答，即時更新排行榜（Supabase Realtime）。

**技術方案**：
- 建立 `competitions_20260310` 資料表
- 使用 Supabase Realtime Channel 廣播分數更新
- 競賽結束後自動發放獎勵點數

---

### 16. 📚 教學影片整合

**概念**：在各學習頁面嵌入教學影片（YouTube Embed 或自架影片），搭配字幕與章節標記。

---

### 17. 🎮 遊戲化升級：連線多人對戰

**概念**：允許兩位學生即時 PK Email 知識測驗，增加競技樂趣。

**技術方案**：使用 Supabase Realtime Presence/Broadcast 實作即時對戰狀態同步。

---

### 18. 📋 教師出題系統

**概念**：提供教師端介面，讓老師自行新增/編輯 Email 測驗題目，存入 Supabase，不需要修改原始碼。

---

### 19. 💾 學習歷程匯出（PDF）

**概念**：教師端可一鍵匯出班級學習報告為 PDF，用於家長日或教學評量。

**建議套件**：`@react-pdf/renderer`

---

### 20. 🔔 推播通知（Web Push）

**概念**：透過 `public/sw.js` Service Worker 對已安裝的 PWA 用戶發送學習提醒推播。

---

## 📈 效能優化建議

| 項目 | 目前狀態 | 建議目標 |
|------|----------|----------|
| First Contentful Paint | 未測量 | < 1.5s |
| Largest Contentful Paint | 未測量 | < 2.5s |
| Bundle 主 chunk | 未測量 | < 200KB gzip |
| Lighthouse 效能分數 | 未測量 | ≥ 90 分 |

**立即可施作的優化**：
- 圖片使用 WebP 格式並設定正確的 `width/height` 屬性（避免 CLS）
- 字體使用 `font-display: swap`
- 移除未使用的 Radix UI 元件

---

## 🔒 安全性強化建議

| 項目 | 建議 |
|------|------|
| Supabase RLS | 確認所有資料表均已啟用 RLS，沒有 `GRANT ALL` 的 Public 政策 |
| API Key 限制 | 在 GCP Console 限制 Google OAuth Client ID 的允許來源網址 |
| CORS 設定 | Supabase Edge Functions 加入 Origin 白名單驗證 |
| 率限制 | 在登入頁面加入輸入防抖（500ms）避免暴力破解 |
| 錯誤訊息 | 登入失敗時不要透露是「帳號錯誤」還是「密碼錯誤」（統一顯示「帳號或密碼錯誤」）|

---

*本文件由 Antigravity AI 分析產生，建議定期（每月）回顧並更新優先順序。*
