import { useState } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIngredients } from '@/api/ingredients.api';

export function IngredientsPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error } = useIngredients({
    page,
    limit: 10,
    search: searchQuery
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  return (
    <AdminLayout title="Ingredients">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-2xl font-bold">Ingredient Management</CardTitle>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Ingredient
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ingredients..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Image</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Name</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Category</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Unit</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Storage</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center text-sm text-muted-foreground">
                      Loading ingredients...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center text-sm text-destructive">
                      Failed to load ingredients. Please try again.
                    </td>
                  </tr>
                ) : data?.ingredients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center text-sm text-muted-foreground">
                      No ingredients found
                    </td>
                  </tr>
                ) : (
                  data?.ingredients.map((ingredient) => (
                    <tr key={ingredient.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <img 
                          src={ingredient.image_url || 'https://placehold.co/100x100?text=No+Image'} 
                          alt={ingredient.name}
                          className="h-14 w-14 rounded-lg object-cover"
                        />
                      </td>
                      <td className="py-4 px-4 text-sm font-medium text-foreground">{ingredient.name}</td>
                      <td className="py-4 px-4">
                        {ingredient.category ? (
                          <Badge variant="secondary">{ingredient.category}</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">N/A</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">{ingredient.common_unit || 'N/A'}</td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {ingredient.storage_temperature ? (
                          <Badge variant="outline">{ingredient.storage_temperature}</Badge>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {data ? (
                <>
                  Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
                  {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
                  {data.pagination.total} ingredients
                </>
              ) : (
                'Loading...'
              )}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!data || data.pagination.page === 1 || isLoading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!data || !data.pagination.hasNext || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
