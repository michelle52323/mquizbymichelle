export enum QuestionType {
    MultipleChoice = 1,
    NumericShortAnswer = 2,
    VerbalShortAnswer = 3
}

export function mapStringToQuestionType(s: string): QuestionType | null {
    switch (s.trim()) {
        case "Multiple Choice":
            return QuestionType.MultipleChoice;
        case "Numeric Short Answer":
            return QuestionType.NumericShortAnswer;
        case "Verbal Short Answer":
            return QuestionType.VerbalShortAnswer;
        default:
            return null;
    }
}