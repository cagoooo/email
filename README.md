# 技术栈

该项目使用以下技术栈
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS


# 开发流程

1. 参考用户需求，调整 src/index.css 与 tailwind.config.ts 的主题风格
2. 根据用户需求，划分出所需要实现的页面
3. 整理好每个页面需要实现的功能，在 pages 下创建对应的文件夹及其下入口 Index.tsx
4. 在 App.tsx 中创建路由配置，引入刚才的各个入口文件 Index.tsx
5. 根据刚才整理的需求，如果需求简单，可以直接在 Index.tsx 中完成该页面的全部工作
6. 如果需求复杂，可以将 page 拆分为若干个组件来实现，目录结构如下：
    - Index.tsx 入口
    - /components/ 组件
    - /hooks/ 钩子
    - /stores/ 如果有复杂交互通信时，可以使用 zustand 进行通信
7. 在完成需求后，需要进行 pnpm i 安装依赖，并使用 npm run lint & npx tsc --noEmit -p tsconfig.app.json --strict 进行检查，并修复问题

# 接入后端接口
- 当需要新增接口或者操作 supabase 时，需要先在 src/api 新增对应 api 文件，并导出对应的数据类型，可以参考 src/demo.ts 文件，如果是 supabase 还需要做好实现
- 前端与 supabase 做实现时，都需要完全按照数据类型进行实现，尽可能避免修改定好的数据类型，如果出现修改，需要检查所有引用该类型的文件

---

<!-- BEGIN:PROJECT_GUIDE -->
## 專案導覽

Email熟練遊樂園

- 專案定位：實用工具／自動化原型
- Repository：`cagoooo/email`
- 可見性：公開
- 主要技術：TypeScript、React、Vite、Supabase、Tailwind CSS
- 線上入口：未在 GitHub repository metadata 設定

### 可以怎麼應用

- 解決特定工作流程中的重複操作或資訊整理需求
- 作為相近工具的功能原型與程式碼參考
- 串接新的資料來源、服務或介面後延伸到其他情境

這些是依目前專案定位整理的延伸方向，不代表所有情境都已內建完成；實作前請先確認現有功能與資料格式。

### 技術與專案結構

- `README.md`
- `index.html`
- `package.json`
- `public`
- `src`
- `vite.config.ts`

檔案結構會隨版本演進；若本節與程式碼不一致，以目前預設分支的原始碼為準。

### 本機執行

```bash
npm install
# dev
npm run dev
# build
npm run build
# lint
npm run lint
```
請以 `package.json` 的 `scripts` 為準；若專案需要雲端服務，請先建立自己的環境變數與測試專案。

### 給 AI Agent 的接手指南

1. 先閱讀本 README、`AGENTS.md`（若有）、套件腳本與部署設定。
2. 先從入口檔、設定檔與資料流確認真實行為，不要只依 repo 名稱推測。
3. 修改前檢查環境變數、外部服務、檔案格式與失敗處理。
4. 完成後執行既有檢查，並以最小可重現案例驗證主要流程。
5. 不要捏造尚未存在的功能；README 與實作有落差時，應同時更新文件。
6. 提交前只納入本次任務檔案，並記錄實際執行過的驗證。

### 安全與資料注意事項

- 不要提交 `.env`、服務帳號、API 金鑰、token、學生個資或正式環境匯出資料。
- 使用 Firebase、Supabase、Google API 或其他雲端服務時，請建立自己的測試專案並套用最小權限。
- 若要公開衍生作品，請先確認程式碼、圖片、音訊、字型與教材內容的授權。

### 貢獻與客製化

歡迎依教學現場、活動或工作流程需求進行 fork／客製化。建議在變更說明中交代使用情境、主要修改、測試方式，以及是否影響資料格式或部署設定。
<!-- END:PROJECT_GUIDE -->
