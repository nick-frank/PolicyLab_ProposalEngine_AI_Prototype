"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PortalNote } from "@/lib/types";
import { Sparkles, RefreshCw, Bot, Send, MessageSquare, Mail } from "lucide-react";

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

const SAMPLE_SUMMARY = "This proposal provides a standard Commercial General Liability program for Pacific Coast Builders LLC, a commercial building contractor in California. Coverage is written on an occurrence form (CG 00 01) with $1M per occurrence / $2M aggregate limits. Key endorsements include a cyber exclusion credit (-$1,900), waiver of subrogation (+$1,140), designated work exclusion for highway/bridge/dam work (-$850), and minimum earned/retained premium provisions (25%/100%). The indicated premium of $40,688 is derived from three class codes across three locations, with LCMs ranging from 1.10 to 1.20. Total premium including form adjustments, fees, and terrorism coverage is approximately $43,500.";

export function ProposalSummaryNotes({
  initialNotes,
  initialSummary,
}: {
  initialNotes: PortalNote[];
  initialSummary?: string;
}) {
  const [summary, setSummary] = useState(initialSummary || SAMPLE_SUMMARY);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [notes, setNotes] = useState(initialNotes);
  const [newNote, setNewNote] = useState("");

  const handleRegenerate = () => {
    setIsRegenerating(true);
    // Stub — would call AI endpoint with current proposal state
    setTimeout(() => {
      setSummary(summary + "\n\n[Updated " + new Date().toLocaleTimeString() + "] Summary regenerated based on current proposal state.");
      setIsRegenerating(false);
    }, 1500);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note: PortalNote = {
      id: `pn-new-${Date.now()}`,
      submissionId: notes[0]?.submissionId || "",
      type: "note",
      author: "Current User",
      timestamp: new Date().toISOString(),
      content: newNote.trim(),
    };
    setNotes([note, ...notes]);
    setNewNote("");
  };

  const sorted = [...notes].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Generative Proposal Summary */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-1">
            <Sparkles className="h-4 w-4 text-violet-600" />
            Generative Proposal Summary
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRegenerate}
            disabled={isRegenerating}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRegenerating ? "animate-spin" : ""}`} />
            {isRegenerating ? "Regenerating..." : "Regenerate"}
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{summary}</p>
          <div className="mt-3 flex items-center gap-1 text-xs text-violet-600">
            <Bot className="h-3 w-3" />
            <span>AI-generated summary — regenerate to reflect latest changes</span>
          </div>
        </CardContent>
      </Card>

      {/* Proposal Notes */}
      <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Proposal Notes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 min-h-0">
          {/* Add Note */}
          <div className="flex gap-2 mb-3">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note..."
              className="flex-1 min-h-[60px] max-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
            <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()} className="self-end">
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Notes Feed — scrollable */}
          <div className="overflow-y-auto max-h-[280px] space-y-2 pr-1">
            {sorted.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No notes yet.</p>
            ) : (
              sorted.map((entry) => (
                <div key={entry.id} className="border rounded-md p-2.5 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      {entry.type === "note" ? (
                        <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                      ) : (
                        <Mail className="h-3.5 w-3.5 text-purple-500" />
                      )}
                      <span className="font-medium text-xs">{entry.author}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatTimestamp(entry.timestamp)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">{entry.content}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
