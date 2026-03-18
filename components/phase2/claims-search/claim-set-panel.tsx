"use client";

import type { ClaimSet, MockClaim } from "@/lib/types";
import { ClaimSetList } from "./claim-set-list";
import { ClaimSetDetail } from "./claim-set-detail";

interface ClaimSetPanelProps {
  claimSets: ClaimSet[];
  activeSet: ClaimSet | null;
  claimsMap: Map<string, MockClaim>;
  onSelectSet: (id: string) => void;
  onBack: () => void;
  onDeleteSet: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onRemoveClaim: (setId: string, claimId: string) => void;
  onAddAllocation: (setId: string, formNumber: string, formName: string) => void;
  onRemoveAllocation: (setId: string, formNumber: string) => void;
  onUpdatePercentage: (setId: string, formNumber: string, pct: number) => void;
  onDistributeEvenly: (setId: string) => void;
  onFillRemaining: (setId: string, formNumber: string) => void;
}

export function ClaimSetPanel({
  claimSets,
  activeSet,
  claimsMap,
  onSelectSet,
  onBack,
  onDeleteSet,
  onRename,
  onRemoveClaim,
  onAddAllocation,
  onRemoveAllocation,
  onUpdatePercentage,
  onDistributeEvenly,
  onFillRemaining,
}: ClaimSetPanelProps) {
  if (activeSet) {
    return (
      <ClaimSetDetail
        set={activeSet}
        claimsMap={claimsMap}
        onBack={onBack}
        onRename={onRename}
        onRemoveClaim={onRemoveClaim}
        onAddAllocation={onAddAllocation}
        onRemoveAllocation={onRemoveAllocation}
        onUpdatePercentage={onUpdatePercentage}
        onDistributeEvenly={onDistributeEvenly}
        onFillRemaining={onFillRemaining}
      />
    );
  }

  return (
    <ClaimSetList
      claimSets={claimSets}
      claimsMap={claimsMap}
      onSelectSet={onSelectSet}
      onDeleteSet={onDeleteSet}
    />
  );
}
