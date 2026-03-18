"use client";

import { useState, useMemo, useRef, useEffect, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClassCodeSelect } from "@/components/rating/class-code-select";
import { Download, Upload, Calculator, History, Bug, Copy, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import CLASS_CODES from "@/lib/class-codes.json";
import RATING_CONFIG from "@/lib/rating-config.json";
import { apiClient, QuoteInput } from "@/lib/api-client";
import { generateExcelFromQuote, parseExcelToQuote } from "@/lib/excel-export";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";

const PL2_OPTIONS = RATING_CONFIG.dropdownOptions.pl2;
const EXPOSURE_BASE_OPTIONS = RATING_CONFIG.dropdownOptions.exposureBase;
const SUBLINE_OPTIONS = RATING_CONFIG.dropdownOptions.subline;
const LIQUOR_LIABILITY_LIMIT_OPTIONS = RATING_CONFIG.dropdownOptions.liquorLiabilityLimit;
const DOMINANT_CLASS_OPTIONS = RATING_CONFIG.dropdownOptions.dominantClassIndicator;
const SIR_TYPE_OPTIONS = RATING_CONFIG.dropdownOptions.sirType;

type ClassRow = {
  classCode: string;
  description: string;
  locationNumber: string;
  subline: string;
  dominantClass: string;
  liquorLiabilityLimit: string;
  exposures: string;
  zipCode: string;
};

export default function PrimaryGLRaterPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <PrimaryGLRaterPage />
    </Suspense>
  );
}

function PrimaryGLRaterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const showToast = useToast();
  const [activeTab, setActiveTab] = useState("exposure");
  const [pl2Selection, setPl2Selection] = useState(RATING_CONFIG.policyDetails.defaults.pl2);
  const [territory, setTerritory] = useState(RATING_CONFIG.policyDetails.defaults.territory);
  const [newSales, setNewSales] = useState("");
  const [expiringSales, setExpiringSales] = useState("");
  const [insured, setInsured] = useState("");
  const [dealNumber, setDealNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [debugData, setDebugData] = useState<any>(null);
  const [debugSectionsOpen, setDebugSectionsOpen] = useState({ input: true, output: true });
  const [currentQuoteId, setCurrentQuoteId] = useState<string | null>(null);
  const [calculatedValues, setCalculatedValues] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [uwNotes, setUwNotes] = useState("");
  const [occurrenceLimit, setOccurrenceLimit] = useState({
    new: RATING_CONFIG.policyDetails.defaults.occurrenceLimit.new,
    expiring: RATING_CONFIG.policyDetails.defaults.occurrenceLimit.expiring
  });
  const [aggregateLimit, setAggregateLimit] = useState({
    new: RATING_CONFIG.policyDetails.defaults.aggregateLimit.new,
    expiring: RATING_CONFIG.policyDetails.defaults.aggregateLimit.expiring
  });
  const [sirType, setSirType] = useState({
    new: RATING_CONFIG.policyDetails.defaults.sirType.new,
    expiring: RATING_CONFIG.policyDetails.defaults.sirType.expiring
  });
  const [sirAmount, setSirAmount] = useState({
    new: RATING_CONFIG.policyDetails.defaults.sirAmount.new,
    expiring: RATING_CONFIG.policyDetails.defaults.sirAmount.expiring
  });
  const [commission, setCommission] = useState({
    new: RATING_CONFIG.policyDetails.defaults.commission.new,
    expiring: RATING_CONFIG.policyDetails.defaults.commission.expiring
  });
  const [classRows, setClassRows] = useState<ClassRow[]>(
    Array.from({ length: RATING_CONFIG.tableDefaults.classRows }, () => ({
      classCode: "",
      description: "",
      locationNumber: "",
      subline: "",
      dominantClass: "",
      liquorLiabilityLimit: "",
      exposures: "",
      zipCode: ""
    }))
  );
  const [effectiveDates, setEffectiveDates] = useState({ new: "", expiring: "" });
  const [expirationDates, setExpirationDates] = useState({ new: "", expiring: "" });
  const [experienceModifierData, setExperienceModifierData] = useState<any>({
    evaluation_date: "",
    policy_year_1: "",
    policy_year_2: "",
    losses: []
  });

  // Load quote data if quote ID is in URL
  useEffect(() => {
    const quoteId = searchParams.get("quote");
    if (quoteId) {
      loadQuote(quoteId);
    }
  }, [searchParams]);

  // Load quote data from API and populate form
  const loadQuote = async (quoteId: string) => {
    setIsLoading(true);
    try {
      // Handle demo quotes
      if (quoteId.startsWith("demo-")) {
        const demoData = getDemoQuoteData(quoteId);
        if (demoData) {
          populateFormFromQuote(demoData);
          setCurrentQuoteId(quoteId);
        }
        return;
      }

      const quote = await apiClient.getQuote(quoteId);

      // Handle both backend format (input_data) and local storage format (input)
      const inputData = quote.input_data || quote.input;
      if (inputData) {
        populateFormFromQuote(inputData);
      }

      setCurrentQuoteId(quoteId);

      // Handle output data from both formats
      const outputData = quote.output_data || quote.output;
      if (outputData?.calculated_values) {
        setCalculatedValues(outputData.calculated_values);
      }
    } catch (error) {
      console.error("Failed to load quote:", error);
      // Try to load as demo if API fails
      if (quoteId) {
        const demoData = getDemoQuoteData(quoteId);
        if (demoData) {
          populateFormFromQuote(demoData);
          setCurrentQuoteId(quoteId);
          setValidationErrors([]);
        } else {
          setValidationErrors(["Failed to load quote. Please try again."]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Get demo quote data for testing
  const getDemoQuoteData = (quoteId: string): QuoteInput | null => {
    if (quoteId === "demo-1") {
      return {
        exposure_rating: {
          policy_details: {
            insured: "ABC Construction Co.",
            deal_number: "MQ-2024-001",
            pl2: "Contractors",
            territory: "CA-01",
            sales: { new: 1500000, expiring: 1200000 },
            policy_effective_date: { new: "2024-04-01", expiring: "2023-04-01" },
            policy_expiration_date: { new: "2025-04-01", expiring: "2024-04-01" },
            occurrence_limit: { new: 1000000, expiring: 1000000 },
            aggregate_limit: { new: 2000000, expiring: 2000000 },
            sir_type: { new: "Deductible", expiring: "Deductible" },
            sir_amount: { new: 5000, expiring: 5000 },
            commission: { new: 0.175, expiring: 0.175 }
          },
          class_rows: [{
            class_code: "10026",
            description: "CABINET MFG - WOOD",
            zip_code: "90210",
            exposures: 500000
          }]
        },
        uw_notes: "Demo quote for ABC Construction Co."
      };
    } else if (quoteId === "demo-2") {
      return {
        exposure_rating: {
          policy_details: {
            insured: "XYZ Restaurant Group",
            deal_number: "MQ-2024-002",
            pl2: "General Liability",
            territory: "NY-02",
            policy_effective_date: { new: "2024-05-01", expiring: "2023-05-01" },
            policy_expiration_date: { new: "2025-05-01", expiring: "2024-05-01" },
            occurrence_limit: { new: 1000000, expiring: 1000000 },
            aggregate_limit: { new: 2000000, expiring: 2000000 },
            sir_type: { new: "SIR", expiring: "SIR" },
            sir_amount: { new: 10000, expiring: 10000 },
            commission: { new: 0.15, expiring: 0.15 }
          },
          class_rows: [{
            class_code: "16911",
            description: "RESTAURANTS",
            zip_code: "10001",
            exposures: 750000,
            location: 1,
            subline: "Liquor Liability",
            liquor_limit: 1000000
          }]
        },
        uw_notes: "Demo quote for XYZ Restaurant Group - includes liquor liability"
      };
    }
    return null;
  };

  // Populate form fields from loaded quote data
  const populateFormFromQuote = (data: QuoteInput) => {
    // Policy details
    if (data.exposure_rating?.policy_details) {
      const pd = data.exposure_rating.policy_details;

      setInsured(pd.insured || "");
      setDealNumber(pd.deal_number || "");
      setPl2Selection(pd.pl2 || "Other");
      setTerritory(pd.territory || "None");

      // Sales (for Contractors)
      if (pd.sales) {
        setNewSales(pd.sales.new?.toString() || "");
        setExpiringSales(pd.sales.expiring?.toString() || "");
      }

      // Dates
      if (pd.policy_effective_date) {
        setEffectiveDates({
          new: pd.policy_effective_date.new || "",
          expiring: pd.policy_effective_date.expiring || ""
        });
      }

      if (pd.policy_expiration_date) {
        setExpirationDates({
          new: pd.policy_expiration_date.new || "",
          expiring: pd.policy_expiration_date.expiring || ""
        });
      }

      // Limits
      if (pd.occurrence_limit) setOccurrenceLimit({ new: pd.occurrence_limit.new, expiring: pd.occurrence_limit.expiring ?? 0 });
      if (pd.aggregate_limit) setAggregateLimit({ new: pd.aggregate_limit.new, expiring: pd.aggregate_limit.expiring ?? 0 });

      // SIR/Deductible
      if (pd.sir_type) setSirType({ new: pd.sir_type.new, expiring: pd.sir_type.expiring ?? "" });
      if (pd.sir_amount) setSirAmount({ new: Number(pd.sir_amount.new), expiring: Number(pd.sir_amount.expiring ?? 0) });

      // Commission
      if (pd.commission) setCommission({ new: Number(pd.commission.new), expiring: Number(pd.commission.expiring ?? 0) });
    }

    // Class rows
    if (data.exposure_rating?.class_rows && data.exposure_rating.class_rows.length > 0) {
      const newRows = [...classRows];
      data.exposure_rating.class_rows.forEach((row, index) => {
        if (index < newRows.length) {
          newRows[index] = {
            classCode: row.class_code || "",
            description: row.description || "",
            locationNumber: row.location?.toString() || "",
            subline: row.subline || "",
            dominantClass: row.dominant_class ? "Yes" : "",
            liquorLiabilityLimit: row.liquor_limit?.toString() || "",
            exposures: row.exposures?.toString() || "",
            zipCode: row.zip_code || ""
          };
        }
      });
      setClassRows(newRows);
    }

    // Experience modifier
    if (data.experience_modifier) {
      setExperienceModifierData(data.experience_modifier);
    }

    // UW Notes
    if (data.uw_notes) {
      setUwNotes(data.uw_notes);
    }
  };

  // Build QuoteInput object from current form state
  const buildQuoteInput = (): QuoteInput => {
    return {
      exposure_rating: {
        policy_details: {
          insured: insured || "Unnamed Insured",
          deal_number: dealNumber,
          pl2: pl2Selection,
          territory: territory,
          sales: pl2Selection === "Contractors" ? {
            new: parseFloat(newSales) || 0,
            expiring: parseFloat(expiringSales) || 0
          } : undefined,
          policy_effective_date: effectiveDates,
          policy_expiration_date: expirationDates,
          occurrence_limit: occurrenceLimit,
          aggregate_limit: aggregateLimit,
          sir_type: sirType,
          sir_amount: sirAmount,
          commission: commission
        },
        class_rows: classRows.filter(row => row.classCode).map(row => ({
          class_code: row.classCode,
          description: row.description,
          zip_code: row.zipCode,
          exposures: parseFloat(row.exposures) || 0,
          location: row.locationNumber ? parseInt(row.locationNumber) : undefined,
          subline: row.subline || undefined,
          liquor_limit: row.liquorLiabilityLimit ? parseFloat(row.liquorLiabilityLimit) : undefined,
          dominant_class: row.dominantClass === "Yes"
        }))
      },
      experience_modifier: experienceModifierData.evaluation_date || experienceModifierData.losses?.length > 0 ? experienceModifierData : undefined,
      uw_notes: uwNotes
    };
  };

  // Export current form data as JSON
  const handleExportJSON = () => {
    const quoteData = buildQuoteInput();
    const blob = new Blob([JSON.stringify(quoteData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quote_${insured || "unnamed"}_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export current form data as Excel
  const handleExportExcel = () => {
    try {
      const quoteData = buildQuoteInput();
      const blob = generateExcelFromQuote(quoteData, insured);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quote_${insured || "unnamed"}_${new Date().toISOString().split("T")[0]}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('success', 'Quote exported to Excel successfully');
    } catch (error) {
      console.error('Export failed:', error);
      showToast('error', 'Failed to export quote to Excel');
    }
  };

  // Save quote to local storage/backend
  const handleSaveQuote = async () => {
    try {
      setIsLoading(true);
      const quoteData = buildQuoteInput();
      const result = await apiClient.createQuote(quoteData);
      setCurrentQuoteId(result.quote_id);
      setValidationErrors([]);
      showToast('success', `Quote saved successfully (ID: ${result.quote_id.slice(0, 8)}...)`);
    } catch (error) {
      console.error("Save failed:", error);
      setValidationErrors(["Failed to save quote. Please try again."]);
      showToast('error', 'Failed to save quote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Import JSON or Excel data into form
  const handleImportJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      let data: QuoteInput;

      if (file.name.endsWith('.json')) {
        // Handle JSON import
        const text = await file.text();
        data = JSON.parse(text) as QuoteInput;
        showToast('success', 'Quote imported from JSON successfully');
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // Handle Excel import
        data = await parseExcelToQuote(file);
        showToast('success', 'Quote imported from Excel successfully');
      } else {
        showToast('warning', 'Please select a JSON or Excel (.xlsx) file');
        setIsLoading(false);
        return;
      }

      // Populate form with imported data
      populateFormFromQuote(data);
      setValidationErrors([]);
    } catch (error) {
      console.error("Failed to import file:", error);
      const message = file.name.endsWith('.json')
        ? "Failed to import JSON file. Please check the file format."
        : "Failed to import Excel file. Please ensure it's a valid GL Rater export.";
      setValidationErrors([message]);
      showToast('error', message);
    } finally {
      setIsLoading(false);
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  // Calculate quote through API
  const handleCalculate = async () => {
    setIsLoading(true);
    setValidationErrors([]);

    try {
      const quoteData = buildQuoteInput();
      const result = await apiClient.calculateQuote(quoteData);

      setCurrentQuoteId(result.quote_id);
      if (result.output?.calculated_values) {
        setCalculatedValues(result.output.calculated_values);
        const premium = result.output.calculated_values.technical_premium_post_emod;
        if (premium) {
          showToast('success', `Quote calculated successfully. Technical Premium: $${premium.toLocaleString()}`);
        } else {
          showToast('success', 'Quote calculated successfully');
        }
      }

      if (result.validation_result && !result.validation_result.is_valid) {
        setValidationErrors(result.validation_result.errors);
        if (result.validation_result.errors.length > 0) {
          showToast('warning', 'Calculation completed with warnings. Please review the validation messages.');
        }
      }
    } catch (error) {
      console.error("Calculation failed:", error);
      setValidationErrors(["Failed to calculate quote. Please check your connection and try again."]);
      showToast('error', 'Failed to calculate quote. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassCodeChange = (index: number, code: string) => {
    const newRows = [...classRows];
    newRows[index].classCode = code;
    // Find the full description from CLASS_CODES
    const fullCode = CLASS_CODES.find(c => c.startsWith(code));
    if (fullCode) {
      newRows[index].description = fullCode.split(' - ').slice(1).join(' - ');
    }
    setClassRows(newRows);
  };

  const handleFieldChange = (index: number, field: keyof ClassRow, value: string) => {
    const newRows = [...classRows];
    newRows[index][field] = value;
    setClassRows(newRows);
  };

  // Validation function
  const getValidationMessage = (index: number): string | null => {
    const row = classRows[index];
    if (pl2Selection === "General Liability" && row.classCode && !row.subline) {
      return "Enter Subline";
    }
    if (pl2Selection === "General Liability" && row.subline && !row.locationNumber) {
      return "Enter Location Number";
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Primary GL Rater</h1>
          <p className="text-sm text-muted-foreground mt-1">
            General Liability primary rating workbook
            {currentQuoteId && (
              <span className="ml-2 text-green-600">
                (Quote loaded: {currentQuoteId.slice(0, 8)}...)
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {currentQuoteId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Clear the quote ID from URL
                router.push("/rating/primary-gl-rater");
                // Reset form to defaults
                window.location.reload();
              }}
              title="Start New Quote"
            >
              New Quote
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/rating/history")}
            title="View Quote History"
          >
            <History className="w-4 h-4 mr-2" />
            History
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newShow = !showDebugPanel;
              setShowDebugPanel(newShow);
              if (newShow) {
                setDebugData({
                  input: buildQuoteInput(),
                  output: calculatedValues,
                  quoteId: currentQuoteId,
                  timestamp: new Date().toISOString()
                });
              }
            }}
            title="Toggle Debug Panel"
          >
            <Bug className="w-4 h-4 mr-2" />
            Debug
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveQuote}
            disabled={isLoading}
            title="Save Quote"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            title="Export to Excel"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            title="Export to JSON"
          >
            <Download className="w-4 h-4 mr-2" />
            Export to JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            title="Import from JSON"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import JSON
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleCalculate}
            disabled={isLoading}
            title="Calculate Quote"
          >
            <Calculator className="w-4 h-4 mr-2" />
            {isLoading ? "Calculating..." : "Calculate"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => showToast('success', 'Quote submitted for approval')}
            title="Submit for Approval"
          >
            Submit for Approval
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.xlsx,.xls"
            onChange={handleImportJSON}
            className="hidden"
          />
          <div className="text-right ml-4">
            <div className="text-xs text-muted-foreground">MARKEL</div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="exposure">Exposure Rating</TabsTrigger>
          <TabsTrigger value="experience">Experience Modifier</TabsTrigger>
          <TabsTrigger value="notes">UW Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="exposure" className="space-y-6 mt-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Table 1. Policy Level Details</h3>

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
                  <select
                    className="col-span-2 h-9 px-3 rounded-md border bg-[#FFF4F2EB]"
                    value={pl2Selection}
                    onChange={(e) => setPl2Selection(e.target.value)}
                  >
                    {PL2_OPTIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
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
                    onChange={(e) => setEffectiveDates({...effectiveDates, new: e.target.value})}
                  />
                  <Input
                    type="date"
                    className="bg-[#FFF4F2EB]"
                    value={effectiveDates.expiring}
                    onChange={(e) => setEffectiveDates({...effectiveDates, expiring: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 items-center">
                  <label className="text-sm text-right">Policy Expiration Date:</label>
                  <Input
                    type="date"
                    className="bg-[#FFF4F2EB]"
                    value={expirationDates.new}
                    onChange={(e) => setExpirationDates({...expirationDates, new: e.target.value})}
                  />
                  <Input
                    type="date"
                    className="bg-[#FFF4F2EB]"
                    value={expirationDates.expiring}
                    onChange={(e) => setExpirationDates({...expirationDates, expiring: e.target.value})}
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
                        setExpirationDates({ ...expirationDates, new: eff.toISOString().split('T')[0] });
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
                    onChange={(e) => setOccurrenceLimit({...occurrenceLimit, new: Number(e.target.value)})}
                    className="bg-[#FFF4F2EB]"
                  />
                  <Input
                    value={occurrenceLimit.expiring}
                    onChange={(e) => setOccurrenceLimit({...occurrenceLimit, expiring: Number(e.target.value)})}
                    className="bg-[#FFF4F2EB]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 items-center">
                  <label className="text-sm text-right">General Aggregate Limit:</label>
                  <Input
                    value={aggregateLimit.new}
                    onChange={(e) => setAggregateLimit({...aggregateLimit, new: Number(e.target.value)})}
                    className="bg-[#FFF4F2EB]"
                  />
                  <Input
                    value={aggregateLimit.expiring}
                    onChange={(e) => setAggregateLimit({...aggregateLimit, expiring: Number(e.target.value)})}
                    className="bg-[#FFF4F2EB]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 items-center">
                  <label className="text-sm text-right">SIR/Deductible:</label>
                  <select
                    className="h-9 px-3 rounded-md border bg-[#FFF4F2EB]"
                    value={sirType.new}
                    onChange={(e) => setSirType({...sirType, new: e.target.value})}
                  >
                    {SIR_TYPE_OPTIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <select
                    className="h-9 px-3 rounded-md border bg-[#FFF4F2EB]"
                    value={sirType.expiring}
                    onChange={(e) => setSirType({...sirType, expiring: e.target.value})}
                  >
                    {SIR_TYPE_OPTIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2 items-center">
                  <label className="text-sm text-right">SIR/Ded Amount:</label>
                  <Input
                    value={sirAmount.new}
                    onChange={(e) => setSirAmount({...sirAmount, new: Number(e.target.value)})}
                    className="bg-[#FFF4F2EB]"
                  />
                  <Input
                    value={sirAmount.expiring}
                    onChange={(e) => setSirAmount({...sirAmount, expiring: Number(e.target.value)})}
                    className="bg-[#FFF4F2EB]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 items-center">
                  <label className="text-sm text-right">Commission:</label>
                  <Input
                    value={(commission.new * 100).toFixed(1) + "%"}
                    className="bg-[#FFF4F2EB]"
                    onChange={(e) => {
                      const val = parseFloat(e.target.value.replace('%', '')) / 100;
                      if (!isNaN(val)) setCommission({...commission, new: val});
                    }}
                  />
                  <Input
                    value={(commission.expiring * 100).toFixed(1) + "%"}
                    className="bg-[#FFF4F2EB]"
                    onChange={(e) => {
                      const val = parseFloat(e.target.value.replace('%', '')) / 100;
                      if (!isNaN(val)) setCommission({...commission, expiring: val});
                    }}
                  />
                </div>
                {commission.new > 0.30 && (
                  <div className="col-span-3 text-right">
                    <span className="text-yellow-600 warning">Commission exceeds typical range</span>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 items-center">
                  <label className="text-sm text-right">Technical Premium Prior to Emod:</label>
                  <Input defaultValue="-" className="bg-white" readOnly />
                </div>

                <div className="grid grid-cols-2 gap-2 items-center">
                  <label className="text-sm text-right">Experience Mod:</label>
                  <Input defaultValue="1.000" className="bg-white" readOnly />
                </div>

                <div className="grid grid-cols-2 gap-2 items-center">
                  <label className="text-sm text-right">Technical Premium After Emod (to be entered in e2):</label>
                  <Input defaultValue="-" className="bg-white" readOnly />
                </div>

                <div className="grid grid-cols-2 gap-2 items-center mt-8">
                  <label className="text-sm text-right">Bound / Quoted Premium:</label>
                  <Input className="bg-[#FFF4F2EB]" />
                </div>

                {/* Sales Section - E9 - Only visible when PL_2 = Contractors */}
                {pl2Selection === "Contractors" && (
                  <div className="mt-8 border-t pt-4">
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <label className="text-sm text-right">Sales:</label>
                      <Input
                        placeholder="New/Renewal"
                        value={newSales}
                        onChange={(e) => setNewSales(e.target.value)}
                        className="bg-[#FFF4F2EB]"
                      />
                      <Input
                        placeholder="Expiring"
                        value={expiringSales}
                        onChange={(e) => setExpiringSales(e.target.value)}
                        className="bg-[#FFF4F2EB]"
                      />
                    </div>

                    {/* Calculated Rate Fields - E10-E13 */}
                    <div className="grid grid-cols-3 gap-2 items-center mt-2">
                      <label className="text-xs text-right">Tech Composite Rate (pre-emod) per $1000:</label>
                      <Input defaultValue="-" className="bg-white h-8 text-xs" readOnly />
                      <Input defaultValue="-" className="bg-white h-8 text-xs" readOnly />
                    </div>

                    <div className="grid grid-cols-3 gap-2 items-center mt-2">
                      <label className="text-xs text-right">Tech Composite Rate (post-emod) per $1000:</label>
                      <Input defaultValue="-" className="bg-white h-8 text-xs" readOnly />
                      <Input defaultValue="-" className="bg-white h-8 text-xs" readOnly />
                    </div>

                    <div className="grid grid-cols-3 gap-2 items-center mt-2">
                      <label className="text-xs text-right">Calculated Composite Rate per $1000:</label>
                      <Input defaultValue="-" className="bg-white h-8 text-xs" readOnly />
                      <Input defaultValue="-" className="bg-white h-8 text-xs" readOnly />
                    </div>

                    <div className="grid grid-cols-3 gap-2 items-center mt-2">
                      <label className="text-xs text-right">Bound Composite Rate per $1000:</label>
                      <Input defaultValue="-" className="bg-white h-8 text-xs" readOnly />
                      <Input defaultValue="-" className="bg-white h-8 text-xs" readOnly />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 items-center">
                  <label className="text-sm text-right">Calculated Premium:</label>
                  <Input defaultValue="-" className="bg-white" readOnly />
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
                  <Button variant="outline" onClick={() => {
                    setPl2Selection(RATING_CONFIG.policyDetails.defaults.pl2);
                    setTerritory(RATING_CONFIG.policyDetails.defaults.territory);
                    setNewSales("");
                    setExpiringSales("");
                    setInsured("");
                    setDealNumber("");
                    setEffectiveDates({ new: "", expiring: "" });
                    setExpirationDates({ new: "", expiring: "" });
                    setOccurrenceLimit({ new: RATING_CONFIG.policyDetails.defaults.occurrenceLimit.new, expiring: RATING_CONFIG.policyDetails.defaults.occurrenceLimit.expiring });
                    setAggregateLimit({ new: RATING_CONFIG.policyDetails.defaults.aggregateLimit.new, expiring: RATING_CONFIG.policyDetails.defaults.aggregateLimit.expiring });
                    setSirType({ new: RATING_CONFIG.policyDetails.defaults.sirType.new, expiring: RATING_CONFIG.policyDetails.defaults.sirType.expiring });
                    setSirAmount({ new: RATING_CONFIG.policyDetails.defaults.sirAmount.new, expiring: RATING_CONFIG.policyDetails.defaults.sirAmount.expiring });
                    setCommission({ new: RATING_CONFIG.policyDetails.defaults.commission.new, expiring: RATING_CONFIG.policyDetails.defaults.commission.expiring });
                    setClassRows(Array.from({ length: RATING_CONFIG.tableDefaults.classRows }, () => ({
                      classCode: "", description: "", locationNumber: "", subline: "", dominantClass: "", liquorLiabilityLimit: "", exposures: "", zipCode: ""
                    })));
                    setCalculatedValues(null);
                    setValidationErrors([]);
                    setCurrentQuoteId(null);
                  }}>Reset Rating Defaults</Button>
                </div>
              </div>
            </div>
          </Card>

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
                    {pl2Selection === "General Liability" && (
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
                    <TableHead className="w-24">
                      {pl2Selection !== "General Liability" ? "PremOps Rate" : "PremOps / Liquor Rate"}
                    </TableHead>
                    <TableHead className="w-24">Products Rate</TableHead>
                    <TableHead className="w-24">Total Rate</TableHead>
                    <TableHead className="w-24">
                      {pl2Selection !== "General Liability" ? "PremOps Prem" : "PremOps / Liquor Prem"}
                    </TableHead>
                    <TableHead className="w-32">Products Premium</TableHead>
                    <TableHead className="w-32">Technical Premium</TableHead>
                    <TableHead className="w-28">Modified Rate</TableHead>
                    <TableHead className="w-32">Modified Premium</TableHead>
                    <TableHead className="w-32">Audit Rate Selection</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>1</TableCell>
                    <TableCell>
                      <ClassCodeSelect
                        classCodes={CLASS_CODES}
                        value={classRows[0].classCode}
                        onChange={(code) => handleClassCodeChange(0, code)}
                        className="h-8 text-xs bg-[#FFF4F2EB]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="h-8 text-xs bg-white"
                        value={classRows[0].description}
                        readOnly
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="h-8 text-xs bg-[#FFF4F2EB]"
                        value={classRows[0].zipCode}
                        onChange={(e) => handleFieldChange(0, 'zipCode', e.target.value)}
                      />
                    </TableCell>
                    {pl2Selection === "General Liability" && (
                      <>
                        <TableCell>
                          <Input
                            className="h-8 text-xs bg-[#FFF4F2EB]"
                            placeholder="Location #"
                            value={classRows[0].locationNumber}
                            onChange={(e) => handleFieldChange(0, 'locationNumber', e.target.value)}
                          />
                          {getValidationMessage(0) === "Enter Location Number" && (
                            <span className="text-red-500 text-xs">Enter Location Number</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <select
                            className="h-8 px-2 text-xs rounded-md border bg-[#FFF4F2EB] w-full"
                            value={classRows[0].subline}
                            onChange={(e) => handleFieldChange(0, 'subline', e.target.value)}
                          >
                            <option value="">Select Subline</option>
                            {SUBLINE_OPTIONS.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                          {getValidationMessage(0) === "Enter Subline" && (
                            <span className="text-red-500 text-xs">Enter Subline</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <select
                            className="h-8 px-2 text-xs rounded-md border bg-[#FFF4F2EB] w-full"
                            value={classRows[0].dominantClass}
                            onChange={(e) => handleFieldChange(0, 'dominantClass', e.target.value)}
                            disabled={!classRows[0].subline}
                          >
                            <option value="">Select</option>
                            {DOMINANT_CLASS_OPTIONS.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell>
                          <select
                            className="h-8 px-2 text-xs rounded-md border bg-[#FFF4F2EB] w-full"
                            value={classRows[0].liquorLiabilityLimit}
                            onChange={(e) => handleFieldChange(0, 'liquorLiabilityLimit', e.target.value)}
                            disabled={classRows[0].subline !== "Liquor Liability"}
                          >
                            <option value="">Select</option>
                            {LIQUOR_LIABILITY_LIMIT_OPTIONS.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </TableCell>
                      </>
                    )}
                    <TableCell>
                      <Input
                        className="h-8 text-xs bg-[#FFF4F2EB]"
                        value={classRows[0].exposures}
                        onChange={(e) => handleFieldChange(0, 'exposures', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input className="h-8 text-xs bg-[#FFF4F2EB]" />
                    </TableCell>
                    <TableCell>
                      <select className="h-8 px-2 text-xs rounded-md border bg-[#FFF4F2EB] w-full">
                        {EXPOSURE_BASE_OPTIONS.map(base => (
                          <option key={base} value={base}>{base}</option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell>
                      <Input className="h-8 text-xs bg-white text-center" defaultValue="-" readOnly />
                    </TableCell>
                    <TableCell>
                      <Input className="h-8 text-xs bg-white text-center" defaultValue="-" readOnly />
                    </TableCell>
                    <TableCell>
                      <Input className="h-8 text-xs bg-white text-center" defaultValue="-" readOnly />
                    </TableCell>
                    <TableCell>
                      <Input className="h-8 text-xs bg-white text-center" defaultValue="-" readOnly />
                    </TableCell>
                    <TableCell>
                      <Input className="h-8 text-xs bg-white text-center" defaultValue="-" readOnly />
                    </TableCell>
                    <TableCell>
                      <Input className="h-8 text-xs bg-white text-center" defaultValue="-" readOnly />
                    </TableCell>
                    <TableCell>
                      <Input className="h-8 text-xs bg-white text-center" defaultValue="-" readOnly />
                    </TableCell>
                    <TableCell>
                      <Input className="h-8 text-xs bg-white text-center" defaultValue="-" readOnly />
                    </TableCell>
                    <TableCell>
                      <Input className="h-8 text-xs bg-white text-center" defaultValue="-" readOnly />
                    </TableCell>
                  </TableRow>
                  {Array.from({ length: 19 }).map((_, i) => {
                    const rowIndex = i + 1;
                    const validationMsg = getValidationMessage(rowIndex);
                    return (
                    <TableRow key={rowIndex + 1}>
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
                          onChange={(e) => handleFieldChange(rowIndex, 'zipCode', e.target.value)}
                        />
                      </TableCell>
                      {pl2Selection === "General Liability" && (
                        <>
                          <TableCell>
                            <Input
                              className="h-8 text-xs bg-[#FFF4F2EB]"
                              placeholder="Location #"
                              value={classRows[rowIndex].locationNumber}
                              onChange={(e) => handleFieldChange(rowIndex, 'locationNumber', e.target.value)}
                            />
                            {validationMsg === "Enter Location Number" && (
                              <span className="text-red-500 text-xs">Enter Location Number</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <select
                              className="h-8 px-2 text-xs rounded-md border bg-[#FFF4F2EB] w-full"
                              value={classRows[rowIndex].subline}
                              onChange={(e) => handleFieldChange(rowIndex, 'subline', e.target.value)}
                            >
                              <option value="">Select Subline</option>
                              {SUBLINE_OPTIONS.map(opt => (
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
                              onChange={(e) => handleFieldChange(rowIndex, 'dominantClass', e.target.value)}
                              disabled={!classRows[rowIndex].subline}
                            >
                              <option value="">Select</option>
                              {DOMINANT_CLASS_OPTIONS.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </TableCell>
                          <TableCell>
                            <select
                              className="h-8 px-2 text-xs rounded-md border bg-[#FFF4F2EB] w-full"
                              value={classRows[rowIndex].liquorLiabilityLimit}
                              onChange={(e) => handleFieldChange(rowIndex, 'liquorLiabilityLimit', e.target.value)}
                              disabled={classRows[rowIndex].subline !== "Liquor Liability"}
                            >
                              <option value="">Select</option>
                              {LIQUOR_LIABILITY_LIMIT_OPTIONS.map(opt => (
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
                          onChange={(e) => handleFieldChange(rowIndex, 'exposures', e.target.value)}
                        />
                      </TableCell>
                      <TableCell><Input className="h-8 text-xs bg-[#FFF4F2EB]" /></TableCell>
                      <TableCell>
                        <select className="h-8 px-2 text-xs rounded-md border bg-[#FFF4F2EB] w-full">
                          <option value="">Select</option>
                          {EXPOSURE_BASE_OPTIONS.map(base => (
                            <option key={base} value={base}>{base}</option>
                          ))}
                        </select>
                      </TableCell>
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
        </TabsContent>

        <TabsContent value="experience" className="space-y-6 mt-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg">Experience Modifier Calculation</h3>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">MARKEL</div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-3 gap-4 items-center">
                <label className="text-sm">Evaluation Date of Loss Run:</label>
                <Input type="date" className="bg-[#FFF4F2EB]" />
                <Button variant="outline" onClick={() => {
                  setExperienceModifierData({ evaluation_date: "", policy_year_1: "", policy_year_2: "", losses: [] });
                }}>Reset</Button>
              </div>

              <div className="grid grid-cols-3 gap-4 items-center">
                <label className="text-sm">Earliest policy year for which you know the loss experience:</label>
                <div className="flex gap-2">
                  <Input className="bg-white" placeholder="Year 1" />
                  <Input className="bg-[#FFF4F2EB]" placeholder="Year 2" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 items-center">
                <label className="text-sm">Experience Modifier:</label>
                <Input defaultValue="1.000" className="bg-white" readOnly />
              </div>
            </div>

            <h4 className="font-semibold mb-4">LOSS DETAIL</h4>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs">
                    <TableHead>Date of Loss</TableHead>
                    <TableHead>Ground-Up Indemnity</TableHead>
                    <TableHead>Ground-Up Expense</TableHead>
                    <TableHead>Ground-Up Total Incurred</TableHead>
                    <TableHead>Indemnity Less Deductible</TableHead>
                    <TableHead>Includable Losses</TableHead>
                    <TableHead>Policy Period</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 20 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Input type="date" className="h-8 text-xs bg-[#FFF4F2EB]" />
                      </TableCell>
                      <TableCell>
                        <Input className="h-8 text-xs bg-[#FFF4F2EB]" />
                      </TableCell>
                      <TableCell>
                        <Input className="h-8 text-xs bg-[#FFF4F2EB]" />
                      </TableCell>
                      <TableCell>
                        <Input className="h-8 text-xs bg-white" readOnly />
                      </TableCell>
                      <TableCell>
                        <Input className="h-8 text-xs bg-white" readOnly />
                      </TableCell>
                      <TableCell>
                        <Input className="h-8 text-xs bg-white" readOnly />
                      </TableCell>
                      <TableCell>
                        <Input className="h-8 text-xs bg-white" readOnly />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 flex justify-between items-start">
              <div className="bg-zinc-50 p-4 rounded-md text-xs max-w-md space-y-2">
                <p>The intention is that individual losses be entered ground-up. The policy deductible will then be subtracted from the indemnity for the purpose of the experience mod calculation.</p>
                <p>The indemnity loss gets capped at $100K in the experience mod calculation. Therefore, it is important to separate indemnity and expense for large claims.</p>
                <p>If only grouped loss information is available, the entire loss sh. ded. amt can be entered in the ground-up expense column with a loss date equal to the appropriate policy effect date.</p>
              </div>
              <Button variant="outline">Clear Data</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-6 mt-6">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-2 text-orange-600">Primary General Liability - UW Notes</h3>
            <p className="text-sm italic mb-4">Please document your selections and deviations from the technical price here:</p>

            <textarea
              className="w-full h-96 p-4 rounded-md border bg-[#FFF4F2EB] resize-none"
              placeholder="Enter underwriting notes..."
              value={uwNotes}
              onChange={(e) => setUwNotes(e.target.value)}
            />

            <div className="mt-4">
              <Button variant="outline" onClick={() => setUwNotes("")}>Clear Text</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="p-4 bg-red-50 border-red-200">
          <h3 className="font-semibold text-red-800 mb-2">Validation Errors</h3>
          <ul className="space-y-1">
            {validationErrors.map((error, idx) => (
              <li key={idx} className="text-sm text-red-600">• {error}</li>
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
          {currentQuoteId && (
            <div className="mt-4 pt-4 border-t border-green-200">
              <span className="text-xs text-green-600">Quote ID: {currentQuoteId}</span>
            </div>
          )}
        </Card>
      )}

      {/* Debug Panel - Fixed right-side overlay */}
      {showDebugPanel && (
        <div className="fixed top-0 right-0 h-full w-[480px] bg-white border-l border-gray-300 shadow-xl z-50 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Debug Information</h3>
            <div className="flex items-center gap-2">
              {debugData?.timestamp && (
                <span className="text-xs text-gray-500">Snapshot: {debugData.timestamp}</span>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setDebugData({
                    input: buildQuoteInput(),
                    output: calculatedValues,
                    quoteId: currentQuoteId,
                    timestamp: new Date().toISOString()
                  });
                }}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDebugPanel(false)}
                className="h-7 w-7 p-0"
              >
                ✕
              </Button>
            </div>
          </div>

          {currentQuoteId && (
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Quote ID:</span>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">{currentQuoteId}</code>
            </div>
          )}

          <div className="space-y-3">
            {/* Quote Input JSON */}
            <div className="border rounded bg-white">
              <button
                className="w-full flex items-center justify-between p-2 text-sm font-medium hover:bg-gray-50"
                onClick={() => setDebugSectionsOpen(prev => ({ ...prev, input: !prev.input }))}
              >
                <span>Quote Input (Form State)</span>
                {debugSectionsOpen.input ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {debugSectionsOpen.input && debugData?.input && (
                <div className="border-t p-2">
                  <div className="flex justify-end mb-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(debugData.input, null, 2));
                        showToast("success", "Input JSON copied to clipboard");
                      }}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <pre className="text-xs overflow-auto max-h-96 bg-gray-50 p-2 rounded">
                    {JSON.stringify(debugData.input, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Calculated Output JSON */}
            <div className="border rounded bg-white">
              <button
                className="w-full flex items-center justify-between p-2 text-sm font-medium hover:bg-gray-50"
                onClick={() => setDebugSectionsOpen(prev => ({ ...prev, output: !prev.output }))}
              >
                <span>Calculated Output</span>
                {debugSectionsOpen.output ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {debugSectionsOpen.output && (
                <div className="border-t p-2">
                  {debugData?.output ? (
                    <>
                      <div className="flex justify-end mb-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs"
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(debugData.output, null, 2));
                            showToast("success", "Output JSON copied to clipboard");
                          }}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <pre className="text-xs overflow-auto max-h-96 bg-gray-50 p-2 rounded">
                        {JSON.stringify(debugData.output, null, 2)}
                      </pre>
                    </>
                  ) : (
                    <p className="text-xs text-gray-500 italic p-2">No calculated output yet. Run a calculation first.</p>
                  )}
                </div>
              )}
            </div>

            {/* API Download Buttons - only when a quote has been saved */}
            {currentQuoteId && (
              <div className="border-t pt-3">
                <p className="text-xs font-medium text-gray-600 mb-2">API Downloads (saved quote)</p>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        const data = await apiClient.downloadInput(currentQuoteId);
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `input_${currentQuoteId}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      } catch (error) {
                        console.error("Failed to download input:", error);
                      }
                    }}
                  >
                    Download Input JSON
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        const data = await apiClient.downloadOutput(currentQuoteId);
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `output_${currentQuoteId}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      } catch (error) {
                        console.error("Failed to download output:", error);
                      }
                    }}
                  >
                    Download Output JSON
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        const blob = await apiClient.downloadExcel(currentQuoteId);
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `quote_${currentQuoteId}.xlsx`;
                        a.click();
                        URL.revokeObjectURL(url);
                      } catch (error) {
                        console.error("Failed to download Excel:", error);
                      }
                    }}
                  >
                    Download Excel
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        const data = await apiClient.getAuditLog(currentQuoteId);
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `audit_${currentQuoteId}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      } catch (error) {
                        console.error("Failed to download audit log:", error);
                      }
                    }}
                  >
                    Download Audit Log
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
