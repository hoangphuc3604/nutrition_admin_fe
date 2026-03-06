import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIngredients, useDeleteIngredient } from '@/api/ingredients.api';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Ingredient } from '@/types';


export function IngredientsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const { t } = useTranslation();

  const { data: ingredientsData, isLoading, error } = useIngredients({
    limit: 10,
    search: searchQuery || undefined
  });
  const deleteIngredient = useDeleteIngredient();

  const ingredients = ingredientsData?.ingredients || [];

  const handleView = (ingredient: Ingredient) => {
    navigate(`/ingredients/${ingredient.id}`);
  };

  const handleEdit = (ingredient: Ingredient) => {
    navigate(`/ingredients/${ingredient.id}/edit`);
  };

  const handleCreate = () => {
    navigate('/ingredients/create');
  };

  const handleDelete = async (ingredient: Ingredient) => {
    if (confirm(t('ingredients.confirmDelete', { name: ingredient.name }))) {
      try {
        await deleteIngredient.mutateAsync(ingredient.id);
        toast({
          title: t('common.success'),
          description: t('ingredients.deleteSuccess'),
          variant: "default",
          className: "bg-green-500 text-white border-none",
        });
      } catch (error: any) {
        console.error('Failed to delete ingredient:', error);
        const errorMessage = error?.response?.data?.message || t('common.error');
        toast({
          title: t('common.error'),
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <AdminLayout title={t('ingredients.title')}>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-2xl font-bold">{t('ingredients.management')}</CardTitle>
          <Button className="gap-2" onClick={handleCreate}>
            <Plus className="h-4 w-4" />{t('ingredients.add')}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative w-72 mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('ingredients.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">{t('ingredients.loading')}</span>
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-destructive">
              {t('ingredients.errorLoading')}
            </div>
          )}
          {!isLoading && !error && (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">{t('common.image')}</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">{t('ingredients.name')}</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">{t('ingredients.category')}</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">{t('ingredients.storage')}</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      {t('ingredients.notFound')}
                    </td>
                  </tr>
                ) : (
                  ingredients.map((item) => (
                    <tr key={item.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-4 px-4">
                        {item.image_url ? (
                          // eslint-disable-next-line jsx-a11y/img-redundant-alt
                          <img
                            src={item.image_url}
                            alt={`Image of ${item.name}`}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-muted/30 flex items-center justify-center text-xs text-muted-foreground">
                            {t('ingredients.noImage')}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-sm font-medium">{item.name}</td>
                      <td className="py-4 px-4">
                        <Badge variant="secondary">{item.category || t('ingredients.uncategorized')}</Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground capitalize">
                        {item.storage_temperature ? t(`ingredients.${item.storage_temperature}`) : t('common.na')}
                      </td>
                      <td className="py-4 px-4 flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary"
                          onClick={() => handleView(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(item)}
                          disabled={deleteIngredient.isPending}
                        >
                          {deleteIngredient.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {!isLoading && !error && ingredientsData && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {ingredients.length} of {ingredientsData.pagination.total} ingredients
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!ingredientsData.pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
