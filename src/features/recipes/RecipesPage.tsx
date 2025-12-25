import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, MoreHorizontal, Flame, Eye } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useRecipes } from '@/api/recipes.api';

export function RecipesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, isLoading, error } = useRecipes({
    page,
    limit: 10,
    search: searchQuery
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  return (
    <AdminLayout title="Recipes">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-2xl font-bold">Recipe Management</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Recipe
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Recipe</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Form content kept as placeholder */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Recipe Name</Label>
                    <Input id="name" placeholder="Enter recipe name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Cuisine Type</Label>
                    <Input id="category" placeholder="e.g., Italian, Asian" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prepTime">Prep Time (min)</Label>
                    <Input id="prepTime" type="number" placeholder="20" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={() => setIsDialogOpen(false)}>Save Recipe</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search recipes..."
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
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Recipe Name</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Cuisine Type</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Prep Time</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 px-4 text-center text-sm text-muted-foreground">
                      Loading recipes...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="py-8 px-4 text-center text-sm text-destructive">
                      Failed to load recipes. Please try again.
                    </td>
                  </tr>
                ) : data?.recipes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 px-4 text-center text-sm text-muted-foreground">
                      No recipes found
                    </td>
                  </tr>
                ) : (
                  data?.recipes.map((recipe) => (
                    <tr key={recipe.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <img 
                          src={recipe.image_url || 'https://placehold.co/100x100?text=No+Image'} 
                          alt={recipe.name}
                          className="h-14 w-14 rounded-lg object-cover"
                        />
                      </td>
                      <td className="py-4 px-4 text-sm font-medium text-foreground">{recipe.name}</td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">{recipe.cuisine_type || 'N/A'}</td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">{recipe.prep_time_minutes ? `${recipe.prep_time_minutes} min` : 'N/A'}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600"
                            onClick={() => navigate(`/recipes/${recipe.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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
                  {data.pagination.total} recipes
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

