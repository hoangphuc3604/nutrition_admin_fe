import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUpload } from '@/components/ui/image-upload';
import { DynamicIngredientTable, AvailableIngredient } from './components/DynamicIngredientTable';
import { DynamicInstructionsTable } from './components/DynamicInstructionsTable';
import { useCreateRecipe } from '@/api/recipes.api';
import { useIngredients } from '@/api/ingredients.api';
import { useToast } from '@/hooks/use-toast';
import { InstructionStep, parseInstructionsToSteps, formatStepsToInstructions } from '@/lib/recipe-instructions.utils';

interface RecipeFormData {
  name: string;
  description?: string;
  image?: File;
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

const emptyRecipe: RecipeFormData = {
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
};

const createIngredientId = () => `ingredient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export function RecipeCreatePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [formData, setFormData] = useState<RecipeFormData>(emptyRecipe);
  const { toast } = useToast();

  const { data: ingredientsData } = useIngredients({ limit: 100 });
  const createRecipe = useCreateRecipe();

  const availableIngredients = (ingredientsData?.ingredients || []) as AvailableIngredient[];

  const handleChange = (field: keyof RecipeFormData, value: string | number | File | undefined) => {
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
      return 'Tên công thức không được để trống';
    }

    if (!formData.difficulty_level || !['easy', 'medium', 'hard'].includes(formData.difficulty_level)) {
      return 'Mức độ khó phải là easy, medium, hoặc hard';
    }

    if (!formData.instructions || formData.instructions.trim() === '') {
      return 'Hướng dẫn nấu ăn không được để trống';
    }

      if (formData.prep_time_minutes !== undefined && (formData.prep_time_minutes < 0 || formData.prep_time_minutes > 1440)) {
        return 'Thời gian chuẩn bị phải từ 0 đến 1440 phút';
      }

      if (formData.cook_time_minutes !== undefined && (formData.cook_time_minutes < 0 || formData.cook_time_minutes > 1440)) {
        return 'Thời gian nấu phải từ 0 đến 1440 phút';
      }

      if (formData.servings !== undefined && (formData.servings <= 0 || formData.servings > 100)) {
        return 'Số khẩu phần phải từ 1 đến 100';
      }

      if (!formData.ingredients || formData.ingredients.length === 0) {
        return 'Cần ít nhất 1 nguyên liệu';
      }

      for (let i = 0; i < formData.ingredients.length; i++) {
        const ing = formData.ingredients[i];
        if (!ing || !ing.ingredientId || ing.ingredientId.trim() === '') {
          return `Nguyên liệu ${i + 1}: Vui lòng chọn nguyên liệu`;
        }
        if (ing.quantity === undefined || ing.quantity <= 0) {
          return `Nguyên liệu ${i + 1}: Số lượng phải lớn hơn 0`;
        }
        if (!ing.unit || ing.unit.trim() === '') {
          return `Nguyên liệu ${i + 1}: Đơn vị không được để trống`;
        }
      }

      return null;
    } catch (error) {
      console.error('Validation error:', error);
      return 'Lỗi validation form';
    }
  };

  const handleSave = async () => {
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

      const formDataToSend = new FormData();

      Object.entries(dataToSend).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (value instanceof File) {
            formDataToSend.append(key, value);
          } else if (Array.isArray(value)) {
            formDataToSend.append(key, JSON.stringify(value));
          } else {
            formDataToSend.append(key, value.toString());
          }
        }
      });

      await createRecipe.mutateAsync(formDataToSend);
      toast({
        title: "Thành công",
        description: "Tạo công thức thành công",
        variant: "default",
        className: "bg-green-500 text-white border-none",
      });
      navigate('/recipes');
    } catch (error: any) {
      console.error('Failed to create recipe:', error);
      const errorMessage = error?.response?.data?.message || 'Không thể tạo công thức. Vui lòng thử lại.';
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const isSaving = createRecipe.isPending;

  return (
    <AdminLayout title="Create Recipe">
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
            onClick={handleSave}
            disabled={isSaving || !!validateForm()}
            className="gap-2"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? 'Creating...' : 'Create Recipe'}
          </Button>
        </div>

        {/* Recipe Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Recipe</CardTitle>
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
                    <Label htmlFor="name">Recipe Name <span className="text-red-500">*</span></Label>
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
                    <ImageUpload
                      value={formData.image}
                      onChange={(file) => handleChange('image', file)}
                      label="Recipe Image"
                      placeholder="Upload recipe image"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty_level">Difficulty Level <span className="text-red-500">*</span></Label>
                    <select
                      id="difficulty_level"
                      value={formData.difficulty_level}
                      onChange={(e) => handleChange('difficulty_level', e.target.value as "easy" | "medium" | "hard")}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md"
                      required
                    >
                      <option value="">Select difficulty level</option>
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
                      max="1440"
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
                      max="1440"
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
                      max="100"
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
                <div className="space-y-2 mb-4">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-2">
                    <span>Instructions <span className="text-red-500">*</span></span>
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

