import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { TakerQuiz } from "../../../types/Quiz/Quiz"
import type { TakerQuestion } from "../../../types/Questions/Question"
import type { TakerAnswerChoice } from "../../../types/AnswerChoices/AnswerChoice"
import { QuestionType } from "../../../types/Questions/QuestionType"
import CheckAuth from '../../../components/Account/CheckAuth';
import { getApiBaseUrl } from "../../../helpers/config";
import Loader from "../../../components/UserControls/Loader/Loader";
import { StudentAnswerSheet, LoadAnswerSheetRequestDTO } from "src/types/StudentAnswerSheet/StudentAnswerSheet";

// ---- Types ----
// export interface TakerQuiz {
//     id: number;
//     title: string;
//     description: string;
//     questions: any[]; // you can replace this with a real Question[] interface later
// }

const API_BASE = getApiBaseUrl();

interface QuizContextType {
    quiz: TakerQuiz | null;
    answerSheet: StudentAnswerSheet | null;
    isLoaded: boolean;
    setQuiz: (quiz: TakerQuiz) => void;
    setAnswerSheet: (answerSheet: StudentAnswerSheet) => void;
    setIsLoaded: (value: boolean) => void;
    firstQuestionId: number | null;

    currentQuestionNumber: number;
    setCurrentQuestionNumber: (value: number) => void;

    clearQuiz: () => void;
}

// ---- Context ----
const QuizContext = createContext<QuizContextType | undefined>(undefined);

// ---- Provider ----
export default function QuizProvider({ children }: { children: ReactNode }) {
    //const { id: quizId } = useParams<{ id: string }>();

    const navigate = useNavigate();

    const [auth, setAuth] = useState(null);

    const { quizId } = useParams<{ quizId?: string }>();


    const [quiz, setQuiz] = useState<TakerQuiz | null>(null);
    const [answerSheet, setAnswerSheet] = useState<StudentAnswerSheet | null>(null);

    const [isLoaded, setIsLoaded] = useState(false);
    const [quizIsLoaded, setQuizIsLoaded] = useState(false);
    const [answerSheetIsLoaded, setAnswerSheetIsLoaded] = useState(false);

    const firstQuestionId = quiz?.questions[0]?.id ?? null;
    const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);

    const clearQuiz = () => {
        setQuiz(null);
        setQuizIsLoaded(false);
        setAnswerSheetIsLoaded(false);
    };


    //Check if user is authorized
    useEffect(() => {
        async function hydrateAuth() {
            const result = await CheckAuth();
            setAuth(result);
        }
        hydrateAuth();
    }, []);

    useEffect(() => {
        if (auth === null) return;

        if (!auth.auth) {
            navigate("/signin");
            return;
        }

        const role =
            auth.claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

        if (role !== "Instructor" && role !== "Student") {
            navigate("/dashboard");
            return;
        }

        // allowed roles fall through here
    }, [auth, navigate]);

    //Fetch quiz data
    useEffect(() => {
        if (!auth?.auth) return;
        if (!quizId) return;

        const fetchQuiz = async () => {
            try {
                const response = await fetch(
                    `${API_BASE}/api/QuizTaker/${quizId}`,
                    {
                        credentials: "include"
                    }
                );

                if (!response.ok) {
                    console.error("Failed to fetch quiz taker data");
                    return;
                }

                const data: TakerQuiz = await response.json();
                //console.log("QuizTaker API result:", data);


                setQuiz(data);
                setQuizIsLoaded(true);
                //console.log("Quiz type: " + JSON.stringify(quiz));
                //console.log("QuizTaker API result:\n" + JSON.stringify(quiz, null, 2));

            } catch (err) {
                console.error("Error fetching quiz taker data:", err);
            }
        };

        fetchQuiz();
    }, [auth, quizId]);

    useEffect(() => {
        if (!auth?.auth) return;
        if (!quizId) return;

        const fetchAnswerSheet = async () => {
            try {
                //const userId = 1; // TODO: replace with actual logged-in user ID
                const userId = auth?.claims?.UserId
                    ? Number(auth.claims.UserId)
                    : null;

                const response = await fetch(
                    `${API_BASE}/api/StudentAnswerSheet/load`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        credentials: "include",
                        body: JSON.stringify({
                            userId: userId,
                            quizId: Number(quizId)
                        })
                    }
                );

                if (!response.ok) {
                    console.error("Failed to fetch answer sheet");
                    return;
                }

                const data: StudentAnswerSheet = await response.json();
                setAnswerSheet(data);
                if (!data.attempt.isCompleted) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }

                setAnswerSheetIsLoaded(true);

                //console.log("Quiz type: " + JSON.stringify(answerSheet));
                //console.log("QuizTaker API result:\n" + JSON.stringify(answerSheet, null, 2));

            } catch (err) {
                console.error("Error fetching answer sheet:", err);
            }
        };

        fetchAnswerSheet();
    }, [auth, quizId]);

    useEffect(() => {
        if (quizIsLoaded && answerSheetIsLoaded) {
            setIsLoaded(true);
        }
    }, [quizIsLoaded, answerSheetIsLoaded]);

    //Copy answer sheet answers into quiz
    function mergeAnswerSheetIntoQuiz(quiz: TakerQuiz, sheet: StudentAnswerSheet) {
        //Retrive all answer sheet records.  If a record does not exist, do not add it to the map
        const answerMap = new Map(
            sheet.attempt.answers.map(a => [a.questionId, a.selectedAnswerId])
        );

        //Iterate through quiz, all questions and answer choices
        //if answer sheet selected answer matches answer choice (must match AND be NOT NULL),
        //mark as selected
        quiz.questions.forEach(question => {
            const savedAnswerId = answerMap.get(question.id);

            question.answerChoices.forEach(choice => {
                choice.isSelected = (choice.id === savedAnswerId);
            });
        });

        return quiz;
    }

    useEffect(() => {
        if (!quizIsLoaded || !answerSheetIsLoaded) return;

        const mergedQuiz = mergeAnswerSheetIntoQuiz(quiz, answerSheet);
        setQuiz(mergedQuiz);

    }, [quizIsLoaded, answerSheetIsLoaded]);



    if (!isLoaded) {
        return <Loader message="Loading quiz..." />;
    }


    if (auth === null) return <div>Loading quiz...</div>;
    if (!auth.auth) return null;

    return (
        <QuizContext.Provider value={{
            quiz, answerSheet, isLoaded, setQuiz, setAnswerSheet, setIsLoaded, firstQuestionId,
            currentQuestionNumber, setCurrentQuestionNumber, clearQuiz
        }}>
            {children}
        </QuizContext.Provider>
    );
}

// ---- Hook ----
export function useQuiz() {
    const context = useContext(QuizContext);
    if (!context) {
        throw new Error("useQuiz must be used inside a QuizProvider");
    }
    return context;
}
