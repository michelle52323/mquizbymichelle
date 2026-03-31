import type { AnswerChoice, TakerAnswerChoice } from "../AnswerChoices/AnswerChoice";
import { QuestionType } from "../Questions/QuestionType";



// export interface Question {
//     id: number;
//     description: string;
//     sortOrder: number;
//     answerChoices?: AnswerChoice[];
//     isPublished: boolean;
// }

export interface QuestionBase {
    id: number;
    description: string;
    sortOrder: number;
    isPublished: boolean;
}

export interface Question extends QuestionBase {
    answerChoices?: AnswerChoice[];
}

export interface TakerQuestion extends QuestionBase {
    answerChoices?: TakerAnswerChoice[];
    questionType: QuestionType;
}