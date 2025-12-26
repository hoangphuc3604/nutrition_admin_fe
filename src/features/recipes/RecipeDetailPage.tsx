import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Flame, ChefHat, Edit, Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRecipe } from '@/api/recipes.api';
import { Recipe } from '@/types';

export function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: recipe, isLoading, error } = useRecipe(id!);

  if (isLoading) {
    return (
      <AdminLayout title="Recipe Details">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading recipe...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Recipe Details">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive">Failed to load recipe</p>
            <Button
              variant="outline"
              onClick={() => navigate('/recipes')}
              className="mt-4"
            >
              Back to Recipes
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!recipe) {
    return (
      <AdminLayout title="Recipe Details">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Recipe not found</p>
        </div>
      </AdminLayout>
    );
  }

  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);

  return (
    <AdminLayout title="Recipe Details">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/recipes')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Recipes
          </Button>
          <div className="flex-1" />
          <Button
            className="gap-2"
            onClick={() => navigate(`/recipes/${id}/edit`)}
          >
            <Edit className="h-4 w-4" />
            Edit Recipe
          </Button>
        </div>

        {/* Hero Section */}
        <Card className="overflow-hidden">
          <div className="relative">
            <img
              src={recipe.image_url || 'https://placehold.co/800x400?text=No+Image'}
              alt={recipe.name}
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-3xl font-bold mb-2">{recipe.name}</h1>
              <p className="text-white/90 max-w-2xl">{recipe.description}</p>
            </div>
          </div>
        </Card>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{totalTime}min</div>
              <div className="text-sm text-muted-foreground">Total Time</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{recipe.servings}</div>
              <div className="text-sm text-muted-foreground">Servings</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <ChefHat className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold capitalize">{recipe.difficulty_level || 'Easy'}</div>
              <div className="text-sm text-muted-foreground">Difficulty</div>
            </CardContent>
          </Card>
        </div>

        {/* Cuisine Type */}
        {recipe.cuisine_type && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cuisine Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{recipe.cuisine_type}</Badge>
            </CardContent>
          </Card>
        )}

        {/* Detailed Information Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold">Overview</TabsTrigger>
            <TabsTrigger value="ingredients" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold">Ingredients</TabsTrigger>
            <TabsTrigger value="instructions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold">Instructions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {recipe.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {recipe.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {!recipe.description && (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No description provided</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ingredients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ingredients {recipe.servings && `(${recipe.servings} servings)`}</CardTitle>
              </CardHeader>
              <CardContent>
                {recipe.recipeIngredients && recipe.recipeIngredients.length > 0 ? (
                  <div className="space-y-3">
                    {recipe.recipeIngredients.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex-1">
                          <span className="font-medium">{item.ingredient?.name || 'Unknown ingredient'}</span>
                        </div>
                        <div className="text-muted-foreground font-medium">
                          {item.quantity} {item.unit}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No ingredients added</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructions" className="space-y-6">
            {recipe.instructions && (
              <Card>
                <CardHeader>
                  <CardTitle>Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {recipe.instructions}
                  </p>
                </CardContent>
              </Card>
            )}

            {!recipe.instructions && (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No instructions provided</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
