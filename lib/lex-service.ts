import {
  LexRuntimeV2Client,
  RecognizeTextCommand,
  RecognizeUtteranceCommand,
} from "@aws-sdk/client-lex-runtime-v2";
import { awsConfig, lexConfig } from "./aws-config";

export interface LexIntent {
  name: string;
  confirmationState?: "Confirmed" | "Denied" | "None";
  slots?: Record<string, unknown>;
}

export interface LexResponse {
  message?: string;
  intent?: LexIntent;
  sessionState?: unknown;
  interpretations?: unknown[];
}

class LexService {
  private client: LexRuntimeV2Client;
  private sessionId: string;

  constructor() {
    this.client = new LexRuntimeV2Client({
      region: awsConfig.region,
      credentials: awsConfig.credentials,
    });
    this.sessionId = lexConfig.sessionId();
  }

  async recognizeText(
    text: string,
    sessionAttributes?: Record<string, string>
  ): Promise<LexResponse> {
    try {
      const command = new RecognizeTextCommand({
        botId: lexConfig.botId,
        botAliasId: lexConfig.botAliasId,
        localeId: lexConfig.localeId,
        sessionId: this.sessionId,
        text: text,
        sessionState: {
          sessionAttributes: sessionAttributes || {},
        },
      });

      const response = await this.client.send(command);

      return {
        message: response.messages?.[0]?.content,
        intent: response.sessionState?.intent
          ? {
              name: response.sessionState.intent.name || "",
              confirmationState: response.sessionState.intent.confirmationState,
              slots: response.sessionState.intent.slots,
            }
          : undefined,
        sessionState: response.sessionState,
        interpretations: response.interpretations,
      };
    } catch (error) {
      console.error("Lex text recognition error:", error);
      throw new Error("Failed to process text with Lex");
    }
  }

  async recognizeAudio(
    audioBlob: Blob,
    contentType: string = "audio/wav"
  ): Promise<LexResponse> {
    try {
      const audioBuffer = await audioBlob.arrayBuffer();

      const command = new RecognizeUtteranceCommand({
        botId: lexConfig.botId,
        botAliasId: lexConfig.botAliasId,
        localeId: lexConfig.localeId,
        sessionId: this.sessionId,
        requestContentType: contentType,
        inputStream: new Uint8Array(audioBuffer),
      });

      const response = await this.client.send(command);

      // Parse the response
      const message = "";
      if (response.audioStream) {
        await this.streamToBuffer(response.audioStream as ReadableStream);
        // You might need to implement audio-to-text conversion here
        // For now, we'll use the text response if available
      }

      return {
        message: response.messages || message,
        sessionState: response.sessionState,
      };
    } catch (error) {
      console.error("Lex audio recognition error:", error);
      throw new Error("Failed to process audio with Lex");
    }
  }

  private async streamToBuffer(stream: ReadableStream): Promise<Buffer> {
    const chunks: Uint8Array[] = [];
    const reader = stream.getReader();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    
    return Buffer.concat(chunks);
  }

  // Reset session for new conversation
  resetSession(): void {
    this.sessionId = lexConfig.sessionId();
  }

  getCurrentSessionId(): string {
    return this.sessionId;
  }

  // Helper method to check if Lex is properly configured
  isConfigured(): boolean {
    return !!(
      lexConfig.botId &&
      lexConfig.botAliasId &&
      awsConfig.credentials.accessKeyId
    );
  }
}

export const lexService = new LexService();
