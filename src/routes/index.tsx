import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarCheck, MessagesSquare, Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Disclaimer } from "@/components/Disclaimer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Workplace Productivity Assistant" },
      { name: "description", content: "Plan your work, research faster and chat with an AI workplace assistant." },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      { property: "og:description", content: "AI task planning, research summaries and a workplace chatbot in one dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const TOOLS = [
  { to: "/planner", icon: CalendarCheck, title: "AI Task Planner", desc: "Turn your task list into a prioritised daily or weekly schedule." },
  { to: "/research", icon: Search, title: "AI Research Assistant", desc: "Summarise topics and articles into insights and recommendations." },
  { to: "/chat", icon: MessagesSquare, title: "AI Chatbot", desc: "Draft emails, prep meetings and think through decisions." },
] as const;

function Dashboard() {
  return (
    <AppShell>
      <section className="bg-hero overflow-hidden rounded-2xl p-6 text-primary-foreground shadow-card sm:p-10">
        <p className="text-sm font-medium opacity-80">Welcome back</p>
        <h1 className="mt-2 max-w-xl text-3xl font-semibold sm:text-4xl">Your AI assistant for a more focused workday.</h1>
        <p className="mt-3 max-w-lg opacity-90">Plan, research and communicate faster — every output is generated from your input and fully editable.</p>
        <Link to="/planner" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-card px-4 py-2.5 text-sm font-semibold text-primary hover:opacity-90">
          Plan my day <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {TOOLS.map(({ to, icon: Icon, title, desc }) => (
          <Link key={to} to={to} className="group rounded-2xl border bg-card p-5 shadow-card transition-transform hover:-translate-y-0.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border bg-card p-5 shadow-card">
        <h2 className="font-semibold">Using AI responsibly</h2>
        <ul className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
          <li>Review every output — you stay accountable for decisions.</li>
          <li>Verify facts, figures and sources before sharing.</li>
          <li>Don't paste confidential or personal information.</li>
        </ul>
        <div className="mt-4"><Disclaimer /></div>
      </div>
    </AppShell>
  );
}
