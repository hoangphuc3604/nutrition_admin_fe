import { useState, useEffect } from 'react';
import {
  ChefHat, Clock, Users, Tag, Save, X, Edit2,
  Image as ImageIcon, BookOpen
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DynamicIngredientTable, AvailableIngredient } from './DynamicIngredientTable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRecipe, useCreateRecipe, useUpdateRecipe } from '@/api/recipes.api';
import { useIngredients } from '@/api/ingredients.api';
import { Recipe, Ingredient } from '@/types';

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

interface RecipeDetailDialogProps {
  recipeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'view' | 'edit' | 'create';
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
  ingredients: [],
};

export function RecipeDetailDialog({
  recipeId,
  open,
  onOpenChange,
  mode = 'view'
}: RecipeDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create');
  const [formData, setFormData] = useState<RecipeFormData>(emptyRecipe);

  const { data: recipe, isLoading: recipeLoading } = useRecipe(recipeId || '');
  const { data: ingredientsData } = useIngredients({ limit: 100 });
  const createRecipe = useCreateRecipe();
  const updateRecipe = useUpdateRecipe();

  const availableIngredients = (ingredientsData?.ingredients || []) as AvailableIngredient[];

  useEffect(() => {
    if (mode === 'create') {
      setFormData(emptyRecipe);
      setIsEditing(true);
    } else if (recipe) {
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
        ingredients: recipe.ingredients?.map((ri: any, index: number) => ({
          id: `ingredient-${index}`,
          ingredientId: ri.ingredientId,
          quantity: ri.quantity,
          unit: ri.unit,
          preparationMethod: ri.preparationMethod,
          isOptional: ri.isOptional,
          sortOrder: ri.sortOrder,
        })) || [],
      });
      setIsEditing(mode === 'edit');
    }
  }, [recipe, mode, open]);

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    if (mode === 'create') {
      onOpenChange(false);
    } else {
      setIsEditing(false);
    }
  };

  const handleSave = async () => {
    try {
      if (mode === 'create') {
        await createRecipe.mutateAsync(formData);
      } else if (recipeId) {
        await updateRecipe.mutateAsync({ id: recipeId, data: formData });
      }
      setIsEditing(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save recipe:', error);
    }
  };

  const handleChange = (field: keyof RecipeFormData, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleIngredientsChange = (ingredients: RecipeIngredientForm[]) => {
    setFormData({ ...formData, ingredients });
  };

  const isCreateMode = mode === 'create';
  const title = isCreateMode ? 'Add New Recipe' : isEditing ? 'Edit Recipe' : 'Recipe Details';
  const isLoading = recipeLoading && !isCreateMode;
  const isSaving = createRecipe.isPending || updateRecipe.isPending;

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading recipe...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <div className="relative h-40 bg-gradient-to-br from-primary/80 to-primary overflow-hidden">
          {formData.image_url && (
            <img
              src={formData.image_url}
              alt={formData.name}
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-end justify-between">
              <div>
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Recipe name"
                    className="bg-background/80 backdrop-blur-sm text-xl font-bold mb-2 max-w-md"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-primary-foreground mb-2">{formData.name}</h2>
                )}
                <div className="flex items-center gap-4 text-primary-foreground/80">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{(formData.prep_time_minutes || 0) + (formData.cook_time_minutes || 0)} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">{formData.servings} servings</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button size="sm" variant="secondary" onClick={handleCancel} disabled={isSaving}>
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving}>
                      <Save className="h-4 w-4 mr-1" /> {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="secondary" onClick={handleEdit}>
                    <Edit2 className="h-4 w-4 mr-1" /> Edit
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <ScrollArea className="max-h-[calc(90vh-10rem)]">
          <div className="p-6">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="details" className="gap-2">
                  <ChefHat className="h-4 w-4" /> Details
                </TabsTrigger>
                <TabsTrigger value="ingredients" className="gap-2">
                  <Tag className="h-4 w-4" /> Ingredients
                </TabsTrigger>
                <TabsTrigger value="instructions" className="gap-2">
                  <BookOpen className="h-4 w-4" /> Instructions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Cuisine Type</Label>
                    {isEditing ? (
                      <Input
                        value={formData.cuisine_type || ''}
                        onChange={(e) => handleChange('cuisine_type', e.target.value)}
                        placeholder="e.g., Italian, Asian, Vietnamese"
                      />
                    ) : (
                      <p className="text-foreground font-medium">{formData.cuisine_type || 'Not specified'}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                      <ImageIcon className="h-3.5 w-3.5 inline mr-1" /> Image URL
                    </Label>
                    {isEditing ? (
                      <Input
                        value={formData.image_url || ''}
                        onChange={(e) => handleChange('image_url', e.target.value)}
                        placeholder="https://..."
                      />
                    ) : (
                      <p className="text-foreground font-medium truncate">{formData.image_url || 'No image'}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Difficulty</Label>
                    {isEditing ? (
                      <select
                        value={formData.difficulty_level}
                        onChange={(e) => handleChange('difficulty_level', e.target.value as "easy" | "medium" | "hard")}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    ) : (
                      <p className="text-foreground font-medium capitalize">{formData.difficulty_level}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Prep Time (min)</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        min="0"
                        value={formData.prep_time_minutes || 0}
                        onChange={(e) => handleChange('prep_time_minutes', parseInt(e.target.value) || 0)}
                      />
                    ) : (
                      <p className="text-foreground font-medium">{formData.prep_time_minutes || 0} min</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Cook Time (min)</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        min="0"
                        value={formData.cook_time_minutes || 0}
                        onChange={(e) => handleChange('cook_time_minutes', parseInt(e.target.value) || 0)}
                      />
                    ) : (
                      <p className="text-foreground font-medium">{formData.cook_time_minutes || 0} min</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Servings</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        min="1"
                        value={formData.servings || 1}
                        onChange={(e) => handleChange('servings', parseInt(e.target.value) || 1)}
                      />
                    ) : (
                      <p className="text-foreground font-medium">{formData.servings}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Description</Label>
                  {isEditing ? (
                    <Textarea
                      value={formData.description || ''}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Recipe description..."
                      rows={3}
                    />
                  ) : (
                    <p className="text-foreground">{formData.description || 'No description'}</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="ingredients">
                {isEditing ? (
                  <DynamicIngredientTable
                    items={formData.ingredients}
                    onChange={handleIngredientsChange}
                    availableIngredients={availableIngredients}
                  />
                ) : (
                  <div className="space-y-3">
                    {formData.ingredients.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No ingredients added</p>
                    ) : (
                      <div className="border border-border rounded-xl overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-secondary/50">
                              <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Ingredient</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData.ingredients.map((item, index) => {
                              const ingredient = availableIngredients.find(i => i.id === item.ingredientId);
                              return (
                                <tr key={index} className="border-t border-border">
                                  <td className="py-3 px-4 font-medium">{ingredient?.name || 'Unknown'}</td>
                                  <td className="py-3 px-4 text-muted-foreground">{item.quantity} {item.unit}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="instructions">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Cooking Instructions</Label>
                  {isEditing ? (
                    <Textarea
                      value={formData.instructions || ''}
                      onChange={(e) => handleChange('instructions', e.target.value)}
                      placeholder="Step by step instructions..."
                      rows={10}
                    />
                  ) : (
                    <div className="bg-secondary/30 rounded-xl p-4">
                      <p className="text-foreground whitespace-pre-wrap">
                        {formData.instructions || 'No instructions provided'}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
