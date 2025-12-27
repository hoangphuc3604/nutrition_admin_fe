import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DynamicIngredientTable, AvailableIngredient } from './components/DynamicIngredientTable';
import { DynamicInstructionsTable } from './components/DynamicInstructionsTable';
import { useRecipe, useUpdateRecipe } from '@/api/recipes.api';
import { useIngredients } from '@/api/ingredients.api';
import { useToast } from '@/hooks/use-toast';
import { InstructionStep, parseInstructionsToSteps, formatStepsToInstructions } from '@/lib/recipe-instructions.utils';

interface RecipeFormData {
  name: string;
  description?: string;
  image_url?: string;
  cuisine_type?: string;
  difficulty_level: "easy" | "medium" | "hard";
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  servings?: number;
  instructions?: string;
  instructionSteps: InstructionStep[];
  ingredients: RecipeIngredientForm[];
}

interface RecipeIngredientForm {
  id: string;
  ingredientId: string;
  quantity: number;
  unit: string;
  preparationMethod?: string;
  isOptional?: boolean;
  sortOrder?: number;
}

export function RecipeEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const { toast } = useToast();
  const [formData, setFormData] = useState<RecipeFormData>({
    name: '',
    description: '',
    cuisine_type: '',
    difficulty_level: 'easy',
    prep_time_minutes: 0,
    cook_time_minutes: 0,
    servings: 1,
    instructions: '',
    instructionSteps: [],
    ingredients: [],
  });

  const { data: recipe, isLoading: recipeLoading } = useRecipe(id!);
  const { data: ingredientsData } = useIngredients({ limit: 100 });
  const updateRecipe = useUpdateRecipe();

  const availableIngredients = (ingredientsData?.ingredients || []) as AvailableIngredient[];

  useEffect(() => {
    if (recipe) {
      const instructionSteps = parseInstructionsToSteps(recipe.instructions || '');
      setFormData({
        name: recipe.name,
        description: recipe.description || '',
        image_url: recipe.image_url || '',
        cuisine_type: recipe.cuisine_type || '',
        difficulty_level: recipe.difficulty_level || 'easy',
        prep_time_minutes: recipe.prep_time_minutes || 0,
        cook_time_minutes: recipe.cook_time_minutes || 0,
        servings: recipe.servings || 1,
        instructions: recipe.instructions || '',
        instructionSteps,
        ingredients: recipe.ingredients?.map((ri: any) => ({
          id: `ingredient-${ri.ingredientId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ingredientId: ri.ingredientId,
          quantity: ri.quantity,
          unit: ri.unit,
          preparationMethod: ri.preparationMethod,
          isOptional: ri.isOptional,
          sortOrder: ri.sortOrder,
        })) || [],
      });
    }
  }, [recipe]);

  const handleChange = (field: keyof RecipeFormData, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleIngredientsChange = (ingredients: RecipeIngredientForm[]) => {
    setFormData({ ...formData, ingredients });
  };

  const handleInstructionsChange = (steps: InstructionStep[]) => {
    const instructions = formatStepsToInstructions(steps);
    setFormData({ ...formData, instructionSteps: steps, instructions });
  };

  const validateForm = (): string | null => {
    if (!formData.name || formData.name.trim() === '') {
      return 'Tên công thức không được để trống';
    }

    if (formData.prep_time_minutes !== undefined && formData.prep_time_minutes < 0) {
      return 'Thời gian chuẩn bị không được âm';
    }

    if (formData.cook_time_minutes !== undefined && formData.cook_time_minutes < 0) {
      return 'Thời gian nấu không được âm';
    }

    if (formData.servings !== undefined && formData.servings <= 0) {
      return 'Số khẩu phần phải lớn hơn 0';
    }

    if (formData.ingredients.some(ing =>
      !ing.ingredientId ||
      ing.quantity <= 0 ||
      !ing.unit.trim()
    )) {
      return 'Thông tin nguyên liệu không hợp lệ';
    }

    return null;
  };

  const handleSave = async () => {
    if (!id) return;

    const validationError = validateForm();
    if (validationError) {
      toast({
        title: "Lỗi validation",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    try {
      const { instructionSteps, ...dataToSend } = formData;
      await updateRecipe.mutateAsync({ id, data: dataToSend });
      toast({
        title: "Thành công",
        description: "Cập nhật công thức thành công",
        variant: "default",
        className: "bg-green-500 text-white border-none",
      });
      navigate(`/recipes/${id}`);
    } catch (error: any) {
      console.error('Failed to update recipe:', error);
      const errorMessage = error?.response?.data?.message || 'Không thể cập nhật công thức. Vui lòng thử lại.';
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const isLoading = recipeLoading;
  const isSaving = updateRecipe.isPending;

  if (isLoading) {
    return (
      <AdminLayout title="Edit Recipe">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading recipe...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!recipe) {
    return (
      <AdminLayout title="Edit Recipe">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Recipe not found</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Recipe">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/recipes/${id}`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Recipe
          </Button>
          <div className="flex-1" />
          <Button
            onClick={handleSave}
            disabled={isSaving || !!validateForm()}
            className="gap-2"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Recipe Form */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Recipe: {recipe.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold">Details</TabsTrigger>
                <TabsTrigger value="ingredients" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold">Ingredients</TabsTrigger>
                <TabsTrigger value="instructions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold">Instructions</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Recipe Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Enter recipe name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cuisine_type">Cuisine Type</Label>
                    <Input
                      id="cuisine_type"
                      value={formData.cuisine_type || ''}
                      onChange={(e) => handleChange('cuisine_type', e.target.value)}
                      placeholder="e.g., Italian, Vietnamese, Asian"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url || ''}
                      onChange={(e) => handleChange('image_url', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty_level">Difficulty Level</Label>
                    <select
                      id="difficulty_level"
                      value={formData.difficulty_level}
                      onChange={(e) => handleChange('difficulty_level', e.target.value as "easy" | "medium" | "hard")}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prep_time_minutes">Prep Time (min)</Label>
                    <Input
                      id="prep_time_minutes"
                      type="number"
                      min="0"
                      value={formData.prep_time_minutes || ''}
                      onChange={(e) => handleChange('prep_time_minutes', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cook_time_minutes">Cook Time (min)</Label>
                    <Input
                      id="cook_time_minutes"
                      type="number"
                      min="0"
                      value={formData.cook_time_minutes || ''}
                      onChange={(e) => handleChange('cook_time_minutes', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="servings">Servings</Label>
                    <Input
                      id="servings"
                      type="number"
                      min="1"
                      value={formData.servings || ''}
                      onChange={(e) => handleChange('servings', parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Recipe description..."
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="ingredients" className="mt-6">
                <DynamicIngredientTable
                  items={formData.ingredients}
                  onChange={handleIngredientsChange}
                  availableIngredients={availableIngredients}
                />
              </TabsContent>

              <TabsContent value="instructions" className="mt-6">
                <DynamicInstructionsTable
                  steps={formData.instructionSteps}
                  onChange={handleInstructionsChange}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

