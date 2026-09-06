# 考研政治 · 时政月鉴

独立运行的考研政治时政与周年专题学习站。
运行时不依赖大模型，内容来自公开 RSS 与本地 JSON。
面向 GitHub Pages 静态托管 + GitHub Actions 每日同步（无需 Vercel、无需手机）。

## 公开地址

项目页（仓库名作为路径）：

`https://durantjames211-creator.github.io/kaoyan-politics-current-affairs/`

## 启用 GitHub Pages

1. 仓库设为 Public（免费 Pages 需要）
2. Settings → Pages → Build and deployment → Source 选 GitHub Actions
3. 推送 main 或在 Actions 中手动运行 Sync and Deploy Pages
4. 首次部署后按上面的 URL 访问（注意带仓库名路径）

## 本地开发

```bash
npm install
npm run dev
```

开发地址带 basePath：`http://localhost:3000/kaoyan-politics-current-affairs/`

管理说明页：`/kaoyan-politics-current-affairs/admin/`
完整写入类管理请在本地开发模式（静态 Pages 上无 API）；或编辑 `data/*.json` 后提交。

## 脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 本地开发（含 API） |
| `npm run build` | 静态导出到 `out/` |
| `npm run sync` | 拉取近 24h RSS，upsert，刷新今日已核验 |

## 每日同步（GitHub Actions）

工作流：`.github/workflows/sync-and-deploy.yml`

- 定时：每天 UTC 12:00（约北京时间 20:00）
- 手动：Actions → Sync and Deploy Pages → Run workflow
- 流程：同步脚本更新 data → 有变更则提交 → 构建 out/ → 官方 Pages 部署
- 同步复用 `src/lib/sync.ts`（经 scripts + tsx）
- 即使 0 条新增也会更新 `lastVerifiedAt`（今日已核验）

静态站在构建时读入 `data/*.json`，同步并重新部署后同一公开 URL 即更新。

## 功能

- 今日已核验、同步状态、本周必看、周年专题、模块筛选、搜索
- 近 24 小时 RSS；按 sourceUrl upsert
- 图片：public/uploads 或远程 URL
- 数据：data/affairs.json、anniversaries.json、sync-meta.json

## 关于 Vercel

`vercel.json` 为历史配置，本 GitHub Pages 路径不使用。

## 限制

- Pages 纯静态：线上无登录后台、无上传；立即同步请用 Actions
- images.unoptimized；basePath 为 `/kaoyan-politics-current-affairs`
