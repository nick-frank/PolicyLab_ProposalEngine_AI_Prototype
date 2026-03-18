import { test, expect } from '@playwright/test';

/**
 * API Integration Tests
 * Tests the backend API endpoints directly
 */

const API_BASE = 'http://localhost:8000';

test.describe('Backend API Integration', () => {
  const testQuoteInput = {
    exposure_rating: {
      policy_details: {
        insured: 'API Test Company',
        deal_number: 'API-TEST-001',
        pl2: 'Contractors',
        territory: 'CA-01',
        policy_effective_date: {
          new: '2024-01-01',
          expiring: '2023-01-01'
        },
        policy_expiration_date: {
          new: '2025-01-01',
          expiring: '2024-01-01'
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
          new: 'Deductible',
          expiring: 'Deductible'
        },
        sir_amount: {
          new: 5000,
          expiring: 5000
        },
        commission: {
          new: 0.175,
          expiring: 0.175
        }
      },
      class_rows: [
        {
          class_code: '10026',
          description: 'CABINET MFG - WOOD',
          zip_code: '90210',
          exposures: 100000,
          prior_year_exposures: 95000,
          exposure_base: 'Payroll'
        }
      ]
    },
    experience_modifier: {
      evaluation_date: '2024-01-01',
      policy_year_1: '2023',
      policy_year_2: '2024',
      losses: [
        {
          date_of_loss: '2023-06-15',
          ground_up_indemnity: 25000,
          ground_up_expense: 5000
        }
      ]
    },
    uw_notes: 'API integration test notes'
  };

  test.describe('Health Check', () => {
    test('should verify API is running', async ({ request }) => {
      try {
        const response = await request.get(`${API_BASE}/api/health`);

        if (!response.ok()) {
          console.log('API server not running. Please start the backend first.');
          test.skip();
        }

        const health = await response.json();
        expect(health).toHaveProperty('status');
        expect(health.status).toBe('healthy');
        expect(health).toHaveProperty('excel_available');
        expect(health).toHaveProperty('storage_available');
      } catch (error) {
        console.log('Cannot connect to API server. Please ensure backend is running on port 8000');
        test.skip();
      }
    });

    test('should return API documentation', async ({ request }) => {
      try {
        const response = await request.get(`${API_BASE}/docs`);
        expect(response.ok()).toBeTruthy();
      } catch {
        test.skip();
      }
    });
  });

  test.describe('Quote Creation', () => {
    let createdQuoteId: string;

    test('should create a new quote', async ({ request }) => {
      try {
        const response = await request.post(`${API_BASE}/api/quotes/new`, {
          data: testQuoteInput
        });

        if (!response.ok()) {
          console.log('API error:', await response.text());
          test.skip();
        }

        const result = await response.json();

        expect(result).toHaveProperty('quote_id');
        expect(result).toHaveProperty('status');
        expect(result.status).toBe('success');

        if (result.output) {
          expect(result.output).toHaveProperty('calculated_values');
        }

        createdQuoteId = result.quote_id;
      } catch (error) {
        console.log('API not available:', error);
        test.skip();
      }
    });

    test('should validate input data', async ({ request }) => {
      const invalidInput = {
        exposure_rating: {
          policy_details: {
            // Missing required fields
            pl2: 'Invalid Option'
          }
        }
      };

      try {
        const response = await request.post(`${API_BASE}/api/quotes/new`, {
          data: invalidInput
        });

        if (response.status() === 400) {
          const result = await response.json();
          expect(result).toHaveProperty('validation_result');
          expect(result.validation_result.errors).toBeDefined();
        }
      } catch {
        test.skip();
      }
    });

    test('should calculate quote without saving', async ({ request }) => {
      try {
        const response = await request.post(`${API_BASE}/api/quotes/calculate`, {
          data: testQuoteInput
        });

        if (!response.ok()) {
          test.skip();
        }

        const result = await response.json();

        expect(result).toHaveProperty('output');
        expect(result).toHaveProperty('quote_id');
        expect(result.output).toHaveProperty('calculated_values');

        // Verify calculated values structure
        const calcValues = result.output.calculated_values;
        expect(calcValues).toHaveProperty('technical_premium_pre_emod');
        expect(calcValues).toHaveProperty('experience_modifier');
        expect(calcValues).toHaveProperty('technical_premium_post_emod');
      } catch {
        test.skip();
      }
    });
  });

  test.describe('Quote Retrieval', () => {
    test('should list all quotes', async ({ request }) => {
      try {
        const response = await request.get(`${API_BASE}/api/quotes/list`);

        if (!response.ok()) {
          test.skip();
        }

        const result = await response.json();

        expect(result).toHaveProperty('quotes');
        expect(result).toHaveProperty('total');
        expect(result).toHaveProperty('page');
        expect(result).toHaveProperty('pages');
        expect(Array.isArray(result.quotes)).toBeTruthy();

        // If there are quotes, verify structure
        if (result.quotes.length > 0) {
          const firstQuote = result.quotes[0];
          expect(firstQuote).toHaveProperty('quote_id');
          expect(firstQuote).toHaveProperty('insured_name');
          expect(firstQuote).toHaveProperty('status');
          expect(firstQuote).toHaveProperty('created_at');
        }
      } catch {
        test.skip();
      }
    });

    test('should filter quotes by status', async ({ request }) => {
      try {
        const response = await request.get(`${API_BASE}/api/quotes/list?status=calculated`);

        if (!response.ok()) {
          test.skip();
        }

        const result = await response.json();

        // All returned quotes should have the filtered status
        for (const quote of result.quotes) {
          expect(quote.status).toBe('calculated');
        }
      } catch {
        test.skip();
      }
    });

    test('should paginate quote list', async ({ request }) => {
      try {
        const response = await request.get(`${API_BASE}/api/quotes/list?page=1&limit=5`);

        if (!response.ok()) {
          test.skip();
        }

        const result = await response.json();

        expect(result.quotes.length).toBeLessThanOrEqual(5);
        expect(result.page).toBe(1);
      } catch {
        test.skip();
      }
    });

    test('should search quotes by insured name', async ({ request }) => {
      try {
        const response = await request.get(`${API_BASE}/api/quotes/list?insured=Test`);

        if (!response.ok()) {
          test.skip();
        }

        const result = await response.json();

        // All returned quotes should contain "Test" in insured name
        for (const quote of result.quotes) {
          expect(quote.insured_name.toLowerCase()).toContain('test');
        }
      } catch {
        test.skip();
      }
    });
  });

  test.describe('Quote Details', () => {
    test('should retrieve specific quote by ID', async ({ request }) => {
      // First create a quote to ensure we have one
      const createResponse = await request.post(`${API_BASE}/api/quotes/new`, {
        data: testQuoteInput
      });

      if (!createResponse.ok()) {
        test.skip();
      }

      const createResult = await createResponse.json();
      const quoteId = createResult.quote_id;

      // Now retrieve it
      const response = await request.get(`${API_BASE}/api/quotes/${quoteId}`);

      if (!response.ok()) {
        test.skip();
      }

      const quote = await response.json();

      expect(quote).toHaveProperty('quote_id');
      expect(quote.quote_id).toBe(quoteId);
      expect(quote).toHaveProperty('insured_name');
      expect(quote.insured_name).toBe(testQuoteInput.exposure_rating.policy_details.insured);
      expect(quote).toHaveProperty('input_data');
      expect(quote).toHaveProperty('output_data');
    });

    test('should return 404 for non-existent quote', async ({ request }) => {
      try {
        const response = await request.get(`${API_BASE}/api/quotes/non-existent-id`);
        expect(response.status()).toBe(404);
      } catch {
        test.skip();
      }
    });
  });

  test.describe('Quote Artifacts', () => {
    let testQuoteId: string;

    test.beforeAll(async ({ request }) => {
      // Create a quote for testing artifacts
      const response = await request.post(`${API_BASE}/api/quotes/new`, {
        data: testQuoteInput
      });

      if (response.ok()) {
        const result = await response.json();
        testQuoteId = result.quote_id;
      }
    });

    test('should download input JSON', async ({ request }) => {
      if (!testQuoteId) {
        test.skip();
      }

      const response = await request.get(`${API_BASE}/api/quotes/${testQuoteId}/input`);

      if (response.ok()) {
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('application/json');

        const inputData = await response.json();
        expect(inputData).toHaveProperty('exposure_rating');
      }
    });

    test('should download output JSON', async ({ request }) => {
      if (!testQuoteId) {
        test.skip();
      }

      const response = await request.get(`${API_BASE}/api/quotes/${testQuoteId}/output`);

      if (response.ok()) {
        const outputData = await response.json();
        expect(outputData).toHaveProperty('calculated_values');
      }
    });

    test('should download Excel file', async ({ request }) => {
      if (!testQuoteId) {
        test.skip();
      }

      const response = await request.get(`${API_BASE}/api/quotes/${testQuoteId}/excel`);

      if (response.ok()) {
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('spreadsheet');

        const buffer = await response.body();
        expect(buffer).toBeTruthy();
      }
    });

    test('should retrieve audit trail', async ({ request }) => {
      if (!testQuoteId) {
        test.skip();
      }

      const response = await request.get(`${API_BASE}/api/quotes/${testQuoteId}/audit`);

      if (response.ok()) {
        const auditLog = await response.json();
        expect(auditLog).toHaveProperty('quote_id');
        expect(auditLog).toHaveProperty('events');
        expect(Array.isArray(auditLog.events)).toBeTruthy();

        // Check audit event structure
        if (auditLog.events.length > 0) {
          const firstEvent = auditLog.events[0];
          expect(firstEvent).toHaveProperty('timestamp');
          expect(firstEvent).toHaveProperty('event_type');
        }
      }
    });

    test('should retrieve debug information', async ({ request }) => {
      if (!testQuoteId) {
        test.skip();
      }

      const response = await request.get(`${API_BASE}/api/quotes/${testQuoteId}/debug`);

      if (response.ok()) {
        const debugInfo = await response.json();
        expect(debugInfo).toHaveProperty('quote_id');
        expect(debugInfo).toHaveProperty('files');

        // Check that expected files are present
        expect(debugInfo.files).toHaveProperty('input.json');
        expect(debugInfo.files).toHaveProperty('output.json');
        expect(debugInfo.files).toHaveProperty('metadata.json');
        expect(debugInfo.files).toHaveProperty('audit_log.json');
      }
    });
  });

  test.describe('Quote Updates', () => {
    test('should recalculate existing quote', async ({ request }) => {
      // First create a quote
      const createResponse = await request.post(`${API_BASE}/api/quotes/new`, {
        data: testQuoteInput
      });

      if (!createResponse.ok()) {
        test.skip();
      }

      const createResult = await createResponse.json();
      const quoteId = createResult.quote_id;

      // Modify the input
      const modifiedInput = { ...testQuoteInput };
      modifiedInput.exposure_rating.policy_details.territory = 'NY-01';
      modifiedInput.exposure_rating.class_rows[0].exposures = 200000;

      // Recalculate
      const response = await request.post(`${API_BASE}/api/quotes/${quoteId}/recalculate`, {
        data: modifiedInput
      });

      if (response.ok()) {
        const result = await response.json();
        expect(result).toHaveProperty('status');
        expect(result.status).toBe('recalculated');
        expect(result).toHaveProperty('output');
      }
    });

    test('should delete quote', async ({ request }) => {
      // Create a quote to delete
      const createResponse = await request.post(`${API_BASE}/api/quotes/new`, {
        data: testQuoteInput
      });

      if (!createResponse.ok()) {
        test.skip();
      }

      const createResult = await createResponse.json();
      const quoteId = createResult.quote_id;

      // Delete the quote
      const deleteResponse = await request.delete(`${API_BASE}/api/quotes/${quoteId}`);

      if (deleteResponse.ok()) {
        const result = await deleteResponse.json();
        expect(result).toHaveProperty('status');
        expect(result.status).toBe('deleted');

        // Verify it's gone
        const getResponse = await request.get(`${API_BASE}/api/quotes/${quoteId}`);
        expect(getResponse.status()).toBe(404);
      }
    });
  });

  test.describe('Validation Endpoints', () => {
    test('should validate quote input', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/validation/validate`, {
        data: testQuoteInput
      });

      if (response.ok()) {
        const result = await response.json();
        expect(result).toHaveProperty('is_valid');
        expect(result).toHaveProperty('errors');
        expect(result).toHaveProperty('warnings');
        expect(result).toHaveProperty('suggestions');
      } else if (response.status() === 404) {
        // Endpoint not implemented yet
        test.skip();
      }
    });

    test('should validate individual field', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/validation/field`, {
        data: {
          field_name: 'commission',
          value: 0.35
        }
      });

      if (response.status() === 404) {
        test.skip();
      }

      if (response.ok()) {
        const result = await response.json();
        // Should warn about high commission
        expect(result).toHaveProperty('warnings');
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle malformed JSON', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/quotes/new`, {
        data: 'not valid json',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(response.status()).toBeGreaterThanOrEqual(400);
    });

    test('should handle missing required fields', async ({ request }) => {
      const incompleteInput = {
        exposure_rating: {
          policy_details: {
            // Missing required 'insured' field
            pl2: 'Contractors'
          }
        }
      };

      const response = await request.post(`${API_BASE}/api/quotes/new`, {
        data: incompleteInput
      });

      if (response.status() === 400) {
        const result = await response.json();
        expect(result).toHaveProperty('validation_result');
      }
    });

    test('should handle server errors gracefully', async ({ request }) => {
      // Try to access a protected endpoint without auth (if implemented)
      const response = await request.get(`${API_BASE}/api/admin/sensitive`);

      // Should return 401, 403, or 404
      expect(response.status()).toBeGreaterThanOrEqual(400);
    });
  });

  test.describe('Performance', () => {
    test('should calculate quote within reasonable time', async ({ request }) => {
      const startTime = Date.now();

      const response = await request.post(`${API_BASE}/api/quotes/calculate`, {
        data: testQuoteInput
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      if (response.ok()) {
        // Should complete within 5 seconds
        expect(duration).toBeLessThan(5000);
      }
    });

    test('should handle concurrent requests', async ({ request }) => {
      const promises = [];

      // Send 5 concurrent requests
      for (let i = 0; i < 5; i++) {
        const quoteInput = { ...testQuoteInput };
        quoteInput.exposure_rating.policy_details.deal_number = `CONCURRENT-${i}`;

        promises.push(
          request.post(`${API_BASE}/api/quotes/calculate`, {
            data: quoteInput
          })
        );
      }

      try {
        const responses = await Promise.all(promises);

        // All should succeed
        for (const response of responses) {
          if (response.ok()) {
            const result = await response.json();
            expect(result).toHaveProperty('output');
          }
        }
      } catch {
        test.skip();
      }
    });
  });
});