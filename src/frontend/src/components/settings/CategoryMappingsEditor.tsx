import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { useCards, useCustomCategories, useAddCategoryMapping } from '@/hooks/useQueries';
import { toast } from 'sonner';

export default function CategoryMappingsEditor() {
  const { data: cards = [] } = useCards();
  const { data: categories = [] } = useCustomCategories();
  const addMappingMutation = useAddCategoryMapping();
  
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [cardCategory, setCardCategory] = useState('');
  const [customCategoryId, setCustomCategoryId] = useState('');

  const selectedCard = cards.find((c) => c.id === selectedCardId);

  const handleAddMapping = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCardId || !cardCategory.trim() || !customCategoryId) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await addMappingMutation.mutateAsync({
        cardId: selectedCardId,
        mapping: {
          cardProvidedCategory: cardCategory.trim(),
          customCategoryID: customCategoryId,
        },
      });

      toast.success('Mapping added successfully');
      setCardCategory('');
      setCustomCategoryId('');
    } catch (error) {
      toast.error('Failed to add mapping');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Mappings</CardTitle>
        <CardDescription>
          Map credit card categories to your custom categories (many-to-one)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card-select">Select Card</Label>
            <Select value={selectedCardId} onValueChange={setSelectedCardId}>
              <SelectTrigger id="card-select">
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
            <form onSubmit={handleAddMapping} className="space-y-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="card-category">Card Category</Label>
                <Input
                  id="card-category"
                  placeholder="e.g., FOOD_AND_DRINK, TRAVEL"
                  value={cardCategory}
                  onChange={(e) => setCardCategory(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-category">Maps to Custom Category</Label>
                <Select value={customCategoryId} onValueChange={setCustomCategoryId}>
                  <SelectTrigger id="custom-category">
                    <SelectValue placeholder="Choose a custom category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" disabled={addMappingMutation.isPending}>
                <Plus className="h-4 w-4 mr-2" />
                Add Mapping
              </Button>
            </form>
          )}
        </div>

        {selectedCard && selectedCard.categoryMappings.length > 0 && (
          <div className="space-y-2">
            <Label>Current Mappings for {selectedCard.name}</Label>
            <div className="space-y-2">
              {selectedCard.categoryMappings.map((mapping, index) => {
                const category = categories.find((cat) => cat.id === mapping.customCategoryID);
                const categoryName = category?.name || 'Unknown';
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{mapping.cardProvidedCategory}</Badge>
                      <span className="text-muted-foreground">→</span>
                      <Badge>{categoryName}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
