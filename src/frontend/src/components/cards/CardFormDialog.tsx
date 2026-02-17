import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAddCard } from '@/hooks/useQueries';
import { toast } from 'sonner';
import type { Card } from '@/backend';

interface CardFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: Card | null;
}

const PRESET_COLORS = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
  '#84cc16', // lime
];

export default function CardFormDialog({ open, onOpenChange, card }: CardFormDialogProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const addCardMutation = useAddCard();

  useEffect(() => {
    if (card) {
      setName(card.name);
      // Extract color from card if stored (not in current backend, but prepare for future)
      setColor(PRESET_COLORS[0]);
    } else {
      setName('');
      setColor(PRESET_COLORS[0]);
    }
  }, [card, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a card name');
      return;
    }

    try {
      const cardId = card?.id || `card_${Date.now()}`;
      await addCardMutation.mutateAsync({
        id: cardId,
        name: name.trim(),
        color,
        csvMapping: card?.csvColumnMapping || {
          dateColumn: BigInt(0),
          amountColumn: BigInt(1),
          categoryColumn: BigInt(2),
          descriptionColumn: BigInt(3),
        },
      });
      
      toast.success(card ? 'Card updated successfully' : 'Card added successfully');
      onOpenChange(false);
      setName('');
      setColor(PRESET_COLORS[0]);
    } catch (error) {
      toast.error(card ? 'Failed to update card' : 'Failed to add card');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{card ? 'Edit Card' : 'Add New Card'}</DialogTitle>
            <DialogDescription>
              {card ? 'Update your credit card details' : 'Add a new credit card to track'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Card Name</Label>
              <Input
                id="name"
                placeholder="e.g., Chase Sapphire, Amex Gold"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <Label>Card Color</Label>
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map((presetColor) => (
                  <button
                    key={presetColor}
                    type="button"
                    onClick={() => setColor(presetColor)}
                    className={`w-10 h-10 rounded-md border-2 transition-all ${
                      color === presetColor ? 'border-foreground scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: presetColor }}
                    aria-label={`Select color ${presetColor}`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addCardMutation.isPending}>
              {addCardMutation.isPending ? 'Saving...' : card ? 'Update' : 'Add Card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
