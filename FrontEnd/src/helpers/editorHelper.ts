import type { AnswerChoice } from '../types/AnswerChoices/AnswerChoice';
import { QuestionType } from '../types/Questions/QuestionType';
import { isEditorEmpty } from '../helpers/textHelper';

import type { EditorJson } from '../types/Editor/EditorJSON'

export interface QuestionEditorState {
    questionId: string | null;        // null in Add mode
    resolvedQuizId: number;

    questionType: QuestionType;       // MC, Numeric, Verbal

    htmlEditorJson?: EditorJson;                     // question text
    //html: string;

    // Multiple Choice
    answerChoices: AnswerChoice[];    // only used if Multiple Choice

    // Short Answer (numeric or verbal)
    //acceptableAnswers: string[];      // raw strings from UI

    // Numeric-only fields
    //formatRestriction: NumericFormatRestriction; // decimal, fraction, either
    //mustBeReduced: boolean;            // only applies if fraction

    // (Optional) metadata
    isPublished: boolean;
}

export function canPublishQuestion(q: QuestionEditorState): boolean {
    if (!questionTextHasContent(q)) return false;

    switch (q.questionType) {
        case QuestionType.MultipleChoice:
            return validateMultipleChoice(q);

        // case QuestionType.NumericShortAnswer:
        //     return validateNumericShortAnswer(q);

        // case QuestionType.VerbalShortAnswer:
        //     return validateVerbalShortAnswer(q);

        default:
            return false;
    }
}

function questionTextHasContent(q: QuestionEditorState): boolean {
    if (!q.htmlEditorJson) return false; // empty editor
    //console.log("Non empty editor: " + JSON.stringify(q.htmlEditorJson));


    return !isEditorEmpty(q.htmlEditorJson);
}

function validateMultipleChoice(q: QuestionEditorState): boolean {
    const choices = q.answerChoices;

    // Must have at least 2 choices
    if (choices.length < 2) return false;

    // No empty choices
    if (choices.some(c => isEditorEmpty(c.editorJson))) return false;
    
    // Must have at least one correct choice
    if (!choices.some(c => c.isCorrect)) return false;

    return true;
}

//For future use
// function validateNumericShortAnswer(q: QuestionEditorState): boolean {
//     if (q.acceptableAnswers.length === 0) return false;

//     for (const ans of q.acceptableAnswers) {
//         if (!isValidNumericAnswer(ans, q.formatRestriction, q.mustBeReduced)) {
//             return false;
//         }
//     }

//     return true;
// }

// function validateVerbalShortAnswer(q: QuestionEditorState): boolean {
//     if (q.acceptableAnswers.length === 0) return false;

//     return q.acceptableAnswers.every(a => a.trim().length > 0);
// }

// function isValidNumericAnswer(
//     raw: string,
//     formatRestriction: NumericFormatRestriction,
//     mustBeReduced: boolean
// ): boolean {

//     const trimmed = raw.trim();
//     if (trimmed.length === 0) return false;

//     // 1. Parse the answer into a numeric value
//     const parsed = parseNumeric(trimmed);
//     if (parsed === null) return false;

//     // 2. Enforce format restrictions
//     if (!passesFormatRestriction(trimmed, parsed, formatRestriction, mustBeReduced)) {
//         return false;
//     }

//     return true;
// }

// function parseNumeric(input: string): number | null {
//     // Decimal?
//     if (!isNaN(Number(input))) {
//         return Number(input);
//     }

//     // Fraction a/b
//     if (input.includes("/")) {
//         const parts = input.split("/").map(p => p.trim());
//         if (parts.length !== 2) return null;

//         const num = Number(parts[0]);
//         const den = Number(parts[1]);
//         if (isNaN(num) || isNaN(den) || den === 0) return null;

//         return num / den;
//     }

//     // Mixed number: a b/c
//     const mixedMatch = input.match(/^(\d+)\s+(\d+)\/(\d+)$/);
//     if (mixedMatch) {
//         const whole = Number(mixedMatch[1]);
//         const num = Number(mixedMatch[2]);
//         const den = Number(mixedMatch[3]);
//         if (den === 0) return null;

//         return whole + num / den;
//     }

//     return null;
// }

// function passesFormatRestriction(
//     raw: string,
//     parsed: number,
//     restriction: NumericFormatRestriction,
//     mustBeReduced: boolean
// ): boolean {

//     const isDecimal = !raw.includes("/");
//     const isFraction = raw.includes("/");

//     switch (restriction) {
//         case "Any":
//             return true;

//         case "DecimalOnly":
//             return isDecimal;

//         case "FractionOnly":
//             if (!isFraction) return false;
//             if (mustBeReduced) return isReducedFraction(raw);
//             return true;

//         default:
//             return false;
//     }
// }

// function isReducedFraction(raw: string): boolean {
//     const [numStr, denStr] = raw.split("/").map(s => s.trim());
//     const num = Number(numStr);
//     const den = Number(denStr);

//     if (isNaN(num) || isNaN(den) || den === 0) return false;

//     const g = gcd(Math.abs(num), Math.abs(den));
//     return g === 1;
// }

// function gcd(a: number, b: number): number {
//     return b === 0 ? a : gcd(b, a % b);
// }