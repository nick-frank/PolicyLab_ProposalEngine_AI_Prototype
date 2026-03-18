import { QuoteInput, QuoteOutput, QuoteListResponse } from './api-client';

const QUOTES_STORAGE_KEY = 'gl_rater_quotes';
const QUOTE_ID_COUNTER_KEY = 'gl_rater_quote_counter';

interface StoredQuote {
  quote_id: string;
  insured_name: string;
  status: 'draft' | 'calculated' | 'submitted' | 'approved' | 'declined';
  created_at: string;
  updated_at: string;
  pl2_selection?: string;
  territory?: string;
  technical_premium?: number;
  input_data: QuoteInput;
  output_data?: QuoteOutput;
}

class LocalStorageQuoteManager {
  private getQuotes(): StoredQuote[] {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem(QUOTES_STORAGE_KEY);
    if (!stored) return [];

    try {
      return JSON.parse(stored) as StoredQuote[];
    } catch {
      return [];
    }
  }

  private saveQuotes(quotes: StoredQuote[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(quotes));
  }

  private generateQuoteId(): string {
    if (typeof window === 'undefined') return 'quote-1';

    const currentCounter = parseInt(localStorage.getItem(QUOTE_ID_COUNTER_KEY) || '0');
    const newCounter = currentCounter + 1;
    localStorage.setItem(QUOTE_ID_COUNTER_KEY, newCounter.toString());

    // Generate a unique ID similar to backend format
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `quote-${timestamp}-${random}`;
  }

  createQuote(input: QuoteInput): QuoteOutput {
    const quotes = this.getQuotes();
    const quoteId = this.generateQuoteId();
    const now = new Date().toISOString();

    const newQuote: StoredQuote = {
      quote_id: quoteId,
      insured_name: input.exposure_rating.policy_details.insured || 'Unnamed',
      status: 'draft',
      created_at: now,
      updated_at: now,
      pl2_selection: input.exposure_rating.policy_details.pl2,
      territory: input.exposure_rating.policy_details.territory,
      input_data: input
    };

    quotes.push(newQuote);
    this.saveQuotes(quotes);

    return {
      quote_id: quoteId,
      status: 'draft'
    };
  }

  calculateQuote(input: QuoteInput): QuoteOutput {
    const quotes = this.getQuotes();
    const quoteId = this.generateQuoteId();
    const now = new Date().toISOString();

    // Simple calculation logic
    let totalPremium = 0;
    let totalExposures = 0;

    if (input.exposure_rating.class_rows) {
      input.exposure_rating.class_rows.forEach(row => {
        const exposure = row.exposures || 0;
        const rate = row.premops_rate || 0;
        const premium = (exposure / 1000) * rate;

        totalExposures += exposure;
        totalPremium += premium;
      });
    }

    const experienceModifier = 1.0; // Default if not specified
    const technicalPremiumPostEmod = totalPremium * experienceModifier;

    const output: QuoteOutput = {
      quote_id: quoteId,
      status: 'calculated',
      output: {
        calculated_values: {
          technical_premium_pre_emod: totalPremium,
          experience_modifier: experienceModifier,
          technical_premium_post_emod: technicalPremiumPostEmod,
          modified_premium: technicalPremiumPostEmod,
          total_exposures: totalExposures,
          average_rate: totalExposures > 0 ? (totalPremium / (totalExposures / 1000)) : 0
        }
      }
    };

    const newQuote: StoredQuote = {
      quote_id: quoteId,
      insured_name: input.exposure_rating.policy_details.insured || 'Unnamed',
      status: 'calculated',
      created_at: now,
      updated_at: now,
      pl2_selection: input.exposure_rating.policy_details.pl2,
      territory: input.exposure_rating.policy_details.territory,
      technical_premium: technicalPremiumPostEmod,
      input_data: input,
      output_data: output
    };

    quotes.push(newQuote);
    this.saveQuotes(quotes);

    return output;
  }

  updateQuote(quoteId: string, input: QuoteInput, status?: string): QuoteOutput {
    const quotes = this.getQuotes();
    const index = quotes.findIndex(q => q.quote_id === quoteId);

    if (index === -1) {
      // Create new if not found
      return this.createQuote(input);
    }

    quotes[index].input_data = input;
    quotes[index].updated_at = new Date().toISOString();
    quotes[index].insured_name = input.exposure_rating.policy_details.insured || 'Unnamed';
    quotes[index].pl2_selection = input.exposure_rating.policy_details.pl2;
    quotes[index].territory = input.exposure_rating.policy_details.territory;

    if (status) {
      quotes[index].status = status as any;
    }

    this.saveQuotes(quotes);

    return {
      quote_id: quoteId,
      status: quotes[index].status
    };
  }

  listQuotes(
    page: number = 1,
    limit: number = 20,
    status?: string,
    insured?: string
  ): QuoteListResponse {
    let quotes = this.getQuotes();

    // Sort by created_at descending (newest first)
    quotes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Filter by status if provided
    if (status && status !== 'all') {
      quotes = quotes.filter(q => q.status === status);
    }

    // Filter by insured name if provided
    if (insured) {
      quotes = quotes.filter(q =>
        q.insured_name.toLowerCase().includes(insured.toLowerCase())
      );
    }

    // Paginate
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedQuotes = quotes.slice(start, end);

    return {
      quotes: paginatedQuotes.map(q => ({
        quote_id: q.quote_id,
        insured_name: q.insured_name,
        status: q.status,
        created_at: q.created_at,
        updated_at: q.updated_at,
        pl2_selection: q.pl2_selection,
        territory: q.territory,
        technical_premium: q.technical_premium
      })),
      total: quotes.length,
      page: page,
      pages: Math.ceil(quotes.length / limit)
    };
  }

  getQuote(quoteId: string): any {
    const quotes = this.getQuotes();
    const quote = quotes.find(q => q.quote_id === quoteId);

    if (!quote) {
      throw new Error(`Quote ${quoteId} not found`);
    }

    return {
      quote_id: quote.quote_id,
      status: quote.status,
      input: quote.input_data,
      output: quote.output_data
    };
  }

  deleteQuote(quoteId: string): void {
    const quotes = this.getQuotes();
    const filtered = quotes.filter(q => q.quote_id !== quoteId);
    this.saveQuotes(filtered);
  }

  clearAll(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(QUOTES_STORAGE_KEY);
    localStorage.removeItem(QUOTE_ID_COUNTER_KEY);
  }
}

export const localStorageQuotes = new LocalStorageQuoteManager();