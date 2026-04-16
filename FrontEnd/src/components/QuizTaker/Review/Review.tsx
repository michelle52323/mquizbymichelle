import { useEffect, useState } from 'react';
import { useOutletContext, useParams, useNavigate, useLocation } from 'react-router-dom';
import type { LayoutContext } from '../../Layout';
import Modal from 'react-modal';
import { getApiBaseUrl } from '../../../helpers/config';
import ButtonGrid from '../../../components/UserControls/ButtonGrid/ButtonGrid';
import { useQuiz } from "../../QuizTaker/QuizProvider/QuizProvider";
import { isIOS } from "../../../helpers/config.jsx"


import Icon from '../../UserControls/Icons/icons';
import '../../../multiple-choice-selection.css';

//import "../Questions/questions.css";
import "./review.css"

const API_BASE = getApiBaseUrl();

export default function Review() {

    const {
        quiz,
        answerSheet,
    } = useQuiz();

    const navigate = useNavigate();
    const { setBanner } = useOutletContext<LayoutContext>();
    const { quizId } = useParams<{ quizId: string }>();

    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

    //const [auth, setAuth] = useState(null);

    useEffect(() => {

        return () => {

            setBanner('');

        };
    }, []);


    useEffect(() => {

        if (answerSheet.attempt.isCompleted)
            navigate(`/quiz/${quiz.id}/score`, { replace: true });

    }, [answerSheet]);

    const handleEditClick = (quizId, questionId) => {
        //navigate(`/dashboard`);
        navigate(`/quiz/${quizId}/questions/${questionId}`);
        //navigate("/quiz/" + quiz.id + "/questions/" + questionId);
    };


    const getReviewInfo = (question) => {
        // Find the student's answer entry for this question
        const entry = answerSheet.attempt.answers.find(
            a => a.questionId === question.id
        );

        const qNumber = quiz.questions.findIndex(q => q.id === question.id) + 1;


        // No entry or no selected answer → unanswered
        if (!entry || entry.selectedAnswerId == null) {
            return {
                questionNumber: qNumber,
                status: "Unanswered",
                answerText: "—"
            };
        }

        // Find which answer choice matches the selectedAnswerId
        const index = question.answerChoices.findIndex(
            ac => ac.id === entry.selectedAnswerId
        );

        // If somehow not found, treat as unanswered
        if (index === -1) {
            return {
                questionNumber: qNumber,
                status: "Unanswered",
                answerText: "—"
            };
        }

        // Convert index → letter
        const letter = String.fromCharCode(65 + index); // 65 = 'A'
        //console.log("Quiz:", JSON.stringify(quiz, null, 2));

        return {
            questionNumber: qNumber,
            status: "Answered",
            answerText: letter
        };
    };



    const handleNext = () => {
        setShowSubmitConfirm(true);
    };

    const classFirstCol = isIOS() ? "col-4" : "col-3";
    const classSecondCol = isIOS() ? "col-8" : "col-9";
    return (
        <>
            {/* <form id="page-form"> */}
            <div className="page-container w-100">
                <div className="content-holder-desktop quiz-page-content">

                    {/* Progress bar (Question X of Y) */}
                    <div className="quiz-taker-progress-bar">
                        <span className="student-question-number">Review your Responses</span>
                    </div>

                    <div className="content-inner-desktop pt-2">
                        <h5>Please review your responses</h5>
                        <div className="review-quiz-overflow-box">
                            <div className="review-list">
                                {quiz.questions.map((q) => {
                                    //console.log("Navigate target:", `/quiz/${quizId}/questions/${q.id}`);

                                    const info = getReviewInfo(q);

                                    return (
                                        <div key={q.id} className="review-item mb-3 pb-2 border-bottom">

                                            <div className="row mb-3">
                                                {/* Column 1: Question number */}
                                                <div className={`${classFirstCol} d-flex align-items-start`}>
                                                    <span><strong>Question {info.questionNumber}</strong></span>
                                                </div>

                                                {/* Column 2: Status + Edit, then Your Answer */}
                                                <div className={classSecondCol}>

                                                    {/* Row 1: Status (left) + Edit link (right) */}
                                                    <div className="d-flex justify-content-between">
                                                        <span><strong>Status:</strong> {info.status}</span>
                                                        <button
                                                            className="review-edit-link btn btn-link p-0"
                                                            onClick={() => handleEditClick(quizId, q.id)}
                                                        >
                                                            Edit
                                                        </button>
                                                    </div>

                                                    {/* Row 2: Your answer (indented) */}
                                                    <div className="ps-3 mt-1">
                                                        <span><strong>Your answer:</strong> {info.answerText}</span>
                                                    </div>

                                                </div>
                                            </div>


                                        </div>
                                    );
                                })}
                            </div>


                        </div>
                    </div>
                </div>
            </div>
            {/* </form> */}
            {/* BUTTON GRID */}
            {<ButtonGrid
                buttons={[

                    {
                        text: "Submit",
                        onClick: handleNext,
                        type: "button",
                        mobileSlot: 3,
                        desktopSlot: 5
                    }
                ]}
            />}

            <Modal
                isOpen={showSubmitConfirm}
                onRequestClose={() => setShowSubmitConfirm(false)}
                contentLabel="Confirm Submit"
                className="dialog-wrapper"
            >
                <div className="modal-header dialog-header">
                    <h5 className="modal-title">Submit Quiz</h5>
                    <button
                        className="btn-close"
                        onClick={() => setShowSubmitConfirm(false)}
                    ></button>
                </div>

                <div className="dialog-content-holder">
                    <div className="dialog-content modal-body dialog-text">
                        Are you sure you want to submit your quiz?
                        <br />
                        You won’t be able to change your answers afterward.
                    </div>

                    <div className="dialog-footer d-flex justify-content-end gap-2">
                        <button
                            className="button button-modal"
                            onClick={() => setShowSubmitConfirm(false)}
                        >
                            Cancel
                        </button>

                        <button
                            className="button button-modal"
                            onClick={() => {
                                setShowSubmitConfirm(false);
                                navigate(`/quiz/${quizId}/score`);
                            }}
                        >
                            Yes, Submit
                        </button>
                    </div>
                </div>
            </Modal>



        </>
    );
}