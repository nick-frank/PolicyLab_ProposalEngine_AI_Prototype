"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClassCodeSelect } from "@/components/rating/class-code-select";
import { Calculator } from "lucide-react";
import CLASS_CODES from "@/lib/class-codes.json";
import RATING_CONFIG from "@/lib/rating-config.json";
import { apiClient, QuoteInput } from "@/lib/api-client";
import type { ClassRow, ExposureRatingProps } from "./types";

const EXPOSURE_BASE_OPTIONS = RATING_CONFIG.dropdownOptions.exposureBase;
const SUBLINE_OPTIONS = RATING_CONFIG.dropdownOptions.subline;
const LIQUOR_LIABILITY_LIMIT_OPTIONS = RATING_CONFIG.dropdownOptions.liquorLiabilityLimit;
const DOMINANT_CLASS_OPTIONS = RATING_CONFIG.dropdownOptions.dominantClassIndicator;
const SIR_TYPE_OPTIONS = RATING_CONFIG.dropdownOptions.sirType;

const NUM_ROWS = RATING_CONFIG.tableDefaults.classRows;

function makeEmptyRow(): ClassRow {
  return {
    classCode: "",
    description: "",
    locationNumber: "",
    subline: "",
    dominantClass: "",
    liquorLiabilityLimit: "",
    exposures: "",
    zipCode: "",
  };
}

