import { NextRequest, NextResponse } from "next/server";
import { simpleChat, type SimpleChatMessage } from "@/lib/simple-bedrock";
import { lexService } from "@/lib/lex-service";
import { type PromptType } from "@/lib/aws-config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      messages,
      promptType = "default",
      useLex = false,
      temperature,
      maxTokens,
    }: {
      messages: SimpleChatMessage[];
      promptType?: PromptType;
      useLex?: boolean;
      temperature?: number;
      maxTokens?: number;
    } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];

    // If using Lex, first process through Lex for intent recognition
    let lexResponse = null;
    if (useLex && lexService.isConfigured()) {
      try {
        lexResponse = await lexService.recognizeText(lastMessage.content);

        // If Lex has a direct response, we might use it or enhance it with Bedrock
        if (lexResponse.message) {
          // You can decide here whether to use Lex response directly or enhance with Bedrock
          console.log("Lex intent detected:", lexResponse.intent);
        }
      } catch (error) {
        console.warn(
          "Lex processing failed, falling back to Bedrock only:",
          error
        );
      }
    }

    // Get response from simple chat (demo mode)
    const chatResponse = await simpleChat(messages, promptType);

    return NextResponse.json({
      content: chatResponse.content,
      usage: chatResponse.usage,
      lexIntent: lexResponse?.intent,
      sessionId: lexService.getCurrentSessionId(),
    });
  } catch (error) {
    console.error("Chat API error:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack"
    );
    return NextResponse.json(
      {
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Stream endpoint for real-time responses
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const messagesParam = searchParams.get("messages");
  const promptType =
    (searchParams.get("promptType") as PromptType) || "default";

  if (!messagesParam) {
    return NextResponse.json(
      { error: "Messages parameter is required" },
      { status: 400 }
    );
  }

  try {
    const messages: ChatMessage[] = JSON.parse(messagesParam);

    // Create a readable stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        bedrockService
          .streamChat(messages, promptType, (chunk: string) => {
            const data = `data: ${JSON.stringify({ content: chunk })}\n\n`;
            controller.enqueue(encoder.encode(data));
          })
          .then(() => {
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          })
          .catch((error) => {
            console.error("Streaming error:", error);
            controller.error(error);
          });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Stream API error:", error);
    return NextResponse.json(
      { error: "Failed to process stream request" },
      { status: 500 }
    );
  }
}
