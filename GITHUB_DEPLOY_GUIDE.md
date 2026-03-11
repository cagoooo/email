# 🚀 石門國小電子郵件學習平台 — GitHub Pages 部署完整指南

> 更新日期：2026-03-11 ｜ 目標平台：GitHub Pages（免費靜態網頁托管）

---

## 📋 部署前確認清單

- [ ] 已有 GitHub 帳號
- [ ] 已建立新的 GitHub Repository（建議設為 Public 以免費使用 Pages）
- [ ] 本機已設定 Git 並完成 `git init`
- [ ] 所有敏感資訊已從程式碼移除（已在 `.env` 中管理）
- [ ] 已在 `vite.config.ts` 設定 `base` 路徑

---

## ⚠️ GitHub Pages 部署的關鍵差異

### HashRouter 相容性
本專案已採用 **HashRouter**（`#` 路由格式），GitHub Pages **不支援** SPA History 路由但**完全支援** Hash 路由，因此本專案天生適合 GitHub Pages。

### Vite `base` 路徑設定（必做）

GitHub Pages 部署在子目錄（如 `https://user.github.io/email/`），需要在 `vite.config.ts` 加入 `base` 設定：

```typescript
// vite.config.ts — 在 defineConfig 中新增
export default defineConfig(({ mode }) => {
  return {
    base: process.env.VITE_BASE_PATH || './',  // ← 新增這行
    server: {
      host: "::",
      port: 8080,
    },
    // ... 其他設定不變
  }
});
```

---

## 🪜 Step 1：初始化 Git Repository

```powershell
# 進入專案目錄
cd h:\email

# 確認 .gitignore 已包含 .env（防止金鑰洩漏）
cat .gitignore | findstr ".env"

# 初始化 Git（若未初始化）
git init

# 確認 .env 不在追蹤範圍內
git status
```

---

## 🪜 Step 2：敏感資訊掃描（Push 前必做）

```powershell
# 掃描所有 Supabase JWT Token 是否殘留在程式碼中
python -c "
import os, re
patterns = [
    re.compile(r'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'),
    re.compile(r'AIzaSy[0-9A-Za-z_-]{33}'),
    re.compile(r'GOCSPX-[0-9A-Za-z_-]+'),
]
found = []
for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in ['.git','node_modules','dist']]
    for fname in files:
        if fname.endswith(('.html','.js','.ts','.tsx','.json','.md','.yml')):
            with open(os.path.join(root,fname), encoding='utf-8', errors='ignore') as f:
                for i, line in enumerate(f, 1):
                    for p in patterns:
                        if p.search(line):
                            found.append(f'{root}/{fname}:{i}')
                            break
print('⚠️ 發現殘留敏感資訊：' if found else '✅ 無殘留敏感資訊，可安全 Push')
for x in found: print(' ', x)
"
```

---

## 🪜 Step 3：建立 `.env.example` 樣板

```powershell
@"
# Supabase 連線設定（到 https://supabase.com 取得）
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Google OAuth（到 https://console.cloud.google.com 取得，可選）
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# 部署設定
VITE_BASE_PATH=./
"@ | Out-File -FilePath .env.example -Encoding utf8

Write-Host "✅ .env.example 建立完成"
```

---

## 🪜 Step 4：首次 Push 到 GitHub

```powershell
# 初次設定遠端 Repository（換成你的 GitHub 網址）
git remote add origin https://github.com/[你的帳號]/[repo名稱].git

# 加入所有檔案（.gitignore 會自動排除 .env）
git add .

# 確認即將提交的內容（確認沒有 .env）
git status

# 建立初次 Commit
git commit -m "✅ 初始提交：石門國小電子郵件學習平台"

# Push 到 main 分支
git push -u origin main
```

---

## 🪜 Step 5：設定 GitHub Repository Secrets

在 GitHub 頁面進入你的 Repository，點擊 **Settings → Secrets and variables → Actions**，新增以下 Secrets：

| Secret 名稱 | 對應 .env 變數 | 說明 |
|-------------|---------------|------|
| `VITE_SUPABASE_URL` | `VITE_SUPABASE_URL` | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | `VITE_SUPABASE_ANON_KEY` | Supabase Anon Key |
| `VITE_GOOGLE_CLIENT_ID` | `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID |

---

## 🪜 Step 6：建立 GitHub Actions 自動部署工作流

在專案根目錄建立以下檔案：

```powershell
# 建立目錄
New-Item -ItemType Directory -Force -Path ".github\workflows"
```

**建立 `.github/workflows/deploy.yml`**：

```yaml
name: 🚀 部署石門國小電子郵件學習平台到 GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:   # 允許手動觸發

