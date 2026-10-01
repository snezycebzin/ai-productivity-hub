import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { BrainCircuit, CalendarCheck, LayoutDashboard, Menu, MessagesSquare, Search, X } from "lucide-react";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/planner", label: "Task Planner", icon: CalendarCheck },
  { to: "/research", label: "Research Assistant", icon: Search },
  { to: "/chat", label: "AI Chatbot", icon: MessagesSquare },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = path === to;
        return (
          <Link
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active ? "bg-sidebar-accent text-primary" : "text-sidebar-foreground hover:bg-muted"
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </Link>
        );
      })}
    </nav>
  );

  const brand = (
    <div className="flex items-center gap-2.5 px-2">
      <div className="bg-hero flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground">
        <BrainCircuit className="h-5 w-5" />
      </div>
      <div className="leading-tight">
        <p className="font-display text-sm font-semibold">Workplace</p>
        <p className="text-xs text-muted-foreground">Productivity Assistant</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-8 border-r border-sidebar-border bg-sidebar p-4 lg:flex">
        {brand}
        {nav}
        <p className="mt-auto rounded-lg bg-primary-soft p-3 text-xs text-accent-foreground">
          AI-generated content can be inaccurate. Always review before use.
        </p>
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col gap-8 bg-sidebar p-4">
            <div className="flex items-center justify-between">
              {brand}
              <button aria-label="Close menu" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
          <button aria-label="Open menu" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
          {brand}
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
      <p className="mt-1 text-muted-foreground">{subtitle}</p>
    </div>
  );
}
