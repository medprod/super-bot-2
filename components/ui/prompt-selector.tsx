"use client";

import { useState } from "react";
import {
  ChevronDown,
  Bot,
  Sparkles,
  Briefcase,
  Lightbulb,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type PromptType } from "@/lib/aws-config";

interface PromptOption {
  key: PromptType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const promptOptions: PromptOption[] = [
  {
    key: "default",
    label: "Default",
    description: "Helpful and conversational",
    icon: <Bot className="h-4 w-4" />,
    color: "bg-blue-500",
  },
  {
    key: "funny",
    label: "Funny",
    description: "Witty and entertaining",
    icon: <Sparkles className="h-4 w-4" />,
    color: "bg-yellow-500",
  },
  {
    key: "professional",
    label: "Professional",
    description: "Formal and business-oriented",
    icon: <Briefcase className="h-4 w-4" />,
    color: "bg-gray-600",
  },
  {
    key: "creative",
    label: "Creative",
    description: "Imaginative and innovative",
    icon: <Lightbulb className="h-4 w-4" />,
    color: "bg-purple-500",
  },
  {
    key: "medical",
    label: "Medical",
    description: "Medical information assistant",
    icon: <Heart className="h-4 w-4" />,
    color: "bg-red-500",
  },
];

interface PromptSelectorProps {
  selectedPrompt: PromptType;
  onPromptChange: (prompt: PromptType) => void;
  className?: string;
}

export function PromptSelector({
  selectedPrompt,
  onPromptChange,
  className,
}: PromptSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption =
    promptOptions.find((option) => option.key === selectedPrompt) ||
    promptOptions[0];

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between h-auto p-3"
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-1.5 rounded-full text-white",
              selectedOption.color
            )}
          >
            {selectedOption.icon}
          </div>
          <div className="text-left">
            <div className="font-medium">{selectedOption.label}</div>
            <div className="text-xs text-muted-foreground">
              {selectedOption.description}
            </div>
          </div>
        </div>
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
        />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-background border rounded-lg shadow-lg">
          <div className="p-2 space-y-1">
            {promptOptions.map((option) => (
              <Button
                key={option.key}
                variant="ghost"
                onClick={() => {
                  onPromptChange(option.key);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full justify-start h-auto p-3",
                  option.key === selectedPrompt && "bg-muted"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-1.5 rounded-full text-white",
                      option.color
                    )}
                  >
                    {option.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {option.description}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
