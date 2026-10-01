import { createFileRoute } from "@tanstack/react-router";
import { errorMessage, runAi } from "@/lib/ai/gateway.server";

export const Route = createFileRoute("/api/generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { mode, prompt } = (await request.json()) as { mode: string; prompt: string };
        if ((mode !== "planner" && mode !== "research") || !prompt?.trim()) {
          return new Response("Invalid request", { status: 400 });
        }
        const { result, withRunId } = runAi(request, mode, [{ role: "user", content: prompt }]);
        const encoder = new TextEncoder();
        const body = new ReadableStream({
          async start(controller) {
            try {
              for await (const part of result.fullStream) {
                if (part.type === "text-delta") controller.enqueue(encoder.encode(part.text));
                if (part.type === "error") throw part.error;
              }
              controller.close();
            } catch (e) {
              controller.enqueue(encoder.encode(`\n\n[[ERROR]] ${errorMessage(e)}`));
              controller.close();
            }
          },
        });
        return withRunId(new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } }));
      },
    },
  },
});
