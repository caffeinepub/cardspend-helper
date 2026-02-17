import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useCustomCategories } from '@/hooks/useQueries';
import { useTransactionCategoryOverrides } from '@/state/transactionCategoryOverrides';
import { useTransactionNeedWantOverrides } from '@/state/transactionNeedWantOverrides';
import { formatTransactionsForExport } from '@/lib/transactionsExport';
import type { Transaction } from '@/backend';
import { toast } from 'sonner';

interface TransactionsExportProps {
  transactions: Transaction[];
}

export default function TransactionsExport({ transactions }: TransactionsExportProps) {
  const { data: categories = [] } = useCustomCategories();
  const { overrides: categoryOverrides } = useTransactionCategoryOverrides();
  const { overrides: needWantOverrides } = useTransactionNeedWantOverrides();
  const [copied, setCopied] = useState(false);

  const exportText = formatTransactionsForExport(
    transactions,
    categories,
    categoryOverrides,
    needWantOverrides
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={exportText}
          readOnly
          className="font-mono text-sm min-h-[300px]"
        />
        <Button onClick={handleCopy} className="w-full">
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy to Clipboard
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
