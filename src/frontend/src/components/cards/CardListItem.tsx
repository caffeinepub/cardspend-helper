import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, CreditCard } from 'lucide-react';
import StatementUploadButton from './StatementUploadButton';
import { useUploadStatus } from '@/state/uploadStatus';
import type { Card as CardType } from '@/backend';

interface CardListItemProps {
  card: CardType;
  onEdit: () => void;
}

export default function CardListItem({ card, onEdit }: CardListItemProps) {
  const { isUploaded } = useUploadStatus();
  const uploaded = isUploaded(card.id);

  return (
    <Card className="relative overflow-hidden">
      <div
        className="absolute top-0 left-0 w-1 h-full"
        style={{ backgroundColor: '#10b981' }}
      />
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-md flex items-center justify-center"
            style={{ backgroundColor: '#10b981' }}
          >
            <CreditCard className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">{card.name}</CardTitle>
            <Badge variant={uploaded ? 'default' : 'secondary'} className="mt-1">
              {uploaded ? (
                <span className="flex items-center gap-1">
                  <img src="/assets/generated/upload-ok.dim_64x64.png" alt="" className="h-3 w-3" />
                  Uploaded
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <img src="/assets/generated/upload-missing.dim_64x64.png" alt="" className="h-3 w-3" />
                  Not Uploaded
                </span>
              )}
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Edit className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <StatementUploadButton card={card} />
      </CardContent>
    </Card>
  );
}
