"use client";

import { ExposureRating } from "@/components/rating/exposure-rating";
import type { PortalSubmission } from "@/lib/types";

interface TabRatesGLProps {
  submission: PortalSubmission;
}

export function TabRatesGL({ submission }: TabRatesGLProps) {
  return (
    <ExposureRating
      initialInsured={submission.insuredName}
      initialTerritory={`${submission.state}-01`}
      initialEffectiveDate={submission.effectiveDate}
      initialExpirationDate={submission.expirationDate}
      pl2="General Liability"
    />
  );
}
