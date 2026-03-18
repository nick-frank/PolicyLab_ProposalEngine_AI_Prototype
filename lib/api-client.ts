/**
 * API Client for GL Primary Rater Backend
 */

import { localStorageQuotes } from './local-storage';
import { generateExcelFromQuote } from './excel-export';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface QuoteInput {
  metadata?: Record<string, any>;
  exposure_rating: {
    policy_details: {
      insured: string;
      deal_number?: string;
      pl2: string;
      territory?: string;
      policy_effective_date?: {
        new: string;
        expiring?: string;
      };
      policy_expiration_date?: {
        new: string;
        expiring?: string;
      };
      occurrence_limit?: {
        new: number;
        expiring?: number;
      };
      aggregate_limit?: {
        new: number;
        expiring?: number;
      };
      sir_type?: {
        new: string;
        expiring?: string;
      };
      sir_amount?: {
        new: number;
        expiring?: number;
      };
      commission?: {
        new: number;
        expiring?: number;
      };
      sales?: {
        new: number;
        expiring?: number;
      };
    };
    class_rows?: Array<{
      class_code?: string;
      description?: string;
      zip_code?: string;
      exposures?: number;
      prior_year_exposures?: number;
      exposure_base?: string;
      subline?: string;
      liquor_limit?: number;
      dominant_class?: boolean;
      location?: number;
      premops_rate?: number;
      premops_premium?: number;
      products_rate?: number;
      products_premium?: number;
      completed_rate?: number;
      completed_premium?: number;
      technical_premium?: number;
      modified_premium?: number;
    }>;
  };
  experience_modifier?: {
    evaluation_date?: string;
    policy_year_1?: string;
    policy_year_2?: string;
    losses?: Array<{
      date_of_loss?: string;
      ground_up_indemnity?: number;
      ground_up_expense?: number;
    }>;
  };
  uw_notes?: string;
}

export interface QuoteOutput {
  quote_id: string;
  status: string;
  output?: {
    calculated_values?: {
      technical_premium_pre_emod?: number;
      experience_modifier?: number;
      technical_premium_post_emod?: number;
      modified_premium?: number;
      total_exposures?: number;
      average_rate?: number;
    };
    exposure_rating?: any;
    experience_modifier?: any;
  };
  validation_result?: {
    is_valid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  };
}

export interface QuoteListResponse {
  quotes: Array<{
    quote_id: string;
    insured_name: string;
    status: string;
    created_at: string;
    updated_at?: string;
    pl2_selection?: string;
    territory?: string;
    technical_premium?: number;
  }>;
  total: number;
  page: number;
  pages: number;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      const data = await response.json();
      return data.status === 'healthy';
    } catch {
      return false;
    }
  }

  async createQuote(input: QuoteInput): Promise<QuoteOutput> {
    try {
      const response = await fetch(`${this.baseUrl}/api/quotes/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(`Failed to create quote: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.warn('Backend not available, using local storage', error);
      return localStorageQuotes.createQuote(input);
    }
  }

  async calculateQuote(input: QuoteInput): Promise<QuoteOutput> {
    try {
      const response = await fetch(`${this.baseUrl}/api/quotes/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(`Failed to calculate quote: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.warn('Backend not available, using local storage', error);
      return localStorageQuotes.calculateQuote(input);
    }
  }

  async listQuotes(
    page: number = 1,
    limit: number = 20,
    status?: string,
    insured?: string
  ): Promise<QuoteListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (status) params.append('status', status);
      if (insured) params.append('insured', insured);

      const response = await fetch(`${this.baseUrl}/api/quotes/list?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to list quotes: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.warn('Backend not available, using local storage', error);
      return localStorageQuotes.listQuotes(page, limit, status, insured);
    }
  }

  async getQuote(quoteId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/quotes/${quoteId}`);

      if (!response.ok) {
        throw new Error(`Failed to get quote: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.warn('Backend not available, using local storage', error);
      return localStorageQuotes.getQuote(quoteId);
    }
  }

  async recalculateQuote(quoteId: string, input: QuoteInput): Promise<QuoteOutput> {
    const response = await fetch(`${this.baseUrl}/api/quotes/${quoteId}/recalculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`Failed to recalculate quote: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteQuote(quoteId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/quotes/${quoteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete quote: ${response.statusText}`);
      }
    } catch (error) {
      console.warn('Backend not available, using local storage', error);
      localStorageQuotes.deleteQuote(quoteId);
    }
  }

  async downloadInput(quoteId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/quotes/${quoteId}/input`);

    if (!response.ok) {
      throw new Error(`Failed to download input: ${response.statusText}`);
    }

    return response.json();
  }

  async downloadOutput(quoteId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/quotes/${quoteId}/output`);

    if (!response.ok) {
      throw new Error(`Failed to download output: ${response.statusText}`);
    }

    return response.json();
  }

  async downloadExcel(quoteId: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/api/quotes/${quoteId}/excel`);

      if (!response.ok) {
        throw new Error(`Failed to download Excel: ${response.statusText}`);
      }

      return response.blob();
    } catch (error) {
      console.warn('Backend not available, generating Excel locally', error);

      // Get quote from local storage
      const quote = localStorageQuotes.getQuote(quoteId);
      if (!quote || !quote.input) {
        throw new Error('Quote not found');
      }

      // Generate Excel from quote data
      return generateExcelFromQuote(quote.input, quote.input.exposure_rating.policy_details.insured);
    }
  }

  async getAuditLog(quoteId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/quotes/${quoteId}/audit`);

    if (!response.ok) {
      throw new Error(`Failed to get audit log: ${response.statusText}`);
    }

    return response.json();
  }

  async getDebugInfo(quoteId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/quotes/${quoteId}/debug`);

    if (!response.ok) {
      throw new Error(`Failed to get debug info: ${response.statusText}`);
    }

    return response.json();
  }

  async validateInput(input: QuoteInput): Promise<{
    is_valid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  }> {
    const response = await fetch(`${this.baseUrl}/api/validation/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`Failed to validate input: ${response.statusText}`);
    }

    return response.json();
  }

  async compareQuotes(quoteIds: string[]): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/quotes/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quote_ids: quoteIds }),
    });

    if (!response.ok) {
      throw new Error(`Failed to compare quotes: ${response.statusText}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();