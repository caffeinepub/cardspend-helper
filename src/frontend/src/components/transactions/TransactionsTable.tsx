import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCustomCategories } from '@/hooks/useQueries';
import { useTransactionCategoryOverrides, getTransactionKey } from '@/state/transactionCategoryOverrides';
import { useTransactionNeedWantOverrides, type NeedWantOverride } from '@/state/transactionNeedWantOverrides';
import { CategoryType } from '@/backend';
import type { Transaction } from '@/backend';

interface TransactionsTableProps {
  transactions: Transaction[];
}

export default function TransactionsTable({ transactions }: TransactionsTableProps) {
  const { data: categories = [] } = useCustomCategories();
  const { overrides: categoryOverrides, setOverride: setCategoryOverride } = useTransactionCategoryOverrides();
  const { overrides: needWantOverrides, setOverride: setNeedWantOverride } = useTransactionNeedWantOverrides();
  
  const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));

  const getCategoryName = (categoryId: string) => {
    return categoryMap.get(categoryId)?.name || 'Unmapped';
  };

  const getEffectiveCategoryId = (transaction: Transaction): string => {
    const key = getTransactionKey(transaction);
    const override = categoryOverrides.get(key);
    return override || transaction.categoryID;
  };

  const getEffectiveNeedWant = (transaction: Transaction): 'need' | 'want' | 'unassigned' => {
    const key = getTransactionKey(transaction);
    const override = needWantOverrides.get(key);
    
    // If there's an override and it's not 'auto', use it
    if (override && override !== 'auto') {
      return override;
    }
    
    // Otherwise, derive from the effective category
    const effectiveCategoryId = getEffectiveCategoryId(transaction);
    const category = categoryMap.get(effectiveCategoryId);
    
    if (!category) {
      return 'unassigned';
    }
    
    return category.categoryType === CategoryType.need ? 'need' : 'want';
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const hasCustomCategories = categories.length > 0;

  const getNeedWantBadgeVariant = (value: 'need' | 'want' | 'unassigned') => {
    if (value === 'need') return 'default';
    if (value === 'want') return 'secondary';
    return 'outline';
  };

  const getNeedWantLabel = (value: 'need' | 'want' | 'unassigned') => {
    if (value === 'need') return 'Need';
    if (value === 'want') return 'Want';
    return 'Unassigned';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Imported Transactions ({transactions.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Need/Want</TableHead>
                <TableHead>Category Override</TableHead>
                <TableHead>Need/Want Override</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction, index) => {
                const effectiveCategoryId = getEffectiveCategoryId(transaction);
                const categoryName = getCategoryName(effectiveCategoryId);
                const isUnmapped = categoryName === 'Unmapped';
                const transactionKey = getTransactionKey(transaction);
                const hasCategoryOverride = categoryOverrides.has(transactionKey);
                const effectiveNeedWant = getEffectiveNeedWant(transaction);
                const needWantOverride = needWantOverrides.get(transactionKey) || 'auto';
                const hasNeedWantOverride = needWantOverride !== 'auto';
                
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {transaction.date}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatAmount(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={isUnmapped ? 'secondary' : hasCategoryOverride ? 'outline' : 'default'}>
                        {categoryName}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={getNeedWantBadgeVariant(effectiveNeedWant)}>
                          {getNeedWantLabel(effectiveNeedWant)}
                        </Badge>
                        {hasNeedWantOverride && (
                          <Badge variant="outline" className="text-xs">
                            Overridden
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {hasCustomCategories ? (
                        <Select
                          value={effectiveCategoryId}
                          onValueChange={(value) => setCategoryOverride(transactionKey, value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No categories available
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={needWantOverride}
                        onValueChange={(value) => setNeedWantOverride(transactionKey, value as NeedWantOverride)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto</SelectItem>
                          <SelectItem value="need">Need</SelectItem>
                          <SelectItem value="want">Want</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
