"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InsuredLocation } from "@/lib/types";
import { LocationMapDialog } from "@/components/shared/location-map-dialog";
import { MapPin, MapPinCheck, Plus, Trash2 } from "lucide-react";

export function TabLocationSchedule({
  locations,
  onAddLocation,
  onRemoveLocation,
}: {
  locations: InsuredLocation[];
  onAddLocation: (loc: InsuredLocation) => void;
  onRemoveLocation: (address: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [mapAddress, setMapAddress] = useState<string | null>(null);
  const [newLoc, setNewLoc] = useState<InsuredLocation>({
    address: "",
    type: "",
    description: "",
    reportable: true,
    effectiveStart: "",
    effectiveEnd: "",
  });

  const handleAdd = () => {
    if (!newLoc.address.trim()) return;
    onAddLocation({ ...newLoc, address: newLoc.address.trim() });
    setNewLoc({ address: "", type: "", description: "", reportable: true, effectiveStart: "", effectiveEnd: "" });
    setAdding(false);
  };

  return (
    <>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          Proposal Location Schedule
        </CardTitle>
        <Button size="sm" variant="outline" onClick={() => setAdding(!adding)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Location
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add location form */}
        {adding && (
          <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
            <p className="text-sm font-medium">New Location (will also be added to the submission schedule)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Address *</label>
                <Input
                  value={newLoc.address}
                  onChange={(e) => setNewLoc((p) => ({ ...p, address: e.target.value }))}
                  placeholder="123 Main St, City, ST 00000"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Type</label>
                <Input
                  value={newLoc.type || ""}
                  onChange={(e) => setNewLoc((p) => ({ ...p, type: e.target.value }))}
                  placeholder="Primary, Branch, Warehouse..."
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Description</label>
                <Input
                  value={newLoc.description || ""}
                  onChange={(e) => setNewLoc((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Location description"
                  className="h-8 text-sm"
                />
              </div>
              <div className="flex items-end gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={newLoc.reportable}
                    onCheckedChange={(v) => setNewLoc((p) => ({ ...p, reportable: !!v }))}
                  />
                  <span className="text-sm">Reportable</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Effective Start</label>
                <Input
                  type="date"
                  value={newLoc.effectiveStart || ""}
                  onChange={(e) => setNewLoc((p) => ({ ...p, effectiveStart: e.target.value }))}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Effective End</label>
                <Input
                  type="date"
                  value={newLoc.effectiveEnd || ""}
                  onChange={(e) => setNewLoc((p) => ({ ...p, effectiveEnd: e.target.value }))}
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={!newLoc.address.trim()}>
                <Plus className="h-4 w-4 mr-1" />
                Add to Schedule
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Location table */}
        {locations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No locations on this proposal. Click "Add Location" to add one.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">#</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Reportable</TableHead>
                <TableHead>Effective Start</TableHead>
                <TableHead>Effective End</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.map((loc, i) => (
                <TableRow key={loc.address}>
                  <TableCell className="text-sm text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="text-sm font-medium">{loc.address}</TableCell>
                  <TableCell>
                    {loc.type && <Badge variant="outline" className="text-xs">{loc.type}</Badge>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{loc.description || "—"}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={loc.reportable
                        ? "bg-green-50 text-green-700 border-green-200 text-xs"
                        : "bg-zinc-50 text-zinc-500 border-zinc-200 text-xs"}
                    >
                      {loc.reportable ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{loc.effectiveStart || "—"}</TableCell>
                  <TableCell className="text-sm">{loc.effectiveEnd || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-primary"
                        onClick={() => setMapAddress(loc.address)}
                        title="View on map"
                      >
                        <MapPinCheck className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => onRemoveLocation(loc.address)}
                        title="Remove from proposal schedule only"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <p className="text-xs text-muted-foreground">
          Adding a location adds it to both this proposal and the submission schedule. Removing only removes it from this proposal.
        </p>
      </CardContent>
    </Card>

    <LocationMapDialog
      address={mapAddress ?? ""}
      open={mapAddress !== null}
      onOpenChange={(open) => { if (!open) setMapAddress(null); }}
    />
    </>
  );
}
