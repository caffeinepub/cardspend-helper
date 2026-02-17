import type { Transaction, CustomCategory, CategoryType } from '@/backend';
import { getTransactionKey } from '@/state/transactionCategoryOverrides';
import type { NeedWantOverride } from '@/state/transactionNeedWantOverrides';

export function formatTransactionsForExport(
  transactions: Transaction[],
  categories: CustomCategory[],
  categoryOverrides?: Map<string, string>,
  needWantOverrides?: Map<string, NeedWantOverride>
): string {
  if (transactions.length === 0) {
    return 'No transactions to export';
  }

  const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));

  // Header row
  const header = 'Date\tDescription\tAmount\tCategory\tNeed/Want';
  
  // Data rows
  const rows = transactions.map((t) => {
    // Check for category override first
    let categoryId = t.categoryID;
    if (categoryOverrides) {
      const key = getTransactionKey(t);
      const override = categoryOverrides.get(key);
      if (override) {
        categoryId = override;
      }
    }
    
    const category = categoryMap.get(categoryId);
    const categoryName = category?.name || 'Unmapped';
    
    // Determine Need/Want value
    let needWant = 'Unassigned';
    if (needWantOverrides) {
      const key = getTransactionKey(t);
      const override = needWantOverrides.get(key);
      if (override && override !== 'auto') {
        needWant = override === 'need' ? 'Need' : 'Want';
      } else if (category) {
        needWant = category.categoryType === 'need' ? 'Need' : 'Want';
      }
    } else if (category) {
      needWant = category.categoryType === 'need' ? 'Need' : 'Want';
    }
    
    const amount = t.amount.toFixed(2);
    return `${t.date}\t${t.description}\t${amount}\t${categoryName}\t${needWant}`;
  });

  return [header, ...rows].join('\n');
}
