"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckSquare, Plus, FolderPlus, X } from "lucide-react";
import type { ClaimSet } from "@/lib/types";

interface ClaimSelectionBarProps {
  pendingCount: number;
  claimSets: ClaimSet[];
  onCreateSet: (name: string, claimIds: string[]) => void;
  onAddToSet: (setId: string, claimIds: string[]) => void;
  onClear: () => void;
  pendingClaimIds: Set<string>;
}

export function ClaimSelectionBar({
  pendingCount,
  claimSets,
  onCreateSet,
  onAddToSet,
  onClear,
  pendingClaimIds,
}: ClaimSelectionBarProps) {
  const [showNameInput, setShowNameInput] = useState(false);
  const [newSetName, setNewSetName] = useState("");
  const [showAddDropdown, setShowAddDropdown] = useState(false);

  if (pendingCount === 0) return null;

  const ids = Array.from(pendingClaimIds);

  const handleCreate = () => {
    const name = newSetName.trim() || `Claim Set ${claimSets.length + 1}`;
    onCreateSet(name, ids);
    setNewSetName("");
    setShowNameInput(false);
  };

  return (
    <div className="flex-none border-t border-b bg-muted/30 px-6 py-2.5">
      <div className="max-w-3xl mx-auto flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <CheckSquare className="h-4 w-4 text-primary" />
          <span>{pendingCount} claim{pendingCount !== 1 ? "s" : ""} selected</span>
        </div>

        <div className="flex-1" />

        {showNameInput ? (
          <div className="flex items-center gap-2">
            <Input
              value={newSetName}
              onChange={(e) => setNewSetName(e.target.value)}
              placeholder="Set name..."
              className="h-8 w-48 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") setShowNameInput(false);
              }}
            />
            <Button size="sm" variant="default" className="h-8" onClick={handleCreate}>
              Create
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => setShowNameInput(false)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <>
            <Button
              size="sm"
              variant="default"
              className="h-8 gap-1.5"
              onClick={() => setShowNameInput(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Create New Set
            </Button>

            {claimSets.length > 0 && (
              <div className="relative">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5"
                  onClick={() => setShowAddDropdown(!showAddDropdown)}
                >
                  <FolderPlus className="h-3.5 w-3.5" />
                  Add to Set
                </Button>
                {showAddDropdown && (
                  <div className="absolute bottom-full mb-1 right-0 w-56 bg-background border rounded-md shadow-lg py-1 z-50">
                    {claimSets.map((set) => (
                      <button
                        key={set.id}
                        className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                        onClick={() => {
                          onAddToSet(set.id, ids);
                          setShowAddDropdown(false);
                        }}
                      >
                        {set.name}{" "}
                        <span className="text-muted-foreground">
                          ({set.claimIds.length} claims)
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <Button size="sm" variant="ghost" className="h-8 text-muted-foreground" onClick={onClear}>
          Clear
        </Button>
      </div>
    </div>
  );
}
