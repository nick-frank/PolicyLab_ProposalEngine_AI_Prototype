import type { MockClaim } from "../types";

export const MOCK_CLAIMS: MockClaim[] = [
  {
    id: "clm-001",
    claimNumber: "CLM-2024-00147",
    claimantName: "Robert Hernandez",
    insuredName: "Summit Mechanical Contractors",
    dateOfLoss: "2024-03-12",
    dateReported: "2024-03-14",
    status: "open",
    category: "bodily_injury",
    amount: 185000,
    reserveAmount: 250000,
    description: "Worker fell from scaffolding at a commercial construction site during exterior facade installation. Sustained multiple fractures to the left leg and hip. Scaffolding was erected by a subcontractor and had not been inspected that morning.",
    notes: [
      "Adjuster visited site on 03/15. Scaffolding planks appeared weathered and one guardrail was missing.",
      "Subcontractor (Apex Scaffolding LLC) provided certificate of insurance but their GL policy lapsed 02/28.",
      "Claimant's attorney filed demand letter for $450,000 on 04/02.",
      "Independent medical exam scheduled for 05/10. Claimant alleges permanent disability."
    ],
    documents: [
      {
        id: "doc-001a",
        title: "Incident Investigation Report",
        text: "On March 12, 2024, at approximately 10:45 AM, Robert Hernandez, an employee of Apex Scaffolding LLC working as a subcontractor on the Summit Mechanical project at 1420 Commerce Blvd, fell approximately 18 feet from scaffolding during facade installation work. The scaffolding had been erected two weeks prior and was scheduled for inspection. A missing guardrail on the third level was identified as a contributing factor. Emergency services were called and the worker was transported to Regional Medical Center."
      },
      {
        id: "doc-001b",
        title: "Subcontractor Agreement Review",
        text: "Review of the subcontractor agreement between Summit Mechanical and Apex Scaffolding reveals that Apex was required to maintain GL coverage with minimum limits of $1M/$2M. Certificate on file shows policy effective through 02/28/2024, creating a gap in coverage at the time of loss. Hold harmless clause in Section 7.2 may provide Summit with contractual indemnification rights."
      }
    ],
    associatedFormNumbers: ["CG 00 01", "CG 20 10", "CG 22 94", "MEGL 0103"],
    state: "TX",
    naicsCode: "238220"
  },
  {
    id: "clm-002",
    claimNumber: "CLM-2024-00163",
    claimantName: "Patricia Nguyen",
    insuredName: "GreenSpace Property Management",
    dateOfLoss: "2024-04-05",
    dateReported: "2024-04-07",
    status: "closed",
    category: "property_damage",
    amount: 42000,
    reserveAmount: 0,
    description: "Water damage to tenant's commercial space caused by burst pipe in the building's mechanical room. The pipe had corroded over time and failed during a cold snap. Tenant's inventory of electronics was damaged beyond repair.",
    notes: [
      "Building maintenance records show the pipe was last inspected 18 months ago.",
      "Tenant submitted inventory list totaling $67,000; adjuster valued actual loss at $42,000.",
      "Claim settled for $42,000 on 06/15/2024. Subrogation potential against plumbing contractor reviewed and declined."
    ],
    documents: [
      {
        id: "doc-002a",
        title: "Property Damage Assessment",
        text: "Water intrusion from a corroded 2-inch copper supply line in the second-floor mechanical room caused extensive damage to the tenant space below. Approximately 800 square feet of ceiling tiles, carpet, and drywall were affected. The tenant, an electronics retailer, reported damage to inventory including laptops, monitors, and networking equipment stored on floor-level shelving. Total property damage estimated at $42,000 including remediation costs."
      }
    ],
    associatedFormNumbers: ["CG 00 01", "CG 25 04"],
    state: "CA",
    naicsCode: "531312"
  },
  {
    id: "clm-003",
    claimNumber: "CLM-2024-00178",
    claimantName: "James Miller",
    insuredName: "ABC Construction Co.",
    dateOfLoss: "2024-05-20",
    dateReported: "2024-05-22",
    status: "litigation",
    category: "bodily_injury",
    amount: 320000,
    reserveAmount: 500000,
    description: "Pedestrian struck by debris falling from active construction zone. Concrete fragments dislodged from overhead demolition work landed on the sidewalk below, injuring a passerby. City citations issued for inadequate pedestrian barriers.",
    notes: [
      "City inspector report cites failure to maintain adequate overhead protection and pedestrian barriers.",
      "Claimant retained counsel; lawsuit filed in state court on 07/15/2024.",
      "Defense counsel assigned. Discovery phase expected to begin Q4 2024.",
      "Video footage from neighboring business security camera obtained showing the incident."
    ],
    documents: [
      {
        id: "doc-003a",
        title: "City Inspection Citation",
        text: "Following the incident on May 20, 2024, the City Building Department conducted an emergency inspection of the ABC Construction jobsite at 300 Main Street. Inspectors found that overhead pedestrian protection was not installed per the approved safety plan. The sidewalk protection consisting of plywood barriers had been partially removed to accommodate material delivery and was not replaced. Citations issued for violations of municipal code sections 3306.1 and 3306.2 regarding pedestrian safety during construction."
      },
      {
        id: "doc-003b",
        title: "Claim Summary Memo",
        text: "Claimant James Miller, age 52, was walking on the public sidewalk adjacent to the ABC Construction demolition site when concrete debris fell from the third floor, striking him on the head and shoulder. He was wearing no protective equipment as he was a member of the public. Emergency medical treatment included CT scan, treatment for concussion, and repair of a fractured clavicle. Claimant alleges ongoing headaches, neck pain, and inability to work as a commercial painter."
      }
    ],
    associatedFormNumbers: ["CG 00 01", "CG 20 10", "CG 20 37", "CG 25 03"],
    state: "NY",
    naicsCode: "236220"
  },
  {
    id: "clm-004",
    claimNumber: "CLM-2024-00201",
    claimantName: "Environmental Services LLC",
    insuredName: "Pacific Coast Demolition",
    dateOfLoss: "2024-02-10",
    dateReported: "2024-02-28",
    status: "reserved",
    category: "property_damage",
    amount: 95000,
    reserveAmount: 275000,
    description: "Asbestos-containing materials were improperly disturbed during demolition of a 1960s commercial building. Neighboring businesses had to be evacuated and remediation was required. EPA and state environmental agency investigating.",
    notes: [
      "Asbestos survey was conducted pre-demolition but failed to identify ACM in floor tiles on the second level.",
      "Neighboring business claims lost revenue of $45,000 during 3-week remediation period.",
      "EPA issued Notice of Violation. State environmental agency opened parallel investigation.",
      "Reserve increased to $275,000 pending outcome of regulatory proceedings."
    ],
    documents: [
      {
        id: "doc-004a",
        title: "Environmental Investigation Summary",
        text: "Investigation reveals that during demolition activities on February 10, 2024, workers disturbed vinyl floor tiles containing approximately 3% chrysotile asbestos on the second floor of the structure. The pre-demolition asbestos survey conducted by Environmental Testing Associates failed to sample the second-floor tile material. Airborne asbestos fibers were detected in monitoring conducted at the property boundary, triggering evacuation of neighboring businesses within a 200-foot radius. Remediation by a licensed abatement contractor is estimated at $95,000."
      }
    ],
    associatedFormNumbers: ["CG 00 01", "CG 21 49", "CG 21 67"],
    state: "OR",
    naicsCode: "238910"
  },
  {
    id: "clm-005",
    claimNumber: "CLM-2024-00215",
    claimantName: "DataVault Corp",
    insuredName: "TechBuild Systems Inc.",
    dateOfLoss: "2024-06-01",
    dateReported: "2024-06-03",
    status: "open",
    category: "property_damage",
    amount: 78000,
    reserveAmount: 120000,
    description: "During installation of HVAC ductwork in a data center, a contractor accidentally severed a fiber optic trunk line and damaged server cooling infrastructure. The data center experienced 14 hours of reduced operations and partial outage.",
    notes: [
      "Contractor claims the fiber optic line was not marked on the building plans provided.",
      "Data center operator estimates $78,000 in direct repair costs plus $340,000 in business interruption (BI not covered under GL).",
      "TechBuild's project manager acknowledged receiving an updated set of plans that included the fiber route, but they were not distributed to the crew."
    ],
    documents: [
      {
        id: "doc-005a",
        title: "Damage Assessment - Data Center",
        text: "Assessment of damage to the DataVault facility at 2500 Tech Park Drive following the June 1 incident. A 4-inch core drill operation for HVAC ductwork penetrated a concealed fiber optic trunk carrying 96 strands of single-mode fiber, severing the building's primary data interconnect. Additionally, a coolant line for the in-row cooling system was compromised, causing a localized temperature spike in server cabinets D12 through D18. Three servers suffered thermal shutdown. Direct repair cost estimate: fiber splice and testing $32,000, coolant system repair $18,000, server diagnostics and replacement components $28,000."
      }
    ],
    associatedFormNumbers: ["CG 00 01", "MGL 1356", "CG 21 06"],
    state: "VA",
    naicsCode: "238220"
  },
  {
    id: "clm-006",
    claimNumber: "CLM-2023-00892",
    claimantName: "Maria Santos",
    insuredName: "Brightline Electrical Services",
    dateOfLoss: "2023-11-15",
    dateReported: "2023-11-16",
    status: "closed",
    category: "bodily_injury",
    amount: 28000,
    reserveAmount: 0,
    description: "Electrician's assistant sustained burns to the forearm from a welding arc flash while working near a welding crew at a shared jobsite. The welding crew did not maintain adequate safety perimeter and failed to deploy welding screens.",
    notes: [
      "Claimant treated at urgent care for second-degree burns. Released same day with wound care instructions.",
      "Welding subcontractor acknowledged failure to deploy screens. Their insurance carrier accepted liability.",
      "Claim resolved through subcontractor's GL policy. Our insured's involvement limited to general contractor oversight."
    ],
    documents: [
      {
        id: "doc-006a",
        title: "Welding Safety Incident Report",
        text: "On November 15, 2023, at the renovation project at 450 Industrial Ave, a welding operation being performed by subcontractor IronWorks Fabrication generated an arc flash that burned a nearby worker. The affected worker, Maria Santos, was an electrician's assistant employed by Brightline Electrical. The welding crew had not set up the required welding curtains or screens, and the minimum 35-foot safety perimeter was not maintained. Burns were classified as second-degree, covering approximately 4% of the forearm. No permanent injury expected."
      }
    ],
    associatedFormNumbers: ["CG 00 01", "MEGL 1390", "CG 20 10"],
    state: "FL",
    naicsCode: "238210"
  },
  {
    id: "clm-007",
    claimNumber: "CLM-2024-00089",
    claimantName: "Thompson & Associates",
    insuredName: "Riverside General Contractors",
    dateOfLoss: "2024-01-22",
    dateReported: "2024-01-25",
    status: "closed",
    category: "completed_operations",
    amount: 156000,
    reserveAmount: 0,
    description: "Completed roofing project developed leaks within 6 months of project completion. Water intrusion caused mold growth in the building's ceiling cavity and required extensive remediation. Building owner claims construction defect.",
    notes: [
      "Roofing work was completed 07/2023. Owner first noticed leaks in 01/2024 during heavy rain.",
      "Independent roofing inspector found improper flashing installation around HVAC penetrations.",
      "Subcontractor (Elite Roofing) had performed the actual roofing work. Their warranty covers materials but not labor.",
      "Settlement reached for $156,000 covering remediation and roof repairs."
    ],
    documents: [
      {
        id: "doc-007a",
        title: "Construction Defect Analysis",
        text: "Inspection of the Thompson & Associates office building roof at 780 Business Park Blvd revealed multiple deficiencies in the roofing installation completed by Elite Roofing (subcontractor to Riverside General). Primary issues include: (1) improper step flashing at the HVAC curb on the northwest section, (2) insufficient membrane overlap at the parapet wall transitions, and (3) missing counterflashing at two rooftop equipment penetrations. These deficiencies allowed water infiltration during normal rainfall events, resulting in moisture damage to approximately 2,400 square feet of ceiling cavity including mold colonization requiring professional remediation."
      }
    ],
    associatedFormNumbers: ["CG 00 01", "CG 20 37", "CG 22 94", "MEGL 1673"],
    state: "GA",
    naicsCode: "238160"
  },
  {
    id: "clm-008",
    claimNumber: "CLM-2024-00234",
    claimantName: "Susan Park",
    insuredName: "Metro Cleaning Solutions",
    dateOfLoss: "2024-06-18",
    dateReported: "2024-06-19",
    status: "open",
    category: "bodily_injury",
    amount: 15000,
    reserveAmount: 35000,
    description: "Visitor slipped and fell on a freshly mopped floor at a commercial office building maintained by the insured. The wet floor warning signs had been placed but were knocked over by foot traffic prior to the fall.",
    notes: [
      "Claimant slipped in main lobby area around 8:30 AM during peak entry time.",
      "Security camera footage shows signs were in place at 8:15 AM but displaced by 8:25 AM.",
      "Claimant reports knee injury and requests compensation for medical bills and lost wages."
    ],
    documents: [
      {
        id: "doc-008a",
        title: "Slip and Fall Incident Report",
        text: "On June 18, 2024, Susan Park, a visitor to the Meridian Office Tower, slipped on a wet floor in the main lobby at approximately 8:30 AM. Metro Cleaning Solutions staff had mopped the lobby floor at 8:00 AM and placed three wet floor signs. Security footage confirms the signs were positioned correctly but were inadvertently moved by incoming foot traffic. Ms. Park fell onto her left side, reporting immediate pain in her left knee. Building security called EMS; the claimant was transported to an urgent care facility where she was diagnosed with a sprained MCL."
      }
    ],
    associatedFormNumbers: ["CG 00 01", "CG 20 11"],
    state: "IL",
    naicsCode: "561720"
  },
  {
    id: "clm-009",
    claimNumber: "CLM-2024-00256",
    claimantName: "Regional Water Authority",
    insuredName: "Underground Utilities Corp",
    dateOfLoss: "2024-07-03",
    dateReported: "2024-07-05",
    status: "reserved",
    category: "property_damage",
    amount: 210000,
    reserveAmount: 350000,
    description: "Excavation crew ruptured a 12-inch water main during trenching operations for a new sewer line. The resulting flood damaged the roadway and caused a water service outage affecting 2,000 residents for 18 hours.",
    notes: [
      "811 locate request was submitted but utility markings were reportedly inaccurate.",
      "Water authority emergency repair crew responded within 2 hours; full service restored after 18 hours.",
      "Road surface damage and re-paving costs estimated at $85,000.",
      "Water authority claims $125,000 in emergency repair and lost water revenue."
    ],
    documents: [
      {
        id: "doc-009a",
        title: "Utility Strike Investigation",
        text: "On July 3, 2024, at approximately 2:15 PM, an excavator operated by Underground Utilities Corp struck and ruptured a 12-inch ductile iron water main at the intersection of Oak Street and 5th Avenue. The crew was excavating a trench for a new sanitary sewer installation. The 811 utility locate ticket (No. 2024-07-001234) had been requested on June 28, with locates completed on June 30. Investigation of the locate markings found the water main was marked approximately 6 feet east of its actual location. The rupture created a sinkhole approximately 15 feet in diameter, flooding the roadway and adjacent properties."
      },
      {
        id: "doc-009b",
        title: "Water Service Impact Report",
        text: "The water main break on July 3 affected service to approximately 2,000 residential and commercial customers in the southeast service area. Emergency water distribution was set up at three locations. Full service was restored at 8:30 AM on July 4 after completion of a bypass connection and permanent repair. Total repair costs include: emergency crew overtime $42,000, pipe and materials $28,000, road excavation and backfill $15,000, temporary bypass $12,000, lost water revenue estimate $28,000."
      }
    ],
    associatedFormNumbers: ["CG 00 01", "MEGL 1592", "CG 25 03"],
    state: "OH",
    naicsCode: "237110"
  },
  {
    id: "clm-010",
    claimNumber: "CLM-2024-00271",
    claimantName: "Heritage Mall LLC",
    insuredName: "ProBuild Construction Group",
    dateOfLoss: "2024-07-20",
    dateReported: "2024-07-22",
    status: "open",
    category: "property_damage",
    amount: 445000,
    reserveAmount: 600000,
    description: "Fire originating from welding operations during a retail space build-out spread to adjacent tenant spaces in a shopping mall. Three stores sustained smoke and water damage. Fire department investigation confirmed the fire started from welding sparks igniting stored construction materials.",
    notes: [
      "Hot work permit was on file but fire watch was not maintained for the required 30 minutes post-welding.",
      "Sprinkler system in the construction zone had been shut off for the renovation work per the building permit.",
      "Three adjacent tenants claim combined losses exceeding $400,000.",
      "Mall management threatening additional claims for lost rent and common area damage."
    ],
    documents: [
      {
        id: "doc-010a",
        title: "Fire Investigation Report",
        text: "Fire investigation determined the fire originated in the retail space under renovation at Heritage Mall, Suite 142. Welding operations were being conducted to install steel framing for a new storefront at approximately 4:30 PM on July 20. Sparks from the welding operation ignited polyethylene sheeting and cardboard packaging material stored approximately 8 feet from the welding location. The fire spread through a gap in the demising wall into Suite 140 (clothing store) and Suite 144 (electronics retailer). The fire suppression system in Suite 142 had been deactivated per the renovation permit. Sprinklers in adjacent suites activated and limited fire spread but caused significant water damage. Three stores sustained combined damage estimated at $445,000."
      }
    ],
    associatedFormNumbers: ["CG 00 01", "MEGL 1390", "CG 20 10", "CG 20 37"],
    state: "AZ",
    naicsCode: "236220"
  },
  {
    id: "clm-011",
    claimNumber: "CLM-2024-00112",
    claimantName: "David Chen",
    insuredName: "Atlas Painting & Coatings",
    dateOfLoss: "2024-02-28",
    dateReported: "2024-03-01",
    status: "closed",
    category: "personal_injury",
    amount: 22000,
    reserveAmount: 0,
    description: "Employee of neighboring business alleges exposure to toxic paint fumes during interior painting project. Claimant reports respiratory irritation and headaches. Building ventilation system was recycling contaminated air to other floors.",
    notes: [
      "Painting crew was using low-VOC paints as specified in the contract.",
      "Building HVAC system was not isolated for the painting area, allowing fumes to circulate.",
      "Claimant's medical records show pre-existing asthma condition that was exacerbated.",
      "Settled for $22,000 covering medical treatment and two weeks lost wages."
    ],
    documents: [
      {
        id: "doc-011a",
        title: "Indoor Air Quality Assessment",
        text: "Air quality monitoring conducted on March 1, 2024, following complaints from tenants on the 4th floor. Volatile organic compound (VOC) levels were measured at 380 ppb in the 4th floor offices, exceeding the recommended 300 ppb guideline. The elevated readings were attributed to interior painting operations on the 3rd floor by Atlas Painting. Investigation found that the building's HVAC return air system was not equipped with isolation dampers, allowing paint vapors to circulate to upper floors. The painting products used were certified low-VOC but concentrations were amplified by the recirculating air handler."
      }
    ],
    associatedFormNumbers: ["CG 00 01", "CG 21 49"],
    state: "WA",
    naicsCode: "238320"
  },
  {
    id: "clm-012",
    claimNumber: "CLM-2023-00756",
    claimantName: "Westfield School District",
    insuredName: "SafePlay Equipment Inc.",
    dateOfLoss: "2023-09-08",
    dateReported: "2023-09-10",
    status: "litigation",
    category: "products_liability",
    amount: 275000,
    reserveAmount: 450000,
    description: "A playground climbing structure manufactured and installed by the insured collapsed during use, injuring two children. Investigation revealed a manufacturing defect in the steel connector brackets that allowed fatigue cracking.",
    notes: [
      "Two children ages 8 and 10 suffered injuries: one broken arm, one concussion with lacerations.",
      "Product recall issued for connector bracket model CB-2200 after metallurgical analysis confirmed defect.",
      "School district filed suit naming both manufacturer and installer as defendants.",
      "Expert witness retained to analyze the bracket failure mode and manufacturing process."
    ],
    documents: [
      {
        id: "doc-012a",
        title: "Product Failure Analysis",
        text: "Metallurgical analysis of the failed connector bracket (Model CB-2200, Lot 2023-04) reveals evidence of hydrogen embrittlement in the heat-affected zone adjacent to the weld. This condition likely resulted from inadequate post-weld heat treatment during manufacturing. The embrittlement created micro-cracks that propagated under cyclic loading during normal playground use. Estimated cycles to failure: 15,000-20,000, consistent with approximately 6 months of regular use. The bracket was rated for a minimum of 200,000 cycles. Similar brackets from the same production lot exhibit comparable defects."
      },
      {
        id: "doc-012b",
        title: "Installation Compliance Review",
        text: "Review of the installation records for the Westfield Elementary playground equipment confirms that installation was performed per manufacturer specifications. All foundation anchors, hardware torque values, and safety clearances meet or exceed ASTM F1487 and CPSC guidelines. The failure is attributed to a manufacturing defect in the connector bracket rather than installation error."
      }
    ],
    associatedFormNumbers: ["CG 00 01", "CG 00 02", "MEGL 0001"],
    state: "PA",
    naicsCode: "332999"
  },
  {
    id: "clm-013",
    claimNumber: "CLM-2024-00188",
    claimantName: "Sunrise Assisted Living",
    insuredName: "ComfortAir HVAC Solutions",
    dateOfLoss: "2024-04-15",
    dateReported: "2024-04-17",
    status: "open",
    category: "completed_operations",
    amount: 89000,
    reserveAmount: 130000,
    description: "HVAC system installed by the insured at an assisted living facility malfunctioned, causing refrigerant leak into the air handling system. Several elderly residents required medical attention for respiratory distress. Facility was partially evacuated.",
    notes: [
      "R-410A refrigerant detected in the supply air ductwork during routine maintenance.",
      "Installation was completed 3 months prior. Investigation points to improper brazing of a copper joint.",
      "Six residents transported to hospital as a precaution; all released within 24 hours.",
      "Facility claims costs for evacuation, temporary relocation, and medical monitoring."
    ],
    documents: [
      {
        id: "doc-013a",
        title: "HVAC System Failure Report",
        text: "Investigation of the refrigerant leak at Sunrise Assisted Living, 1200 Elder Care Drive, determined that a brazed joint on the evaporator coil supply line failed, releasing R-410A refrigerant into the air handling unit. The leak was detected on April 15 when staff reported a chemical odor in the east wing. The faulty joint was on a connection installed by ComfortAir HVAC during the system upgrade completed January 2024. Metallurgical examination of the joint shows incomplete fusion and porosity consistent with insufficient heat application during brazing. The system had operated for approximately 90 days before the joint failed under normal operating pressure of 410 psi."
      }
    ],
    associatedFormNumbers: ["CG 00 01", "CG 20 37", "MEGL 0001"],
    state: "NC",
    naicsCode: "238220"
  },
  {
    id: "clm-014",
    claimNumber: "CLM-2024-00302",
    claimantName: "Karen Williams",
    insuredName: "Elite Landscaping Services",
    dateOfLoss: "2024-08-10",
    dateReported: "2024-08-12",
    status: "open",
    category: "bodily_injury",
    amount: 45000,
    reserveAmount: 75000,
    description: "Homeowner struck by debris ejected from a commercial lawn mower operated by the insured's employee. Rock projectile caused facial lacerations and a chipped tooth. The homeowner was standing on her adjacent property at the time.",
    notes: [
      "Mowing crew was operating a zero-turn mower near the property boundary.",
      "No debris guard was installed on the mower's discharge chute.",
      "Claimant seeking compensation for emergency dental work, plastic surgery consultation, and pain and suffering."
    ],
    documents: [
      {
        id: "doc-014a",
        title: "Equipment Inspection Report",
        text: "Post-incident inspection of the Exmark Lazer Z zero-turn mower (Serial No. EX-2022-4587) operated at the time of the incident revealed that the factory-installed debris guard on the discharge chute had been removed. Company maintenance records do not show when or why the guard was removed. The mower was operating on a commercial property adjacent to the claimant's residence. A stone approximately 1.5 inches in diameter was recovered from the scene consistent with the claimant's injuries. Standard operating procedure requires debris guards be in place and a pre-mowing walk-through to remove large stones and debris."
      }
    ],
    associatedFormNumbers: ["CG 00 01", "MEGL 0273"],
    state: "TN",
    naicsCode: "561730"
  },
  {
    id: "clm-015",
    claimNumber: "CLM-2024-00145",
    claimantName: "First National Bank",
    insuredName: "Precision Concrete Corp",
    dateOfLoss: "2024-03-05",
    dateReported: "2024-03-08",
    status: "reserved",
    category: "property_damage",
    amount: 167000,
    reserveAmount: 220000,
    description: "Concrete pump truck operated by the insured struck an overhead power line while positioning at a construction site, causing a power outage to a nearby bank branch. The bank's backup generator failed, resulting in loss of transaction data and vault security system compromise.",
    notes: [
      "Concrete pump boom extended to approximately 45 feet, contacting a 13.2kV distribution line.",
      "Power outage lasted 6 hours. Bank's UPS battery backup expired after 2 hours; generator failed to start.",
      "Bank claims $167,000 including data recovery, security system reset, and business interruption.",
      "Utility company also claims $23,000 for line repair and emergency response (included in total)."
    ],
    documents: [
      {
        id: "doc-015a",
        title: "Incident Reconstruction",
        text: "On March 5, 2024, a Schwing S43SX concrete pump truck operated by Precision Concrete struck an overhead 13.2kV power distribution line while extending the boom at the Parkview Commons construction site. The boom contacted the line at approximately 42 feet elevation. The resulting fault caused a power outage affecting the adjacent First National Bank branch and surrounding commercial properties. The pump operator had not conducted a pre-operation overhead hazard assessment as required by OSHA 1926.1431. No spotter was assigned despite the proximity of overhead lines. The power line was located 12 feet outside the construction fence line."
      }
    ],
    associatedFormNumbers: ["CG 00 01", "MEGL 1397", "MGL 1356"],
    state: "MO",
    naicsCode: "238110"
  },
  {
    id: "clm-016",
    claimNumber: "CLM-2024-00290",
    claimantName: "Bayview Condominiums HOA",
    insuredName: "Coastal Waterproofing LLC",
    dateOfLoss: "2024-07-30",
    dateReported: "2024-08-02",
    status: "open",
    category: "completed_operations",
    amount: 340000,
    reserveAmount: 500000,
    description: "Waterproofing membrane applied by the insured to a condominium parking garage failed within one year, allowing water intrusion that corroded structural steel reinforcement. Engineering report indicates potential structural compromise requiring extensive repairs.",
    notes: [
      "Membrane was applied in August 2023. Warranty period is 10 years.",
      "Independent structural engineer found chloride contamination of rebar at levels exceeding ACI thresholds.",
      "HOA retained counsel and is demanding full remediation including membrane replacement and structural repair.",
      "Manufacturer of the membrane product has been notified and is investigating potential product defect."
    ],
    documents: [
      {
        id: "doc-016a",
        title: "Structural Engineering Assessment",
        text: "Structural assessment of the Bayview Condominiums parking garage reveals that the waterproofing membrane installed by Coastal Waterproofing in August 2023 has failed in multiple locations on all three levels. Core samples from 12 locations show water penetration through the membrane into the concrete substrate. Chloride ion testing indicates concentrations of 1,200-2,800 ppm at the rebar depth, well above the corrosion threshold of 700 ppm. Several areas show active corrosion of reinforcing steel with section loss estimated at 5-15%. Remediation will require complete membrane removal, concrete repair in affected areas, supplemental reinforcement where section loss exceeds 10%, and application of a new membrane system. Estimated repair cost: $340,000."
      },
      {
        id: "doc-016b",
        title: "Application Records Review",
        text: "Review of Coastal Waterproofing's application records indicates that the membrane was applied during a period of high humidity (85-92% RH) and the ambient temperature dropped below the manufacturer's minimum application temperature of 50°F on two of the five application days. The product data sheet requires minimum 48 hours of cure time above 50°F, which was not achieved during the October application dates. Additionally, the surface preparation records show that shot-blasting achieved a CSP 3 profile, while the manufacturer specifies CSP 4-5 for the product used."
      }
    ],
    associatedFormNumbers: ["CG 00 01", "CG 20 37", "MEGL 1673", "CG 25 04"],
    state: "FL",
    naicsCode: "238390"
  },
  {
    id: "clm-017",
    claimNumber: "CLM-2024-00198",
    claimantName: "Rivera Family Trust",
    insuredName: "American Excavation Inc.",
    dateOfLoss: "2024-05-12",
    dateReported: "2024-05-14",
    status: "closed",
    category: "property_damage",
    amount: 38000,
    reserveAmount: 0,
    description: "Excavation work for a new commercial foundation caused soil settlement on the adjacent residential property. Foundation cracks appeared in the neighboring home, and a retaining wall partially collapsed.",
    notes: [
      "Geotechnical report prior to excavation noted sandy soil conditions and recommended sheet piling.",
      "Sheet piling was not installed due to cost concerns; open-cut excavation was used instead.",
      "Homeowner's structural engineer documented foundation cracks and wall displacement.",
      "Settled for $38,000 covering foundation repair and retaining wall reconstruction."
    ],
    documents: [
      {
        id: "doc-017a",
        title: "Geotechnical Impact Assessment",
        text: "Assessment of the Rivera property at 456 Oak Lane confirms ground settlement of 1.2 to 2.8 inches along the property line adjacent to the American Excavation project. The settlement resulted from the open-cut excavation of a 14-foot deep foundation trench in sandy soil without lateral support. Pre-construction survey data shows the Rivera home's foundation was level to within 0.25 inches prior to excavation. Current measurements show differential settlement of up to 2.1 inches across the foundation, exceeding the 1-inch threshold for cosmetic damage. Repairs include underpinning of the affected foundation section, crack injection, and reconstruction of the collapsed retaining wall section."
      }
    ],
    associatedFormNumbers: ["CG 00 01", "MEGL 1592", "CG 25 03"],
    state: "NJ",
    naicsCode: "238910"
  },
  {
    id: "clm-018",
    claimNumber: "CLM-2024-00320",
    claimantName: "Martinez Advertising Group",
    insuredName: "SignPro Installations LLC",
    dateOfLoss: "2024-08-25",
    dateReported: "2024-08-27",
    status: "open",
    category: "advertising_injury",
    amount: 55000,
    reserveAmount: 80000,
    description: "Sign installation company installed a large commercial sign that closely replicated the trade dress of a competing business. The competitor alleges trademark infringement and unfair competition. Claim brought under advertising injury coverage.",
    notes: [
      "Sign was designed by the client but manufactured and installed by the insured.",
      "Competing business sent cease and desist letter on 08/25/2024.",
      "Insured removed the sign on 09/01 but competitor claims ongoing damages from the 6-week display period.",
      "Coverage under advertising injury being evaluated; client may bear primary responsibility for design."
    ],
    documents: [
      {
        id: "doc-018a",
        title: "Advertising Injury Claim Summary",
        text: "Martinez Advertising Group alleges that a commercial sign manufactured and installed by SignPro Installations at 800 Commerce Way infringes on their registered trade dress and trademark. The sign, commissioned by QuickServe Restaurants, features a color scheme, font style, and layout that Martinez claims is confusingly similar to their client BurgerBarn's established branding. The sign was displayed from July 15 through September 1, 2024. Martinez claims damages including legal fees, lost customer revenue attributed to brand confusion, and costs of a corrective advertising campaign. Total claimed damages: $55,000."
      }
    ],
    associatedFormNumbers: ["CG 00 01", "CG 21 06"],
    state: "TX",
    naicsCode: "238990"
  },
];

export const MOCK_CLAIMS_MAP = Object.fromEntries(
  MOCK_CLAIMS.map((c) => [c.id, c])
);
