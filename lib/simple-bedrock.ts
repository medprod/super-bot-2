export interface SimpleChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface SimpleBedrock {
  content: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export async function simpleChat(
  messages: SimpleChatMessage[],
  promptType: string = "default"
): Promise<SimpleBedrock> {
  console.log("🚀 Simple chat called with", messages.length, "messages");

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
    content:
      responses[promptType as keyof typeof responses] || responses.default,
    usage: {
      input_tokens: 50,
      output_tokens: 100,
    },
  };
}