export function ExposureRating({
  initialInsured = "",
  initialTerritory = RATING_CONFIG.policyDetails.defaults.territory,
  initialEffectiveDate = "",
  initialExpirationDate = "",
  pl2 = "General Liability",
}: ExposureRatingProps) {
  // Policy-level state
  const [insured, setInsured] = useState(initialInsured);
  const [dealNumber, setDealNumber] = useState("");
  const [territory, setTerritory] = useState(initialTerritory);
  const [effectiveDates, setEffectiveDates] = useState({ new: initialEffectiveDate, expiring: "" });
  const [expirationDates, setExpirationDates] = useState({ new: initialExpirationDate, expiring: "" });
  const [occurrenceLimit, setOccurrenceLimit] = useState({
    new: RATING_CONFIG.policyDetails.defaults.occurrenceLimit.new,
    expiring: RATING_CONFIG.policyDetails.defaults.occurrenceLimit.expiring,
  });
  const [aggregateLimit, setAggregateLimit] = useState({
    new: RATING_CONFIG.policyDetails.defaults.aggregateLimit.new,
    expiring: RATING_CONFIG.policyDetails.defaults.aggregateLimit.expiring,
  });
  const [sirType, setSirType] = useState({
    new: RATING_CONFIG.policyDetails.defaults.sirType.new,
    expiring: RATING_CONFIG.policyDetails.defaults.sirType.expiring,
  });
  const [sirAmount, setSirAmount] = useState({
    new: RATING_CONFIG.policyDetails.defaults.sirAmount.new,
    expiring: RATING_CONFIG.policyDetails.defaults.sirAmount.expiring,
  });
  const [commission, setCommission] = useState({
    new: RATING_CONFIG.policyDetails.defaults.commission.new,
    expiring: RATING_CONFIG.policyDetails.defaults.commission.expiring,
  });

  // Class rows state
  const [classRows, setClassRows] = useState<ClassRow[]>(
    Array.from({ length: NUM_ROWS }, () => makeEmptyRow())
  );

  // Calculation state
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [calculatedValues, setCalculatedValues] = useState<Record<string, any> | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const isGL = pl2 === "General Liability";

  const handleClassCodeChange = (index: number, code: string) => {
    const newRows = [...classRows];
    newRows[index].classCode = code;
    const fullCode = CLASS_CODES.find((c) => c.startsWith(code));
    if (fullCode) {
      newRows[index].description = fullCode.split(" - ").slice(1).join(" - ");
    }
    setClassRows(newRows);
  };

  const handleFieldChange = (index: number, field: keyof ClassRow, value: string) => {
    const newRows = [...classRows];
    newRows[index][field] = value;
    setClassRows(newRows);
  };

  const getValidationMessage = (index: number): string | null => {
    const row = classRows[index];
    if (isGL && row.classCode && !row.subline) return "Enter Subline";
    if (isGL && row.subline && !row.locationNumber) return "Enter Location Number";
    return null;
  };

  const buildQuoteInput = (): QuoteInput => ({
    exposure_rating: {
      policy_details: {
        insured: insured || "Unnamed Insured",
        deal_number: dealNumber,
        pl2,
        territory,
        policy_effective_date: effectiveDates,
        policy_expiration_date: expirationDates,
        occurrence_limit: occurrenceLimit,
        aggregate_limit: aggregateLimit,
        sir_type: sirType,
        sir_amount: sirAmount,
        commission,
      },
      class_rows: classRows
        .filter((row) => row.classCode)
        .map((row) => ({
          class_code: row.classCode,
          description: row.description,
          zip_code: row.zipCode,
          exposures: parseFloat(row.exposures) || 0,
          location: row.locationNumber ? parseInt(row.locationNumber) : undefined,
          subline: row.subline || undefined,
          liquor_limit: row.liquorLiabilityLimit ? parseFloat(row.liquorLiabilityLimit) : undefined,
          dominant_class: row.dominantClass === "Yes",
        })),
    },
  });

  const handleCalculate = async () => {
    setIsLoading(true);
    setValidationErrors([]);
    try {
      const quoteData = buildQuoteInput();
      const result = await apiClient.calculateQuote(quoteData);
      if (result.output?.calculated_values) {
        setCalculatedValues(result.output.calculated_values);
      }
      if (result.validation_result && !result.validation_result.is_valid) {
        setValidationErrors(result.validation_result.errors);
      }
    } catch (error) {
      console.error("Calculation failed:", error);
      setValidationErrors(["Failed to calculate quote. Please check your connection and try again."]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setInsured(initialInsured);
    setDealNumber("");
    setTerritory(initialTerritory);
    setEffectiveDates({ new: initialEffectiveDate, expiring: "" });
    setExpirationDates({ new: initialExpirationDate, expiring: "" });
    setOccurrenceLimit({ new: RATING_CONFIG.policyDetails.defaults.occurrenceLimit.new, expiring: RATING_CONFIG.policyDetails.defaults.occurrenceLimit.expiring });
    setAggregateLimit({ new: RATING_CONFIG.policyDetails.defaults.aggregateLimit.new, expiring: RATING_CONFIG.policyDetails.defaults.aggregateLimit.expiring });
    setSirType({ new: RATING_CONFIG.policyDetails.defaults.sirType.new, expiring: RATING_CONFIG.policyDetails.defaults.sirType.expiring });
    setSirAmount({ new: RATING_CONFIG.policyDetails.defaults.sirAmount.new, expiring: RATING_CONFIG.policyDetails.defaults.sirAmount.expiring });
    setCommission({ new: RATING_CONFIG.policyDetails.defaults.commission.new, expiring: RATING_CONFIG.policyDetails.defaults.commission.expiring });
    setClassRows(Array.from({ length: NUM_ROWS }, () => makeEmptyRow()));
    setCalculatedValues(null);
    setValidationErrors([]);
  };

  return (
    <div className="space-y-6">
      {/* Table 1 — Policy Level Details */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Table 1. Policy Level Details</h3>
          <Button
            variant="default"
            size="sm"
            onClick={handleCalculate}
            disabled={isLoading}
          >
            <Calculator className="w-4 h-4 mr-2" />
            {isLoading ? "Calculating..." : "Calculate"}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 items-center">
              <label className="text-sm text-right">Insured:</label>
              <Input
                className="col-span-2 bg-[#FFF4F2EB]"
                value={insured}
                onChange={(e) => setInsured(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 items-center">
              <label className="text-sm text-right">New / Renewal Deal Number:</label>
              <Input
                className="col-span-2 bg-[#FFF4F2EB]"
                value={dealNumber}
                onChange={(e) => setDealNumber(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 items-center">
              <label className="text-sm text-right">PL_2:</label>
              <Input className="col-span-2 bg-white" value={pl2} readOnly />
            </div>

            <div className="grid grid-cols-3 gap-2 items-center">
              <label className="text-sm text-right">Territory:</label>
              <Input
                className="col-span-2 bg-[#FFF4F2EB]"
                value={territory}
                onChange={(e) => setTerritory(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div></div>
              <div className="text-xs text-center">New / Renewal</div>
              <div className="text-xs text-center">Expiring</div>
            </div>

            <div className="grid grid-cols-3 gap-2 items-center">
              <label className="text-sm text-right">Policy Effective Date:</label>
              <Input
                type="date"
                className="bg-[#FFF4F2EB]"
                value={effectiveDates.new}
                onChange={(e) => setEffectiveDates({ ...effectiveDates, new: e.target.value })}
              />
              <Input
                type="date"
                className="bg-[#FFF4F2EB]"
                value={effectiveDates.expiring}
                onChange={(e) => setEffectiveDates({ ...effectiveDates, expiring: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 items-center">
              <label className="text-sm text-right">Policy Expiration Date:</label>
              <Input
                type="date"
                className="bg-[#FFF4F2EB]"
                value={expirationDates.new}
                onChange={(e) => setExpirationDates({ ...expirationDates, new: e.target.value })}
              />
              <Input
                type="date"
                className="bg-[#FFF4F2EB]"
                value={expirationDates.expiring}
                onChange={(e) => setExpirationDates({ ...expirationDates, expiring: e.target.value })}
              />
            </div>
            {effectiveDates.new && expirationDates.new && expirationDates.new < effectiveDates.new && (
              <div className="col-span-3 text-right">
                <span className="text-red-600 text-sm">Expiration date is before effective date. </span>
                <button
                  className="text-blue-600 underline text-sm"
                  onClick={() => {
                    const eff = new Date(effectiveDates.new);
                    eff.setFullYear(eff.getFullYear() + 1);
                    setExpirationDates({ ...expirationDates, new: eff.toISOString().split("T")[0] });
                  }}
                >
                  Apply Correction
                </button>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 items-center">
              <label className="text-sm text-right">Each Occurrence Limit:</label>
              <Input
                value={occurrenceLimit.new}
                onChange={(e) => setOccurrenceLimit({ ...occurrenceLimit, new: Number(e.target.value) })}
                className="bg-[#FFF4F2EB]"
              />
              <Input
                value={occurrenceLimit.expiring}
                onChange={(e) => setOccurrenceLimit({ ...occurrenceLimit, expiring: Number(e.target.value) })}
                className="bg-[#FFF4F2EB]"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 items-center">
              <label className="text-sm text-right">General Aggregate Limit:</label>
              <Input
                value={aggregateLimit.new}
                onChange={(e) => setAggregateLimit({ ...aggregateLimit, new: Number(e.target.value) })}
                className="bg-[#FFF4F2EB]"
              />
              <Input
                value={aggregateLimit.expiring}
                onChange={(e) => setAggregateLimit({ ...aggregateLimit, expiring: Number(e.target.value) })}
                className="bg-[#FFF4F2EB]"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 items-center">
              <label className="text-sm text-right">SIR/Deductible:</label>
              <select
                className="h-9 px-3 rounded-md border bg-[#FFF4F2EB]"
                value={sirType.new}
                onChange={(e) => setSirType({ ...sirType, new: e.target.value })}
              >
                {SIR_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <select
                className="h-9 px-3 rounded-md border bg-[#FFF4F2EB]"
                value={sirType.expiring}
                onChange={(e) => setSirType({ ...sirType, expiring: e.target.value })}
              >
                {SIR_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2 items-center">
              <label className="text-sm text-right">SIR/Ded Amount:</label>
              <Input
                value={sirAmount.new}
                onChange={(e) => setSirAmount({ ...sirAmount, new: Number(e.target.value) })}
                className="bg-[#FFF4F2EB]"
              />
              <Input
                value={sirAmount.expiring}
                onChange={(e) => setSirAmount({ ...sirAmount, expiring: Number(e.target.value) })}
                className="bg-[#FFF4F2EB]"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 items-center">
              <label className="text-sm text-right">Commission:</label>
              <Input
                value={(commission.new * 100).toFixed(1) + "%"}
                className="bg-[#FFF4F2EB]"
                onChange={(e) => {
                  const val = parseFloat(e.target.value.replace("%", "")) / 100;
                  if (!isNaN(val)) setCommission({ ...commission, new: val });
                }}
              />
              <Input
                value={(commission.expiring * 100).toFixed(1) + "%"}
                className="bg-[#FFF4F2EB]"
                onChange={(e) => {
                  const val = parseFloat(e.target.value.replace("%", "")) / 100;
                  if (!isNaN(val)) setCommission({ ...commission, expiring: val });
                }}
              />
            </div>
            {commission.new > 0.3 && (
              <div className="col-span-3 text-right">
                <span className="text-yellow-600 warning">Commission exceeds typical range</span>
              </div>
            )}
          </div>

          {/* Right Column — Computed / Readonly Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 items-center">
              <label className="text-sm text-right">Technical Premium Prior to Emod:</label>
              <Input
                value={calculatedValues?.technical_premium_pre_emod != null
                  ? `$${calculatedValues.technical_premium_pre_emod.toLocaleString()}`
                  : "-"}
                className="bg-white"
                readOnly
              />
            </div>

            <div className="grid grid-cols-2 gap-2 items-center">
              <label className="text-sm text-right">Experience Mod:</label>
              <Input
                value={calculatedValues?.experience_modifier?.toFixed(3) ?? "1.000"}
                className="bg-white"
                readOnly
              />
            </div>

            <div className="grid grid-cols-2 gap-2 items-center">
              <label className="text-sm text-right">Technical Premium After Emod (to be entered in e2):</label>
              <Input
                value={calculatedValues?.technical_premium_post_emod != null
                  ? `$${calculatedValues.technical_premium_post_emod.toLocaleString()}`
                  : "-"}
                className="bg-white"
                readOnly
              />
            </div>

            <div className="grid grid-cols-2 gap-2 items-center mt-8">
              <label className="text-sm text-right">Bound / Quoted Premium:</label>
              <Input className="bg-[#FFF4F2EB]" />
            </div>

            <div className="grid grid-cols-2 gap-2 items-center">
              <label className="text-sm text-right">Calculated Premium:</label>
              <Input
                value={calculatedValues?.modified_premium != null
                  ? `$${calculatedValues.modified_premium.toLocaleString()}`
                  : "-"}
                className="bg-white"
                readOnly
              />
            </div>

            <div className="grid grid-cols-2 gap-2 items-center">
              <label className="text-sm text-right">Technical Ratio:</label>
              <Input className="bg-white" readOnly />
            </div>

            <div className="grid grid-cols-2 gap-2 items-center">
              <label className="text-sm text-right">Rate Change:</label>
              <Input className="bg-white" readOnly />
            </div>

            <div className="mt-8">
              <Button variant="outline" onClick={handleReset}>
                Reset Rating Defaults
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Table 2 — Class & Territory Detail */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Table 2. Class & Territory Detail</h3>
          <span className="text-xs text-muted-foreground">*Optional</span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-xs">
                <TableHead className="w-12">Index</TableHead>
                <TableHead className="w-24">Class Code</TableHead>
                <TableHead className="min-w-[200px]">Class Code Description</TableHead>
                <TableHead className="w-20">Zip Code</TableHead>
                {isGL && (
                  <>
                    <TableHead className="w-28">Location Number</TableHead>
                    <TableHead className="w-24">Subline</TableHead>
                    <TableHead className="w-32">Dominant Class Indicator</TableHead>
                    <TableHead className="w-32">Liquor Liability Limit</TableHead>
                  </>
                )}
                <TableHead className="w-24">Exposures</TableHead>
                <TableHead className="w-24">Prior Year Exposures</TableHead>
                <TableHead className="w-28">Exposure Base</TableHead>
                <TableHead className="w-24">{isGL ? "PremOps / Liquor Rate" : "PremOps Rate"}</TableHead>
                <TableHead className="w-24">Products Rate</TableHead>
                <TableHead className="w-24">Total Rate</TableHead>
                <TableHead className="w-24">{isGL ? "PremOps / Liquor Prem" : "PremOps Prem"}</TableHead>
                <TableHead className="w-32">Products Premium</TableHead>
                <TableHead className="w-32">Technical Premium</TableHead>
                <TableHead className="w-28">Modified Rate</TableHead>
                <TableHead className="w-32">Modified Premium</TableHead>
                <TableHead className="w-32">Audit Rate Selection</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: NUM_ROWS }).map((_, rowIndex) => {
                const validationMsg = getValidationMessage(rowIndex);
                return (
                  <TableRow key={rowIndex}>
                    <TableCell>{rowIndex + 1}</TableCell>
                    <TableCell>
                      <ClassCodeSelect
                        classCodes={CLASS_CODES}
                        value={classRows[rowIndex].classCode}
                        onChange={(code) => handleClassCodeChange(rowIndex, code)}
                        className="h-8 text-xs bg-[#FFF4F2EB]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="h-8 text-xs bg-white"
                        value={classRows[rowIndex].description}
                        readOnly
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="h-8 text-xs bg-[#FFF4F2EB]"
                        value={classRows[rowIndex].zipCode}
                        onChange={(e) => handleFieldChange(rowIndex, "zipCode", e.target.value)}
                      />
                    </TableCell>
                    {isGL && (
                      <>
                        <TableCell>
                          <Input
                            className="h-8 text-xs bg-[#FFF4F2EB]"
                            placeholder="Location #"
                            value={classRows[rowIndex].locationNumber}
                            onChange={(e) => handleFieldChange(rowIndex, "locationNumber", e.target.value)}
                          />
                          {validationMsg === "Enter Location Number" && (
                            <span className="text-red-500 text-xs">Enter Location Number</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <select
                            className="h-8 px-2 text-xs rounded-md border bg-[#FFF4F2EB] w-full"
                            value={classRows[rowIndex].subline}
                            onChange={(e) => handleFieldChange(rowIndex, "subline", e.target.value)}
                          >
                            <option value="">Select Subline</option>
                            {SUBLINE_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                          {validationMsg === "Enter Subline" && (
                            <span className="text-red-500 text-xs">Enter Subline</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <select
                            className="h-8 px-2 text-xs rounded-md border bg-[#FFF4F2EB] w-full"
                            value={classRows[rowIndex].dominantClass}
                            onChange={(e) => handleFieldChange(rowIndex, "dominantClass", e.target.value)}
                            disabled={!classRows[rowIndex].subline}
                          >
                            <option value="">Select</option>
                            {DOMINANT_CLASS_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell>
                          <select
                            className="h-8 px-2 text-xs rounded-md border bg-[#FFF4F2EB] w-full"
                            value={classRows[rowIndex].liquorLiabilityLimit}
                            onChange={(e) => handleFieldChange(rowIndex, "liquorLiabilityLimit", e.target.value)}
                            disabled={classRows[rowIndex].subline !== "Liquor Liability"}
                          >
                            <option value="">Select</option>
                            {LIQUOR_LIABILITY_LIMIT_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </TableCell>
                      </>
                    )}
                    <TableCell>
                      <Input
                        className="h-8 text-xs bg-[#FFF4F2EB]"
                        value={classRows[rowIndex].exposures}
                        onChange={(e) => handleFieldChange(rowIndex, "exposures", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input className="h-8 text-xs bg-[#FFF4F2EB]" />
                    </TableCell>
                    <TableCell>
                      <select className="h-8 px-2 text-xs rounded-md border bg-[#FFF4F2EB] w-full">
                        {EXPOSURE_BASE_OPTIONS.map((base) => (
                          <option key={base} value={base}>{base}</option>
                        ))}
                      </select>
                    </TableCell>
                    {/* Readonly computed columns */}
                    <TableCell><Input className="h-8 text-xs bg-white text-center" defaultValue="-" readOnly /></TableCell>
                    <TableCell><Input className="h-8 text-xs bg-white text-center" defaultValue="-" readOnly /></TableCell>
                    <TableCell><Input className="h-8 text-xs bg-white text-center" defaultValue="-" readOnly /></TableCell>
                    <TableCell><Input className="h-8 text-xs bg-white text-center" defaultValue="-" readOnly /></TableCell>
                    <TableCell><Input className="h-8 text-xs bg-white text-center" defaultValue="-" readOnly /></TableCell>
                    <TableCell><Input className="h-8 text-xs bg-white text-center" defaultValue="-" readOnly /></TableCell>
                    <TableCell><Input className="h-8 text-xs bg-white text-center" defaultValue="-" readOnly /></TableCell>
                    <TableCell><Input className="h-8 text-xs bg-white text-center" defaultValue="-" readOnly /></TableCell>
                    <TableCell><Input className="h-8 text-xs bg-white text-center" defaultValue="-" readOnly /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="p-4 bg-red-50 border-red-200">
          <h3 className="font-semibold text-red-800 mb-2">Validation Errors</h3>
          <ul className="space-y-1">
            {validationErrors.map((error, idx) => (
              <li key={idx} className="text-sm text-red-600">&bull; {error}</li>
            ))}
          </ul>
        </Card>
      )}

      {/* Calculated Values Display */}
      {calculatedValues && (
        <Card className="p-4 bg-green-50 border-green-200">
          <h3 className="font-semibold text-green-800 mb-2">Calculated Results</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Technical Premium (Pre-EMod):</span>{" "}
              ${calculatedValues.technical_premium_pre_emod?.toLocaleString() || "0"}
            </div>
            <div>
              <span className="font-medium">Experience Modifier:</span>{" "}
              {calculatedValues.experience_modifier?.toFixed(3) || "1.000"}
            </div>
            <div>
              <span className="font-medium">Technical Premium (Post-EMod):</span>{" "}
              ${calculatedValues.technical_premium_post_emod?.toLocaleString() || "0"}
            </div>
            <div>
              <span className="font-medium">Modified Premium:</span>{" "}
              ${calculatedValues.modified_premium?.toLocaleString() || "0"}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
