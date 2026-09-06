"use client";

import { useEffect, useState } from "react";
import { withBase } from "@/lib/basePath";

export default function AdminPage() {
  const [mode, setMode] = useState<"checking" | "local" | "static">("checking");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(withBase("/api/admin/me"), {
          signal: AbortSignal.timeout(2500),
        });
        if (!cancelled) setMode(res.ok || res.status === 401 ? "local" : "static");
      } catch {
        if (!cancelled) setMode("static");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (mode === "checking") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-slate-500">检测管理接口…</div>
    );
  }
  if (mode === "local") return <LocalAdminHint />;
  return <StaticAdminGuide />;
}

function StaticAdminGuide() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="card space-y-5 p-6 md:p-8">
        <h1 className="text-2xl font-bold">管理说明（静态 Pages）</h1>
        <p className="text-slate-600">纯静态托管：公开页可用，写入接口不可用。</p>
        <h2 className="text-lg font-semibold">每日自动同步</h2>
        <p className="text-sm text-slate-600">
          sync-and-deploy 工作流每天约北京时间 20:00（UTC 12:00）同步近24小时 RSS，
          写入 data 并刷新今日已核验，再发布到同一公开地址。
        </p>
        <h2 className="text-lg font-semibold">立即同步</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-600">
          <li>打开仓库的 Actions，选择 Sync and Deploy Pages</li>
          <li>使用 Run workflow 手动触发</li>
          <li>完成后刷新网站</li>
        </ol>
        <h2 className="text-lg font-semibold">本地管理</h2>
        <p className="text-sm text-slate-600">
          本机安装依赖后启动开发服务；或本地执行同步脚本更新 data 再提交。
          vercel.json 未用于本部署路径。
        </p>
        <a href={withBase("/")} className="inline-block rounded-full bg-red-700 px-4 py-2 text-sm text-white">返回首页</a>
      </div>
    </div>
  );
}

function LocalAdminHint() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="card space-y-4 p-6 md:p-8">
        <h1 className="text-2xl font-bold">本地管理模式</h1>
        <p className="text-slate-600">已检测到本地接口。请编辑 data 或运行同步脚本；线上请用工作流手动触发。</p>
        <a href={withBase("/")} className="inline-block rounded-full bg-red-700 px-4 py-2 text-sm text-white">返回首页</a>
      </div>
    </div>
  );
}
