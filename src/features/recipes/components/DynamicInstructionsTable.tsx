import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { InstructionStep, createEmptyStep } from '@/lib/recipe-instructions.utils';

interface DynamicInstructionsTableProps {
  steps: InstructionStep[];
  onChange: (steps: InstructionStep[]) => void;
}

interface SortableStepProps {
  step: InstructionStep;
  index: number;
  hoveredRow: string | null;
  setHoveredRow: (id: string | null) => void;
  onUpdateStep: (index: number, content: string) => void;
  onDeleteStep: (index: number) => void;
}

function SortableStep({
  step,
  index,
  hoveredRow,
  setHoveredRow,
  onUpdateStep,
  onDeleteStep,
}: SortableStepProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-4 border-b border-border last:border-b-0 transition-all duration-200",
        hoveredRow === step.id && "bg-muted/50",
        isDragging && "opacity-50 shadow-lg bg-background z-10"
      )}
      onMouseEnter={() => setHoveredRow(step.id)}
      onMouseLeave={() => setHoveredRow(null)}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded flex-shrink-0"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center">
          {index + 1}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <Input
          value={step.content}
          onChange={(e) => onUpdateStep(index, e.target.value)}
          placeholder="Nhập bước thực hiện..."
          className="shadow-none focus-visible:ring-0 px-0"
        />
      </div>

      <div className="flex-shrink-0">
        {hoveredRow === step.id && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteStep(index)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function DynamicInstructionsTable({ steps, onChange }: DynamicInstructionsTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const addStep = () => {
    onChange([...steps, createEmptyStep()]);
  };

  const removeStep = (index: number) => {
    onChange(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, content: string) => {
    onChange(steps.map((step, i) =>
      i === index ? { ...step, content } : step
    ));
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
      const oldIndex = steps.findIndex(step => step.id === active.id);
      const newIndex = steps.findIndex(step => step.id === over.id);

      const reorderedSteps = arrayMove(steps, oldIndex, newIndex);
      onChange(reorderedSteps);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-foreground">Cooking Instructions</h4>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="border border-border rounded-xl overflow-hidden bg-background">
          <SortableContext items={steps.map(step => step.id)} strategy={verticalListSortingStrategy}>
            {steps.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No instructions added yet. Click "Add Step" to start.
              </div>
            ) : (
              steps.map((step, index) => (
                <SortableStep
                  key={step.id}
                  step={step}
                  index={index}
                  hoveredRow={hoveredRow}
                  setHoveredRow={setHoveredRow}
                  onUpdateStep={updateStep}
                  onDeleteStep={removeStep}
                />
              ))
            )}
          </SortableContext>
        </div>
      </DndContext>

      <Button
        variant="outline"
        size="sm"
        onClick={addStep}
        className="w-full border-dashed"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Step
      </Button>
    </div>
  );
}
