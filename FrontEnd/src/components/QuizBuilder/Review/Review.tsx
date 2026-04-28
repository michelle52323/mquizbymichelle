import React, { useState, useEffect, useMemo } from 'react';
import { isMobileTouchDevice } from '../../../helpers/config';
import ProgressBar from "../../UserControls/ProgressBar/ProgressBar";
import { useOutletContext, useParams, useNavigate, useLocation } from 'react-router-dom';
import { getApiBaseUrl } from '../../../helpers/config';
import CheckAuth from '../../../components/Account/CheckAuth';
import Icon from '../../UserControls/Icons/icons'
import ButtonGrid from "../../UserControls/ButtonGrid/ButtonGrid";
import type { Quiz } from 'src/types/Quiz/Quiz';
import type { Question } from 'src/types/Questions/Question';
import type { AnswerChoice } from 'src/types/AnswerChoices/AnswerChoice';
import { renderMathInHtml } from '../../../helpers/mathHelper';

import { InlineMathNode } from "../../../extensions/InlineMathNode"
import { isEditorEmpty } from '../../../helpers/textHelper';
import type { EditorJson } from '../../../types/Editor/EditorJSON';
import { generateJSON } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';

// -------------------------------------------------------------
// Temporary stub functions (replace later with LaTeX-aware logic)
// -------------------------------------------------------------
function isQuestionEmpty(question: Question): boolean {
    return false; // stub for now
}

function isAnswerChoiceEmpty(ac: AnswerChoice): boolean {
    //return false; // stub for now

    return (isEditorEmpty(ac.editorJson));

}

// -------------------------------------------------------------
// Evaluate a single question and return errors, warnings, and icon
// -------------------------------------------------------------
function evaluateQuestion(question: Question) {
    const errors: string[] = [];
    const warnings: string[] = [];

    // --- WARNINGS ---
    if (!question.isPublished) {
        warnings.push("Question is not published");
    }

    // --- ERRORS ---
    // 1. Empty question description
    if (isQuestionEmpty(question)) {
        errors.push("Question text is empty");
    }

    // 2. Missing or empty answer choices
    const ac = question.answerChoices ?? [];

    if (ac.length < 2) {
        errors.push("Question must have at least 2 answer choices");
    }

    // 3. Empty answer choice text
    for (const choice of ac) {
        if (isAnswerChoiceEmpty(choice)) {
            errors.push("One or more answer choices are empty");
            break;
        }
    }

    // 4. No correct answer
    const hasCorrect = ac.some(c => c.isCorrect === true);
    if (!hasCorrect) {
        errors.push("No answer choice is marked correct");
    }

    // --- ICON LOGIC ---
    let icon: "success" | "warning" | "error" = "success";

    if (errors.length > 0) {
        icon = "error";
    } else if (warnings.length > 0) {
        icon = "warning";
    }

    return { errors, warnings, icon };
}

interface ReportItem {
    question: Question;
    errors: string[];
    warnings: string[];
    icon: "success" | "warning" | "error";
}


