"use client";

import { useState, useEffect } from "react";

export function useMockDelay(delayMs: number = 400): { isLoading: boolean } {
  const [isLoading, setIsLoading] = useState(delayMs > 0);

  useEffect(() => {
    if (delayMs <= 0) return;
    const timer = setTimeout(() => setIsLoading(false), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  return { isLoading };
}
