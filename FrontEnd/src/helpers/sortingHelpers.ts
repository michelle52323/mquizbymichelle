import type { AnswerChoice } from "src/types/AnswerChoices/AnswerChoice";

export const normalizeSortOrder = (choices: AnswerChoice[]) =>
  choices
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((c, index) => ({
      ...c,
      sortOrder: index + 1,
    }));
