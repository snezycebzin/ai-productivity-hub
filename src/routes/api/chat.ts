import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, type UIMessage } from "ai";
import { errorMessage, runAi } from "@/lib/ai/gateway.server";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages: UIMessage[] };
        const { result, withRunId } = runAi(request, "chat", await convertToModelMessages(messages));
        return withRunId(
          result.toUIMessageStreamResponse({ originalMessages: messages, onError: errorMessage }),
        );
      },
    },
  },
});
