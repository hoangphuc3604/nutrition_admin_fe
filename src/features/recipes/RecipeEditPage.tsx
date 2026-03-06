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
import { ImageUploadWithPreview } from '@/components/ui/image-upload-with-preview';
import { useRecipe, useUpdateRecipe, UpdateRecipeRequest } from '@/api/recipes.api';
import { useIngredients } from '@/api/ingredients.api';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { InstructionStep, parseInstructionsToSteps, formatStepsToInstructions } from '@/lib/recipe-instructions.utils';

interface RecipeFormData {
  name: string;
  description?: string;
  image?: File | null;
  image_url?: string;
  removeImage?: boolean;
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
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const { toast } = useToast();
  const [formData, setFormData] = useState<RecipeFormData>({
    name: '',
    description: '',
    image: null,
    cuisine_type: '',
    difficulty_level: 'easy',
    prep_time_minutes: 0,
    cook_time_minutes: 0,
    servings: 1,
    instructions: '',
    instructionSteps: [],
    ingredients: [],
  });

  const [ingredientPage, setIngredientPage] = useState(1);
  const [ingredientHasMore, setIngredientHasMore] = useState(true);
  const [allIngredients, setAllIngredients] = useState<AvailableIngredient[]>([]);

  const { data: recipe, isLoading: recipeLoading } = useRecipe(id!);
  const { data: ingredientsData } = useIngredients({ page: ingredientPage, limit: 100 });
  const updateRecipe = useUpdateRecipe();

  useEffect(() => {
    if (ingredientsData?.ingredients) {
      setAllIngredients(prev => {
        const newIngredients = ingredientsData.ingredients.filter(
          ing => !prev.some(existing => existing.id === ing.id)
        );
        return [...prev, ...newIngredients];
      });
      if (ingredientsData.pagination) {
        setIngredientHasMore(ingredientsData.pagination.hasNext);
      }
    }
  }, [ingredientsData]);

  const availableIngredients = allIngredients as AvailableIngredient[];

