import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarCheck, Loader2, Wand2 } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { OutputPanel, fieldCls, primaryBtn, useGenerate } from "@/components/AiGenerator";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Workplace Productivity Assistant" },
      { name: "description", content: "Generate personalised daily or weekly schedules and prioritise your tasks with AI." },
      { property: "og:title", content: "AI Task Planner" },
      { property: "og:description", content: "Personalised AI schedules and task prioritisation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Planner,
});

function Planner() {
  const [tasks, setTasks] = useState("");
  const [period, setPeriod] = useState("day");
  const [hours, setHours] = useState("08:00 – 17:00");
  const [notes, setNotes] = useState("");
  const g = useGenerate("planner");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    g.generate(
      `Plan period: ${period === "day" ? "a single workday" : "a 5-day work week"}\nWorking hours: ${hours}\nTasks:\n${tasks}\nConstraints/preferences: ${notes || "none"}`,
    );
  };

  return (
    <AppShell>
      <PageHeader title="AI Task Planner" subtitle="List your tasks — AI builds a prioritised, time-blocked plan you can edit." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-card p-5 shadow-card">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Tasks (one per line, add deadlines if any)</span>
            <textarea required rows={7} value={tasks} onChange={(e) => setTasks(e.target.value)} className={fieldCls}
              placeholder="e.g. Finish Q3 report — due Friday" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Plan for</span>
              <select value={period} onChange={(e) => setPeriod(e.target.value)} className={fieldCls}>
                <option value="day">Today</option>
                <option value="week">This week</option>
              </select>
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Working hours</span>
              <input value={hours} onChange={(e) => setHours(e.target.value)} className={fieldCls} />
            </label>
          </div>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Preferences (optional)</span>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} className={fieldCls}
              placeholder="e.g. deep work in mornings, lunch at 13:00" />
          </label>
          <button disabled={g.loading || !tasks.trim()} className={primaryBtn}>
            {g.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Generate plan
          </button>
        </form>
        <OutputPanel
          title="Your plan"
          {...g}
          empty={
            <div className="flex h-full flex-col items-center justify-center gap-2 py-16 text-center text-sm text-muted-foreground">
              <CalendarCheck className="h-8 w-8 text-primary/60" />
              Your AI-generated schedule will appear here.
            </div>
          }
        />
      </div>
    </AppShell>
  );
}
