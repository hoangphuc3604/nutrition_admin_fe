export interface InstructionStep {
  id: string;
  content: string;
}

interface ApiInstruction {
  instruction?: string;
  step_number?: number;
  image_url?: string | null;
  timer_minutes?: number | null;
  ingredients_used?: string[];
}

/**
 * Parse instructions from API (which can be either a string or an array of objects)
 * into an array of InstructionStep objects
 */
export function parseInstructionsToSteps(instructions: string | ApiInstruction[] | undefined | null): InstructionStep[] {
  // Handle null/undefined/empty
  if (!instructions) {
    return [];
  }

  // If it's already an array (API response format), convert it
  if (Array.isArray(instructions)) {
    return instructions
      .filter((step): step is ApiInstruction => step && typeof step === 'object' && 'instruction' in step)
      .map((step, index) => ({
        id: `step-${step.step_number ?? index}`,
        content: step.instruction || ''
      }));
  }

  // If it's a string (legacy format), process as before
  if (typeof instructions !== 'string') {
    return [];
  }

  if (instructions.trim() === '') {
    return [];
  }

  const lines = instructions.split('\n').filter(line => line.trim() !== '');

  return lines.map((line, index) => {
    const trimmedLine = line.trim();

    const numberMatch = trimmedLine.match(/^(\d+)\.\s*(.+)$/);
    if (numberMatch) {
      return {
        id: `step-${index}`,
        content: numberMatch[2].trim()
      };
    }

    return {
      id: `step-${index}`,
      content: trimmedLine
    };
  });
}

export function formatStepsToInstructions(steps: InstructionStep[]): string {
  if (!steps || steps.length === 0) {
    return '';
  }

  return steps
    .filter(step => step.content && step.content.trim() !== '')
    .map((step, index) => `${index + 1}. ${step.content.trim()}`)
    .join('\n');
}

export function createEmptyStep(): InstructionStep {
  return {
    id: `step-${Date.now()}`,
    content: ''
  };
}
