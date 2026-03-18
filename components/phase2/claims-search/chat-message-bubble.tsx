"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ClaimResultCard } from "./claim-result-card";
import { Bot, User } from "lucide-react";
import type { ChatMessage } from "@/lib/types";

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

interface ChatMessageBubbleProps {
  message: ChatMessage;
  selectable?: boolean;
  selectedClaimIds?: Set<string>;
  onToggleSelect?: (claimId: string) => void;
}

export function ChatMessageBubble({
  message,
  selectable,
  selectedClaimIds,
  onToggleSelect,
}: ChatMessageBubbleProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="flex items-start gap-2 max-w-[80%]">
          <div className="space-y-1">
            {message.selectedForm && (
              <div className="flex justify-end">
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                  Form: {message.selectedForm.formNumber}
                </Badge>
              </div>
            )}
            <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-2.5">
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mt-1">
            <User className="h-3.5 w-3.5 text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="flex items-start gap-2 max-w-[85%]">
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center mt-1">
          <Bot className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="space-y-3 min-w-0">
          {message.isLoading ? (
            <div className="bg-muted/50 rounded-2xl rounded-bl-sm px-4 py-3">
              <LoadingSkeleton />
            </div>
          ) : (
            <>
              <div className="bg-muted/50 rounded-2xl rounded-bl-sm px-4 py-2.5">
                <div className="text-sm prose prose-sm max-w-none [&_strong]:font-semibold">
                  {message.content.split("\n").map((line, i) => (
                    <p key={i} className={line === "" ? "h-2" : "mb-1 last:mb-0"}>
                      {line.split(/(\*\*[^*]+\*\*)/).map((part, j) => {
                        if (part.startsWith("**") && part.endsWith("**")) {
                          return <strong key={j}>{part.slice(2, -2)}</strong>;
                        }
                        return part;
                      })}
                    </p>
                  ))}
                </div>
              </div>
              {message.results && message.results.length > 0 && (
                <div className="space-y-2">
                  {message.results.map((result) => (
                    <ClaimResultCard
                      key={result.claim.id}
                      result={result}
                      selectable={selectable}
                      selected={selectedClaimIds?.has(result.claim.id)}
                      onToggleSelect={onToggleSelect}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
