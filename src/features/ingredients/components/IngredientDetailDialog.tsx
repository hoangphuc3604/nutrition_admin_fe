import { useState, useEffect } from 'react';
import { Package, Flame, Scale, Tag, Save, X, Edit2 } from 'lucide-react';
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
  category: string;
  unit: string;
  caloriesPerUnit: number;
  description?: string;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface IngredientDetailDialogProps {
  ingredient: IngredientData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (ingredient: IngredientData) => void;
  mode?: 'view' | 'edit' | 'create';
}

const categories = ['Protein', 'Vegetables', 'Fruits', 'Grains', 'Dairy', 'Oils', 'Spices', 'Other'];
const units = ['gram', 'kg', 'piece', 'tbsp', 'tsp', 'cup', 'ml', 'liter'];

const emptyIngredient: IngredientData = {
  id: '',
  name: '',
  category: 'Protein',
  unit: 'gram',
  caloriesPerUnit: 0,
  description: '',
  protein: 0,
  carbs: 0,
  fat: 0,
};

export function IngredientDetailDialog({
  ingredient,
  open,
  onOpenChange,
  onSave,
  mode = 'view'
}: IngredientDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create');
  const [formData, setFormData] = useState<IngredientData>(emptyIngredient);

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

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
    setIsEditing(false);
    onOpenChange(false);
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
                  <Badge variant="secondary">{formData.category}</Badge>
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
                <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-foreground font-medium">{formData.category}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-2">
                <Scale className="h-3.5 w-3.5" /> Unit
              </Label>
              {isEditing ? (
                <Select value={formData.unit} onValueChange={(v) => handleChange('unit', v)}>
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
                <p className="text-foreground font-medium">{formData.unit}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-2">
              <Flame className="h-3.5 w-3.5" /> Calories per {formData.unit}
            </Label>
            {isEditing ? (
              <Input
                type="number"
                step="0.01"
                value={formData.caloriesPerUnit}
                onChange={(e) => handleChange('caloriesPerUnit', parseFloat(e.target.value) || 0)}
              />
            ) : (
              <p className="text-foreground font-medium">{formData.caloriesPerUnit} kcal</p>
            )}
          </div>

          <div className="bg-secondary/50 rounded-xl p-4">
            <h4 className="font-semibold text-foreground mb-3 text-sm">Macros (per {formData.unit})</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Protein</div>
                {isEditing ? (
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.protein || 0}
                    onChange={(e) => handleChange('protein', parseFloat(e.target.value) || 0)}
                    className="text-center"
                  />
                ) : (
                  <p className="text-lg font-bold text-foreground">{formData.protein || 0}g</p>
                )}
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Carbs</div>
                {isEditing ? (
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.carbs || 0}
                    onChange={(e) => handleChange('carbs', parseFloat(e.target.value) || 0)}
                    className="text-center"
                  />
                ) : (
                  <p className="text-lg font-bold text-foreground">{formData.carbs || 0}g</p>
                )}
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Fat</div>
                {isEditing ? (
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.fat || 0}
                    onChange={(e) => handleChange('fat', parseFloat(e.target.value) || 0)}
                    className="text-center"
                  />
                ) : (
                  <p className="text-lg font-bold text-foreground">{formData.fat || 0}g</p>
                )}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Description</Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Optional description..."
                rows={3}
              />
            </div>
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
