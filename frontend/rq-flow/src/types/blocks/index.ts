export type OutlineTableRow = {
  section: string;
  description: string;
  isNew: boolean;
  isEditing: boolean;
  isLoading: boolean;
}

export type ScenarioItem = {
  scenario: string;
  scenarioSuggestions: string[];
  researchOutline: Map<string, string>[] | null;
  hypotheticalAbstract: string| null;
}