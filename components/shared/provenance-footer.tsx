import type { Provenance } from "@/lib/types";

export function ProvenanceFooter({ provenance, compact = false }: {
  provenance: Provenance; compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="text-xs text-muted-foreground">
        {provenance.documentName} · p.{provenance.pageNumber}
      </div>
    );
  }
  return (
    <div className="text-xs text-muted-foreground flex flex-wrap gap-x-2 gap-y-0.5">
      <span>{provenance.documentName}</span>
      <span>|</span>
      <span>p.{provenance.pageNumber}</span>
      {provenance.clauseId && (<><span>|</span><span>Clause {provenance.clauseId}</span></>)}
      <span>|</span>
      <span>{provenance.modelVersion}</span>
      <span>|</span>
      <span>{provenance.extractionTimestamp}</span>
    </div>
  );
}
