"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import type { Affair, Anniversary, ModuleTag } from "@/lib/types";
import { MODULE_TAGS } from "@/lib/types";

type Tab = "affairs" | "anniversaries";

const emptyAffairForm = {
  title: "",
  summary: "",
  date: new Date().toISOString().slice(0, 10),
  source: "手动录入",
  sourceUrl: "",
  modules: [] as ModuleTag[],
  examTips: "",
  imageUrl: "",
};

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState<Tab>("affairs");
  const [affairs, setAffairs] = useState<Affair[]>([]);
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [editing, setEditing] = useState<Affair | null>(null);
  const [form, setForm] = useState(emptyAffairForm);
  const [annEdit, setAnnEdit] = useState<Anniversary | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const refreshAuth = useCallback(async () => {
    const res = await fetch("/api/admin/me");
    const data = await res.json();
    setAuthed(Boolean(data.authenticated));
  }, []);

  const loadData = useCallback(async () => {
    const [a, n] = await Promise.all([
      fetch("/api/admin/affairs").then((r) => r.json()),
      fetch("/api/admin/anniversaries").then((r) => r.json()),
    ]);
    if (a.affairs) setAffairs(a.affairs);
    if (n.anniversaries) setAnniversaries(n.anniversaries);
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  useEffect(() => {
    if (authed) loadData();
  }, [authed, loadData]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setLoginError("密码错误");
      return;
    }
    setPassword("");
    setAuthed(true);
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
  }

  function toggleModule(m: ModuleTag) {
    setForm((prev) => ({
      ...prev,
      modules: prev.modules.includes(m)
        ? prev.modules.filter((x) => x !== m)
        : [...prev.modules, m],
    }));
  }

  async function uploadImage(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "上传失败");
    setForm((prev) => ({ ...prev, imageUrl: data.url }));
    setMessage(`图片已上传：${data.url}`);
  }

  async function saveAffair(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const payload = { ...form };
      const res = await fetch(
        editing ? `/api/admin/affairs/${editing.id}` : "/api/admin/affairs",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "保存失败");
      setForm(emptyAffairForm);
      setEditing(null);
      setMessage(editing ? "已更新时政条目" : "已创建时政条目");
      await loadData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function deleteAffair(id: string) {
    if (!confirm("确认删除该条目？")) return;
    await fetch(`/api/admin/affairs/${id}`, { method: "DELETE" });
    await loadData();
  }

  function startEdit(a: Affair) {
    setEditing(a);
    setForm({
      title: a.title,
      summary: a.summary,
      date: a.date,
      source: a.source,
      sourceUrl: a.sourceUrl || "",
      modules: a.modules,
      examTips: a.examTips || "",
      imageUrl: a.imageUrl || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function runSync() {
    setBusy(true);
    setMessage("正在同步 RSS…");
    try {
      const res = await fetch("/api/admin/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "同步失败");
      setMessage(data.meta?.lastMessage || "同步完成");
      await loadData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function saveAnniversary(e: FormEvent) {
    e.preventDefault();
    if (!annEdit) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/anniversaries/${annEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(annEdit),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "保存失败");
      setMessage("周年节点已更新");
      setAnnEdit(null);
      await loadData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  if (authed === null) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center text-slate-500">
        检查登录状态…
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="card p-6">
          <h1 className="text-xl font-bold">管理后台登录</h1>
          <p className="mt-2 text-sm text-slate-500">
            使用环境变量 <code className="rounded bg-slate-100 px-1">ADMIN_PASSWORD</code>{" "}
            （默认 change-me）
          </p>
          <form onSubmit={handleLogin} className="mt-6 space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="管理员密码"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-200"
            />
            {loginError && (
              <p className="text-sm text-rose-600">{loginError}</p>
            )}
            <button
              type="submit"
              className="w-full rounded-xl bg-red-700 py-2.5 text-sm font-medium text-white hover:bg-red-800"
            >
              登录
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">管理后台</h1>
          <p className="text-sm text-slate-500">时政条目 · 周年节点 · RSS 同步</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={runSync}
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            立即同步
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm"
          >
            退出
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      )}

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          className={`chip ${tab === "affairs" ? "active" : ""}`}
          onClick={() => setTab("affairs")}
        >
          时政管理
        </button>
        <button
          type="button"
          className={`chip ${tab === "anniversaries" ? "active" : ""}`}
          onClick={() => setTab("anniversaries")}
        >
          周年节点
        </button>
      </div>

      {tab === "affairs" && (
        <>
          <form onSubmit={saveAffair} className="card mb-6 space-y-3 p-5">
            <h2 className="font-semibold">
              {editing ? "编辑时政" : "新增时政"}
            </h2>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="标题"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <textarea
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              placeholder="摘要"
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                placeholder="来源"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                value={form.sourceUrl}
                onChange={(e) =>
                  setForm({ ...form, sourceUrl: e.target.value })
                }
                placeholder="来源 URL"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {MODULE_TAGS.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`chip ${form.modules.includes(m) ? "active" : ""}`}
                  onClick={() => toggleModule(m)}
                >
                  {m}
                </button>
              ))}
            </div>
            <textarea
              value={form.examTips}
              onChange={(e) => setForm({ ...form, examTips: e.target.value })}
              placeholder="答题 / 复习提示"
              rows={2}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <div className="flex flex-wrap items-center gap-3">
              <label className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm cursor-pointer">
                上传图片
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    try {
                      await uploadImage(f);
                    } catch (err) {
                      setMessage(
                        err instanceof Error ? err.message : String(err)
                      );
                    }
                  }}
                />
              </label>
              {form.imageUrl && (
                <span className="text-xs text-slate-500">{form.imageUrl}</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {editing ? "保存修改" : "创建"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setForm(emptyAffairForm);
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
                >
                  取消
                </button>
              )}
            </div>
          </form>

          <div className="space-y-2">
            {affairs.map((a) => (
              <div
                key={a.id}
                className="card flex flex-wrap items-start justify-between gap-3 p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{a.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {a.date} · {a.source} · {a.modules.join(" / ")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(a)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteAffair(a.id)}
                    className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs text-rose-700"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "anniversaries" && (
        <div className="space-y-3">
          {annEdit && (
            <form onSubmit={saveAnniversary} className="card space-y-3 p-5">
              <h2 className="font-semibold">编辑周年：{annEdit.title}</h2>
              <input
                value={annEdit.title}
                onChange={(e) =>
                  setAnnEdit({ ...annEdit, title: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <textarea
                value={annEdit.summary}
                onChange={(e) =>
                  setAnnEdit({ ...annEdit, summary: e.target.value })
                }
                rows={2}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <textarea
                value={annEdit.examRelation}
                onChange={(e) =>
                  setAnnEdit({ ...annEdit, examRelation: e.target.value })
                }
                rows={2}
                placeholder="考查关联"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <textarea
                value={annEdit.linkage || ""}
                onChange={(e) =>
                  setAnnEdit({ ...annEdit, linkage: e.target.value })
                }
                rows={2}
                placeholder="联动"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <textarea
                value={annEdit.knowledgePoints.join("\n")}
                onChange={(e) =>
                  setAnnEdit({
                    ...annEdit,
                    knowledgePoints: e.target.value
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                rows={4}
                placeholder="知识点（每行一条）"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-lg bg-red-700 px-4 py-2 text-sm text-white"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => setAnnEdit(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
                >
                  取消
                </button>
              </div>
            </form>
          )}
          {anniversaries.map((ann) => (
            <div
              key={ann.id}
              className="card flex items-center justify-between gap-3 p-4"
            >
              <div>
                <p className="font-medium">
                  {ann.year} · {ann.title}{" "}
                  <span className="text-xs text-slate-400">
                    ({ann.importance})
                  </span>
                </p>
                <p className="text-xs text-slate-500">
                  {ann.modules.join(" / ")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAnnEdit(ann)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
              >
                轻量编辑
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
