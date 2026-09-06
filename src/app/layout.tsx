import type { Metadata } from "next";
import Link from "next/link";
import { Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const noto = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "考研政治 · 时政月鉴",
  description:
    "独立运行的考研政治时政与周年专题学习站，支持 RSS 自动同步，无 ChatGPT 运行时依赖。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${noto.variable} font-sans antialiased`}>
        <div className="min-h-screen">
          <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-700 text-sm text-white">
                  政
                </span>
                <span>考研政治 · 时政月鉴</span>
              </Link>
              <nav className="flex items-center gap-3 text-sm text-slate-600">
                <Link href="/#week" className="hover:text-red-700">
                  本周必看
                </Link>
                <Link href="/#anniversaries" className="hover:text-red-700">
                  周年专题
                </Link>
                <Link
                  href="/admin"
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 hover:border-red-300 hover:text-red-700"
                >
                  管理
                </Link>
              </nav>
            </div>
          </header>
          <main>{children}</main>
          <footer className="mt-16 border-t border-slate-200 bg-white/70">
            <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-500">
              <p>考研政治 · 时政月鉴 — GitHub Pages 静态站，Actions 每日同步 JSON，独立于大模型运行。</p>
              <p className="mt-1">仅供学习整理参考，请以官方教材与权威报道为准。</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
