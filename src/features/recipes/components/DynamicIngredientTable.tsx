import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IngredientAutocomplete } from './IngredientAutocomplete';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface IngredientItem {
  ingredientId: string;
  quantity: number;
  unit: string;
  preparationMethod?: string;
  isOptional?: boolean;
  sortOrder?: number;
}

export interface AvailableIngredient {
  id: string;
  name: string;
  category?: any;
  description?: string;
  image_url?: string;
  shelf_life_days?: number;
  storage_temperature?: "frozen" | "refrigerated" | "room_temp";
  common_unit?: string;
  createdAt?: string;
  updatedAt?: string;
  is_active?: boolean;
}

interface DynamicIngredientTableProps {
  items: IngredientItem[];
  onChange: (items: IngredientItem[]) => void;
  availableIngredients: AvailableIngredient[];
}

const units = ['gram', 'kg', 'piece', 'tbsp', 'tsp', 'cup', 'ml', 'liter'];

interface SortableItemProps {
  item: IngredientItem;
  index: number;
  availableIngredients: AvailableIngredient[];
  hoveredRow: string | null;
  setHoveredRow: (id: string | null) => void;
  onIngredientSelect: (index: number, ingredient: AvailableIngredient | null) => void;
  onUpdateItem: (index: number, field: keyof IngredientItem, value: string | number | boolean) => void;
  onDeleteItem: (index: number) => void;
}

function SortableItem({
  item,
  index,
  availableIngredients,
  hoveredRow,
  setHoveredRow,
  onIngredientSelect,
  onUpdateItem,
  onDeleteItem,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: index.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const ingredient = availableIngredients.find(i => i.id === item.ingredientId);

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        "border-t border-border transition-all duration-200",
        hoveredRow === index.toString() && "bg-muted/50",
        isDragging && "opacity-50 shadow-lg bg-background z-10"
      )}
      onMouseEnter={() => setHoveredRow(index.toString())}
      onMouseLeave={() => setHoveredRow(null)}
    >
      <td className="w-8 px-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </td>
      <td className="py-3 px-3">
                      <IngredientAutocomplete
                        ingredients={availableIngredients}
                        value={item.ingredientId}
                        onSelect={(ing) => onIngredientSelect(index, ing)}
                        placeholder="Select ingredient..."
                      />
      </td>
      <td className="py-3 px-3">
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.quantity || ''}
                        onChange={(e) => onUpdateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full"
                        placeholder="0"
                      />
      </td>
      <td className="py-3 px-3">
                      <Select
                        value={item.unit}
                        onValueChange={(v) => onUpdateItem(index, 'unit', v)}
                      >
          <SelectTrigger className="w-24">
            <SelectValue placeholder="Unit" />
          </SelectTrigger>
          <SelectContent>
            {units.map((unit) => (
              <SelectItem key={unit} value={unit}>
                {unit}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="w-12 px-2">
        {hoveredRow === index.toString() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteItem(index)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </td>
    </tr>
  );
}

export function DynamicIngredientTable({ items, onChange, availableIngredients }: DynamicIngredientTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const addRow = () => {
    const newItem: IngredientItem = {
      ingredientId: '',
      quantity: 0,
      unit: 'gram',
    };
    onChange([...items, newItem]);
  };

  const removeRow = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof IngredientItem, value: string | number | boolean) => {
    onChange(items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleIngredientSelect = (rowIndex: number, ingredient: AvailableIngredient | null) => {
    if (ingredient) {
      onChange(items.map((item, i) =>
        i === rowIndex
          ? {
              ...item,
              ingredientId: ingredient.id,
              unit: ingredient.common_unit || 'gram'
            }
          : item
      ));
    } else {
      onChange(items.map((item, i) =>
        i === rowIndex
          ? { ...item, ingredientId: '' }
          : item
      ));
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id as string);
      const newIndex = parseInt(over.id as string);

      const reorderedItems = arrayMove(items, oldIndex, newIndex);

      // Update sortOrder for all items
      const updatedItems = reorderedItems.map((item, index) => ({
        ...item,
        sortOrder: index,
      }));

      onChange(updatedItems);
    }
  };


  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-foreground">Recipe Ingredients</h4>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary/50">
                <th className="w-8 px-2"></th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ingredient</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">Quantity</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-28">Unit</th>
                <th className="w-12 px-2"></th>
              </tr>
            </thead>
            <tbody>
              <SortableContext items={items.map((_, index) => index.toString())} strategy={verticalListSortingStrategy}>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No ingredients added yet. Click "Add Ingredient" to start.
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <SortableItem
                      key={index}
                      item={item}
                      index={index}
                      availableIngredients={availableIngredients}
                      hoveredRow={hoveredRow}
                      setHoveredRow={setHoveredRow}
                      onIngredientSelect={handleIngredientSelect}
                      onUpdateItem={updateRow}
                      onDeleteItem={removeRow}
                    />
                  ))
                )}
              </SortableContext>
            </tbody>
        </table>
        </div>
      </DndContext>

      <Button
        variant="outline"
        size="sm"
        onClick={addRow}
        className="w-full border-dashed"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Ingredient
      </Button>
    </div>
  );
}
