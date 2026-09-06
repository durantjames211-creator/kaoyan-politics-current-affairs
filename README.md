# 考研政治 · 时政月鉴

独立运行的考研政治时政与周年专题学习站。
运行时不依赖大模型，内容来自公开 RSS 与本地 JSON。

## 快速开始

1. 复制 .env.example 为 .env.local
2. 安装依赖并启动开发服务（见 package.json scripts: install / dev）
3. 打开 http://localhost:3000 ；管理台 /admin
4. 生产构建使用 package.json 中的 build 与 start 脚本

## 环境变量

- ADMIN_PASSWORD：管理后台密码（默认 change-me）
- CRON_SECRET：保护 POST /api/cron/sync 的密钥

## 功能

- 今日已核验、同步状态、本周必看、周年专题、模块筛选、搜索
- 同步仅收录过去 24 小时发布的条目
- 按 sourceUrl 新增或修订（upsert），刷新模块/考点/周年联动
- 无新增时仍刷新今日已核验
- 管理后台支持图片上传到 public/uploads/
- 数据文件：data/affairs.json、anniversaries.json、sync-meta.json

## 同一公开 URL 每日更新

将站点部署到固定域名后，用定时任务请求该域名的 /api/cron/sync，并在请求头中携带 CRON_SECRET。
内容写入 data/*.json，同一公开 URL 即可看到更新。
仓库含 vercel.json（每日 UTC 01:00）。
注意：纯 Serverless 磁盘不持久；长期自更新请用带持久盘的主机，或同步后提交 data/ 再部署到同一项目。

本地可用管理后台「立即同步」，或对本地服务调用 /api/cron/sync。

## 同步规则

1. 公开 RSS，按发布时间过滤近 24 小时
2. sourceUrl upsert（新增或修订）
3. 自动刷新模块标签、考点提示、周年联动；本周必看随数据更新
4. 无论是否有新增，都写入 lastVerifiedAt（今日已核验）

## 与大模型

运行时不调用 ChatGPT、Grok 或其他大模型 API。
