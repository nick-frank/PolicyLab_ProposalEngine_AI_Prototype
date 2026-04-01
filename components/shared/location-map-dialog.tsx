"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPinOff, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";
import { geocodeAddress, type GeocodeResult } from "@/lib/geocode";

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full flex items-center justify-center bg-muted/30 rounded-lg">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  ),
});

type Status = "idle" | "loading" | "success" | "not_found" | "error";

const CONFIDENCE_BADGE: Record<string, { className: string; icon: typeof CheckCircle2; label: string }> = {
  high: { className: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2, label: "Address verified" },
  medium: { className: "bg-amber-50 text-amber-700 border-amber-200", icon: AlertTriangle, label: "Approximate match" },
  low: { className: "bg-zinc-50 text-zinc-500 border-zinc-200", icon: HelpCircle, label: "Low confidence match" },
};

export function LocationMapDialog({
  address,
  open,
  onOpenChange,
}: {
  address: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [result, setResult] = useState<GeocodeResult | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (!open || !address) {
      return;
    }

    setStatus("loading");
    setResult(null);

    const controller = new AbortController();

    geocodeAddress(address, controller.signal)
      .then((r) => {
        if (controller.signal.aborted) return;
        if (r) {
          setResult(r);
          setStatus("success");
        } else {
          setResult(null);
          setStatus("not_found");
        }
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        if (err.name !== "AbortError") {
          setResult(null);
          setStatus("error");
        }
      });

    return () => controller.abort();
  }, [open, address]);

  const badge = result ? CONFIDENCE_BADGE[result.confidence] : null;
  const BadgeIcon = badge?.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Location Map</DialogTitle>
          <DialogDescription className="break-words">{address}</DialogDescription>
        </DialogHeader>

        {/* Validation badge */}
        {status === "success" && badge && BadgeIcon && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`gap-1 ${badge.className}`}>
              <BadgeIcon className="h-3 w-3" />
              {badge.label}
            </Badge>
          </div>
        )}

        {/* Map area */}
        {(status === "idle" || status === "loading") && (
          <div className="h-[400px] w-full flex items-center justify-center bg-muted/30 rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Locating address...</span>
            </div>
          </div>
        )}

        {status === "success" && result && (
          <>
            <div className="h-[400px] w-full rounded-lg overflow-hidden border">
              <LeafletMap lat={result.lat} lng={result.lng} address={address} />
            </div>
            <p className="text-xs text-muted-foreground">{result.displayName}</p>
          </>
        )}

        {status === "not_found" && (
          <div className="h-[400px] w-full flex items-center justify-center bg-muted/30 rounded-lg">
            <div className="flex flex-col items-center gap-3 text-center px-8">
              <MapPinOff className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium">Address could not be located</p>
              <p className="text-xs text-muted-foreground">The address may be incomplete or incorrectly formatted.</p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="h-[400px] w-full flex items-center justify-center bg-muted/30 rounded-lg">
            <div className="flex flex-col items-center gap-3 text-center px-8">
              <MapPinOff className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium">Unable to connect to geocoding service</p>
              <p className="text-xs text-muted-foreground">Please check your network connection and try again.</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
