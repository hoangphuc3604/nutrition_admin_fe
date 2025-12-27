export interface InstructionStep {
  id: string;
  content: string;
}

export function parseInstructionsToSteps(instructions: string): InstructionStep[] {
  if (!instructions || instructions.trim() === '') {
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
