"use client";
import type { EvidenceSpan as EvidenceSpanType, TightnessDirection, MechanismType } from "@/lib/types";
import { EvidenceSpan } from "./evidence-span";
import { TightnessBadge } from "./tightness-badge";
import { MechanismTag } from "./mechanism-tag";

export function SideBySideDiff({ markelSpan, kinsaleSpan, tightness, mechanism }: {
  markelSpan: EvidenceSpanType; kinsaleSpan: EvidenceSpanType; tightness: TightnessDirection; mechanism: MechanismType;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-3">
        <TightnessBadge direction={tightness} />
        <MechanismTag mechanism={mechanism} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Markel</h4>
          <EvidenceSpan span={markelSpan} highlightColor="bg-green-100" />
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Kinsale</h4>
          <EvidenceSpan span={kinsaleSpan} highlightColor="bg-red-100" />
        </div>
      </div>
    </div>
  );
}
