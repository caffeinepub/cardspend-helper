import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { useCustomCategories, useAddCustomCategory, useUpdateCustomCategoryType } from '@/hooks/useQueries';
import { CategoryType } from '@/backend';
import { toast } from 'sonner';

export default function CustomCategoriesManager() {
  const { data: categories = [], isLoading } = useCustomCategories();
  const addCategoryMutation = useAddCustomCategory();
  const updateCategoryTypeMutation = useUpdateCustomCategoryType();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<CategoryType>(CategoryType.want);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      const categoryId = `cat_${Date.now()}`;
      await addCategoryMutation.mutateAsync({
        id: categoryId,
        name: newCategoryName.trim(),
        categoryType: newCategoryType,
      });
      
      toast.success('Category added successfully');
      setNewCategoryName('');
      setNewCategoryType(CategoryType.want);
    } catch (error) {
      toast.error('Failed to add category');
    }
  };

  const handleToggleCategoryType = async (categoryId: string, currentType: CategoryType) => {
    const newType = currentType === CategoryType.need ? CategoryType.want : CategoryType.need;
    
    try {
      await updateCategoryTypeMutation.mutateAsync({
        id: categoryId,
        categoryType: newType,
      });
      toast.success(`Category updated to ${newType === CategoryType.need ? 'Need' : 'Want'}`);
    } catch (error) {
      toast.error('Failed to update category');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Categories</CardTitle>
        <CardDescription>
          Create your own expense categories and classify them as needs or wants
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleAddCategory} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="category-name" className="sr-only">
                Category Name
              </Label>
              <Input
                id="category-name"
                placeholder="e.g., Groceries, Dining, Transportation"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
            <div className="flex gap-1 border rounded-md p-1">
              <Button
                type="button"
                variant={newCategoryType === CategoryType.need ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setNewCategoryType(CategoryType.need)}
                className="h-8"
              >
                Need
              </Button>
              <Button
                type="button"
                variant={newCategoryType === CategoryType.want ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setNewCategoryType(CategoryType.want)}
                className="h-8"
              >
                Want
              </Button>
            </div>
            <Button type="submit" disabled={addCategoryMutation.isPending}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </form>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No custom categories yet. Add your first category above.
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <Badge variant="outline">{category.name}</Badge>
                <div className="flex gap-1 border rounded-md p-1">
                  <Button
                    variant={category.categoryType === CategoryType.need ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleToggleCategoryType(category.id, category.categoryType)}
                    disabled={updateCategoryTypeMutation.isPending}
                    className="h-7 text-xs"
                  >
                    Need
                  </Button>
                  <Button
                    variant={category.categoryType === CategoryType.want ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleToggleCategoryType(category.id, category.categoryType)}
                    disabled={updateCategoryTypeMutation.isPending}
                    className="h-7 text-xs"
                  >
                    Want
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
