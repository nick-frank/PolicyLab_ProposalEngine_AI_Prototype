"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PricedFormsCard } from "./priced-forms-card";
import { AdditionalCoveragesCard } from "./additional-coverages-card";
import type { PortalProposal, PortalRate, PortalLossRun, PortalLossDetail, SubmissionForm, InsuredLocation } from "@/lib/types";
import { DollarSign, Shield, FileText, BarChart3, Receipt, MapPin, Plus, Trash2, ShieldAlert, ClipboardList, Pencil, Check } from "lucide-react";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function TabPricingWorksheet({
  proposal,
  rates,
  forms,
  lossRuns = [],
  lossDetails = [],
  proposalLocations = [],
  readOnly = false,
}: {
  proposal: PortalProposal;
  rates: PortalRate[];
  forms: SubmissionForm[];
  lossRuns?: PortalLossRun[];
  lossDetails?: PortalLossDetail[];
  proposalLocations?: InsuredLocation[];
  readOnly?: boolean;
}) {
  const initialFormAdj = useMemo(() => {
    let total = 0;
    for (const f of forms) {
      for (const adj of f.adjustments || []) {
        total += adj.type === "credit" ? -adj.amount : adj.amount;
      }
    }
    return total;
  }, [forms]);

  const [totalFormAdjustments, setTotalFormAdjustments] = useState(initialFormAdj);

  const pricedForms = useMemo(
    () => forms.filter((f) => (f.adjustments?.length ?? 0) > 0),
    [forms],
  );

  const [deductibles, setDeductibles] = useState([
    { id: "ded-1", type: "Per Occurrence Deductible", appliesTo: "Bodily Injury & Property Damage", amount: 5000, enabled: true },
    { id: "ded-2", type: "Products/Completed Ops Deductible", appliesTo: "Products & Completed Operations", amount: 5000, enabled: true },
  ]);

  let dedNextId = 100;
  const toggleDeductible = (id: string) => {
    setDeductibles((prev) => prev.map((d) => d.id === id ? { ...d, enabled: !d.enabled } : d));
  };
  const removeDeductible = (id: string) => {
    setDeductibles((prev) => prev.filter((d) => d.id !== id));
  };
  const addDeductible = () => {
    setDeductibles((prev) => [...prev, { id: `ded-new-${++dedNextId}`, type: "", appliesTo: "", amount: 0, enabled: true }]);
  };
  const updateDeductible = (id: string, field: "type" | "appliesTo" | "amount", value: string) => {
    setDeductibles((prev) => prev.map((d) => {
      if (d.id !== id) return d;
      if (field === "amount") return { ...d, amount: parseFloat(value) || 0 };
      return { ...d, [field]: value };
    }));
  };

  const [coverages, setCoverages] = useState([
    { id: "cov-1", name: "Coverage Limits", enabled: true, limits: [
      { id: "lim-1a", label: "Per Occurrence", amount: 1000000 },
      { id: "lim-1b", label: "General Aggregate", amount: 2000000 },
    ]},
    { id: "cov-2", name: "Products / Completed Operations Aggregate", enabled: true, limits: [
      { id: "lim-2", label: "Limit", amount: 2000000 },
    ]},
    { id: "cov-3", name: "Personal / Advertising Injury", enabled: true, limits: [
      { id: "lim-3", label: "Limit", amount: 1000000 },
    ]},
    { id: "cov-4", name: "Damage to Premises Rented to You", enabled: true, limits: [
      { id: "lim-4", label: "Limit", amount: 100000 },
    ]},
    { id: "cov-5", name: "Medical Expense", enabled: false, limits: [
      { id: "lim-5", label: "Limit", amount: 5000 },
    ]},
    { id: "cov-6", name: "Per Location/Project Aggregate Cap", enabled: false, limits: [
      { id: "lim-6", label: "Limit", amount: 2000000 },
    ]},
    { id: "cov-7", name: "Aggregate Reinstatements (per policy period)", enabled: false, limits: [
      { id: "lim-7", label: "Limit", amount: 0 },
    ]},
  ]);

  const toggleCoverage = (id: string) => {
    setCoverages((prev) => prev.map((c) => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  const updateCoverageLimit = (covId: string, limId: string, value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    setCoverages((prev) => prev.map((c) => {
      if (c.id !== covId) return c;
      return { ...c, limits: c.limits.map((l) => l.id === limId ? { ...l, amount: num } : l) };
    }));
  };

  const [fees, setFees] = useState([
    { id: "fee-1", name: "Surplus Lines Tax", description: "State surplus lines tax", rate: 3, flatAmount: 0, enabled: true },
    { id: "fee-2", name: "Stamping Fee", description: "State stamping office fee", rate: 0.18, flatAmount: 0, enabled: true },
    { id: "fee-3", name: "Policy Fee", description: "Policy issuance and administration", rate: 0, flatAmount: 250, enabled: true },
    { id: "fee-4", name: "Filing Fee", description: "State filing fee", rate: 0, flatAmount: 175, enabled: false },
  ]);

  const toggleFee = (id: string) => {
    setFees((prev) => prev.map((f) => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  const updateFeeRate = (id: string, value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    setFees((prev) => prev.map((f) => f.id === id ? { ...f, rate: num } : f));
  };

  let feeNextId = 200;
  const addFee = () => {
    setFees((prev) => [...prev, { id: `fee-new-${++feeNextId}`, name: "", description: "", rate: 0, flatAmount: 0, enabled: true }]);
  };

  const updateFeeFlat = (id: string, value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    setFees((prev) => prev.map((f) => f.id === id ? { ...f, flatAmount: num } : f));
  };

  const totalFees = useMemo(() => {
    return fees.filter((f) => f.enabled).reduce((sum, f) => {
      const pctAmount = f.rate > 0 ? Math.round(proposal.totalPremium * (f.rate / 100)) : 0;
      return sum + pctAmount + f.flatAmount;
    }, 0);
  }, [fees, proposal.totalPremium]);

  const [experienceModifier, setExperienceModifier] = useState(1.0);
  const [commissionRate, setCommissionRate] = useState(17.5);
  const [terrorismAccepted, setTerrorismAccepted] = useState(true);
  const [terrorismRate, setTerrorismRate] = useState(3);

  // Exposure editing
  const [exposureEditing, setExposureEditing] = useState(false);
  const [exposureRates, setExposureRates] = useState<PortalRate[]>(rates);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  let expNextId = 3000;

  // Locations already in use in the exposure table
  const usedLocationAddresses = new Set(exposureRates.map((r) => r.locationAddress).filter(Boolean));
  // Available from proposal schedule that aren't yet in use
  const availableLocations = proposalLocations.filter((l) => !usedLocationAddresses.has(l.address));

  const addExposureForLocation = (address: string) => {
    const newRate: PortalRate = {
      id: `exp-${++expNextId}`,
      submissionId: rates[0]?.submissionId || "",
      locationAddress: address,
      classCode: "",
      classDescription: "",
      territory: "",
      baseRate: 0,
      exposure: 0,
      exposureBase: "Payroll",
      manualPremium: 0,
      lcm: 1.0,
      adjustedPremium: 0,
    };
    setExposureRates((prev) => [...prev, newRate]);
    setShowLocationPicker(false);
  };

  const addExposureRow = (locationAddress: string) => {
    const newRate: PortalRate = {
      id: `exp-${++expNextId}`,
      submissionId: rates[0]?.submissionId || "",
      locationAddress,
      classCode: "",
      classDescription: "",
      territory: "",
      baseRate: 0,
      exposure: 0,
      exposureBase: "Payroll",
      manualPremium: 0,
      lcm: 1.0,
      adjustedPremium: 0,
    };
    setExposureRates((prev) => [...prev, newRate]);
  };

  const removeExposureRow = (id: string) => {
    setExposureRates((prev) => prev.filter((r) => r.id !== id));
  };

  const updateExposureField = (id: string, field: keyof PortalRate, value: string) => {
    setExposureRates((prev) => prev.map((r) => {
      if (r.id !== id) return r;
      const isText = field === "classCode" || field === "classDescription" || field === "territory" || field === "exposureBase" || field === "locationAddress";
      const updated = { ...r, [field]: isText ? value : parseFloat(value) || 0 };
      if (field === "baseRate" || field === "exposure") {
        updated.manualPremium = updated.baseRate * (updated.exposure / 100);
        updated.adjustedPremium = updated.manualPremium * updated.lcm;
      } else if (field === "lcm") {
        updated.adjustedPremium = updated.manualPremium * updated.lcm;
      } else if (field === "adjustedPremium") {
        // Back-calculate LCM from adjusted premium
        if (updated.manualPremium > 0) {
          updated.lcm = Math.round((updated.adjustedPremium / updated.manualPremium) * 10000) / 10000;
        }
      }
      return updated;
    }));
  };

  // Use exposureRates for calculations when editing
  const activeRates = exposureEditing ? exposureRates : rates;

  const totalIndicatedPremium = useMemo(
    () => activeRates.reduce((sum, r) => sum + r.adjustedPremium, 0),
    [activeRates],
  );

  const terrorismPremium = terrorismAccepted ? Math.round(totalIndicatedPremium * (terrorismRate / 100)) : 0;

  const finalPremium = totalIndicatedPremium + totalFormAdjustments;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column: worksheets */}
      <div className="lg:col-span-2 space-y-6">

        {/* General Liability Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-1">
              <Shield className="h-4 w-4" />
              General Liability
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Commission Rate */}
            <div className="flex items-center justify-between gap-4 pb-3 mb-3 border-b">
              <span className="text-sm font-medium">Commission %</span>
              {readOnly ? (
                <span className="text-sm font-medium">{commissionRate}%</span>
              ) : (
                <div className="flex items-center gap-1">
                  <Input
                    type="number" min="0" max="100" step="0.5"
                    value={commissionRate}
                    onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) setCommissionRate(v); }}
                    className="h-7 text-sm text-right w-20"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {coverages.map((cov) => (
                <div key={cov.id} className={!cov.enabled ? "opacity-50" : ""}>
                  <div className="flex items-center gap-2 mb-1">
                    <Checkbox
                      checked={cov.enabled}
                      onCheckedChange={() => toggleCoverage(cov.id)}
                      disabled={readOnly}
                    />
                    <span className="text-sm font-medium">{cov.name}</span>
                  </div>
                  {cov.enabled && (
                    <div className="ml-8 space-y-1.5">
                      {cov.limits.map((lim) => (
                        <div key={lim.id} className="flex items-center justify-between gap-4">
                          <span className="text-xs text-muted-foreground w-36">{lim.label}</span>
                          {readOnly ? (
                            <span className="text-sm font-medium">{fmt(lim.amount)}</span>
                          ) : (
                            <Input
                              type="number"
                              min="0"
                              step="1000"
                              value={lim.amount || ""}
                              onChange={(e) => updateCoverageLimit(cov.id, lim.id, e.target.value)}
                              className="h-7 text-sm text-right w-32"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Defense within Limits */}
            <div className="flex items-center gap-2 pt-3 border-t">
              <Checkbox checked={false} disabled={readOnly} />
              <span className="text-sm">Defense within Limits</span>
            </div>

            {/* Terrorism */}
            <div className="pt-3 border-t space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={terrorismAccepted}
                  onCheckedChange={(v) => setTerrorismAccepted(!!v)}
                  disabled={readOnly}
                />
                <span className="text-sm font-medium">Terrorism</span>
              </div>
              {terrorismAccepted && (
                <div className="ml-8 space-y-1.5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-muted-foreground w-36">Terrorism Prem %</span>
                    {readOnly ? (
                      <span className="text-sm font-medium">{terrorismRate}%</span>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number" min="0" max="100" step="0.1"
                          value={terrorismRate}
                          onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) setTerrorismRate(v); }}
                          className="h-7 text-sm text-right w-20"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-muted-foreground w-36">Terrorism Premium</span>
                    <span className="text-sm font-medium">{fmt(terrorismPremium)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Commission */}
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium">Commission</span>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{commissionRate}%</span>
                  <span className="font-medium">{fmt(Math.round(finalPremium * (commissionRate / 100)))}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Coverages */}
        <AdditionalCoveragesCard readOnly={readOnly} />

        {/* Deductibles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Deductibles
            </CardTitle>
            {!readOnly && (
              <Button size="sm" variant="outline" onClick={addDeductible}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Type</TableHead>
                  <TableHead>Applies To</TableHead>
                  <TableHead className="text-right w-28">Amount</TableHead>
                  {!readOnly && <TableHead className="w-10" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {deductibles.map((ded) => (
                  <TableRow key={ded.id} className={!ded.enabled ? "opacity-50" : ""}>
                    <TableCell>
                      <Checkbox
                        checked={ded.enabled}
                        onCheckedChange={() => toggleDeductible(ded.id)}
                        disabled={readOnly}
                      />
                    </TableCell>
                    <TableCell>
                      {readOnly ? (
                        <span className="text-sm font-medium">{ded.type}</span>
                      ) : (
                        <Input
                          value={ded.type}
                          onChange={(e) => updateDeductible(ded.id, "type", e.target.value)}
                          disabled={!ded.enabled}
                          placeholder="Deductible type"
                          className="h-7 text-sm"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {readOnly ? (
                        <span className="text-sm text-muted-foreground">{ded.appliesTo}</span>
                      ) : (
                        <Input
                          value={ded.appliesTo}
                          onChange={(e) => updateDeductible(ded.id, "appliesTo", e.target.value)}
                          disabled={!ded.enabled}
                          placeholder="Applies to"
                          className="h-7 text-sm"
                        />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {readOnly ? (
                        <span className="text-sm">{ded.enabled ? fmt(ded.amount) : "—"}</span>
                      ) : (
                        <Input
                          type="number"
                          min="0"
                          value={ded.amount || ""}
                          onChange={(e) => updateDeductible(ded.id, "amount", e.target.value)}
                          disabled={!ded.enabled}
                          className="h-7 text-sm text-right w-24 ml-auto"
                        />
                      )}
                    </TableCell>
                    {!readOnly && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => removeDeductible(ded.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Fees */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-1">
              <Receipt className="h-4 w-4" />
              Fees
            </CardTitle>
            {!readOnly && (
              <Button size="sm" variant="outline" onClick={addFee}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Fee</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right w-24">Rate %</TableHead>
                  <TableHead className="text-right w-28">Flat Amount</TableHead>
                  <TableHead className="text-right w-28">Calculated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fees.map((fee) => {
                  const pctAmount = fee.rate > 0 ? Math.round(proposal.totalPremium * (fee.rate / 100)) : 0;
                  const total = pctAmount + fee.flatAmount;
                  return (
                    <TableRow key={fee.id} className={!fee.enabled ? "opacity-50" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={fee.enabled}
                          onCheckedChange={() => toggleFee(fee.id)}
                          disabled={readOnly}
                        />
                      </TableCell>
                      <TableCell className="text-sm font-medium">{fee.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{fee.description}</TableCell>
                      <TableCell className="text-right">
                        {readOnly ? (
                          <span className="text-sm">{fee.rate > 0 ? `${fee.rate}%` : "—"}</span>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={fee.rate || ""}
                              placeholder="—"
                              onChange={(e) => updateFeeRate(fee.id, e.target.value)}
                              disabled={!fee.enabled}
                              className="h-7 text-sm text-right w-16"
                            />
                            <span className="text-xs text-muted-foreground">%</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {readOnly ? (
                          <span className="text-sm">{fee.flatAmount > 0 ? fmt(fee.flatAmount) : "—"}</span>
                        ) : (
                          <Input
                            type="number"
                            step="1"
                            min="0"
                            value={fee.flatAmount || ""}
                            placeholder="—"
                            onChange={(e) => updateFeeFlat(fee.id, e.target.value)}
                            disabled={!fee.enabled}
                            className="h-7 text-sm text-right w-24"
                          />
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-right font-medium">
                        {fee.enabled ? fmt(total) : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="border-t-2">
                  <TableCell />
                  <TableCell colSpan={4} className="text-right font-medium text-sm">Total Fees</TableCell>
                  <TableCell className="text-sm text-right font-bold">{fmt(totalFees)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Exposure Details — grouped by location */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              Exposure Details
            </CardTitle>
            {!readOnly && (
              <div className="flex items-center gap-2">
                {exposureEditing && (
                  <div className="relative">
                    <Button size="sm" variant="outline" onClick={() => setShowLocationPicker(!showLocationPicker)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Location
                    </Button>
                    {showLocationPicker && (
                      <div className="absolute right-0 z-50 mt-1 w-80 rounded-md border bg-popover shadow-lg max-h-64 overflow-y-auto">
                        {availableLocations.length === 0 ? (
                          <div className="p-3 text-sm text-muted-foreground">
                            All proposal locations are already in use. Add new locations on the Proposal Location Schedule tab.
                          </div>
                        ) : (
                          availableLocations.map((loc) => (
                            <button
                              key={loc.address}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-accent text-sm"
                              onClick={() => addExposureForLocation(loc.address)}
                            >
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="truncate">{loc.address}</span>
                              {loc.type && <Badge variant="outline" className="text-xs shrink-0">{loc.type}</Badge>}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
                <Button
                  size="sm"
                  variant={exposureEditing ? "default" : "outline"}
                  onClick={() => { setExposureEditing(!exposureEditing); setShowLocationPicker(false); }}
                >
                  {exposureEditing ? <><Check className="h-4 w-4 mr-1" />Done</> : <><Pencil className="h-4 w-4 mr-1" />Edit</>}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {(() => {
              const displayRates = exposureEditing ? exposureRates : rates;
              if (displayRates.length === 0) {
                return <p className="text-sm text-muted-foreground">No exposure data available.{exposureEditing && " Click 'Add Location' to begin."}</p>;
              }
              const grouped: Record<string, PortalRate[]> = {};
              for (const r of displayRates) {
                const key = r.locationAddress || "Unassigned";
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(r);
              }
              const locations = Object.keys(grouped);
              return (
                <div className="space-y-6">
                  {locations.map((loc) => {
                    const locRates = grouped[loc];
                    const locTotal = locRates.reduce((s, r) => s + r.adjustedPremium, 0);
                    return (
                      <div key={loc}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            {loc || "Unassigned"}
                          </div>
                          {exposureEditing && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => addExposureRow(loc)}>
                              <Plus className="h-3.5 w-3.5 mr-1" />
                              Add Row
                            </Button>
                          )}
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Class Code</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Territory</TableHead>
                              <TableHead>Exposure Base</TableHead>
                              <TableHead className="text-right">Exposure</TableHead>
                              <TableHead className="text-right">Base Rate</TableHead>
                              <TableHead className="text-right">Technical Rate</TableHead>
                              <TableHead className="text-right">LCM</TableHead>
                              <TableHead className="text-right">Adjusted Premium</TableHead>
                              {exposureEditing && <TableHead className="w-10" />}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {locRates.map((r) => (
                              <TableRow key={r.id}>
                                <TableCell>
                                  {exposureEditing ? (
                                    <Input value={r.classCode} onChange={(e) => updateExposureField(r.id, "classCode", e.target.value)} className="h-7 text-sm font-mono w-20" />
                                  ) : (
                                    <span className="font-mono text-sm">{r.classCode}</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {exposureEditing ? (
                                    <Input value={r.classDescription} onChange={(e) => updateExposureField(r.id, "classDescription", e.target.value)} className="h-7 text-sm" />
                                  ) : (
                                    <span className="text-sm">{r.classDescription}</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {exposureEditing ? (
                                    <Input value={r.territory} onChange={(e) => updateExposureField(r.id, "territory", e.target.value)} className="h-7 text-sm w-16" />
                                  ) : (
                                    <span className="text-sm">{r.territory}</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {exposureEditing ? (
                                    <Input value={r.exposureBase} onChange={(e) => updateExposureField(r.id, "exposureBase", e.target.value)} className="h-7 text-sm w-20" />
                                  ) : (
                                    <span className="text-sm">{r.exposureBase}</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  {exposureEditing ? (
                                    <Input type="number" value={r.exposure || ""} onChange={(e) => updateExposureField(r.id, "exposure", e.target.value)} className="h-7 text-sm text-right w-28" />
                                  ) : (
                                    <span className="text-sm">{r.exposure.toLocaleString()}</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  {exposureEditing ? (
                                    <Input type="number" step="0.01" value={r.baseRate || ""} onChange={(e) => updateExposureField(r.id, "baseRate", e.target.value)} className="h-7 text-sm text-right w-20" />
                                  ) : (
                                    <span className="text-sm">{r.baseRate}</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-sm text-right">{fmt(r.manualPremium)}</TableCell>
                                <TableCell className="text-right">
                                  {exposureEditing ? (
                                    <Input type="number" step="0.01" value={r.lcm || ""} onChange={(e) => updateExposureField(r.id, "lcm", e.target.value)} className="h-7 text-sm text-right w-16" />
                                  ) : (
                                    <span className="text-sm">{r.lcm}</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  {exposureEditing ? (
                                    <Input type="number" step="100" value={r.adjustedPremium || ""} onChange={(e) => updateExposureField(r.id, "adjustedPremium", e.target.value)} className="h-7 text-sm text-right w-24" />
                                  ) : (
                                    <span className="text-sm font-medium">{fmt(r.adjustedPremium)}</span>
                                  )}
                                </TableCell>
                                {exposureEditing && (
                                  <TableCell>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeExposureRow(r.id)}>
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                            <TableRow className="bg-muted/30">
                              <TableCell colSpan={8} className="text-right text-sm font-medium">Location Subtotal</TableCell>
                              <TableCell className="text-right text-sm font-bold">{fmt(locTotal)}</TableCell>
                              {exposureEditing && <TableCell />}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Priced Forms */}
        <PricedFormsCard
          forms={pricedForms}
          readOnly={readOnly}
          onTotalChange={setTotalFormAdjustments}
        />
        {/* Loss Detail */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-1">
              <ClipboardList className="h-4 w-4" />
              Loss Detail
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Experience Modifier */}
            <div className="flex items-center gap-4 pb-3 border-b">
              <span className="text-sm font-medium w-44">Experience Modifier</span>
              {readOnly ? (
                <span className="text-sm font-bold">{experienceModifier.toFixed(2)}</span>
              ) : (
                <Input
                  type="number"
                  min="0"
                  max="5"
                  step="0.01"
                  value={experienceModifier}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v)) setExperienceModifier(v);
                  }}
                  className="h-8 text-sm w-24"
                />
              )}
              <span className="text-xs text-muted-foreground">
                {experienceModifier < 1 ? "Credit — better than expected losses" : experienceModifier > 1 ? "Debit — worse than expected losses" : "Unity — neutral"}
              </span>
            </div>

            {/* Loss Detail Table */}
            {lossDetails.length === 0 ? (
              <p className="text-sm text-muted-foreground">No loss detail data available.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date of Loss</TableHead>
                    <TableHead className="text-right">Ground-Up Indemnity</TableHead>
                    <TableHead className="text-right">Ground-Up Expense</TableHead>
                    <TableHead className="text-right">Ground-Up Total Incurred</TableHead>
                    <TableHead className="text-right">Indemnity Less Deductible</TableHead>
                    <TableHead className="text-right">Includable Losses</TableHead>
                    <TableHead>Policy Period</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lossDetails.map((ld) => (
                    <TableRow key={ld.id}>
                      <TableCell className="text-sm font-medium">{ld.dateOfLoss}</TableCell>
                      <TableCell className="text-sm text-right">{fmt(ld.groundUpIndemnity)}</TableCell>
                      <TableCell className="text-sm text-right">{fmt(ld.groundUpExpense)}</TableCell>
                      <TableCell className="text-sm text-right">{fmt(ld.groundUpTotalIncurred)}</TableCell>
                      <TableCell className="text-sm text-right">{fmt(ld.indemnityLessDeductible)}</TableCell>
                      <TableCell className="text-sm text-right">{fmt(ld.includableLosses)}</TableCell>
                      <TableCell className="text-sm">{ld.policyPeriod}</TableCell>
                    </TableRow>
                  ))}
                  {(() => {
                    const totals = lossDetails.reduce((acc, ld) => ({
                      indemnity: acc.indemnity + ld.groundUpIndemnity,
                      expense: acc.expense + ld.groundUpExpense,
                      totalIncurred: acc.totalIncurred + ld.groundUpTotalIncurred,
                      lessDeductible: acc.lessDeductible + ld.indemnityLessDeductible,
                      includable: acc.includable + ld.includableLosses,
                    }), { indemnity: 0, expense: 0, totalIncurred: 0, lessDeductible: 0, includable: 0 });
                    return (
                      <TableRow className="border-t-2 font-medium">
                        <TableCell className="text-sm">Total</TableCell>
                        <TableCell className="text-sm text-right">{fmt(totals.indemnity)}</TableCell>
                        <TableCell className="text-sm text-right">{fmt(totals.expense)}</TableCell>
                        <TableCell className="text-sm text-right font-bold">{fmt(totals.totalIncurred)}</TableCell>
                        <TableCell className="text-sm text-right">{fmt(totals.lessDeductible)}</TableCell>
                        <TableCell className="text-sm text-right font-bold">{fmt(totals.includable)}</TableCell>
                        <TableCell />
                      </TableRow>
                    );
                  })()}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Right column: Price Summary (sticky) */}
      <div>
        <div className="sticky top-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Price Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Exposure by Location */}
              {(() => {
                const grouped: Record<string, PortalRate[]> = {};
                const displayRates = exposureEditing ? exposureRates : rates;
                for (const r of displayRates) {
                  const key = r.locationAddress || "Unassigned";
                  if (!grouped[key]) grouped[key] = [];
                  grouped[key].push(r);
                }
                const locations = Object.keys(grouped);
                return locations.length > 0 ? (
                  <div className="space-y-1.5 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Exposure by Location</p>
                    {locations.map((loc) => {
                      const locTotal = grouped[loc].reduce((s, r) => s + r.adjustedPremium, 0);
                      const shortAddr = loc.split(",")[0];
                      return (
                        <div key={loc} className="flex justify-between">
                          <span className="text-muted-foreground truncate mr-2" title={loc}>{shortAddr}</span>
                          <span className="font-medium shrink-0">{fmt(locTotal)}</span>
                        </div>
                      );
                    })}
                    <div className="flex justify-between border-t pt-1.5">
                      <span className="font-medium">Indicated Premium</span>
                      <span className="font-bold">{fmt(totalIndicatedPremium)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Indicated Premium</span>
                    <span className="font-medium">{fmt(totalIndicatedPremium)}</span>
                  </div>
                );
              })()}

              {/* Technical Premium */}
              {(() => {
                const techPremPreEmod = totalIndicatedPremium + totalFormAdjustments;
                const techPrem = Math.round(techPremPreEmod * experienceModifier);
                const minimumPremium = Math.round(techPrem * 0.5);
                const marketPrice = finalPremium + totalFees + terrorismPremium;
                const deltaFromTech = techPrem !== 0 ? ((marketPrice - techPrem) / techPrem) * 100 : 0;
                const commissionAmt = Math.round(marketPrice * (commissionRate / 100));

                return (
                  <>
                    <div className="space-y-2 text-sm border-t pt-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Premium Buildup</p>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Form Adjustments</span>
                        <span className={`font-medium ${totalFormAdjustments > 0 ? "text-red-600" : totalFormAdjustments < 0 ? "text-green-600" : ""}`}>
                          {totalFormAdjustments > 0 ? "+" : ""}{fmt(totalFormAdjustments)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Technical Premium (pre-EMod)</span>
                        <span className="font-medium">{fmt(techPremPreEmod)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Experience Modifier</span>
                        <span className="font-medium">{experienceModifier.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Technical Premium</span>
                        <span className="font-bold">{fmt(techPrem)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Minimum Premium (50%)</span>
                        <span className="font-medium">{fmt(minimumPremium)}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm border-t pt-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fees &amp; Surcharges</p>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fees &amp; Taxes</span>
                        <span className="font-medium">{fmt(totalFees)}</span>
                      </div>
                      {terrorismAccepted && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Terrorism ({terrorismRate}%)</span>
                          <span className="font-medium">{fmt(terrorismPremium)}</span>
                        </div>
                      )}
                    </div>

                    {/* Market Price */}
                    <div className="border-t pt-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-sm">Market Price</span>
                        <span className="font-bold text-lg">{fmt(marketPrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">% Delta from Technical</span>
                        <span className={`font-medium ${deltaFromTech > 0 ? "text-red-600" : deltaFromTech < 0 ? "text-green-600" : ""}`}>
                          {deltaFromTech > 0 ? "+" : ""}{deltaFromTech.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Commission */}
                    <div className="border-t pt-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Commission Rate</span>
                        <span className="font-medium">{commissionRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Commission Amount</span>
                        <span className="font-medium">{fmt(commissionAmt)}</span>
                      </div>
                    </div>

                    <div className="border-t pt-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rate Classes</span>
                        <span>{rates.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Priced Forms</span>
                        <span>{pricedForms.length}</span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
