import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PopularRecipe {
  id: string;
  name: string;
  category: string;
  usageCount: number;
  calories: number;
  status: 'popular' | 'trending' | 'new';
}

const recipes: PopularRecipe[] = [
  { id: '1', name: 'Grilled Chicken Salad', category: 'Lunch', usageCount: 423, calories: 350, status: 'popular' },
  { id: '2', name: 'Overnight Oats', category: 'Breakfast', usageCount: 312, calories: 280, status: 'trending' },
  { id: '3', name: 'Quinoa Buddha Bowl', category: 'Dinner', usageCount: 289, calories: 420, status: 'new' },
  { id: '4', name: 'Avocado Toast', category: 'Breakfast', usageCount: 256, calories: 310, status: 'popular' },
  { id: '5', name: 'Salmon Teriyaki', category: 'Dinner', usageCount: 234, calories: 480, status: 'trending' },
];

const statusColors = {
  popular: 'bg-success text-success-foreground',
  trending: 'bg-warning text-warning-foreground',
  new: 'bg-info text-info-foreground',
};

export function PopularRecipesTable() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Popular Recipes</CardTitle>
        <Select defaultValue="october">
          <SelectTrigger className="w-32 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="october">October</SelectItem>
            <SelectItem value="november">November</SelectItem>
            <SelectItem value="december">December</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Recipe Name</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Usage</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Calories</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((recipe) => (
                <tr key={recipe.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="py-4 px-2 text-sm font-medium text-foreground">{recipe.name}</td>
                  <td className="py-4 px-2 text-sm text-muted-foreground">{recipe.category}</td>
                  <td className="py-4 px-2 text-sm text-foreground">{recipe.usageCount.toLocaleString()}</td>
                  <td className="py-4 px-2 text-sm text-foreground">{recipe.calories} kcal</td>
                  <td className="py-4 px-2">
                    <Badge className={cn("capitalize text-xs", statusColors[recipe.status])}>
                      {recipe.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
