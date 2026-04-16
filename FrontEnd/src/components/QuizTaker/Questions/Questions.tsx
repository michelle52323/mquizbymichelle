import { useEffect, useState } from 'react';
import { useOutletContext, useParams, useNavigate, useLocation } from 'react-router-dom';
import type { LayoutContext } from '../../Layout';
import { getApiBaseUrl } from '../../../helpers/config';
import ButtonGrid from '../../../components/UserControls/ButtonGrid/ButtonGrid';
import { useQuiz } from "../../QuizTaker/QuizProvider/QuizProvider";
import { renderMathInHtml } from '../../../helpers/mathHelper';
import { StudentAnswerSheetAnswer, StudentAnswerSheetAnswerDTO } from "src/types/StudentAnswerSheet/StudentAnswerSheet";

import Icon from '../../UserControls/Icons/icons';
import '../../../multiple-choice-selection.css';

import "./questions.css";

const API_BASE = getApiBaseUrl();

export default function Questions() {

    const {
        quiz,
        setQuiz,
        answerSheet,
        setAnswerSheet,
        firstQuestionId,
        currentQuestionNumber,
        setCurrentQuestionNumber
    } = useQuiz();

    const navigate = useNavigate();
    const { setTitle, setBanner } = useOutletContext<LayoutContext>();
    //const [auth, setAuth] = useState(null);

    const { questionId } = useParams<{ questionId: string }>();

    const questionIndex = currentQuestionNumber - 1;
    const question = quiz.questions[questionIndex];

    const totalQuestions = quiz.questions.length;

    const isFirstQuestion = currentQuestionNumber === 1;
    const isLastQuestion = currentQuestionNumber === totalQuestions;

    const disablePrevious = isFirstQuestion;
    const showCompleteQuiz = isLastQuestion;



    useEffect(() => {
        if (quiz) {
            setTitle(quiz.name);   // or quiz.name depending on your DTO
        }
    }, [quiz, setTitle]);

    useEffect(() => {

        return () => {

            setBanner('');

        };
    }, []);

    useEffect(() => {

        if (answerSheet.attempt.isCompleted)
            navigate(`/quiz/${quiz.id}/score`, { replace: true });

    }, [answerSheet]);



    useEffect(() => {
        if (!quiz || !questionId) return;

        const qid = Number(questionId);
        const index = quiz.questions.findIndex(q => q.id === qid);
        setCurrentQuestionNumber(index + 1);

    }, [quiz, questionId]);


    // useEffect(() => {
    //     async function hydrateAuth() {
    //         const result = await CheckAuth();
    //         setAuth(result);
    //     }
    //     hydrateAuth();
    // }, []);

    // useEffect(() => {
    //     if (auth === null) return;

    //     if (!auth.auth) {
    //         navigate("/signin");
    //         return;
    //     }

    //     const role =
    //         auth.claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    //     if (role !== "Instructor" && role !== "Student") {
    //         navigate("/dashboard");
    //         return;
    //     }

    //     // allowed roles fall through here
    // }, [auth, navigate, setTitle]);

    const handleCorrectSelected = async (choiceId) => {
        updateAnswerSelectionQuiz(choiceId);
        updateAnswerSheet(choiceId);
        const latest = getLatestAnswerSheetEntry();
        const dto = buildSaveAnswerSheetDTO(latest);
        //console.log("Entry Id: " + dto.answerSheetEntryId);
        await saveAnswerToServer(dto);
        //console.log("Quiz type: " + JSON.stringify(quiz));
        //console.log("QuizTaker API result:\n" + JSON.stringify(answerSheet, null, 2));
    };

    const updateAnswerSelectionQuiz = (choiceId) => {
        setQuiz(prev => {
            const updatedQuestions = [...prev.questions];
            const qIndex = currentQuestionNumber - 1;

            const updatedChoices = updatedQuestions[qIndex].answerChoices.map(c => ({
                ...c,
                isSelected: c.id === choiceId
            }));

            updatedQuestions[qIndex] = {
                ...updatedQuestions[qIndex],
                answerChoices: updatedChoices
            };

            return {
                ...prev,
                questions: updatedQuestions
            };
        });
    };

    const updateAnswerSheet = (choiceId) => {
        const existing = answerSheet.attempt.answers.find(
            a => a.questionId.toString() === questionId
        );

        if (!existing) {
            answerSheet.attempt.answers.push({
                answerSheetEntryId: -1,            // placeholder until DB assigns real ID
                questionId: Number(questionId),
                selectedAnswerId: choiceId,
                answerText: null,                 // no text for MCQ
                timestamp: new Date().toISOString(),
                isCorrect: null,                  // not evaluated yet
                isActive: true                    // default
            });


        } else {
            existing.selectedAnswerId = choiceId;
        }

        setAnswerSheet({ ...answerSheet });

    }

    const getLatestAnswerSheetEntry = (): StudentAnswerSheetAnswer | null => {
        const entry = answerSheet.attempt.answers.find(
            a => a.questionId.toString() === questionId
        );

        return entry ?? null;
    };


    const buildSaveAnswerSheetDTO = (
        latest: StudentAnswerSheetAnswer
    ): StudentAnswerSheetAnswerDTO => {
        return {
            answerSheetEntryId: latest.answerSheetEntryId,
            questionId: latest.questionId,
            selectedAnswerId: latest.selectedAnswerId,
            answerText: latest.answerText,
            timestamp: latest.timestamp,
            isCorrect: latest.isCorrect,
            isActive: latest.isActive,
            quizAttemptId: answerSheet.attempt.attemptId
        };

    };

    const UpdateAnswerSheetEntryId = (result: {
        success: boolean;
        answerSheetEntryId: number | null;
    }) => {
        // If no new ID was returned, do nothing
        if (!result || result.answerSheetEntryId == null) {
            return;
        }

        const newId = result.answerSheetEntryId;

        // Get the most recently added or updated entry
        const latest = getLatestAnswerSheetEntry();
        if (!latest) return;

        // Patch the new DB ID into the entry
        latest.answerSheetEntryId = newId;

        // Trigger React to re-render by replacing the answers array reference
        setAnswerSheet(prev => ({
            ...prev,
            attempt: {
                ...prev.attempt,
                answers: [...prev.attempt.answers]
            }
        }));

    };




    const saveAnswerToServer = async (dto: StudentAnswerSheetAnswerDTO) => {
        try {
            const response = await fetch(`${API_BASE}/api/StudentAnswerSheet/save-answer`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dto)
            });

            if (!response.ok) {
                console.error("Failed to save answer:", response.status);
                return null;
            }

            const result = await response.json();
            UpdateAnswerSheetEntryId(result);
            //console.log("Quiz type: " + JSON.stringify(quiz));
            //console.log("QuizTaker API result:\n" + JSON.stringify(answerSheet, null, 2));
            return result;
        } catch (err) {
            console.error("Error saving answer:", err);
            return null;
        }
    };


    const handlePrevious = () => {
        const total = quiz.questions.length;
        const index = currentQuestionNumber - 1; // zero-based

        if (index <= 0) return; // safety guard

        const previousQuestionId = quiz.questions[index - 1].id;

        navigate(`/quiz/${quiz.id}/questions/${previousQuestionId}`);
    };


    const handleNext = () => {
        const total = quiz.questions.length;
        const index = currentQuestionNumber - 1; // zero-based

        if (showCompleteQuiz) {
            navigate(`/quiz/${quiz.id}/review`);
            return;
        }

        const nextQuestionId = quiz.questions[index + 1].id;

        navigate(`/quiz/${quiz.id}/questions/${nextQuestionId}`);
    };