export default function Review() {
    const { id } = useParams<{ id?: string }>();
    //console.log("***ID:" + id    );

    const navigate = useNavigate();
    const { setTitle, setBanner } = useOutletContext();
    const [auth, setAuth] = useState(null);
    const [report, setReport] = useState<ReportItem[]>([]);
    const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

    const [quiz, setQuiz] = useState<Quiz>();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [canPublish, setCanPublish] = useState(false);
    const [quizIsPublished, setQuizIsPublished] = useState(false);

    const API_BASE = getApiBaseUrl();

    useEffect(() => {
        CheckAuth().then(setAuth);
    }, []);

    useEffect(() => {
        if (!auth) return;

        if (!auth.auth) {
            navigate('/signin');
            return;
        }

        const role = auth.claims?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        if (role !== 'Instructor') {
            navigate('/dashboard');
            return;
        }


    }, [auth, navigate]);

    useEffect(() => {
        if (!auth || !auth.auth) return;
        if (!id) return;

        const fetchQuizInfo = async () => {
            try {
                const response = await fetch(
                    `${getApiBaseUrl()}/api/QuizInfo/${id}`,
                    { credentials: "include" }
                );

                if (!response.ok) {
                    console.error("Failed to fetch quiz info");
                    return;
                }

                const data = await response.json();
                setQuiz(data);

                setTitle(`${data.name}`);
                setQuizIsPublished(data.isPublished);

            } catch (error) {
                console.error("Error fetching quiz info:", error);
            }
        };

        fetchQuizInfo();
    }, [auth, id]);


    useEffect(() => {
        if (!auth || !auth.auth) return;
        if (!id) return;

        const fetchAllData = async () => {
            try {
                // 1. Fetch all questions
                const qResponse = await fetch(
                    `${getApiBaseUrl()}/api/Questions/${id}/questions`,
                    { credentials: "include" }
                );

                if (!qResponse.ok) {
                    console.error("Failed to fetch questions");
                    return;
                }

                const questions = await qResponse.json();

                // 2. Fetch answer choices for each question in parallel
                const enrichedQuestions = await Promise.all(
                    questions.map(async (q) => {
                        try {
                            const acResponse = await fetch(
                                `${getApiBaseUrl()}/api/AnswerChoices/${q.id}`,
                                { credentials: "include" }
                            );

                            if (!acResponse.ok) {
                                console.error(`Failed to fetch answer choices for question ${q.id}`);
                                return { ...q, answerChoices: [] };
                            }

                            // const answerChoices = await acResponse.json();
                            // return { ...q, answerChoices };
                            const answerChoices = await acResponse.json();

                            const hydratedChoices = answerChoices.map(ac => ({
                                ...ac,
                                editorJson: generateJSON(ac.description ?? "", [
                                    StarterKit,
                                    InlineMathNode
                                ])

                            }));



                            return { ...q, answerChoices: hydratedChoices };

                        } catch (err) {
                            console.error(`Error fetching answer choices for question ${q.id}`, err);
                            return { ...q, answerChoices: [] };
                        }
                    })
                );

                // 3. Log the final enriched result
                //console.log("Final Questions:", enrichedQuestions);

                setQuestions(enrichedQuestions);

            } catch (error) {
                console.error("Error fetching questions or answer choices:", error);
            }
        };

        fetchAllData();
    }, [auth, id]);

    useEffect(() => {
        //console.log("@@@questions at evaluation time:", questions);

        if (!quiz) return;
        if (!questions || questions.length === 0) return;

        const newReport: ReportItem[] = [];

        let publishedQuestionCount = 0;
        let publishedQuestionsWithErrors = 0;

        for (const q of questions) {
            const { errors, warnings, icon } = evaluateQuestion(q);

            // Count published questions
            if (q.isPublished) {
                publishedQuestionCount++;

                // Only errors on published questions matter
                if (errors.length > 0) {
                    publishedQuestionsWithErrors++;
                }
            }

            newReport.push({
                question: q,
                errors,
                warnings,
                icon
            });
        }

        // Store the report
        setReport(newReport);

        // Compute canPublish
        let can = true;

        // Rule 1: Quiz already published → canPublish irrelevant, but set false
        if (quiz.isPublished) {
            can = false;
        } else {
            // Rule 2: Must have at least one published question
            if (publishedQuestionCount === 0) {
                can = false;
            }

            // Rule 3: No published question may have errors
            if (publishedQuestionsWithErrors > 0) {
                can = false;
            }
        }

        setCanPublish(can);

    }, [quiz, questions]);

    async function publishHandler() {
        setBanner('');
        const success = await publishQuiz(id);

        if (!success) {
            // You can replace this with a banner, toast, modal, etc.
            console.error("Failed to publish quiz");
            return;
        }

        // Optional: update state
        setQuizIsPublished(true);

        setBanner('Quiz successfully published!');

        // Optional: navigate somewhere
        // navigate("/quizbuilder/myquizzes");

        // Optional: show success banner
        // setShowPublishSuccess(true);
    }

    function handleNavigationMyQuizzes() {
        setBanner('');
        navigate("/quizbuilder/myquizzes");
    }

    function handleNavigationQuestionsList() {
        setBanner('');
        navigate(`/quizbuilder/questions/${id}`);
    }




    async function publishQuiz(quizId) {
        const response = await fetch(`${API_BASE}/api/QuizInfo/publish/${quizId}`, {
            method: "POST"
        });

        if (!response.ok) {
            return false;
        }

        return true;
    }



    function renderReport() {
        if (!report || report.length === 0) {
            return (
                <div >
                    <div className="empty-grid">No questions found.</div>
                </div>
            );
        }

        return (
            <div className={`grid-overflow-box ${isMobileTouchDevice() ? "gof-mobile-short" : "gof-short"}`}>

                {report.map((item, i) => {
                    const counter = i + 1;
                    const { question, errors, warnings, icon } = item;

                    const idKey = String(question.id);
                    const isOpen = openMap[idKey] ?? false;

                    return (
                        <div
                            key={idKey}
                            className="grid-page-row gof-row"
                            onClick={() =>
                                setOpenMap(prev => ({
                                    ...prev,
                                    [idKey]: !isOpen
                                }))
                            }
                            style={{ cursor: "pointer" }}
                        >
                            {/* ICON + QUESTION TEXT */}
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <span className="col-1"><strong>{counter}</strong></span>
                                <span
                                    className="col-10"
                                    style={{ marginLeft: "10px" }}
                                    dangerouslySetInnerHTML={{
                                        __html: renderMathInHtml(question.description ?? "(Untitled Question)")
                                    }}
                                />

                                <span className="col-1">
                                    <Icon name={icon} />
                                </span>

                            </div>

                            {/* EXPANDABLE ERRORS/WARNINGS */}
                            <div
                                className={
                                    isOpen
                                        ? "accordion-content show"
                                        : "accordion-content"
                                }
                            >
                                {/* <div className="accordion-content-inner">
                                    {errors.length > 0 && (
                                        <div>
                                            {errors.map((e, i) => (
                                                <div key={i}>{e}</div>
                                            ))}
                                        </div>
                                    )}

                                    {warnings.length > 0 && (
                                        <div style={{ marginTop: errors.length > 0 ? "8px" : "0" }}>
                                            {warnings.map((w, i) => (
                                                <div key={i}>{w}</div>
                                            ))}
                                        </div>
                                    )}
                                </div> */}
                                <div className="accordion-content-inner">

                                    {errors.length > 0 && (
                                        <div className="mb-2">
                                            {errors.map((e, i) => (
                                                <div key={i} className="d-flex align-items-start mb-1">
                                                    <div className="col-11">
                                                        {e}
                                                    </div>
                                                    <div className="col-1 d-flex justify-content-center">
                                                        <Icon name="error" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {warnings.length > 0 && (
                                        <div>
                                            {warnings.map((w, i) => (
                                                <div key={i} className="d-flex align-items-start mb-1">
                                                    <div className="col-11">
                                                        {w}
                                                    </div>
                                                    <div className="col-1 d-flex justify-content-center">
                                                        <Icon name="warning" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                </div>

                            </div>
                        </div>
                    );
                })
                }
            </div >
        );
    }



    return (
        <div>
            <div className={isMobileTouchDevice() ? "content-holder-mobile" : "content-holder-desktop"}>
                <ProgressBar />

                {/* REPORT */}
                <div className={`content-inner-desktop mt-3 ${isMobileTouchDevice() ? "grid-overflow-box" : ""}`}
>
                    {!quizIsPublished && (
                        <div className="mb-3">
                            <strong>Please review this report carefully before publishing your quiz.</strong>
                            <p>
                                Any question with errors must be corrected before the quiz can be published.
                                Warnings will not block publishing, but they may still affect clarity or student
                                experience. Unpublished questions are allowed, but they will not appear in the
                                version students take.
                            </p>
                        </div>
                    )}

                    {quizIsPublished && (
                        <div className="mb-3">
                            <strong>Please review this report to ensure your published quiz remains accurate and functional.</strong>
                            <p>
                                Although the quiz is already live, any question with critical errors may negatively
                                affect the student experience. Warnings indicate areas that may need attention but
                                do not prevent students from completing the quiz.
                            </p>
                        </div>
                    )}

                    {renderReport()}
                </div>

            </div>


            <div className="button-grid"></div>


            <ButtonGrid
                buttons={[
                    {
                        text: "Questions",
                        type: "button",
                        onClick: handleNavigationQuestionsList,
                        mobileSlot: 1,
                        desktopSlot: 1
                    },
                    {
                        text: "My Quizzes",
                        type: "button",
                        onClick: handleNavigationMyQuizzes,
                        mobileSlot: 2,
                        desktopSlot: 3
                    },
                    {
                        text: "Publish",
                        type: "button",
                        onClick: publishHandler,
                        mobileSlot: 3,
                        desktopSlot: 5,
                        isDisabled: !canPublish,
                        isVisible: !quizIsPublished
                    }
                ]}
            />


        </div>



    );

}
