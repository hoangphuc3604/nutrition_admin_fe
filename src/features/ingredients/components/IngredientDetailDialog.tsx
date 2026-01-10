import { useState, useEffect } from 'react';
import { Package, Scale, Tag, Save, X, Edit2, Image } from 'lucide-react';
import { useCreateIngredient, useUpdateIngredient } from '@/api/ingredients.api';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';

interface IngredientData {
  id: string;
  name: string;
  category?: string;
  category_id?: string;
  common_unit?: string;
  storage_temperature?: "frozen" | "refrigerated" | "room_temp";
  shelf_life_days?: number;
  description?: string;
  image_url?: string;
}

interface IngredientDetailDialogProps {
  ingredient: IngredientData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'view' | 'edit' | 'create';
}

// Categories will be defined using translations in the component
const units = ['gram', 'kg', 'piece', 'tbsp', 'tsp', 'cup', 'ml', 'liter'];
// storageTemperatures will be defined using translations in the component

const emptyIngredient: IngredientData = {
  id: '',
  name: '',
  category: '',
  category_id: '',
  common_unit: 'gram',
  storage_temperature: 'room_temp',
  shelf_life_days: 0,
  description: '',
  image_url: '',
};

export function IngredientDetailDialog({
  ingredient,
  open,
  onOpenChange,
  mode = 'view'
}: IngredientDetailDialogProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create');
  const [formData, setFormData] = useState<IngredientData>(emptyIngredient);

  const categories = [
    { id: '1', name: t('ingredients.categories.protein') },
    { id: '2', name: t('ingredients.categories.vegetables') },
    { id: '3', name: t('ingredients.categories.fruits') },
    { id: '4', name: t('ingredients.categories.grains') },
    { id: '5', name: t('ingredients.categories.dairy') },
    { id: '6', name: t('ingredients.categories.oils') },
    { id: '7', name: t('ingredients.categories.spices') },
    { id: '8', name: t('common.other') },
  ];

  const storageTemperatures = [
    { value: 'frozen', label: t('ingredients.frozen') },
    { value: 'refrigerated', label: t('ingredients.refrigerated') },
    { value: 'room_temp', label: t('ingredients.roomTemp') },
  ];
  const { toast } = useToast();

  const createIngredient = useCreateIngredient();
  const updateIngredient = useUpdateIngredient();

  useEffect(() => {
    if (mode === 'create') {
      setFormData(emptyIngredient);
      setIsEditing(true);
    } else if (ingredient) {
      setFormData(ingredient);
      setIsEditing(mode === 'edit');
    }
  }, [ingredient, mode, open]);

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    if (mode === 'create') {
      onOpenChange(false);
    } else {
      setFormData(ingredient || emptyIngredient);
      setIsEditing(false);
    }
  };

  const handleSave = async () => {
    try {
      if (mode === 'create') {
        await createIngredient.mutateAsync({
          name: formData.name,
          description: formData.description,
          image_url: formData.image_url,
          category_id: formData.category_id,
          shelf_life_days: formData.shelf_life_days,
          storage_temperature: formData.storage_temperature,
          common_unit: formData.common_unit,
        });
        toast({
          title: t('common.success'),
          description: t('ingredients.createSuccess'),
          variant: "default",
          className: "bg-green-500 text-white border-none",
        });
      } else if (mode === 'edit' && ingredient) {
        await updateIngredient.mutateAsync({
          id: ingredient.id,
          data: {
            name: formData.name,
            description: formData.description,
            image_url: formData.image_url,
            category_id: formData.category_id,
            shelf_life_days: formData.shelf_life_days,
            storage_temperature: formData.storage_temperature,
            common_unit: formData.common_unit,
          }
        });
        toast({
          title: t('common.success'),
          description: t('ingredients.updateSuccess'),
          variant: "default",
          className: "bg-green-500 text-white border-none",
        });
      }

      setIsEditing(false);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to save ingredient:', error);
      const errorMessage = error?.response?.data?.message || (isCreateMode ? t('ingredients.createFailed') : t('ingredients.updateFailed'));
      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleChange = (field: keyof IngredientData, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  const isCreateMode = mode === 'create';
  const title = isCreateMode ? t('ingredients.addIngredient') : isEditing ? t('ingredients.editIngredient') : t('ingredients.ingredientDetails');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
            {!isCreateMode && !isEditing && (
              <Button size="sm" variant="outline" onClick={handleEdit}>
                <Edit2 className="h-4 w-4 mr-1" /> {t('ingredients.edit')}
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder={t('ingredients.namePlaceholder')}
                  className="text-lg font-semibold"
                />
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-foreground">{formData.name}</h3>
                  <Badge variant="secondary">{formData.category || t('ingredients.uncategorized')}</Badge>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-2">
                <Tag className="h-3.5 w-3.5" /> {t('ingredients.category')}
              </Label>
              {isEditing ? (
                <Select value={formData.category_id} onValueChange={(v) => handleChange('category_id', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-foreground font-medium">{formData.category || t('ingredients.uncategorized')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-2">
                <Scale className="h-3.5 w-3.5" /> {t('ingredients.unit')}
              </Label>
              {isEditing ? (
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
              ) : (
                <p className="text-foreground font-medium">{formData.common_unit || t('common.na')}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                {t('ingredients.storage')}
              </Label>
              {isEditing ? (
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
              ) : (
                <p className="text-foreground font-medium capitalize">
                  {formData.storage_temperature?.replace('_', ' ') || t('ingredients.roomTemp')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                {t('ingredients.shelfLife')}
              </Label>
              {isEditing ? (
                <Input
                  type="number"
                  min="0"
                  value={formData.shelf_life_days || 0}
                  onChange={(e) => handleChange('shelf_life_days', parseInt(e.target.value) || 0)}
                />
              ) : (
                <p className="text-foreground font-medium">
                  {formData.shelf_life_days || 0} {t('common.days')}
                </p>
              )}
            </div>
          </div>

          {isEditing && (
            <>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-2">
                  <Image className="h-3.5 w-3.5" /> {t('ingredients.image')}
                </Label>
                <Input
                  value={formData.image_url || ''}
                  onChange={(e) => handleChange('image_url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">{t('ingredients.description')}</Label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder={t('ingredients.descriptionPlaceholder')}
                  rows={3}
                />
              </div>
            </>
          )}

          {isEditing && (
            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" /> {t('ingredients.cancel')}
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" /> {isCreateMode ? t('common.save') : t('ingredients.save')}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
