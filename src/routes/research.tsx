import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpenText, Loader2, Wand2 } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { OutputPanel, fieldCls, primaryBtn, useGenerate } from "@/components/AiGenerator";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Workplace Productivity Assistant" },
      { name: "description", content: "Summarise topics and articles and get AI insights and recommendations." },
      { property: "og:title", content: "AI Research Assistant" },
      { property: "og:description", content: "AI summaries, insights and recommendations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Research,
});

function Research() {
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState("");
  const g = useGenerate("research");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    g.generate(
      `Topic/question: ${topic || "(see article)"}\nAudience/context: ${audience || "general professional"}\n${content ? `Article/notes:\n${content}` : ""}`,
    );
  };

  return (
    <AppShell>
      <PageHeader title="AI Research Assistant" subtitle="Enter a topic or paste an article to get a summary, insights and recommendations." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-card p-5 shadow-card">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Topic or question</span>
            <input value={topic} onChange={(e) => setTopic(e.target.value)} className={fieldCls}
              placeholder="e.g. Impact of hybrid work on team productivity" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Article or notes (optional)</span>
            <textarea rows={8} value={content} onChange={(e) => setContent(e.target.value)} className={fieldCls}
              placeholder="Paste text to summarise…" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Your role / context (optional)</span>
            <input value={audience} onChange={(e) => setAudience(e.target.value)} className={fieldCls}
              placeholder="e.g. HR manager at a 200-person company" />
          </label>
          <button disabled={g.loading || (!topic.trim() && !content.trim())} className={primaryBtn}>
            {g.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Analyse
          </button>
        </form>
        <OutputPanel
          title="Research brief"
          {...g}
          empty={
            <div className="flex h-full flex-col items-center justify-center gap-2 py-16 text-center text-sm text-muted-foreground">
              <BookOpenText className="h-8 w-8 text-primary/60" />
              Your AI summary and recommendations will appear here.
            </div>
          }
        />
      </div>
    </AppShell>
  );
}
