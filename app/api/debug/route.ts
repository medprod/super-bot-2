import { NextRequest, NextResponse } from "next/server";
import { awsConfig, lexConfig, bedrockConfig } from "@/lib/aws-config";

export async function GET(request: NextRequest) {
  // Only allow in development or with a secret key for security
  const debugKey = request.nextUrl.searchParams.get("key");
  const isDevelopment = process.env.NODE_ENV === "development";
  
  if (!isDevelopment && debugKey !== process.env.DEBUG_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const environmentCheck = {
    // AWS Credentials
    hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
    hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
    hasSessionToken: !!process.env.AWS_SESSION_TOKEN,
    
    // AWS Regions
    awsRegion: process.env.AWS_REGION || "us-east-1",
    bedrockRegion: process.env.BEDROCK_REGION || "us-east-1",
    
    // Lex Configuration
    hasBotId: !!process.env.LEX_BOT_ID,
    hasBotAlias: !!process.env.LEX_BOT_ALIAS_ID,
    localeId: process.env.LEX_LOCALE_ID || "en_US",
    
    // Bedrock Configuration
    bedrockModelId: process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-sonnet-20240229-v1:0",
    
    // Runtime Configuration
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    
    // Actual values (masked for security)
    botId: process.env.LEX_BOT_ID ? `${process.env.LEX_BOT_ID.substring(0, 4)}...` : "Not set",
    botAlias: process.env.LEX_BOT_ALIAS_ID ? `${process.env.LEX_BOT_ALIAS_ID.substring(0, 4)}...` : "Not set",
    accessKey: process.env.AWS_ACCESS_KEY_ID ? `${process.env.AWS_ACCESS_KEY_ID.substring(0, 4)}...` : "Not set",
  };

  return NextResponse.json({
    message: "Environment Debug Information",
    environment: environmentCheck,
    config: {
      awsConfig: {
        region: awsConfig.region,
        hasCredentials: !!(awsConfig.credentials.accessKeyId && awsConfig.credentials.secretAccessKey),
      },
      lexConfig: {
        botId: lexConfig.botId ? `${lexConfig.botId.substring(0, 4)}...` : "Not set",
        botAliasId: lexConfig.botAliasId ? `${lexConfig.botAliasId.substring(0, 4)}...` : "Not set",
        localeId: lexConfig.localeId,
      },
      bedrockConfig: {
        modelId: bedrockConfig.modelId,
        region: bedrockConfig.region,
      },
    },
  });
}
