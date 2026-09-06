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
          <header className="site-topbar">
            <div className="site-topbar-inner">
              <Link href="/" className="brand-mark" aria-label="首页">
                政
              </Link>
              <Link href="/" className="brand-text">
                考研政治 · 时政月鉴
              </Link>
              <span className="status-chip">
                <i aria-hidden />
                每日自动核验
              </span>
              <nav className="topbar-nav" aria-label="主导航">
                <Link href="/#week">本周必看</Link>
                <Link href="/#anniversaries">周年专题</Link>
                <Link href="/admin" className="topbar-admin">
                  管理
                </Link>
              </nav>
            </div>
          </header>
          <main>{children}</main>
          <footer className="site-footer">
            <div>
              <p className="brand-line">考研政治 · 时政月鉴</p>
              <p style={{ margin: "6px 0 0" }}>
                GitHub Pages 静态站 · Actions 每日同步 JSON · 独立于大模型运行
              </p>
            </div>
            <p style={{ margin: 0 }}>仅供学习整理参考，请以官方教材与权威报道为准。</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
