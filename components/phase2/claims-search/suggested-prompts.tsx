"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Droplets,
  HardHat,
  Leaf,
  FileText,
  TrendingUp,
} from "lucide-react";

const SUGGESTED_PROMPTS = [
  {
    icon: Search,
    text: "Show me all open bodily injury claims over $100,000",
  },
  {
    icon: Droplets,
    text: "Find claims related to water damage or plumbing",
  },
  {
    icon: HardHat,
    text: "Which claims involve subcontractor operations?",
  },
  {
    icon: Leaf,
    text: "Claims with pollution or environmental exposure",
  },
  {
    icon: FileText,
    text: "Find claims associated with form CG 21 49",
  },
  {
    icon: TrendingUp,
    text: "What are the largest reserved claims from 2024?",
  },
];

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-lg font-semibold">Claims Search</h2>
          <p className="text-sm text-muted-foreground">
            Search claims using natural language. Ask about specific incidents,
            coverage types, forms, or financial thresholds.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <Card
              key={prompt.text}
              className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
              onClick={() => onSelect(prompt.text)}
            >
              <CardContent className="p-3 flex items-start gap-3">
                <prompt.icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-sm">{prompt.text}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
