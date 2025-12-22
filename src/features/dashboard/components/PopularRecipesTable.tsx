import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTrendingRecipes } from '@/api/dashboard.api';

export function PopularRecipesTable() {
  const { data, isLoading } = useTrendingRecipes(10);

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Popular Recipes</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : data?.recipes && data.recipes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Recipe Name</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Cuisine Type</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recipes.map((recipe) => (
                  <tr key={recipe.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-2 text-sm font-medium text-foreground max-w-xs truncate" title={recipe.name}>
                      {recipe.name}
                    </td>
                    <td className="py-4 px-2 text-sm text-muted-foreground">
                      {recipe.cuisine_type || 'N/A'}
                    </td>
                    <td className="py-4 px-2">
                      <Badge className={cn("capitalize text-xs", "bg-warning text-warning-foreground")}>
                        trending
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No trending recipes found
          </div>
        )}
      </CardContent>
    </Card>
  );
}
