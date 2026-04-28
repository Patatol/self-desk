"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/ui/nav";
import { Button } from "@/components/ui/primitives";
import { useTheme } from "@/components/theme-provider";
import { useState } from "react";

export function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-shell flex bg-[var(--background)]">
      <aside
        className={`hidden border-r border-[var(--border)] bg-[var(--panel)] transition-all md:flex md:flex-col ${collapsed ? "md:w-20" : "md:w-64"}`}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <span className={`font-semibold ${collapsed ? "hidden" : "block"}`}>SelfDesk</span>
          <Button variant="ghost" onClick={() => setCollapsed((v) => !v)} aria-label="Toggle sidebar">
            {collapsed ? "→" : "←"}
          </Button>
        </div>
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`focus-ring flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${
                pathname === item.href ? "bg-[var(--panel-2)] font-semibold" : ""
              }`}
            >
              <span>{item.icon}</span>
              <span className={collapsed ? "hidden" : "block"}>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex min-h-dvh flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--border)] bg-[var(--panel)] px-4 py-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="md:hidden" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
              ☰
            </Button>
            <h1 className="text-base font-semibold">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "light" ? "🌙" : "☀️"}
            </Button>
            <form action="/api/auth/logout" method="post">
              <Button type="submit" variant="secondary">
                Logout
              </Button>
            </form>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-3 pb-24 pt-4 md:px-6 md:pb-6">{children}</main>

        <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-[var(--border)] bg-[var(--panel)] md:hidden">
          <div className="grid grid-cols-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-2 text-xs ${
                  pathname === item.href ? "font-semibold text-[var(--accent-strong)]" : ""
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setDrawerOpen(false)}>
          <aside className="h-full w-64 bg-[var(--panel)] p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <strong>Menu</strong>
              <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
                ✕
              </Button>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 ${pathname === item.href ? "bg-[var(--panel-2)]" : ""}`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
