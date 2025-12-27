import { useState, useEffect } from 'react';
import { Package, Scale, Tag, Save, X, Edit2, Image } from 'lucide-react';
import { useCreateIngredient, useUpdateIngredient } from '@/api/ingredients.api';
import { useToast } from '@/hooks/use-toast';
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

const categories = [
  { id: '1', name: 'Protein' },
  { id: '2', name: 'Vegetables' },
  { id: '3', name: 'Fruits' },
  { id: '4', name: 'Grains' },
  { id: '5', name: 'Dairy' },
  { id: '6', name: 'Oils' },
  { id: '7', name: 'Spices' },
  { id: '8', name: 'Other' },
];
const units = ['gram', 'kg', 'piece', 'tbsp', 'tsp', 'cup', 'ml', 'liter'];
const storageTemperatures = [
  { value: 'frozen', label: 'Frozen' },
  { value: 'refrigerated', label: 'Refrigerated' },
  { value: 'room_temp', label: 'Room Temperature' },
];

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
  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create');
  const [formData, setFormData] = useState<IngredientData>(emptyIngredient);
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
          title: "Thành công",
          description: "Tạo nguyên liệu thành công",
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
          title: "Thành công",
          description: "Cập nhật nguyên liệu thành công",
          variant: "default",
          className: "bg-green-500 text-white border-none",
        });
      }

      setIsEditing(false);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to save ingredient:', error);
      const errorMessage = error?.response?.data?.message || 'Không thể lưu nguyên liệu. Vui lòng thử lại.';
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleChange = (field: keyof IngredientData, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  const isCreateMode = mode === 'create';
  const title = isCreateMode ? 'Add New Ingredient' : isEditing ? 'Edit Ingredient' : 'Ingredient Details';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
            {!isCreateMode && !isEditing && (
              <Button size="sm" variant="outline" onClick={handleEdit}>
                <Edit2 className="h-4 w-4 mr-1" /> Edit
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
                  placeholder="Ingredient name"
                  className="text-lg font-semibold"
                />
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-foreground">{formData.name}</h3>
                  <Badge variant="secondary">{formData.category || 'Uncategorized'}</Badge>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-2">
                <Tag className="h-3.5 w-3.5" /> Category
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
                <p className="text-foreground font-medium">{formData.category || 'Uncategorized'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-2">
                <Scale className="h-3.5 w-3.5" /> Common Unit
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
                <p className="text-foreground font-medium">{formData.common_unit || 'N/A'}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                Storage Temperature
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
                  {formData.storage_temperature?.replace('_', ' ') || 'Room Temperature'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                Shelf Life (days)
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
                  {formData.shelf_life_days || 0} days
                </p>
              )}
            </div>
          </div>

          {isEditing && (
            <>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-2">
                  <Image className="h-3.5 w-3.5" /> Image URL
                </Label>
                <Input
                  value={formData.image_url || ''}
                  onChange={(e) => handleChange('image_url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Description</Label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Optional description..."
                  rows={3}
                />
              </div>
            </>
          )}

          {isEditing && (
            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" /> {isCreateMode ? 'Create' : 'Save'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
