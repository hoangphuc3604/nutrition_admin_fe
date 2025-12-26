import { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Ingredient {
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

interface IngredientAutocompleteProps {
  ingredients: Ingredient[];
  value: string;
  onSelect: (ingredient: Ingredient | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function IngredientAutocomplete({
  ingredients,
  value,
  onSelect,
  placeholder = "Select ingredient...",
  disabled = false
}: IngredientAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const selectedIngredient = ingredients.find(i => i.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={disabled}
        >
          {selectedIngredient ? selectedIngredient.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search ingredient..." />
          <CommandList>
            <CommandEmpty>No ingredient found.</CommandEmpty>
            <CommandGroup>
              {ingredients.map((ingredient) => (
                <CommandItem
                  key={ingredient.id}
                  value={ingredient.name}
                  onSelect={() => {
                    onSelect(ingredient.id === value ? null : ingredient);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === ingredient.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{ingredient.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {ingredient.common_unit ? `${ingredient.common_unit}` : 'No unit'}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
