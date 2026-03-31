import type { EditorJson } from '../../types/Editor/EditorJSON';

// export interface AnswerChoice {
//   id: number;
//   clientId: string,
//   description: string;
//   editorJson: EditorJson;
//   sortOrder: number;
//   isCorrect: boolean;
// }

export interface AnswerChoiceBase {
  id: number;
  description: string;
  sortOrder: number;
  isCorrect: boolean;
}

export interface AnswerChoice extends AnswerChoiceBase {
  clientId: string;
  editorJson: EditorJson;
}

export interface TakerAnswerChoice extends AnswerChoiceBase {
  isSelected?: boolean;
  isRevealed?: boolean;
}
