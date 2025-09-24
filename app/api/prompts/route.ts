import { NextResponse } from "next/server";
import { bedrockService } from "@/lib/bedrock-service";

export async function GET() {
  try {
    const prompts = bedrockService.getAvailablePrompts();

    return NextResponse.json({
      prompts,
      success: true,
    });
  } catch (error) {
    console.error("Prompts API error:", error);
    return NextResponse.json(
      { error: "Failed to get available prompts" },
      { status: 500 }
    );
  }
}
