import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.server";

const MODEL = "openai/gpt-6-astra";

export const SYSTEM_PROMPTS = {
  planner: `You are an expert workplace productivity planner. Using ONLY the user's tasks, goals, constraints and working hours, produce a personalised schedule in Markdown:
1. "## Priorities" — rank every task (Eisenhower: Urgent/Important) with a one-line reason.
2. "## Schedule" — a time-blocked plan (table: Time | Task | Focus notes) for the requested period (day or week), with breaks.
3. "## Tips" — 3 specific tips tied to these tasks.
Be concrete and specific to the input. Never use generic filler.`,
  research: `You are a sharp workplace research analyst. From the user's topic or pasted article, produce Markdown with:
"## Summary" (concise), "## Key insights" (bullets), "## Recommendations" (actionable, numbered), "## Open questions / caveats".
Ground everything in the provided input; if it's only a topic, state reasoning and note facts that should be verified.`,
  chat: `You are a friendly, professional AI workplace assistant. Help with emails, meetings, planning, communication, analysis and career questions. Be concise, structured, and use Markdown where helpful.`,
} as const;

export type Mode = keyof typeof SYSTEM_PROMPTS;

export function runAi(request: Request, mode: Mode, messages: ModelMessage[]) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured.");
  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  const result = streamText({
    model: provider.responses(MODEL),
    system: SYSTEM_PROMPTS[mode],
    messages,
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  return { result, runIdFetch, withRunId: (r: Response) => withLovableAiGatewayRunIdHeader(r, runIdFetch) };
}

export function errorMessage(error: unknown) {
  const e = error as { statusCode?: number; message?: string };
  if (e?.statusCode === 429) return "Too many requests — please wait a moment and try again.";
  if (e?.statusCode === 402) return "AI credits are exhausted. Please add credits to your workspace.";
  return e?.message || "Something went wrong generating a response.";
}
