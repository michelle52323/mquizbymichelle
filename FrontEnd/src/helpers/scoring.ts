import type { TakerQuiz } from "src/types/Quiz/Quiz";
import type { TakerQuestion } from "src/types/Questions/Question";
import type { TakerAnswerChoice } from "src/types/AnswerChoices/AnswerChoice";
import { QuestionType } from "../types/Questions/QuestionType";
import { StudentAnswerSheet, StudentAnswerSheetAttempt, StudentAnswerSheetAnswer} from "src/types/StudentAnswerSheet/StudentAnswerSheet";

// ===============================
// Main scoring entry point
// ===============================
export function calculateScore(quiz: TakerQuiz, answerSheet: StudentAnswerSheet) {
    const attempt = answerSheet.attempt;
    const answers = attempt.answers;

    let correct = 0;
    let total = quiz.questions?.length ?? 0;

    if (!quiz.questions) {
        return { correct: 0, total: 0 };
    }

    for (const question of quiz.questions) {
        
        const answerEntry = answers.find(a => a.questionId === question.id) || null;
        
        const isCorrect = scoreQuestionByType(question, answerEntry);
        
        if (isCorrect) {
            correct++;
        }
    }

    return { correct, total };
}

// ===============================
// Dispatcher by question type
// ===============================
function scoreQuestionByType(
    question: TakerQuestion,
    answerEntry: StudentAnswerSheetAnswer | null
): boolean {
    //return scoreMultipleChoice(question, answerEntry);
    //console.log("HERE: " + JSON.stringify(question.questionTypeId));
    switch (question.questionTypeId) {
        case QuestionType.MultipleChoice:
            return scoreMultipleChoice(question, answerEntry);

        case QuestionType.NumericShortAnswer:
            return scoreNumericShortAnswer(question, answerEntry);

        case QuestionType.VerbalShortAnswer:
            return scoreVerbalShortAnswer(question, answerEntry);

        default:
            return false;
    }
}

// ===============================
// Multiple Choice scoring
// ===============================
function scoreMultipleChoice(
    question: TakerQuestion,
    answerEntry: StudentAnswerSheetAnswer | null
): boolean {
    
    // Rule 1: No answer entry → incorrect
    if (!answerEntry) return false;

    // Rule 2: Answer exists but no selected answer → incorrect
    if (answerEntry.selectedAnswerId === null) return false;

    // Find the correct answer choice
    const correctChoice = question.answerChoices?.find(ac => ac.isCorrect);

    if (!correctChoice) return false; // malformed question
    //console.log("***NEW QUESTION ***");
    //console.log ("Selected Answer: " + answerEntry.selectedAnswerId);
    //console.log ("Correct Answer: " + correctChoice.id);
    // Rule 3: selected answer must match correct answer
    return answerEntry.selectedAnswerId === correctChoice.id;
}


// ===============================
// Future scoring types (stubs)
// ===============================
function scoreNumericShortAnswer(
    question: TakerQuestion,
    answerEntry: StudentAnswerSheetAnswer | null
): boolean {
    // TODO: implement numeric scoring
    return false;
}

function scoreVerbalShortAnswer(
    question: TakerQuestion,
    answerEntry: StudentAnswerSheetAnswer | null
): boolean {
    // TODO: implement verbal scoring
    return false;
}

