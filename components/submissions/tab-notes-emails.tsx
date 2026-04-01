"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { PortalNote } from "@/lib/types";
import { MessageSquare, Mail, ChevronDown, Send } from "lucide-react";
import { cn } from "@/lib/utils";

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function TabNotesEmails({ initialNotes, readOnly = false }: { initialNotes: PortalNote[]; readOnly?: boolean }) {
  const [notes, setNotes] = useState(initialNotes);
  const [newNote, setNewNote] = useState("");
  const [expandedEmails, setExpandedEmails] = useState<Set<string>>(new Set());

  // Sort chronologically (newest first)
  const sorted = [...notes].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note: PortalNote = {
      id: `n-new-${Date.now()}`,
      submissionId: notes[0]?.submissionId || "",
      type: "note",
      author: "Current User",
      timestamp: new Date().toISOString(),
      content: newNote.trim(),
    };
    setNotes([note, ...notes]);
    setNewNote("");
  };

  const toggleEmail = (id: string) => {
    setExpandedEmails((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Notes & Emails</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Note */}
        {!readOnly && (
          <div className="flex gap-2">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note..."
              className="flex-1 min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()} className="self-end">
              <Send className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        )}

        {/* Feed */}
        <div className="space-y-3">
          {sorted.map((entry) => (
            <div key={entry.id} className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                {entry.type === "note" ? (
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                ) : (
                  <Mail className="h-4 w-4 text-purple-500" />
                )}
                <Badge variant="outline" className="text-xs">
                  {entry.type}
                </Badge>
                <span className="text-sm font-medium">{entry.author}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {formatTimestamp(entry.timestamp)}
                </span>
              </div>

              {entry.type === "email" ? (
                <Collapsible open={expandedEmails.has(entry.id)} onOpenChange={() => toggleEmail(entry.id)}>
                  <CollapsibleTrigger className="w-full text-left">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{entry.subject}</span>
                      <ChevronDown className={cn("h-3 w-3 ml-auto transition-transform", expandedEmails.has(entry.id) && "rotate-180")} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      From: {entry.from} → To: {entry.to}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <p className="text-sm mt-2 whitespace-pre-wrap">{entry.content}</p>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
              )}
            </div>
          ))}

          {sorted.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No notes or emails yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
