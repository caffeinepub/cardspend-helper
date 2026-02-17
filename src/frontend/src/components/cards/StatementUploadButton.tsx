import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from '@tanstack/react-router';
import { parseCSV } from '@/lib/csvImport';
import { useProcessTransactions } from '@/hooks/useQueries';
import { useUploadStatus } from '@/state/uploadStatus';
import { toast } from 'sonner';
import type { Card } from '@/backend';

interface StatementUploadButtonProps {
  card: Card;
}

export default function StatementUploadButton({ card }: StatementUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const processTransactionsMutation = useProcessTransactions();
  const { markUploaded } = useUploadStatus();

  const hasValidMapping = 
    card.csvColumnMapping.dateColumn !== undefined &&
    card.csvColumnMapping.amountColumn !== undefined &&
    card.csvColumnMapping.descriptionColumn !== undefined &&
    card.csvColumnMapping.categoryColumn !== undefined;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!hasValidMapping) {
      setError('CSV column mapping not configured for this card');
      toast.error('Please configure CSV mapping in Settings first');
      return;
    }

    try {
      const text = await file.text();
      const transactions = parseCSV(text, card);
      
      if (transactions.length === 0) {
        throw new Error('No valid transactions found in CSV');
      }

      await processTransactionsMutation.mutateAsync({
        cardId: card.id,
        transactions,
      });

      markUploaded(card.id);
      toast.success(`Imported ${transactions.length} transactions from ${card.name}`);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process CSV file';
      setError(message);
      toast.error(message);
    }
  };

  const handleUploadClick = () => {
    if (!hasValidMapping) {
      navigate({ to: '/settings', search: { tab: 'csv', cardId: card.id } });
      toast.info('Please configure CSV column mapping first');
      return;
    }
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <Button
        onClick={handleUploadClick}
        variant="outline"
        className="w-full"
        disabled={processTransactionsMutation.isPending}
      >
        <Upload className="h-4 w-4 mr-2" />
        {processTransactionsMutation.isPending ? 'Processing...' : 'Upload Statement'}
      </Button>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!hasValidMapping && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Configure CSV column mapping in Settings before uploading
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
