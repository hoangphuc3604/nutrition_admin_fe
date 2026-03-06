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
import { useTranslation } from 'react-i18next';
import { parseInstructionsToSteps } from '@/lib/recipe-instructions.utils';

export function RecipeDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: recipe, isLoading, error } = useRecipe(id!);

  if (isLoading) {
    return (
      <AdminLayout title={t('recipes.recipeDetail.title')}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">{t('recipes.recipeDetail.loading')}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title={t('recipes.recipeDetail.title')}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive">{t('recipes.recipeDetail.loadFailed')}</p>
            <Button
              variant="outline"
              onClick={() => navigate('/recipes')}
              className="mt-4"
            >
              {t('recipes.recipeDetail.backToRecipes')}
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!recipe) {
    return (
      <AdminLayout title={t('recipes.recipeDetail.title')}>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{t('recipes.recipeDetail.notFound')}</p>
        </div>
      </AdminLayout>
    );
  }

  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);

  return (
    <AdminLayout title={t('recipes.recipeDetail.title')}>
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
            {t('recipes.recipeDetail.backToRecipes')}
          </Button>
          <div className="flex-1" />
          <Button
            className="gap-2"
            onClick={() => navigate(`/recipes/${id}/edit`)}
          >
            <Edit className="h-4 w-4" />
            {t('recipes.recipeDetail.editRecipe')}
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
              <div className="text-sm text-muted-foreground">{t('recipes.recipeDetail.totalTime')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{recipe.servings}</div>
              <div className="text-sm text-muted-foreground">{t('recipes.recipeDetail.servings')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <ChefHat className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold capitalize">{recipe.difficulty_level || t('recipes.recipeCreate.difficulty.easy')}</div>
              <div className="text-sm text-muted-foreground">{t('recipes.recipeDetail.difficulty')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Cuisine Type */}
        {recipe.cuisine_type && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('recipes.recipeDetail.cuisineType')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{recipe.cuisine_type}</Badge>
            </CardContent>
          </Card>
        )}

        {/* Detailed Information Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold">{t('recipes.recipeDetail.tabs.overview')}</TabsTrigger>
            <TabsTrigger value="ingredients" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold">{t('recipes.recipeDetail.tabs.ingredients')}</TabsTrigger>
            <TabsTrigger value="instructions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold">{t('recipes.recipeDetail.tabs.instructions')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {recipe.description && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('recipes.recipeDetail.sections.description')}</CardTitle>
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
                  <p className="text-muted-foreground">{t('recipes.recipeDetail.emptyStates.noDescription')}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ingredients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('recipes.recipeDetail.sections.ingredients')} {recipe.servings && `(${recipe.servings} ${t('recipes.recipeDetail.servings').toLowerCase()})`}</CardTitle>
              </CardHeader>
              <CardContent>
                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                  <div className="space-y-3">
                    {recipe.ingredients.map((item: any, index: number) => {
                      const name = item?.name ?? t('common.unknown');
                      const quantity = item?.quantity ?? '';
                      const unit = item?.unit ?? '';
                      return (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                          <div className="flex-1">
                            <span className="font-medium">{name}</span>
                          </div>
                          <div className="text-muted-foreground font-medium">
                            {quantity} {unit}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">{t('recipes.recipeDetail.emptyStates.noIngredients')}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructions" className="space-y-6">
            {recipe.instructions && recipe.instructions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('recipes.recipeDetail.sections.instructions')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {parseInstructionsToSteps(recipe.instructions).map((step, index) => (
                      <div key={step.id || index} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <p className="text-muted-foreground flex-1 pt-1">
                          {step.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {(!recipe.instructions || recipe.instructions.length === 0) && (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">{t('recipes.recipeDetail.emptyStates.noInstructions')}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
