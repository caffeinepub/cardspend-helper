import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCards, useAddCard } from '@/hooks/useQueries';
import { toast } from 'sonner';

export default function CsvMappingEditor() {
  const { data: cards = [] } = useCards();
  const updateCardMutation = useAddCard();
  
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [dateColumn, setDateColumn] = useState('0');
  const [amountColumn, setAmountColumn] = useState('1');
  const [categoryColumn, setCategoryColumn] = useState('2');
  const [descriptionColumn, setDescriptionColumn] = useState('3');

  const selectedCard = cards.find((c) => c.id === selectedCardId);

  useEffect(() => {
    if (selectedCard) {
      setDateColumn(selectedCard.csvColumnMapping.dateColumn.toString());
      setAmountColumn(selectedCard.csvColumnMapping.amountColumn.toString());
      setCategoryColumn(selectedCard.csvColumnMapping.categoryColumn.toString());
      setDescriptionColumn(selectedCard.csvColumnMapping.descriptionColumn.toString());
    }
  }, [selectedCard]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCardId || !selectedCard) {
      toast.error('Please select a card');
      return;
    }

    try {
      await updateCardMutation.mutateAsync({
        id: selectedCard.id,
        name: selectedCard.name,
        color: '#10b981',
        csvMapping: {
          dateColumn: BigInt(parseInt(dateColumn)),
          amountColumn: BigInt(parseInt(amountColumn)),
          categoryColumn: BigInt(parseInt(categoryColumn)),
          descriptionColumn: BigInt(parseInt(descriptionColumn)),
        },
      });

      toast.success('CSV mapping updated successfully');
    } catch (error) {
      toast.error('Failed to update CSV mapping');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>CSV Column Mapping</CardTitle>
        <CardDescription>
          Configure which CSV columns contain date, amount, category, and description for each card
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="card-select-csv">Select Card</Label>
          <Select value={selectedCardId} onValueChange={setSelectedCardId}>
            <SelectTrigger id="card-select-csv">
              <SelectValue placeholder="Choose a card" />
            </SelectTrigger>
            <SelectContent>
              {cards.map((card) => (
                <SelectItem key={card.id} value={card.id}>
                  {card.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCardId && (
          <form onSubmit={handleSave} className="space-y-4 p-4 border rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-column">Date Column Index</Label>
                <Input
                  id="date-column"
                  type="number"
                  min="0"
                  value={dateColumn}
                  onChange={(e) => setDateColumn(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount-column">Amount Column Index</Label>
                <Input
                  id="amount-column"
                  type="number"
                  min="0"
                  value={amountColumn}
                  onChange={(e) => setAmountColumn(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category-column">Category Column Index</Label>
                <Input
                  id="category-column"
                  type="number"
                  min="0"
                  value={categoryColumn}
                  onChange={(e) => setCategoryColumn(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description-column">Description Column Index</Label>
                <Input
                  id="description-column"
                  type="number"
                  min="0"
                  value={descriptionColumn}
                  onChange={(e) => setDescriptionColumn(e.target.value)}
                />
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Column indices start at 0. For example, if Date is the first column in your CSV, use 0.
            </div>

            <Button type="submit" disabled={updateCardMutation.isPending}>
              {updateCardMutation.isPending ? 'Saving...' : 'Save Mapping'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
