#!/usr/bin/env node

/**
 * Script to populate backend database with test quotes
 */

const http = require('http');

const API_URL = 'http://localhost:8000';

const testQuotes = [
  {
    exposure_rating: {
      policy_details: {
        insured: "ABC Construction Co.",
        deal_number: "Txn9163632",
        pl2: "Contractors",
        territory: "CA-01",
        policy_effective_date: {
          new: "2026-03-03",
          expiring: "2025-03-03"
        },
        policy_expiration_date: {
          new: "2027-03-03",
          expiring: "2026-03-03"
        },
        occurrence_limit: {
          new: 1000000,
          expiring: 1000000
        },
        aggregate_limit: {
          new: 2000000,
          expiring: 2000000
        },
        sir_type: {
          new: "SIR",
          expiring: "SIR"
        },
        sir_amount: {
          new: 2500,
          expiring: 2500
        },
        commission: {
          new: 0.15,
          expiring: 0.15
        },
        sales: {
          new: 8000000,
          expiring: 7500000
        }
      },
      class_rows: [
        {
          class_code: "10026",
          description: "Commercial Construction",
          location: 1,
          exposures: 5000000,
          exposure_base: "Sales",
          premops_rate: 1.25,
          premops_premium: 6250
        },
        {
          class_code: "10033",
          description: "Residential Construction",
          location: 2,
          exposures: 3000000,
          exposure_base: "Sales",
          premops_rate: 1.50,
          premops_premium: 4500
        }
      ]
    },
    experience_modifier: {
      evaluation_date: "2024-01-01",
      modifier_value: 1.15,
      losses: [
        {
          date_of_loss: "2023-06-15",
          ground_up_indemnity: 25000,
          ground_up_expense: 5000
        },
        {
          date_of_loss: "2022-11-20",
          ground_up_indemnity: 15000,
          ground_up_expense: 3000
        }
      ]
    },
    uw_notes: "Primary contractor for commercial and residential projects in California.\n\nExperience Modifier: 1.15\nPrior losses: 2 claims in past 3 years, well-managed\n\nTechnical Premium: $12,362.50\n\nRecommended for binding with standard terms."
  },
  {
    exposure_rating: {
      policy_details: {
        insured: "XYZ Restaurant Group",
        deal_number: "TXN-2024-002",
        pl2: "General Liability",
        territory: "NY-02",
        policy_effective_date: {
          new: "2026-01-01"
        },
        policy_expiration_date: {
          new: "2027-01-01"
        },
        occurrence_limit: {
          new: 1000000
        },
        aggregate_limit: {
          new: 2000000
        },
        sir_type: {
          new: "Deductible"
        },
        sir_amount: {
          new: 1000
        },
        commission: {
          new: 0.12
        }
      },
      class_rows: [
        {
          class_code: "16913",
          description: "Restaurant - Table Service",
          location: 1,
          exposures: 2500000,
          exposure_base: "Sales",
          subline: "Prem/Ops",
          premops_rate: 0.85,
          premops_premium: 2125
        },
        {
          class_code: "16915",
          description: "Restaurant - Bar/Lounge",
          location: 1,
          exposures: 1500000,
          exposure_base: "Sales",
          subline: "Liquor Liability",
          liquor_limit: 1000000,
          premops_rate: 1.25,
          premops_premium: 1875
        }
      ]
    },
    uw_notes: "Restaurant chain with 3 locations in NYC.\nServes alcohol - separate liquor liability coverage.\nClean loss history."
  },
  {
    exposure_rating: {
      policy_details: {
        insured: "Tech Solutions Inc.",
        deal_number: "TXN-2024-003",
        pl2: "Products Liability - Occurrence",
        territory: "TX-03",
        policy_effective_date: {
          new: "2026-02-01"
        },
        policy_expiration_date: {
          new: "2027-02-01"
        },
        occurrence_limit: {
          new: 2000000
        },
        aggregate_limit: {
          new: 4000000
        },
        sir_type: {
          new: "SIR"
        },
        sir_amount: {
          new: 5000
        },
        commission: {
          new: 0.10
        }
      },
      class_rows: [
        {
          class_code: "54225",
          description: "Computer Programming Services",
          location: 1,
          exposures: 10000000,
          exposure_base: "Sales",
          products_rate: 0.45,
          products_premium: 4500
        }
      ]
    },
    experience_modifier: {
      evaluation_date: "2024-01-01",
      modifier_value: 0.95
    },
    uw_notes: "Software development company specializing in enterprise solutions.\nProducts liability for software errors and omissions.\nExcellent loss history with experience modifier of 0.95."
  },
  {
    exposure_rating: {
      policy_details: {
        insured: "Green Landscaping LLC",
        deal_number: "TXN-2024-004",
        pl2: "Contractors",
        territory: "FL-01",
        policy_effective_date: {
          new: "2026-04-01"
        },
        policy_expiration_date: {
          new: "2027-04-01"
        },
        occurrence_limit: {
          new: 500000
        },
        aggregate_limit: {
          new: 1000000
        },
        sir_type: {
          new: "Deductible"
        },
        sir_amount: {
          new: 500
        },
        commission: {
          new: 0.15
        },
        sales: {
          new: 1200000,
          expiring: 1000000
        }
      },
      class_rows: [
        {
          class_code: "97444",
          description: "Landscaping",
          location: 1,
          exposures: 1200000,
          exposure_base: "Sales",
          premops_rate: 2.15,
          premops_premium: 2580
        }
      ]
    },
    uw_notes: "Small landscaping contractor.\n20% growth in sales year over year.\nNo prior losses."
  }
];

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${responseData}`));
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function createQuote(quoteData) {
  try {
    return await makeRequest('/api/quotes/calculate', 'POST', quoteData);
  } catch (error) {
    console.error('Error creating quote:', error.message);
    throw error;
  }
}

async function saveQuote(quoteData) {
  try {
    // Try to save via the /new endpoint which saves to database
    return await makeRequest('/api/quotes/new', 'POST', quoteData);
  } catch (error) {
    console.error('Failed to save quote:', error.message);
    // Fall back to calculate endpoint
    return createQuote(quoteData);
  }
}

async function populateDatabase() {
  console.log('🚀 Starting to populate backend database...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const [index, quote] of testQuotes.entries()) {
    console.log(`Creating quote ${index + 1}/${testQuotes.length}: ${quote.exposure_rating.policy_details.insured}`);

    try {
      const result = await saveQuote(quote);
      console.log(`✅ Created quote with ID: ${result.quote_id || 'generated'}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to create quote: ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Successfully created: ${successCount} quotes`);
  if (errorCount > 0) {
    console.log(`❌ Failed: ${errorCount} quotes`);
  }

  // Check the API to list quotes
  try {
    const listResponse = await fetch(`${API_URL}/api/quotes/list`);
    if (listResponse.ok) {
      const data = await listResponse.json();
      console.log(`\n📋 Total quotes in database: ${data.total || 0}`);
    }
  } catch (error) {
    console.log('\n⚠️  Could not verify quotes in database');
  }
}

// Check if API is available
fetch(`${API_URL}/api/health`)
  .then(response => {
    if (!response.ok) {
      throw new Error('API not available');
    }
    return response.json();
  })
  .then(data => {
    console.log('✅ API is healthy:', data);
    return populateDatabase();
  })
  .catch(error => {
    console.error('❌ API is not available. Please ensure the backend is running on http://localhost:8000');
    process.exit(1);
  });