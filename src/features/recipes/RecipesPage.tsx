import { useState } from 'react';
import { Search, Plus, Edit, Trash2, MoreHorizontal, Flame } from 'lucide-react';
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

interface Recipe {
  id: string;
  name: string;
  category: string;
  calories: number;
  prepTime: number;
  tags: string[];
  imageUrl: string;
}

const mockRecipes: Recipe[] = [
  { id: '1', name: 'Grilled Chicken Salad', category: 'Lunch', calories: 350, prepTime: 20, tags: ['High Protein', 'Low Carb'], imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop' },
  { id: '2', name: 'Overnight Oats', category: 'Breakfast', calories: 280, prepTime: 10, tags: ['Fiber Rich', 'Easy'], imageUrl: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=100&h=100&fit=crop' },
  { id: '3', name: 'Quinoa Buddha Bowl', category: 'Dinner', calories: 420, prepTime: 30, tags: ['Vegan', 'Healthy'], imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&h=100&fit=crop' },
  { id: '4', name: 'Avocado Toast', category: 'Breakfast', calories: 310, prepTime: 5, tags: ['Quick', 'Vegetarian'], imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=100&h=100&fit=crop' },
  { id: '5', name: 'Salmon Teriyaki', category: 'Dinner', calories: 480, prepTime: 25, tags: ['Omega-3', 'Asian'], imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=100&h=100&fit=crop' },
  { id: '6', name: 'Green Smoothie', category: 'Breakfast', calories: 180, prepTime: 5, tags: ['Detox', 'Quick'], imageUrl: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=100&h=100&fit=crop' },
];

export function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredRecipes = mockRecipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Recipe Name</Label>
                    <Input id="name" placeholder="Enter recipe name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" placeholder="e.g., Breakfast, Lunch" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="calories">Calories</Label>
                    <Input id="calories" type="number" placeholder="350" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prepTime">Prep Time (min)</Label>
                    <Input id="prepTime" type="number" placeholder="20" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="servings">Servings</Label>
                    <Input id="servings" type="number" placeholder="2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input id="tags" placeholder="High Protein, Low Carb, Easy" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Recipe description..." rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ingredients">Ingredients</Label>
                  <Textarea id="ingredients" placeholder="List ingredients..." rows={4} />
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
                onChange={(e) => setSearchQuery(e.target.value)}
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
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Category</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Calories</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Prep Time</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Tags</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecipes.map((recipe) => (
                  <tr key={recipe.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <img 
                        src={recipe.imageUrl} 
                        alt={recipe.name}
                        className="h-14 w-14 rounded-lg object-cover"
                      />
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-foreground">{recipe.name}</td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{recipe.category}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Flame className="h-4 w-4 text-warning" />
                        {recipe.calories} kcal
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{recipe.prepTime} min</td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {recipe.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
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
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {filteredRecipes.length} of {mockRecipes.length} recipes
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
