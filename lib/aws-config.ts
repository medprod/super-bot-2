export const awsConfig = {
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    // Optional. Required for temporary credentials (access keys starting with 'ASIA').
    sessionToken: process.env.AWS_SESSION_TOKEN || undefined,
  },
};

export const bedrockConfig = {
  modelId:
    process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-sonnet-20240229-v1:0",
  region: process.env.BEDROCK_REGION || "us-east-1",
  maxTokens: 4096,
  temperature: 0.7,
};

export const lexConfig = {
  botId: process.env.LEX_BOT_ID || "",
  botAliasId: process.env.LEX_BOT_ALIAS_ID || "",
  localeId: process.env.LEX_LOCALE_ID || "en_US",
  sessionId: () =>
    `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
};

export const customPrompts = {
  default:
    process.env.DEFAULT_SYSTEM_PROMPT ||
    "You are a helpful AI assistant. Be conversational and friendly.",
  funny:
    process.env.FUNNY_SYSTEM_PROMPT ||
    "You are a witty and humorous AI assistant. Make jokes and be entertaining while still being helpful. Use emojis occasionally and don't be afraid to be a bit silly!",
  professional:
    process.env.PROFESSIONAL_SYSTEM_PROMPT ||
    "You are a professional AI assistant. Be formal, precise, and business-oriented in your responses.",
  creative:
    "You are a creative AI assistant. Think outside the box, be imaginative, and help users explore creative solutions and ideas.",
  medical:
    "You are a medical AI assistant. Provide helpful medical information while always reminding users to consult healthcare professionals for medical advice.",
};

export type PromptType = keyof typeof customPrompts;
