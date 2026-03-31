import type { TakerQuestion } from "../Questions/Question";

// export interface Quiz {
//     id: number;
//     name: string;
//     description: string;
//     sortOrder: number;
//     isPublished: boolean;
// }

export interface QuizBase {
    id: number;
    name: string;
    description: string;
    sortOrder: number;
    isPublished: boolean;
}

export interface Quiz extends QuizBase {
    // no extra fields for the editor
}

export interface TakerQuiz extends QuizBase {
    questions?: TakerQuestion[];
    subjectName: string;
}
