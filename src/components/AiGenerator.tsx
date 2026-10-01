import { useRef, useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { Check, Copy, Loader2, Pencil, Sparkle, Square } from "lucide-react";
import { Disclaimer } from "./Disclaimer";

const ERR = "[[ERROR]]";

export function useGenerate(mode: "planner" | "research") {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ctrl = useRef<AbortController | null>(null);

  async function generate(prompt: string) {
    setLoading(true);
    setError(null);
    setOutput("");
    ctrl.current = new AbortController();
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, prompt }),
        signal: ctrl.current.signal,
      });
      if (!res.ok || !res.body) throw new Error((await res.text()) || "Request failed");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += dec.decode(value, { stream: true });
        const i = text.indexOf(ERR);
        if (i >= 0) {
          setOutput(text.slice(0, i).trim());
          setError(text.slice(i + ERR.length).trim());
          break;
        }
        setOutput(text);
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return { output, setOutput, loading, error, generate, stop: () => ctrl.current?.abort() };
}

export function OutputPanel({
  title,
  output,
  setOutput,
  loading,
  error,
  stop,
  empty,
}: {
  title: string;
  output: string;
  setOutput: (v: string) => void;
  loading: boolean;
  error: string | null;
  stop: () => void;
  empty: ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  return (
    <section className="flex min-h-[420px] flex-col rounded-2xl border bg-card shadow-card">
      <div className="flex items-center justify-between gap-2 border-b px-5 py-3">
        <h2 className="flex items-center gap-2 font-semibold">
          <Sparkle className="h-4 w-4 text-primary" /> {title}
        </h2>
        <div className="flex gap-1.5">
          {loading && (
            <button onClick={stop} className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs hover:bg-muted">
              <Square className="h-3 w-3" /> Stop
            </button>
          )}
          {output && !loading && (
            <>
              <button
                onClick={() => setEditing((e) => !e)}
                className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs hover:bg-muted"
              >
                {editing ? <Check className="h-3 w-3" /> : <Pencil className="h-3 w-3" />} {editing ? "Done" : "Edit"}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(output);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs hover:bg-muted"
              >
                <Copy className="h-3 w-3" /> {copied ? "Copied" : "Copy"}
              </button>
            </>
          )}
        </div>
      </div>
      <div className="flex-1 p-5">
        {error && <p className="mb-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        {!output && loading && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Thinking about your input…
          </p>
        )}
        {!output && !loading && !error && empty}
        {output && editing ? (
          <textarea
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            className="h-full min-h-[380px] w-full resize-y rounded-lg border bg-muted/40 p-3 font-mono text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        ) : (
          output && (
            <div className="ai-prose" onDoubleClick={() => !loading && setEditing(true)}>
              <ReactMarkdown>{output}</ReactMarkdown>
            </div>
          )
        )}
      </div>
      {output && (
        <div className="border-t p-4">
          <Disclaimer compact />
        </div>
      )}
    </section>
  );
}

export const fieldCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
export const primaryBtn =
  "bg-hero inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-card transition-opacity hover:opacity-90 disabled:opacity-50";
