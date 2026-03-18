import type { SubmissionFormType } from "../types";

export interface FormsCatalogEntry {
  formNumber: string;
  edition: string;
  formName: string;
  type: SubmissionFormType;
  category: string;
}

export const FORMS_CATALOG: FormsCatalogEntry[] = [
  // Common Policy
  { formNumber: "MJIL 1000", edition: "08 10", formName: "Policy Jacket (Evanston)", type: "policy", category: "Common Policy" },
  { formNumber: "MPIL 1007", edition: "01 20", formName: "Privacy Notice", type: "notice", category: "Common Policy" },
  { formNumber: "MPIL 1039-CA", edition: "01 20", formName: "California Surplus Lines Notice (D-2)", type: "notice", category: "Common Policy" },
  { formNumber: "MPIL 1041", edition: "02 20", formName: "How To Report A Claim", type: "notice", category: "Common Policy" },
  { formNumber: "MPIL 1083", edition: "04 15", formName: "U.S. Treasury Department's Office Of Foreign Assets Control (OFAC) Advisory Notice To Policyholders", type: "notice", category: "Common Policy" },
  { formNumber: "MDIL 1000", edition: "08 11", formName: "Common Policy Declaration", type: "policy", category: "Common Policy" },
  { formNumber: "MDIL 1002", edition: "01 10", formName: "Schedule of Taxes, Surcharges Or Fees", type: "policy", category: "Common Policy" },
  { formNumber: "MDIL 1001", edition: "08 11", formName: "Forms Schedule", type: "policy", category: "Common Policy" },
  { formNumber: "IL 00 17", edition: "11 98", formName: "Common Policy Conditions", type: "policy", category: "Common Policy" },
  { formNumber: "IL 00 21", edition: "09 08", formName: "Nuclear Energy Liability Exclusion Endorsement", type: "exclusion", category: "Common Policy" },
  { formNumber: "MEIL 1200-CA", edition: "02 23", formName: "Service of Suit - California", type: "endorsement", category: "Common Policy" },
  { formNumber: "MEIL 1225", edition: "10 11", formName: "Change - Civil Union", type: "endorsement", category: "Common Policy" },
  { formNumber: "MIL 1214", edition: "09 17", formName: "Trade Or Economic Sanctions", type: "endorsement", category: "Common Policy" },
  { formNumber: "MEIL 1200-NY", edition: "02 23", formName: "Service of Suit - New York", type: "endorsement", category: "Common Policy" },
  { formNumber: "MEIL 1200-TX", edition: "02 23", formName: "Service of Suit - Texas", type: "endorsement", category: "Common Policy" },
  { formNumber: "MPIL 1039-NY", edition: "01 20", formName: "New York Surplus Lines Notice", type: "notice", category: "Common Policy" },
  { formNumber: "MPIL 1039-FL", edition: "01 20", formName: "Florida Surplus Lines Notice", type: "notice", category: "Common Policy" },

  // GL Coverage
  { formNumber: "MDGL 1008", edition: "08 11", formName: "Commercial General Liability Coverage Part Declarations", type: "coverage", category: "GL Coverage" },
  { formNumber: "CG 00 01", edition: "04 13", formName: "Commercial General Liability Coverage Form", type: "coverage", category: "GL Coverage" },
  { formNumber: "CG 00 02", edition: "04 13", formName: "Commercial General Liability Coverage Form (Claims-Made)", type: "coverage", category: "GL Coverage" },

  // GL Endorsements
  { formNumber: "CG 03 00", edition: "01 96", formName: "Deductible Liability Insurance", type: "endorsement", category: "GL Endorsements" },
  { formNumber: "CG 20 10", edition: "04 13", formName: "Additional Insured - Owners, Lessees or Contractors", type: "endorsement", category: "GL Endorsements" },
  { formNumber: "CG 20 11", edition: "04 13", formName: "Additional Insured - Managers or Lessors of Premises", type: "endorsement", category: "GL Endorsements" },
  { formNumber: "CG 20 26", edition: "04 13", formName: "Additional Insured - Designated Person or Organization", type: "endorsement", category: "GL Endorsements" },
  { formNumber: "CG 20 37", edition: "04 13", formName: "Additional Insured - Owners, Lessees or Contractors (Completed Operations)", type: "endorsement", category: "GL Endorsements" },
  { formNumber: "CG 21 06", edition: "05 14", formName: "Exclusion - Access or Disclosure of Confidential Information", type: "exclusion", category: "GL Endorsements" },
  { formNumber: "CG 21 34", edition: "01 87", formName: "Designated Work Exclusion", type: "exclusion", category: "GL Endorsements" },
  { formNumber: "CG 21 35", edition: "10 01", formName: "Exclusion - Coverage C - Medical Payments", type: "exclusion", category: "GL Endorsements" },
  { formNumber: "CG 21 36", edition: "03 05", formName: "New Entities Exclusion", type: "exclusion", category: "GL Endorsements" },
  { formNumber: "CG 21 39", edition: "10 93", formName: "Contractual Liability Limitation", type: "endorsement", category: "GL Endorsements" },
  { formNumber: "CG 21 47", edition: "12 07", formName: "Employment-Related Practices Exclusion", type: "exclusion", category: "GL Endorsements" },
  { formNumber: "CG 21 49", edition: "09 99", formName: "Total Pollution Exclusion Endorsement", type: "exclusion", category: "GL Endorsements" },
  { formNumber: "CG 21 53", edition: "01 96", formName: "Exclusion - Designated Ongoing Operations", type: "exclusion", category: "GL Endorsements" },
  { formNumber: "CG 21 67", edition: "12 04", formName: "Fungi or Bacteria Exclusion", type: "exclusion", category: "GL Endorsements" },
  { formNumber: "CG 21 73", edition: "01 15", formName: "Exclusion Of Certified Acts Of Terrorism", type: "exclusion", category: "GL Endorsements" },
  { formNumber: "CG 22 54", edition: "11 85", formName: "Exclusion - Logging and Lumbering Operations", type: "exclusion", category: "GL Endorsements" },
  { formNumber: "CG 22 79", edition: "04 13", formName: "Abuse or Molestation Exclusion", type: "exclusion", category: "GL Endorsements" },
  { formNumber: "CG 22 94", edition: "10 01", formName: "Exclusion - Damage To Work Performed By Subcontractors On Your Behalf", type: "exclusion", category: "GL Endorsements" },
  { formNumber: "CG 24 04", edition: "05 09", formName: "Waiver of Transfer of Rights of Recovery Against Others", type: "endorsement", category: "GL Endorsements" },
  { formNumber: "CG 24 26", edition: "04 13", formName: "Amendment Of Insured Contract Definition", type: "endorsement", category: "GL Endorsements" },
  { formNumber: "CG 25 03", edition: "05 09", formName: "Designated Construction Projects - General Aggregate Limit", type: "endorsement", category: "GL Endorsements" },
  { formNumber: "CG 25 04", edition: "05 09", formName: "Designated Location(s) General Aggregate Limit", type: "endorsement", category: "GL Endorsements" },
  { formNumber: "MEGL 0001", edition: "05 24", formName: "Combination General Endorsement", type: "endorsement", category: "GL Endorsements" },
  { formNumber: "MEGL 0008", edition: "04 20", formName: "Exclusion - Continuous or Progressive Injury or Damage", type: "exclusion", category: "GL Endorsements" },
  { formNumber: "MEGL 0009-01", edition: "09 18", formName: "Blanket Additional Insured", type: "endorsement", category: "GL Endorsements" },
  { formNumber: "MEGL 0028", edition: "05 16", formName: "Exclusion - Cancer", type: "exclusion", category: "GL Endorsements" },
  { formNumber: "MEGL 0030", edition: "05 17", formName: "Limitation Of Coverage To Specified Covered Operations", type: "endorsement", category: "GL Endorsements" },
  { formNumber: "MEGL 0103", edition: "07 18", formName: "Limitation - Contractor Or Subcontractor Management", type: "endorsement", category: "GL Endorsements" },
  { formNumber: "MEGL 0170", edition: "05 16", formName: "Premium Basis", type: "endorsement", category: "GL Endorsements" },
  { formNumber: "MEGL 0241-01", edition: "05 16", formName: "Blanket Waiver of Transfer of Rights Against Others To Us", type: "endorsement", category: "GL Endorsements" },
  { formNumber: "MEGL 0273", edition: "05 16", formName: "Amended Mobile Equipment Exclusion - Over The Road", type: "exclusion", category: "GL Endorsements" },
  { formNumber: "MEGL 0300", edition: "09 21", formName: "Exclusion - New Residential Work", type: "exclusion", category: "GL Endorsements" },
  { formNumber: "MEGL 1331", edition: "04 24", formName: "Exclusion - Operations Covered By A Consolidated (Wrap-Up) Insurance Program", type: "exclusion", category: "GL Endorsements" },
  { formNumber: "MEGL 1361", edition: "05 16", formName: "Excl - Tainted Drywall/Gypsum Containing Bldng Materials", type: "exclusion", category: "GL Endorsements" },
  { formNumber: "MEGL 1390", edition: "12 15", formName: "Limitation - Welding Operations", type: "endorsement", category: "GL Endorsements" },
  { formNumber: "MEGL 1397", edition: "07 10", formName: "Exclusion - Aircraft, Auto Or Watercraft", type: "exclusion", category: "GL Endorsements" },
  { formNumber: "MEGL 1592", edition: "06 21", formName: "Limited Exclusion - Specified Underground Hazards", type: "exclusion", category: "GL Endorsements" },
  { formNumber: "MEGL 1614", edition: "03 20", formName: "Exclusion - Conditional Open Roofs and Specified Roofing Operations", type: "exclusion", category: "GL Endorsements" },
  { formNumber: "MEGL 1625", edition: "11 13", formName: "Exclusion - Specified States", type: "exclusion", category: "GL Endorsements" },
  { formNumber: "MEGL 1637", edition: "10 19", formName: "Exclusion - Employer's Liability And Bodily Injury To Contractors, Subcontractors, Or Independent Contractors", type: "exclusion", category: "GL Endorsements" },
  { formNumber: "MEGL 1673", edition: "05 16", formName: "Exclusion - Prior Completed Or Abandoned Work", type: "exclusion", category: "GL Endorsements" },
  { formNumber: "MEGL 2262", edition: "03 21", formName: "Amended Insuring Agreements - Duty to Defend and Indemnify", type: "endorsement", category: "GL Endorsements" },
  { formNumber: "MEGL 2310", edition: "04 20", formName: "Exclusion - Wild Fire", type: "exclusion", category: "GL Endorsements" },
  { formNumber: "MEGL 2322", edition: "05 21", formName: "Exclusion - Communicable Disease", type: "exclusion", category: "GL Endorsements" },
  { formNumber: "MGL 1356", edition: "10 20", formName: "Exclusion - Cyber Incident, Data Compromise, And Violation Of Statutes Related To Personal Data", type: "exclusion", category: "GL Endorsements" },
  { formNumber: "MGL 1615", edition: "01 23", formName: "Exclusion - Perfluoroalkyl and Polyfluoroalkyl Substances (PFAS)", type: "exclusion", category: "GL Endorsements" },
  { formNumber: "CG 04 35", edition: "04 13", formName: "Employee Benefits Liability Coverage", type: "endorsement", category: "GL Endorsements" },
];