permissions:
  contents: write      # 需要寫入 gh-pages 分支的權限

jobs:
  build-and-deploy:
    name: 建置並部署
    runs-on: ubuntu-latest

    steps:
      - name: ✅ 取出程式碼
        uses: actions/checkout@v4

      - name: 📦 設定 Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: 📥 安裝依賴套件
        run: npm ci

      - name: 🔍 執行 TypeScript 型別檢查
        run: npx tsc --noEmit -p tsconfig.app.json

      - name: 🏗️ 建置專案
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_GOOGLE_CLIENT_ID: ${{ secrets.VITE_GOOGLE_CLIENT_ID }}
          VITE_BASE_PATH: "./"

      - name: 🚀 部署到 GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          user_name: 'github-actions[bot]'
          user_email: 'github-actions[bot]@users.noreply.github.com'
          commit_message: '🚀 自動部署：${{ github.sha }}'
```

---

## 🪜 Step 7：啟用 GitHub Pages

1. 在 GitHub Repository 頁面點擊 **Settings**
2. 左側選單選 **Pages**
3. **Source** 選擇 `Deploy from a branch`
4. **Branch** 選擇 `gh-pages` / `/ (root)`
5. 點擊 **Save**

等待約 1-2 分鐘後，你的網站會在以下網址上線：  
`https://[你的帳號].github.io/[repo名稱]/`

---

## 🪜 Step 8：設定 Supabase OAuth Redirect URL

因為部署後的網址改變，需要更新 Supabase 認證設定：

1. 至 **Supabase Dashboard → Authentication → URL Configuration**
2. 在 **Site URL** 填入主要網址：`https://[你的帳號].github.io/[repo名稱]`
3. 在 **Redirect URLs** 加入：
   - `http://localhost:8080`
   - `http://127.0.0.1:8080`
   - `https://[你的帳號].github.io/[repo名稱]`
   - `https://[你的帳號].github.io/[repo名稱]/#/`（Hash 路由相容）

---

## 🔄 後續更新流程

每次更新程式碼後，只需要：

```powershell
git add .
git commit -m "✅ 更新功能：描述你的更改"
git push
```

GitHub Actions 會自動觸發建置和部署。

---

## 🔍 部署後驗證清單

```text
□ 首頁可正常載入
□ HashRouter 路由切換正常（Email 學習、遊戲等頁面）
□ Supabase 連線正常（可嘗試登入）
□ Google OAuth 登入跳轉正常
□ 圖片資源正常顯示
□ Lighthouse 分數 ≥ 80
□ 手機/平板版面正常（RWD）
□ PWA 安裝按鈕可見（網址列圖示）
□ Service Worker 已在正式環境啟動
```

---

## ❓ 常見部署問題排查

### 問題：GitHub Pages 顯示 404
**原因**：`gh-pages` 分支尚未建立，或 GitHub Pages Source 設定錯誤  
**解法**：確認 Actions 已成功執行，並確認 Pages Source 指向 `gh-pages` 分支

### 問題：CSS/JS 資源 404
**原因**：`vite.config.ts` 未設定正確的 `base` 路徑  
**解法**：確認已加入 `base: './'`

### 問題：Supabase 報 CORS 錯誤
**原因**：新網址未加入 Supabase Allowed Origins  
**解法**：至 Supabase Dashboard → Settings → API，在 Additional Allowed Origins 加入部署網址

### 問題：Google 登入後回傳錯誤頁面
**原因**：Google Cloud Console 未加入新網址為授權 URI  
**解法**：至 [GCP Console](https://console.cloud.google.com) → API & Services → OAuth 同意畫面，加入授權重新導向 URI

---

## 📊 部署架構示意圖

```
本機開發環境               GitHub                    使用者端
-----------               --------                  ---------
h:\email\          push   main 分支      GitHub        瀏覽器
  src/        ────────→  (原始碼)   →   Actions  →  gh-pages 分支
  public/                                            (靜態網頁)
  .env（本機）           Repository                    ↓
                          Secrets                  GitHub Pages
                          (環境變數)              https://user.github.io/repo/
                             ↓
                         注入 build
```

---

*✅ 完成以上步驟後，你的學習平台就能在全球任何地方透過瀏覽器免費存取！*
