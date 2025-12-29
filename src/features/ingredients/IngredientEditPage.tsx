import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Package, Scale, Tag, Image, Thermometer, Calendar } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploadWithPreview } from '@/components/ui/image-upload-with-preview';
import { useIngredient, useUpdateIngredient } from '@/api/ingredients.api';
import categoriesApi, { Category } from '@/api/categories.api';
import { useToast } from '@/hooks/use-toast';

interface IngredientFormData {
  name: string;
  category_id: string;
  common_unit: string;
  storage_temperature: "frozen" | "refrigerated" | "room_temp";
  shelf_life_days: number;
  description: string;
  image?: File | null;
  image_url?: string;
}

const units = ['gram', 'kg', 'piece', 'tbsp', 'tsp', 'cup', 'ml', 'liter'];
const storageTemperatures = [
  { value: 'frozen', label: 'Frozen' },
  { value: 'refrigerated', label: 'Refrigerated' },
  { value: 'room_temp', label: 'Room Temperature' },
];

// Helper function to find category ID by name
const findCategoryId = (categoryName: string | null, categories: Category[] = []): string => {
  if (!categoryName) return '';
  const category = categories.find(cat => cat.name === categoryName);
  return category?.id || '';
};

export function IngredientEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: ingredient, isLoading: ingredientLoading } = useIngredient(id!);
  const updateIngredient = useUpdateIngredient();

  const [formData, setFormData] = useState<IngredientFormData>({
    name: '',
    category_id: '',
    common_unit: 'gram',
    storage_temperature: 'room_temp',
    shelf_life_days: 0,
    description: '',
    image_url: '',
  });
  const [categories, setCategories] = useState<Category[]>([]);

  // load categories on mount
  useEffect(() => {
    (async () => {
      try {
        const cats = await categoriesApi.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    })();
  }, []);

  // set form data once ingredient and categories are available
  useEffect(() => {
    if (!ingredient) return;
    const categoryId = findCategoryId(ingredient.category, categories);
    setFormData({
      name: ingredient.name,
      category_id: categoryId,
      common_unit: ingredient.common_unit || 'gram',
      storage_temperature: (ingredient.storage_temperature as "frozen" | "refrigerated" | "room_temp") || 'room_temp',
      shelf_life_days: ingredient.shelf_life_days || 0,
      description: ingredient.description || '',
      image: null,
      image_url: ingredient.image_url || '',
    });
  }, [ingredient, categories]);

  const handleChange = (field: keyof IngredientFormData, value: string | number | File | null) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateForm = (): string | null => {
    if (!formData.name || formData.name.trim() === '') {
      return 'Tên nguyên liệu không được để trống';
    }
    if (!formData.category_id) {
      return 'Vui lòng chọn danh mục';
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
      let dataToSend: UpdateIngredientRequest | FormData = formData;

      if (formData.image !== null) {
        const formDataToSend = new FormData();

        Object.entries(formData).forEach(([key, value]) => {
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

        dataToSend = formDataToSend;
      } else if (formData.image === null) {
        const data: UpdateIngredientRequest = { ...formData };
        delete data.image;
        data.image_url = '';
        dataToSend = data;
      }

      await updateIngredient.mutateAsync({
        id,
        data: dataToSend
      });
      toast({
        title: "Thành công",
        description: "Cập nhật nguyên liệu thành công",
        variant: "default",
        className: "bg-green-500 text-white border-none",
      });
      navigate(`/ingredients/${id}`);
    } catch (error: any) {
      console.error('Failed to update ingredient:', error);
      const errorMessage = error?.response?.data?.message || 'Không thể cập nhật nguyên liệu. Vui lòng thử lại.';
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const isLoading = ingredientLoading;
  const isSaving = updateIngredient.isPending;

  if (isLoading) {
    return (
      <AdminLayout title="Edit Ingredient">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading ingredient...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!ingredient) {
    return (
      <AdminLayout title="Edit Ingredient">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Ingredient not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/ingredients')}
          >
            Back to Ingredients
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Ingredient">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/ingredients/${id}`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Ingredient
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

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              Edit Ingredient: {ingredient.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-2 mb-2">
                  <Package className="h-3.5 w-3.5" /> Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter ingredient name"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Tag className="h-3.5 w-3.5" /> Category *
                  </Label>
                  <Select value={formData.category_id} onValueChange={(v) => handleChange('category_id', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Scale className="h-3.5 w-3.5" /> Common Unit
                  </Label>
                  <Select value={formData.common_unit} onValueChange={(v) => handleChange('common_unit', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Storage Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-2 mb-2">
                  <Thermometer className="h-3.5 w-3.5" /> Storage Temperature
                </Label>
                <Select value={formData.storage_temperature} onValueChange={(v: any) => handleChange('storage_temperature', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {storageTemperatures.map((temp) => (
                      <SelectItem key={temp.value} value={temp.value}>{temp.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-2 mb-2">
                  <Calendar className="h-3.5 w-3.5" /> Shelf Life (days)
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.shelf_life_days || ''}
                  onChange={(e) => handleChange('shelf_life_days', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Image Upload */}
            <ImageUploadWithPreview
              value={formData.image}
              existingImageUrl={formData.image_url}
              onChange={(file) => handleChange('image', file)}
              label="Image"
              placeholder="Upload ingredient image"
            />

            {/* Description */}
            <div>
              <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block">
                Description
              </Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Optional description..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