if (!answerSheet.attempt.isCompleted)
    return (
        <>
            <form id="page-form">
                <div className="page-container w-100">
                    <div className="content-holder-desktop quiz-page-content">

                        {/* Progress bar (Question X of Y) */}
                        <div className="quiz-taker-progress-bar">
                            <span className="student-question-number">Question {currentQuestionNumber} of {quiz.questions.length}</span>
                        </div>

                        <div className="student-quiz-main pt-2">
                            {/* <div className="student-quiz-left-padding"></div> */}
                            <div className="student-quiz-left student-quiz-main-section">
                                <div className="student-quiz-section-content">
                                    <div className="student-question-overflow-box inner-content-background">


                                        <div className="student-question-header ps-3 pt-2">
                                            Question {currentQuestionNumber}
                                        </div>

                                        {/* Question text */}
                                        <div
                                            className="student-question-text ps-3"
                                            dangerouslySetInnerHTML={{ __html: renderMathInHtml(question.description) }}
                                        />
                                        <div className="pb-3"></div>
                                        {/* Answer choices */}
                                        <div className="student-answer-choices">
                                            {question.answerChoices.map((choice, index) => (
                                                <div key={choice.id} className="student-answer-choice-row">

                                                    {/* Letter (A, B, C, …) */}
                                                    <div className="student-answer-letter col-2">
                                                        {String.fromCharCode(65 + index)}
                                                    </div>

                                                    {/* Main answer text */}
                                                    <div
                                                        className="student-answer-text col-8"
                                                        dangerouslySetInnerHTML={{ __html: renderMathInHtml(choice.description) }}
                                                    />

                                                    {/* Radio placeholder */}
                                                    <div className="student-answer-radio-placeholder col-2">
                                                        {/* radio goes here later */}
                                                        <label className="answer-choice-radio ">
                                                            {choice.isSelected ? (
                                                                <span className="selected-answer-choice-margin-neutralizer">
                                                                    <Icon name="answerSelected" width={22} height={22} />
                                                                </span>

                                                            ) : (
                                                                <>
                                                                    <span className="answer-choice-margin-neutralizer">
                                                                        <input
                                                                            type="radio"
                                                                            onChange={() => handleCorrectSelected(choice.id)}
                                                                        />
                                                                        <span className="circle"></span>
                                                                    </span>

                                                                </>
                                                            )}
                                                        </label>

                                                    </div>

                                                </div>
                                            ))}
                                        </div>
                                        <div className="pb-2"></div>


                                    </div>
                                </div>

                            </div>

                        </div>
                    </div>
                </div>
            </form>
            {/* BUTTON GRID */}
            <ButtonGrid
                buttons={[
                    {
                        text: "Previous",
                        onClick: handlePrevious,
                        icon: <Icon name="leftArrow" />,
                        type: "button",
                        mobileSlot: 1,
                        desktopSlot: 1,
                        isDisabled: disablePrevious
                    },
                    {
                        text: showCompleteQuiz ? "Complete Quiz" : "Next",
                        onClick: handleNext,
                        icon: showCompleteQuiz ? null : <Icon name="rightArrow" />,
                        type: "button",
                        mobileSlot: 3,
                        desktopSlot: 5
                    }
                ]}
            />

        </>
    );
else
    return(<></>);

}
