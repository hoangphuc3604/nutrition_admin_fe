import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Flame, ChefHat, Edit } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock recipe detail data
const mockRecipeDetail = {
  id: '1',
  name: 'Grilled Chicken Salad',
  description: 'A healthy and delicious grilled chicken salad with fresh vegetables and a light vinaigrette dressing. Perfect for lunch or dinner.',
  image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
  cuisine_type: 'American',
  prep_time_minutes: 20,
  cook_time_minutes: 15,
  total_time_minutes: 35,
  servings: 2,
  difficulty: 'Easy',
  calories: 350,
  protein: 35,
  carbs: 15,
  fat: 18,
  fiber: 5,
  sugar: 8,
  sodium: 450,
  tags: ['High Protein', 'Low Carb', 'Healthy', 'Quick'],
  ingredients: [
    { id: 1, name: 'Chicken breast', amount: '200g', notes: 'boneless, skinless' },
    { id: 2, name: 'Mixed greens', amount: '100g', notes: 'lettuce, spinach, arugula' },
    { id: 3, name: 'Cherry tomatoes', amount: '150g', notes: 'halved' },
    { id: 4, name: 'Cucumber', amount: '1 medium', notes: 'sliced' },
    { id: 5, name: 'Red onion', amount: '50g', notes: 'thinly sliced' },
    { id: 6, name: 'Feta cheese', amount: '50g', notes: 'crumbled' },
    { id: 7, name: 'Olive oil', amount: '2 tbsp', notes: 'extra virgin' },
    { id: 8, name: 'Lemon juice', amount: '1 tbsp', notes: 'fresh' },
    { id: 9, name: 'Dried oregano', amount: '1 tsp', notes: '' },
    { id: 10, name: 'Salt and pepper', amount: 'to taste', notes: '' }
  ],
  instructions: [
    {
      step: 1,
      title: 'Prepare the chicken',
      description: 'Season the chicken breast with salt, pepper, and half the dried oregano. Heat a grill pan over medium-high heat.'
    },
    {
      step: 2,
      title: 'Grill the chicken',
      description: 'Grill the chicken for 6-7 minutes per side until cooked through and internal temperature reaches 165°F (74°C). Let rest for 5 minutes, then slice.'
    },
    {
      step: 3,
      title: 'Prepare the dressing',
      description: 'In a small bowl, whisk together olive oil, lemon juice, remaining oregano, salt, and pepper.'
    },
    {
      step: 4,
      title: 'Assemble the salad',
      description: 'In a large bowl, combine mixed greens, cherry tomatoes, cucumber, and red onion. Add sliced chicken and crumbled feta cheese.'
    },
    {
      step: 5,
      title: 'Dress and serve',
      description: 'Drizzle the dressing over the salad and toss gently to combine. Serve immediately.'
    }
  ],
  nutritional_facts: [
    { name: 'Calories', amount: '350 kcal', daily_value: '18%' },
    { name: 'Total Fat', amount: '18g', daily_value: '23%' },
    { name: 'Saturated Fat', amount: '4g', daily_value: '20%' },
    { name: 'Cholesterol', amount: '85mg', daily_value: '28%' },
    { name: 'Sodium', amount: '450mg', daily_value: '20%' },
    { name: 'Total Carbohydrates', amount: '15g', daily_value: '5%' },
    { name: 'Dietary Fiber', amount: '5g', daily_value: '18%' },
    { name: 'Total Sugars', amount: '8g', daily_value: '' },
    { name: 'Protein', amount: '35g', daily_value: '70%' },
    { name: 'Vitamin D', amount: '0mcg', daily_value: '0%' },
    { name: 'Calcium', amount: '150mg', daily_value: '12%' },
    { name: 'Iron', amount: '2mg', daily_value: '11%' },
    { name: 'Potassium', amount: '600mg', daily_value: '13%' }
  ]
};

export function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // In a real app, this would fetch data based on the ID
  const recipe = mockRecipeDetail;

  if (!recipe) {
    return (
      <AdminLayout title="Recipe Details">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Recipe not found</p>
        </div>
      </AdminLayout>
    );
  }

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
          <Button className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Recipe
          </Button>
        </div>

        {/* Hero Section */}
        <Card className="overflow-hidden">
          <div className="relative">
            <img
              src={recipe.image_url}
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
              <div className="text-2xl font-bold">{recipe.total_time_minutes}min</div>
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
              <Flame className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold">{recipe.calories}</div>
              <div className="text-sm text-muted-foreground">Calories</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <ChefHat className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{recipe.difficulty}</div>
              <div className="text-sm text-muted-foreground">Difficulty</div>
            </CardContent>
          </Card>
        </div>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tags & Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{recipe.cuisine_type}</Badge>
              {recipe.tags.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Information Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <div key={instruction.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
                      {instruction.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{instruction.title}</h4>
                      <p className="text-muted-foreground">{instruction.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ingredients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ingredients ({recipe.servings} servings)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recipe.ingredients.map((ingredient) => (
                    <div key={ingredient.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex-1">
                        <span className="font-medium">{ingredient.name}</span>
                        {ingredient.notes && (
                          <span className="text-muted-foreground text-sm ml-2">({ingredient.notes})</span>
                        )}
                      </div>
                      <div className="text-muted-foreground font-medium">
                        {ingredient.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nutrition" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Nutrition Facts</CardTitle>
                <p className="text-sm text-muted-foreground">Per serving ({recipe.servings} servings total)</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recipe.nutritional_facts.map((fact) => (
                    <div key={fact.name} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                      <span className="font-medium">{fact.name}</span>
                      <div className="text-right">
                        <span className="font-semibold">{fact.amount}</span>
                        {fact.daily_value && (
                          <span className="text-muted-foreground text-sm ml-2">({fact.daily_value})</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Macronutrients Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{recipe.protein}g</div>
                    <div className="text-sm text-muted-foreground">Protein</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{recipe.carbs}g</div>
                    <div className="text-sm text-muted-foreground">Carbs</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{recipe.fat}g</div>
                    <div className="text-sm text-muted-foreground">Fat</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{recipe.fiber}g</div>
                    <div className="text-sm text-muted-foreground">Fiber</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
