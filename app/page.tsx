"use client";

import { Chat } from "@/components/ui/chat";
import Image from "next/image";

import { useState, useCallback, useEffect } from "react";
import { type Message } from "@/components/ui/chat-message";
import { lexService } from "@/lib/lex-service";
import { bedrockService } from "@/lib/bedrock-service";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [isAwsConfigured, setIsAwsConfigured] = useState(false);

  useEffect(() => {
    setIsAwsConfigured(bedrockService.isConfigured());
  }, []);

  const handleSubmit = useCallback(
    async (event?: { preventDefault?: () => void }) => {
      event?.preventDefault?.();

      if (!input.trim() || isLoading) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: input.trim(),
        createdAt: new Date(),
      };

      // Add user message immediately
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      // Create abort controller for this request
      const controller = new AbortController();
      setAbortController(controller);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            promptType: "default",
            useLex: true,
            temperature: 0.7,
            maxTokens: 4096,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Debug logging
        console.log("API Response:", data);
        console.log("Response source:", data.source);

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.content,
          createdAt: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Log Lex intent if available
        if (data.lexIntent) {
          console.log("Detected intent:", data.lexIntent);
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("Request was aborted");
          return;
        }

        console.error("Chat error:", error);

        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "Sorry, I encountered an error while processing your request. Please try again.",
          createdAt: new Date(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        setAbortController(null);
      }
    },
    [input, messages, isLoading]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const stop = useCallback(() => {
    if (abortController) {
      abortController.abort();
    }
    setIsLoading(false);
    setAbortController(null);
  }, [abortController]);

  const append = useCallback(
    async (message: { role: "user"; content: string }) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        role: message.role,
        content: message.content,
        createdAt: new Date(),
      };
      
      // Add user message immediately
      setMessages((prev) => [...prev, newMessage]);
      setInput("");
      setIsLoading(true);

      // Create abort controller for this request
      const controller = new AbortController();
      setAbortController(controller);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, newMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            promptType: "default",
            useLex: true,
            temperature: 0.7,
            maxTokens: 4096,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Debug logging
        console.log("API Response:", data);
        console.log("Response source:", data.source);

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.content,
          createdAt: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Log Lex intent if available
        if (data.lexIntent) {
          console.log("Detected intent:", data.lexIntent);
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("Request was aborted");
          return;
        }

        console.error("Chat error:", error);

        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "Sorry, I encountered an error while processing your request. Please try again.",
          createdAt: new Date(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        setAbortController(null);
      }
    },
    [messages]
  );

  const transcribeAudio = async (blob: Blob): Promise<string> => {
    try {
      if (lexService.isConfigured()) {
        const lexResponse = await lexService.recognizeAudio(blob);
        return lexResponse.message || "Could not transcribe audio";
      } else {
        // Fallback to basic transcription or external service
        console.log("Audio transcription with blob:", blob);
        return "Audio transcription not configured";
      }
    } catch (error) {
      console.error("Audio transcription error:", error);
      return "Failed to transcribe audio";
    }
  };

  const clearChat = () => {
    setMessages([]);
    lexService.resetSession();
  };

  return (
    <div className="h-screen w-4/5 mx-auto flex flex-col py-10 gap-4">
      {/* Header with prompt selector and controls */}
      <div className="flex items-center gap-4 pb-4 border-b bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 rounded-xl p-6 shadow-lg border-2 border-blue-200/60 backdrop-blur-sm">
        {/* Logo and Title */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full blur-sm group-hover:blur-md transition-all duration-300"></div>
            <Image 
              src="/SuperBot-logo.png" 
              alt="SUPERBot Logo" 
              width={56}
              height={56}
              className="relative w-14 h-14 rounded-full object-cover border-2 border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse shadow-sm"></div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white opacity-60"></div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent tracking-tight">
              SUPER Bot
            </h1>
            <p className="text-sm text-muted-foreground">
              {isAwsConfigured ? (
                <>
                  Your intelligent HR assistant for company policies, benefits, and employee support
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                    HR Bot Active
                  </span>
                </>
              ) : (
                <><strong>Policy access shouldn&apos;t be a scavenger hunt—it should be a conversation.</strong></>
              )}
            </p>
          </div>
        </div>

        <div className="flex-1"></div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="px-3 py-1 text-sm border rounded bg-white hover:bg-gray-50 shadow-sm"
            disabled={isLoading}
          >
            Clear Chat
          </button>
        </div>
      </div>

      {/* Chat interface */}
      <Chat
        className="grow"
        messages={messages}
        handleSubmit={handleSubmit}
        input={input}
        handleInputChange={handleInputChange}
        isGenerating={isLoading}
        stop={stop}
        append={append}
        setMessages={setMessages}
        transcribeAudio={transcribeAudio}
        suggestions={[
          "What are the company holidays?",
          "Can I use paid time off when I am sick?",
          "When do I get paid?",
          "How do we sign up for benefits?",
        ]}
      />
    </div>
  );
}
