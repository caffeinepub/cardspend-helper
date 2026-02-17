import { useState } from 'react';
import { Plus, Trash2, Edit, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useCards, useResetTransactions } from '@/hooks/useQueries';
import CardFormDialog from '@/components/cards/CardFormDialog';
import CardListItem from '@/components/cards/CardListItem';
import { toast } from 'sonner';
import type { Card as CardType } from '@/backend';

export default function CardsManagerPage() {
  const { data: cards = [], isLoading } = useCards();
  const resetMutation = useResetTransactions();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardType | null>(null);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const handleReset = async () => {
    try {
      await resetMutation.mutateAsync();
      toast.success('All transactions cleared and upload status reset');
      setIsResetDialogOpen(false);
    } catch (error) {
      toast.error('Failed to reset transactions');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Credit Cards</h1>
          <p className="text-muted-foreground mt-1">
            Manage your credit card accounts and upload statements
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsResetDialogOpen(true)}
            disabled={resetMutation.isPending}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset All
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Card
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : cards.length === 0 ? (
        <Card>
          <CardHeader className="text-center py-12">
            <div className="flex justify-center mb-4">
              <img src="/assets/generated/card-icon.dim_128x128.png" alt="No cards" className="h-24 w-24 opacity-50" />
            </div>
            <CardTitle>No credit cards yet</CardTitle>
            <CardDescription>
              Add your first credit card to start tracking expenses
            </CardDescription>
            <div className="pt-4">
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Card
              </Button>
            </div>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((card) => (
            <CardListItem
              key={card.id}
              card={card}
              onEdit={() => setEditingCard(card)}
            />
          ))}
        </div>
      )}

      <CardFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        card={null}
      />

      <CardFormDialog
        open={!!editingCard}
        onOpenChange={(open) => !open && setEditingCard(null)}
        card={editingCard}
      />

      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset all transactions?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all imported transactions and reset upload status for all cards.
              Your card configurations, custom categories, and mappings will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} disabled={resetMutation.isPending}>
              {resetMutation.isPending ? 'Resetting...' : 'Reset'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
