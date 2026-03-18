"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ChatMessageBubble } from "@/components/phase2/claims-search/chat-message-bubble";
import { ChatInput } from "@/components/phase2/claims-search/chat-input";
import { SuggestedPrompts } from "@/components/phase2/claims-search/suggested-prompts";
import { ClaimSelectionBar } from "@/components/phase2/claims-search/claim-selection-bar";
import { ClaimSetPanel } from "@/components/phase2/claims-search/claim-set-panel";
import { useClaimSets } from "@/components/phase2/claims-search/use-claim-sets";
import { MOCK_CLAIMS } from "@/lib/mock-data";
import {
  searchClaims,
  searchClaimsByForm,
  generateAISummary,
} from "@/lib/claims-search-engine";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layers } from "lucide-react";
import type { ChatMessage, MockClaim } from "@/lib/types";

let messageIdCounter = 0;
function nextId() {
  return `msg-${++messageIdCounter}`;
}

const claimsMap: Map<string, MockClaim> = new Map(
  MOCK_CLAIMS.map((c) => [c.id, c])
);

export default function ClaimsSearchPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const cs = useClaimSets();

  const selectionMode = cs.pendingClaimIds.size > 0 || cs.claimSets.length > 0;

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 50);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(
    (
      text: string,
      selectedForm?: { formNumber: string; formName: string }
    ) => {
      const userMessage: ChatMessage = {
        id: nextId(),
        role: "user",
        content: text,
        timestamp: new Date().toISOString(),
        selectedForm,
      };

      const loadingId = nextId();
      const loadingMessage: ChatMessage = {
        id: loadingId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
        isLoading: true,
      };

      setMessages((prev) => [...prev, userMessage, loadingMessage]);
      setIsSearching(true);

      const delay = 1200 + Math.random() * 600;
      setTimeout(() => {
        const results = selectedForm
          ? searchClaimsByForm(selectedForm.formNumber, MOCK_CLAIMS)
          : searchClaims(text, MOCK_CLAIMS);

        const summary = generateAISummary(
          selectedForm
            ? `claims associated with form ${selectedForm.formNumber} (${selectedForm.formName})`
            : text,
          results
        );

        setMessages((prev) =>
          prev.map((m) =>
            m.id === loadingId
              ? {
                  ...m,
                  content: summary,
                  results,
                  isLoading: false,
                }
              : m
          )
        );
        setIsSearching(false);
      }, delay);
    },
    []
  );

  const handlePromptSelect = useCallback(
    (prompt: string) => {
      handleSend(prompt);
    },
    [handleSend]
  );

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex-none px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Claims Search</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Search claims using natural language queries, keywords, or form associations
          </p>
        </div>
        <Button
          variant={showPanel ? "default" : "outline"}
          size="sm"
          className="gap-1.5"
          onClick={() => setShowPanel(!showPanel)}
        >
          <Layers className="h-4 w-4" />
          Claim Sets
          {cs.claimSets.length > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 h-5 min-w-[20px] px-1 text-xs"
            >
              {cs.claimSets.length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Body: chat + optional side panel */}
      <div className="flex-1 flex flex-row min-h-0">
        {/* Chat column */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          {/* Message feed or empty state */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {hasMessages ? (
              <div
                ref={scrollRef}
                className="h-full overflow-y-auto px-6 pb-4"
              >
                <div className="max-w-3xl mx-auto space-y-4">
                  {messages.map((message) => (
                    <ChatMessageBubble
                      key={message.id}
                      message={message}
                      selectable={selectionMode}
                      selectedClaimIds={cs.pendingClaimIds}
                      onToggleSelect={cs.togglePendingClaim}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <SuggestedPrompts onSelect={handlePromptSelect} />
            )}
          </div>

          {/* Floating selection bar */}
          {cs.pendingClaimIds.size > 0 && (
            <ClaimSelectionBar
              pendingCount={cs.pendingClaimIds.size}
              claimSets={cs.claimSets}
              onCreateSet={(name, ids) => {
                cs.createSet(name, ids);
                setShowPanel(true);
              }}
              onAddToSet={(setId, ids) => {
                cs.addClaimsToSet(setId, ids);
                cs.setActiveSetId(setId);
                setShowPanel(true);
              }}
              onClear={cs.clearPending}
              pendingClaimIds={cs.pendingClaimIds}
            />
          )}

          {/* Input area */}
          <div className="flex-none border-t bg-background px-6 py-4">
            <div className="max-w-3xl mx-auto">
              <ChatInput onSend={handleSend} disabled={isSearching} />
            </div>
          </div>
        </div>

        {/* Side panel */}
        {showPanel && (
          <div className="w-[400px] border-l flex-shrink-0 flex flex-col min-h-0 bg-background">
            <div className="flex-none px-4 py-3 border-b">
              <h2 className="text-sm font-semibold">Claim Sets</h2>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <ClaimSetPanel
                claimSets={cs.claimSets}
                activeSet={cs.activeSet}
                claimsMap={claimsMap}
                onSelectSet={cs.setActiveSetId}
                onBack={() => cs.setActiveSetId(null)}
                onDeleteSet={cs.deleteSet}
                onRename={cs.renameSet}
                onRemoveClaim={cs.removeClaimFromSet}
                onAddAllocation={cs.addAllocation}
                onRemoveAllocation={cs.removeAllocation}
                onUpdatePercentage={cs.updateAllocationPercentage}
                onDistributeEvenly={cs.distributeEvenly}
                onFillRemaining={cs.fillRemaining}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
