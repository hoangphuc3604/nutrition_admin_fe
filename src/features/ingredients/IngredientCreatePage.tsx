import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Package, Scale, Tag, Thermometer, Calendar } from 'lucide-react';
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
import { ImageUpload } from '@/components/ui/image-upload';
import { useCreateIngredient } from '@/api/ingredients.api';
import categoriesApi, { Category } from '@/api/categories.api';
import { useToast } from '@/hooks/use-toast';

import { useTranslation } from 'react-i18next';

interface IngredientFormData {
  name: string;
  category_id: string;
  common_unit: string;
  storage_temperature: "frozen" | "refrigerated" | "room_temp";
  shelf_life_days: number;
  description: string;
  image?: File;
}

const units = ['gram', 'kg', 'piece', 'tbsp', 'tsp', 'cup', 'ml', 'liter'];

const emptyForm: IngredientFormData = {
  name: '',
  category_id: '',
  common_unit: 'gram',
  storage_temperature: 'room_temp',
  shelf_life_days: 0,
  description: '',
};

export function IngredientCreatePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [formData, setFormData] = useState<IngredientFormData>(emptyForm);
  const createIngredient = useCreateIngredient();
  const [categories, setCategories] = useState<Category[]>([]);

  const storageTemperatures = [
    { value: 'frozen', label: t('ingredients.frozen') },
    { value: 'refrigerated', label: t('ingredients.refrigerated') },
    { value: 'room_temp', label: t('ingredients.roomTemp') },
  ];

  const handleChange = (field: keyof IngredientFormData, value: string | number | File | undefined) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateForm = (): string | null => {
    if (!formData.name || formData.name.trim() === '') {
      return t('ingredients.validation.nameRequired');
    }
    if (!formData.category_id) {
      return t('ingredients.validation.categoryRequired');
    }
    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast({
        title: t('common.validationError'),
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    try {
      const formDataToSend = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (value instanceof File) {
            formDataToSend.append(key, value);
          } else {
            formDataToSend.append(key, value.toString());
          }
        }
      });

      await createIngredient.mutateAsync(formDataToSend);
      toast({
        title: t('common.success'),
        description: t('ingredients.createSuccess'),
        variant: "default",
        className: "bg-green-500 text-white border-none",
      });
      navigate('/ingredients');
    } catch (error: any) {
      console.error('Failed to create ingredient:', error);
      const errorMessage = error?.response?.data?.message || t('ingredients.createError');
      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const isSaving = createIngredient.isPending;

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

  return (
    <AdminLayout title={t('ingredients.createTitle')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/ingredients')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('ingredients.backToIngredients')}
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
            {isSaving ? t('common.saving') : t('ingredients.create')}
          </Button>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              {t('ingredients.createTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-2 mb-2">
                  <Package className="h-3.5 w-3.5" /> {t('ingredients.name')} *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder={t('ingredients.namePlaceholder')}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Tag className="h-3.5 w-3.5" /> {t('ingredients.category')} *
                  </Label>
                  <Select value={formData.category_id} onValueChange={(v) => handleChange('category_id', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('ingredients.selectCategory')} />
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
                    <Scale className="h-3.5 w-3.5" /> {t('ingredients.unit')}
                  </Label>
                  <Select value={formData.common_unit} onValueChange={(v) => handleChange('common_unit', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>{t(`common.${unit}`) !== `common.${unit}` ? t(`common.${unit}`) : unit}</SelectItem>
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
                  <Thermometer className="h-3.5 w-3.5" /> {t('ingredients.storage')}
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
                  <Calendar className="h-3.5 w-3.5" /> {t('ingredients.shelfLife')}
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
            <ImageUpload
              value={formData.image}
              onChange={(file) => handleChange('image', file)}
              label={t('ingredients.image')}
              placeholder={t('ingredients.noImage')}
            />

            {/* Description */}
            <div>
              <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block">
                {t('ingredients.description')}
              </Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder={t('ingredients.descriptionPlaceholder')}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
