import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import {
  awsConfig,
  bedrockConfig,
  customPrompts,
  type PromptType,
} from "./aws-config";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface BedrockResponse {
  content: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

class BedrockService {
  private client: BedrockRuntimeClient | null = null;

  constructor() {
    // Only initialize client if credentials are provided
    if (
      awsConfig.credentials.accessKeyId &&
      awsConfig.credentials.secretAccessKey &&
      (!awsConfig.credentials.accessKeyId.startsWith("ASIA") ||
        !!awsConfig.credentials.sessionToken)
    ) {
      try {
        this.client = new BedrockRuntimeClient({
          region: bedrockConfig.region,
          credentials: awsConfig.credentials,
        });
        console.log("✅ Bedrock client initialized with AWS credentials");
      } catch (error) {
        console.error("❌ Failed to initialize Bedrock client:", error);
      }
    } else {
      console.log("🚀 Running in demo mode - no AWS credentials provided");
      console.log(
        "🔍 Access key:",
        awsConfig.credentials.accessKeyId || "NOT SET"
      );
      console.log(
        "🔍 Secret key:",
        awsConfig.credentials.secretAccessKey ? "SET" : "NOT SET"
      );
      if (awsConfig.credentials.accessKeyId?.startsWith("ASIA")) {
        console.log(
          "🔒 Temporary credentials detected (ASIA...). AWS_SESSION_TOKEN is",
          awsConfig.credentials.sessionToken ? "SET" : "NOT SET"
        );
      }
    }
  }

  async chat(
    messages: ChatMessage[],
    promptType: PromptType = "default",
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<BedrockResponse> {
    console.log("🔍 Chat method called. Client exists:", !!this.client);

    // Demo mode - return mock response if no client
    if (!this.client) {
      console.log("🚀 Using demo mode for chat");
      try {
        return await this.getMockResponse(messages, promptType);
      } catch (error) {
        console.error("❌ Error in demo mode:", error);
        return {
          content: `Sorry, there was an error in demo mode. Error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          usage: { input_tokens: 0, output_tokens: 0 },
        };
      }
    }

    try {
      const systemPrompt = customPrompts[promptType];

      // Format messages for Claude
      const formattedMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const payload = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: options?.maxTokens || bedrockConfig.maxTokens,
        temperature: options?.temperature || bedrockConfig.temperature,
        system: systemPrompt,
        messages: formattedMessages,
      };

      const command = new InvokeModelCommand({
        modelId: bedrockConfig.modelId,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(payload),
      });

      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      return {
        content: responseBody.content[0].text,
        usage: responseBody.usage,
      };
    } catch (error) {
      console.error("Bedrock API error:", error);
      // Gracefully fall back to mock response so UI doesn't break in production
      try {
        return await this.getMockResponse(messages, promptType);
      } catch (fallbackError) {
        console.error("Fallback to mock response failed:", fallbackError);
        throw new Error("Failed to get response from Bedrock");
      }
    }
  }

  async streamChat(
    messages: ChatMessage[],
    promptType: PromptType = "default",
    onChunk: (chunk: string) => void,
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<void> {
    // Demo mode - return mock streaming response if no client
    if (!this.client) {
      const mockResponse = this.getMockResponse(messages, promptType);
      const content = (await mockResponse).content;
      const words = content.split(" ");

      for (let i = 0; i < words.length; i++) {
        const chunk = words.slice(0, i + 1).join(" ");
        onChunk(chunk);
        // Small delay to simulate streaming
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return;
    }

    try {
      const systemPrompt = customPrompts[promptType];

      const formattedMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const payload = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: options?.maxTokens || bedrockConfig.maxTokens,
        temperature: options?.temperature || bedrockConfig.temperature,
        system: systemPrompt,
        messages: formattedMessages,
      };

      const command = new InvokeModelCommand({
        modelId: bedrockConfig.modelId,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(payload),
      });

      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      // For non-streaming, we'll simulate streaming by chunking the response
      const content = responseBody.content[0].text;
      const words = content.split(" ");

      for (let i = 0; i < words.length; i++) {
        const chunk = words.slice(0, i + 1).join(" ");
        onChunk(chunk);
        // Small delay to simulate streaming
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    } catch (error) {
      console.error("Bedrock streaming error:", error);
      throw new Error("Failed to stream response from Bedrock");
    }
  }

  private async getMockResponse(
    messages: ChatMessage[],
    promptType: PromptType
  ): Promise<BedrockResponse> {
    console.log(
      "🎭 Generating mock response for:",
      promptType,
      "with",
      messages.length,
      "messages"
    );
    const lastMessage = messages[messages.length - 1]?.content || "Hello";

    // Mock responses based on prompt type
    const responses = {
      default: `Hello! I'm a helpful AI assistant. You asked: "${lastMessage}". I'd be happy to help you with that! This is currently running in demo mode - configure your AWS credentials to enable full Bedrock functionality.`,
      funny: `Hey there! 😄 You said: "${lastMessage}". That's hilarious! Well, not really, but I'm programmed to be funny! 🤪 Did you hear about the AI that went to therapy? It had too many deep learning issues! 😂 (This is demo mode - add AWS creds for real Claude responses!)`,
      professional: `Good day. Regarding your inquiry: "${lastMessage}". I shall provide you with a comprehensive and professional response. Currently operating in demonstration mode. Please configure AWS Bedrock credentials for full service functionality.`,
      creative: `✨ Wow, "${lastMessage}" - that sparks so many creative possibilities! 🎨 Imagine if we could paint with words, dance with ideas, and sculpt dreams from thin air! 🌟 Your question opens doorways to infinite creativity! (Demo mode active - AWS setup needed for real magic!)`,
      medical: `Thank you for your medical inquiry: "${lastMessage}". Please note that I'm an AI assistant and this information is for educational purposes only. Always consult with qualified healthcare professionals for medical advice. Currently in demo mode - AWS configuration required for full medical knowledge base access.`,
    };

    // Simulate some processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      content: responses[promptType] || responses.default,
      usage: {
        input_tokens: 50,
        output_tokens: 100,
      },
    };
  }

  getAvailablePrompts(): Array<{
    key: PromptType;
    label: string;
    description: string;
  }> {
    return [
      {
        key: "default",
        label: "Default",
        description: "Helpful and conversational",
      },
      { key: "funny", label: "Funny", description: "Witty and entertaining" },
      {
        key: "professional",
        label: "Professional",
        description: "Formal and business-oriented",
      },
      {
        key: "creative",
        label: "Creative",
        description: "Imaginative and innovative",
      },
      {
        key: "medical",
        label: "Medical",
        description: "Medical information assistant",
      },
    ];
  }

  isConfigured(): boolean {
    const hasKeys =
      !!awsConfig.credentials.accessKeyId &&
      !!awsConfig.credentials.secretAccessKey;
    const needsSession = awsConfig.credentials.accessKeyId?.startsWith("ASIA");
    const hasSession = !!awsConfig.credentials.sessionToken;
    return !!(this.client && hasKeys && (!needsSession || hasSession));
  }
}

export const bedrockService = new BedrockService();
