import type { Card, Transaction } from '@/backend';

export function parseCSV(csvText: string, card: Card): Transaction[] {
  const lines = csvText.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header and one data row');
  }

  // Skip header row
  const dataLines = lines.slice(1);
  const transactions: Transaction[] = [];

  const { dateColumn, amountColumn, categoryColumn, descriptionColumn } = card.csvColumnMapping;

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i].trim();
    if (!line) continue;

    // Simple CSV parsing (handles basic cases, not complex quoted fields)
    const columns = line.split(',').map((col) => col.trim().replace(/^"|"$/g, ''));

    const dateIdx = Number(dateColumn);
    const amountIdx = Number(amountColumn);
    const categoryIdx = Number(categoryColumn);
    const descriptionIdx = Number(descriptionColumn);

    if (
      dateIdx >= columns.length ||
      amountIdx >= columns.length ||
      categoryIdx >= columns.length ||
      descriptionIdx >= columns.length
    ) {
      console.warn(`Skipping row ${i + 2}: insufficient columns`);
      continue;
    }

    const date = columns[dateIdx];
    const amountStr = columns[amountIdx].replace(/[^0-9.-]/g, '');
    const amount = parseFloat(amountStr);
    const cardCategory = columns[categoryIdx];
    const description = columns[descriptionIdx];

    if (!date || isNaN(amount) || !description) {
      console.warn(`Skipping row ${i + 2}: invalid data`);
      continue;
    }

    // Find matching category mapping
    const mapping = card.categoryMappings.find(
      (m) => m.cardProvidedCategory.toLowerCase() === cardCategory.toLowerCase()
    );

    const categoryID = mapping?.customCategoryID || 'unmapped';

    transactions.push({
      date,
      amount,
      categoryID,
      description,
    });
  }

  return transactions;
}
