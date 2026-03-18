import * as XLSX from 'xlsx';
import { QuoteInput } from './api-client';

export function generateExcelFromQuote(quoteData: QuoteInput, insuredName: string = "unnamed"): Blob {
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Sheet 1: Exposure Rating
  const exposureData: any[] = [];

  // Policy Details section
  exposureData.push(['EXPOSURE RATING']);
  exposureData.push([]);
  exposureData.push(['Table 1. Policy Level Details']);
  exposureData.push([]);

  const policy = quoteData.exposure_rating.policy_details;
  exposureData.push(['Field', 'New/Renewal', 'Expiring']);
  exposureData.push(['Insured', policy.insured || '', '']);
  exposureData.push(['Deal Number', policy.deal_number || '', '']);
  exposureData.push(['PL_2', policy.pl2 || '', '']);
  exposureData.push(['Territory', policy.territory || '', '']);
  exposureData.push(['Policy Effective Date', policy.policy_effective_date?.new || '', policy.policy_effective_date?.expiring || '']);
  exposureData.push(['Policy Expiration Date', policy.policy_expiration_date?.new || '', policy.policy_expiration_date?.expiring || '']);
  exposureData.push(['Occurrence Limit', policy.occurrence_limit?.new || 1000000, policy.occurrence_limit?.expiring || '']);
  exposureData.push(['Aggregate Limit', policy.aggregate_limit?.new || 2000000, policy.aggregate_limit?.expiring || '']);
  exposureData.push(['SIR Type', policy.sir_type?.new || '', policy.sir_type?.expiring || '']);
  exposureData.push(['SIR Amount', policy.sir_amount?.new || 0, policy.sir_amount?.expiring || '']);
  exposureData.push(['Commission %', policy.commission?.new || 15, policy.commission?.expiring || '']);

  if (policy.pl2 === 'Contractors') {
    exposureData.push(['Sales', policy.sales?.new || 0, policy.sales?.expiring || '']);
  }

  exposureData.push([]);
  exposureData.push([]);

  // Class & Territory Details section
  exposureData.push(['Table 2. Class & Territory Details']);
  exposureData.push([]);

  // Header for class details table
  const classHeaders = [
    'Row', 'Class Code', 'Description', 'Subline', 'Liquor Limit', 'Location',
    'Exposure', 'Exposure Basis', 'PremOps Rate', 'PremOps Prem',
    'Products Rate', 'Products Prem', 'Technical Premium', 'Modified Premium'
  ];
  exposureData.push(classHeaders);

  // Add class rows
  if (quoteData.exposure_rating.class_rows) {
    quoteData.exposure_rating.class_rows.forEach((row, index) => {
      exposureData.push([
        index + 1,
        row.class_code || '',
        row.description || '',
        row.subline || '',
        row.liquor_limit || '',
        row.location || '',
        row.exposures || 0,
        row.exposure_base || 'Sales',
        row.premops_rate || 0,
        row.premops_premium || 0,
        row.products_rate || 0,
        row.products_premium || 0,
        row.technical_premium || 0,
        row.modified_premium || 0
      ]);
    });
  }

  // Create worksheet and add to workbook
  const ws1 = XLSX.utils.aoa_to_sheet(exposureData);

  // Set column widths
  ws1['!cols'] = [
    { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 },
    { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
    { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 }
  ];

  XLSX.utils.book_append_sheet(wb, ws1, 'Exposure Rating');

  // Sheet 2: Experience Modifier
  const expModData: any[] = [];

  expModData.push(['EXPERIENCE MODIFIER']);
  expModData.push([]);

  const expMod = quoteData.experience_modifier || {};
  expModData.push(['Evaluation Date', expMod.evaluation_date || '']);
  expModData.push(['Policy Year 1', expMod.policy_year_1 || '']);
  expModData.push(['Policy Year 2', expMod.policy_year_2 || '']);
  expModData.push([]);

  expModData.push(['Loss Details']);
  expModData.push(['Date of Loss', 'Ground Up Indemnity', 'Ground Up Expense', 'Total Incurred']);

  if (expMod.losses) {
    expMod.losses.forEach(loss => {
      const total = (loss.ground_up_indemnity || 0) + (loss.ground_up_expense || 0);
      expModData.push([
        loss.date_of_loss || '',
        loss.ground_up_indemnity || 0,
        loss.ground_up_expense || 0,
        total
      ]);
    });
  }

  const ws2 = XLSX.utils.aoa_to_sheet(expModData);
  ws2['!cols'] = [
    { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(wb, ws2, 'Experience Modifier');

  // Sheet 3: UW Notes
  const notesData: any[] = [];
  notesData.push(['UNDERWRITING NOTES']);
  notesData.push([]);
  notesData.push([quoteData.uw_notes || '']);

  const ws3 = XLSX.utils.aoa_to_sheet(notesData);
  ws3['!cols'] = [{ wch: 100 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'UW Notes');

  // Generate Excel file
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export function parseExcelToQuote(file: File): Promise<QuoteInput> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Parse Exposure Rating sheet
        const exposureSheet = workbook.Sheets['Exposure Rating'];
        if (!exposureSheet) {
          throw new Error('Exposure Rating sheet not found');
        }

        const exposureData = XLSX.utils.sheet_to_json(exposureSheet, { header: 1 }) as any[][];

        // Build QuoteInput from Excel data
        const quoteInput: QuoteInput = {
          exposure_rating: {
            policy_details: {
              insured: '',
              pl2: 'Other',
            },
            class_rows: []
          },
          experience_modifier: {},
          uw_notes: ''
        };

        // Parse policy details (simplified for now)
        for (let i = 5; i < exposureData.length; i++) {
          const row = exposureData[i];
          if (!row || row.length < 2) continue;

          const field = row[0];
          const value = row[1];

          switch (field) {
            case 'Insured':
              quoteInput.exposure_rating.policy_details.insured = value || '';
              break;
            case 'PL_2':
              quoteInput.exposure_rating.policy_details.pl2 = value || 'Other';
              break;
            case 'Territory':
              quoteInput.exposure_rating.policy_details.territory = value || '';
              break;
            case 'Sales':
              quoteInput.exposure_rating.policy_details.sales = {
                new: parseFloat(value) || 0,
                expiring: parseFloat(row[2]) || 0
              };
              break;
          }

          if (field === 'Table 2. Class & Territory Details') {
            // Parse class rows
            const headerIndex = i + 2;
            for (let j = headerIndex + 1; j < exposureData.length; j++) {
              const classRow = exposureData[j];
              if (!classRow || classRow.length < 2) break;

              quoteInput.exposure_rating.class_rows?.push({
                class_code: classRow[1] || '',
                description: classRow[2] || '',
                subline: classRow[3] || '',
                liquor_limit: parseFloat(classRow[4]) || 0,
                location: parseInt(classRow[5]) || 0,
                exposures: parseFloat(classRow[6]) || 0,
                exposure_base: classRow[7] || 'Sales',
                premops_rate: parseFloat(classRow[8]) || 0,
                premops_premium: parseFloat(classRow[9]) || 0,
                products_rate: parseFloat(classRow[10]) || 0,
                products_premium: parseFloat(classRow[11]) || 0,
                technical_premium: parseFloat(classRow[12]) || 0,
                modified_premium: parseFloat(classRow[13]) || 0
              });
            }
            break;
          }
        }

        // Parse UW Notes sheet
        const notesSheet = workbook.Sheets['UW Notes'];
        if (notesSheet) {
          const notesData = XLSX.utils.sheet_to_json(notesSheet, { header: 1 }) as any[][];
          if (notesData[2] && notesData[2][0]) {
            quoteInput.uw_notes = notesData[2][0];
          }
        }

        resolve(quoteInput);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}