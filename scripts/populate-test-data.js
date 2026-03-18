// Script to populate test quotes directly in the browser
// Run this in the browser console while on the app page

const testQuotes = [
  {
    quote_id: "quote-test-001",
    insured_name: "ABC Construction Co.",
    status: "calculated",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    pl2_selection: "Contractors",
    territory: "CA-01",
    technical_premium: 12362.50,
    input_data: {
      policy_details: {
        insured_name: "ABC Construction Co.",
        deal_number: "Txn9163632",
        pl2_selection: "Contractors",
        territory: "CA-01",
        effective_date: "2026-03-03",
        expiration_date: "2027-03-03",
        occurrence_limit: 1000000,
        aggregate_limit: 2000000,
        sir_type: "SIR",
        sir_amount: 2500,
        commission: 0.15,
        new_renewal_sales: 8000000,
        expiring_sales: 7500000
      },
      class_codes: [
        {
          code: "10026",
          description: "Commercial Construction",
          location: "001",
          exposure: 5000000,
          rate: 1.25
        },
        {
          code: "10033",
          description: "Residential Construction",
          location: "002",
          exposure: 3000000,
          rate: 1.50
        }
      ],
      experience_modifier: {
        evaluation_date: "2024-01-01",
        modifier_value: 1.15,
        losses: [
          {
            date: "2023-06-15",
            indemnity: 25000,
            expense: 5000
          },
          {
            date: "2022-11-20",
            indemnity: 15000,
            expense: 3000
          }
        ]
      },
      uw_notes: "Primary contractor for commercial and residential projects in California."
    }
  },
  {
    quote_id: "quote-test-002",
    insured_name: "XYZ Restaurant Group",
    status: "draft",
    created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    pl2_selection: "General Liability",
    territory: "NY-02",
    technical_premium: 8500,
    input_data: {
      policy_details: {
        insured_name: "XYZ Restaurant Group",
        pl2_selection: "General Liability",
        territory: "NY-02"
      },
      class_codes: [],
      experience_modifier: {},
      uw_notes: ""
    }
  },
  {
    quote_id: "quote-test-003",
    insured_name: "Tech Solutions Inc.",
    status: "approved",
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updated_at: new Date(Date.now() - 172800000).toISOString(),
    pl2_selection: "Products Liability - Occurrence",
    territory: "TX-03",
    technical_premium: 15750,
    input_data: {
      policy_details: {
        insured_name: "Tech Solutions Inc.",
        pl2_selection: "Products Liability - Occurrence",
        territory: "TX-03"
      },
      class_codes: [],
      experience_modifier: {},
      uw_notes: ""
    }
  }
];

// Save to localStorage
localStorage.setItem('gl_rater_quotes', JSON.stringify(testQuotes));

console.log('✅ Test data populated successfully!');
console.log(`Added ${testQuotes.length} test quotes to localStorage`);
console.log('Refresh the history page to see the quotes');

// Return the data for verification
testQuotes;