  const loadMoreIngredients = () => {
    if (ingredientHasMore) {
      setIngredientPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (recipe) {
      // Parse instructions - API returns array format, function handles both string and array
      const instructionSteps = parseInstructionsToSteps(recipe.instructions);
      const instructionsString = formatStepsToInstructions(instructionSteps);

      setFormData({
        name: recipe.name,
        description: recipe.description || '',
        image: null,
        image_url: recipe.image_url || '',
        removeImage: false,
        cuisine_type: recipe.cuisine_type || '',
        difficulty_level: recipe.difficulty_level || 'easy',
        prep_time_minutes: recipe.prep_time_minutes || 0,
        cook_time_minutes: recipe.cook_time_minutes || 0,
        servings: recipe.servings || 1,
        instructions: instructionsString,
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

  const handleChange = (field: keyof RecipeFormData, value: string | number | File | null) => {
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
    try {
      if (!formData.name || formData.name.trim() === '') {
        return t('recipes.recipeCreate.validation.nameRequired');
      }

    if (!formData.difficulty_level || !['easy', 'medium', 'hard'].includes(formData.difficulty_level)) {
      return t('recipes.recipeCreate.validation.invalidDifficulty');
    }

    if (!formData.instructions || formData.instructions.trim() === '') {
      return t('recipes.recipeCreate.validation.instructionsRequired');
    }

      if (formData.prep_time_minutes !== undefined && (formData.prep_time_minutes < 0 || formData.prep_time_minutes > 1440)) {
        return t('recipes.recipeCreate.validation.invalidPrepTime');
      }

      if (formData.cook_time_minutes !== undefined && (formData.cook_time_minutes < 0 || formData.cook_time_minutes > 1440)) {
        return t('recipes.recipeCreate.validation.invalidCookTime');
      }

      if (formData.servings !== undefined && (formData.servings <= 0 || formData.servings > 100)) {
        return t('recipes.recipeCreate.validation.invalidServings');
      }

      if (!formData.ingredients || formData.ingredients.length === 0) {
        return t('recipes.recipeCreate.validation.atLeastOneIngredient');
      }

      for (let i = 0; i < formData.ingredients.length; i++) {
        const ing = formData.ingredients[i];
        if (!ing || !ing.ingredientId || ing.ingredientId.trim() === '') {
          return `${t('recipes.ingredientsTable.headers.ingredient')} ${i + 1}: ${t('recipes.recipeCreate.validation.selectIngredient')}`;
        }
        if (ing.quantity === undefined || ing.quantity <= 0) {
          return `${t('recipes.ingredientsTable.headers.ingredient')} ${i + 1}: ${t('recipes.recipeCreate.validation.quantityGreaterThanZero')}`;
        }
        if (!ing.unit || ing.unit.trim() === '') {
          return `${t('recipes.ingredientsTable.headers.ingredient')} ${i + 1}: ${t('recipes.recipeCreate.validation.unitRequired')}`;
        }
      }

      return null;
    } catch (error) {
      console.error('Validation error:', error);
      return t('recipes.recipeCreate.validation.validationError');
    }
  };

  const handleSave = async () => {
    if (!id) return;

    const validationError = validateForm();
    if (validationError) {
      toast({
        title: t('common.error'),
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    try {
      const { instructionSteps, ...dataToSend } = formData;

      let dataToSendFinal: UpdateRecipeRequest | FormData = dataToSend;

      if (formData.image && formData.image instanceof File) {
        // User uploaded new image
        const formDataToSend = new FormData();

        Object.entries(dataToSend).forEach(([key, value]) => {
          if (key !== 'removeImage' && value !== undefined && value !== null && value !== '') {
            if (value instanceof File) {
              formDataToSend.append(key, value);
            } else if (Array.isArray(value)) {
              formDataToSend.append(key, JSON.stringify(value));
            } else {
              formDataToSend.append(key, value.toString());
            }
          }
        });

        dataToSendFinal = formDataToSend;
      } else if (formData.removeImage) {
        dataToSend.image_url = '';
      } else {
        delete dataToSend.image_url;
      }

      await updateRecipe.mutateAsync({ id, data: dataToSendFinal });
      toast({
        title: t('common.success'),
        description: t('recipes.recipeEdit.success'),
        variant: "default",
        className: "bg-green-500 text-white border-none",
      });
      navigate(`/recipes/${id}`);
    } catch (error: any) {
      console.error('Failed to update recipe:', error);
      const errorMessage = error?.response?.data?.message || t('recipes.recipeEdit.error');
      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const isLoading = recipeLoading;
  const isSaving = updateRecipe.isPending;

  if (isLoading) {
    return (
      <AdminLayout title={t('recipes.recipeEdit.title')}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">{t('recipes.recipeDetail.loading')}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!recipe) {
    return (
      <AdminLayout title={t('recipes.recipeEdit.title')}>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{t('recipes.recipeDetail.notFound')}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t('recipes.recipeEdit.title')}>
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
            {t('recipes.recipeDetail.backToRecipes')}
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
            {isSaving ? t('recipes.recipeEdit.updating') : t('recipes.recipeEdit.updateRecipe')}
          </Button>
        </div>

        {/* Recipe Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t('recipes.recipeEdit.editRecipe', { name: recipe.name })}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold">{t('recipes.recipeCreate.tabs.details')}</TabsTrigger>
                <TabsTrigger value="ingredients" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold">{t('recipes.recipeCreate.tabs.ingredients')}</TabsTrigger>
                <TabsTrigger value="instructions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold">{t('recipes.recipeCreate.tabs.instructions')}</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('recipes.recipeCreate.fields.recipeName')} <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder={t('recipes.recipeCreate.placeholders.enterRecipeName')}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cuisine_type">Cuisine Type</Label>
                    <Input
                      id="cuisine_type"
                      value={formData.cuisine_type || ''}
                      onChange={(e) => handleChange('cuisine_type', e.target.value)}
                      placeholder={t('recipes.recipeCreate.placeholders.cuisineExample')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <ImageUploadWithPreview
                      value={formData.image}
                      existingImageUrl={formData.image_url}
                      onChange={(file) => handleChange('image', file)}
                      onRemove={() => setFormData({ ...formData, removeImage: true })}
                      label={t('recipes.recipeCreate.fields.recipeImage')}
                      placeholder={t('recipes.recipeCreate.placeholders.uploadImage')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty_level">{t('recipes.recipeCreate.fields.difficultyLevel')} <span className="text-red-500">*</span></Label>
                    <select
                      id="difficulty_level"
                      value={formData.difficulty_level}
                      onChange={(e) => handleChange('difficulty_level', e.target.value as "easy" | "medium" | "hard")}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md"
                      required
                    >
                      <option value="">{t('recipes.recipeCreate.difficulty.select')}</option>
                      <option value="easy">{t('recipes.recipeCreate.difficulty.easy')}</option>
                      <option value="medium">{t('recipes.recipeCreate.difficulty.medium')}</option>
                      <option value="hard">{t('recipes.recipeCreate.difficulty.hard')}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prep_time_minutes">{t('recipes.recipeCreate.fields.prepTime')}</Label>
                    <Input
                      id="prep_time_minutes"
                      type="number"
                      min="0"
                      max="1440"
                      value={formData.prep_time_minutes || ''}
                      onChange={(e) => handleChange('prep_time_minutes', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cook_time_minutes">{t('recipes.recipeCreate.fields.cookTime')}</Label>
                    <Input
                      id="cook_time_minutes"
                      type="number"
                      min="0"
                      max="1440"
                      value={formData.cook_time_minutes || ''}
                      onChange={(e) => handleChange('cook_time_minutes', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="servings">{t('recipes.recipeCreate.fields.servings')}</Label>
                    <Input
                      id="servings"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.servings || ''}
                      onChange={(e) => handleChange('servings', parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t('recipes.recipeCreate.fields.description')}</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder={t('recipes.recipeCreate.placeholders.recipeDescription')}
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="ingredients" className="mt-6">
                <DynamicIngredientTable
                  items={formData.ingredients}
                  onChange={handleIngredientsChange}
                  availableIngredients={availableIngredients}
                  onLoadMoreIngredients={loadMoreIngredients}
                  hasMoreIngredients={ingredientHasMore}
                />
              </TabsContent>

              <TabsContent value="instructions" className="mt-6">
                <div className="space-y-2 mb-4">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-2">
                    <span>{t('recipes.recipeCreate.fields.instructions')} <span className="text-red-500">*</span></span>
                  </Label>
                </div>
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

