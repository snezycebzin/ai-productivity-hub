import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { BriefcaseBusiness, Check, Loader2, Pencil, RotateCcw, SendHorizontal, Square } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Disclaimer } from "@/components/Disclaimer";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chatbot — Workplace Productivity Assistant" },
      { name: "description", content: "Chat with an AI workplace assistant for emails, meetings, planning and more." },
      { property: "og:title", content: "AI Workplace Chatbot" },
      { property: "og:description", content: "An interactive AI assistant for everyday work." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Chat,
});

function Chat() {
  const { messages, setMessages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const [input, setInput] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const ta = useRef<HTMLTextAreaElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, status]);
  useEffect(() => { if (!busy) ta.current?.focus(); }, [busy]);

  const send = () => {
    if (!input.trim() || busy) return;
    sendMessage({ text: input });
    setInput("");
  };

  const textOf = (m: (typeof messages)[number]) =>
    m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");

  const saveEdit = (id: string) => {
    setMessages(messages.map((m) => (m.id === id ? { ...m, parts: [{ type: "text", text: draft }] } : m)));
    setEditId(null);
  };

  return (
    <AppShell>
      <PageHeader title="AI Chatbot" subtitle="Ask anything about your work — drafting, meetings, decisions, analysis." />
      <div className="flex h-[calc(100vh-14rem)] min-h-[480px] flex-col rounded-2xl border bg-card shadow-card">
        <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
              <div className="bg-hero flex h-12 w-12 items-center justify-center rounded-2xl text-primary-foreground">
                <BriefcaseBusiness className="h-6 w-6" />
              </div>
              <p className="max-w-sm text-sm">Start a conversation. Every reply is generated live by AI from your message.</p>
            </div>
          )}
          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                  {textOf(m)}
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex gap-3">
                <div className="bg-hero mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-primary-foreground">
                  <BriefcaseBusiness className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  {editId === m.id ? (
                    <div className="space-y-2">
                      <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={8}
                        className="w-full rounded-lg border bg-muted/40 p-3 font-mono text-sm outline-none focus:ring-2 focus:ring-ring" />
                      <button onClick={() => saveEdit(m.id)} className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs hover:bg-muted">
                        <Check className="h-3 w-3" /> Save
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="ai-prose"><ReactMarkdown>{textOf(m)}</ReactMarkdown></div>
                      {!busy && textOf(m) && (
                        <button onClick={() => { setEditId(m.id); setDraft(textOf(m)); }}
                          className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                          <Pencil className="h-3 w-3" /> Edit response
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ),
          )}
          {status === "submitted" && (
            <p className="flex items-center gap-2 pl-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
            </p>
          )}
          {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error.message}</p>}
          <div ref={end} />
        </div>
        <div className="space-y-3 border-t p-3 sm:p-4">
          <div className="flex items-end gap-2 rounded-xl border bg-background p-2 focus-within:ring-2 focus-within:ring-ring">
            <textarea
              ref={ta}
              autoFocus
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Message your workplace assistant…"
              className="max-h-40 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none"
            />
            {messages.length > 0 && !busy && (
              <button aria-label="New conversation" onClick={() => setMessages([])} className="rounded-lg p-2 text-muted-foreground hover:bg-muted">
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
            <button
              aria-label={busy ? "Stop" : "Send"}
              onClick={busy ? stop : send}
              className="bg-hero flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-primary-foreground disabled:opacity-50"
              disabled={!busy && !input.trim()}
            >
              {busy ? <Square className="h-4 w-4" /> : <SendHorizontal className="h-4 w-4" />}
            </button>
          </div>
          <Disclaimer compact />
        </div>
      </div>
    </AppShell>
  );
}
