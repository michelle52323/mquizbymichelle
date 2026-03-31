export interface LoadAnswerSheetRequestDTO {
    userId: number;
    quizId: number;
}


export interface StudentAnswerSheet {
    assignmentId: number;
    userId: number;
    quizId: number;
    allowMultipleAttempts: boolean;
    mostRecentAttemptId: number | null;
    isActive: boolean;
    attempt: StudentAnswerSheetAttempt;
}

export interface StudentAnswerSheetAttempt {
    attemptId: number;
    dateTaken: string; // ISO string from backend
    isCompleted: boolean;
    isActive: boolean;
    answers: StudentAnswerSheetAnswer[];
}

export interface StudentAnswerSheetAnswer {
    answerSheetEntryId: number;   // maps to StudentQuizAnswers.Id
    questionId: number;
    selectedAnswerId: number | null;
    answerText: string | null;
    timestamp: string;            // ISO string
    isCorrect: boolean | null;
    isActive: boolean;
}

export interface StudentAnswerSheetAnswerDTO
    extends StudentAnswerSheetAnswer {
    quizAttemptId: number;
}



