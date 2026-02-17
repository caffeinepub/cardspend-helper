import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from '@/hooks/useQueries';
import TransactionsTable from '@/components/transactions/TransactionsTable';
import TransactionsExport from '@/components/transactions/TransactionsExport';
import { Receipt } from 'lucide-react';

export default function TransactionsPage() {
  const { data: transactions = [], isLoading } = useTransactions();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground mt-1">
          Review imported transactions and export for your spreadsheet
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/4 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : transactions.length === 0 ? (
        <Card>
          <CardHeader className="text-center py-12">
            <div className="flex justify-center mb-4">
              <Receipt className="h-24 w-24 text-muted-foreground/50" />
            </div>
            <CardTitle>No transactions yet</CardTitle>
            <CardDescription>
              Upload a credit card statement from the Cards page to see transactions here
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <TransactionsTable transactions={transactions} />
          <TransactionsExport transactions={transactions} />
        </>
      )}
    </div>
  );
}
