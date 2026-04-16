import { useEffect, useState } from 'react';
import { useOutletContext, useParams, useNavigate, useLocation } from 'react-router-dom';
import type { LayoutContext } from '../../Layout';
import ButtonGrid from '../../../components/UserControls/ButtonGrid/ButtonGrid';
import { useQuiz } from "../../QuizTaker/QuizProvider/QuizProvider";

//const API_BASE = getApiBaseUrl();

interface IntroProps {
    quizId: number;
}

// interface QuizInfo {
//     name: string;
//     description: string;
//     subjectId: string;
//     subjectName: string;
// }

export default function Intro() {

    const {
        quiz,
        answerSheet,
        firstQuestionId
    } = useQuiz();


    const navigate = useNavigate();
    const { setTitle, setBanner } = useOutletContext<LayoutContext>();
    const [auth, setAuth] = useState(null);

    const { quizId } = useParams<{ quizId: string }>();

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


    const handleGoBack = () => {
        //** NEED TO MODIFY SO STUDENT VERSION GOES BACK TO MY QUIZZES STUDENT **/
        navigate("/quizbuilder/myquizzes");
    };

    const handleStartQuiz = () => {
        navigate("/quiz/" + quiz.id + "/questions/" + firstQuestionId);
    };


    return (
        <>
            <form id="page-form">
                <div className="content-holder-desktop">
                    <div className="content-inner-desktop">
                        <div className="page-container row pt-3">

                            {/* SUBJECT (LEFT COLUMN) */}
                            <div className="page-item col-12 col-md-6">
                                <label className="form-label-tight">Subject</label>
                                <div className="form-element">
                                    {/* Placeholder for subject */}
                                    <div className="indented-content">
                                        {quiz.subjectName || "Subject goes here"}
                                    </div>
                                </div>
                                <div className="error-message-placeholder-height"></div>
                            </div>

                            {/* DESCRIPTION (RIGHT COLUMN) */}
                            <div className="page-item col-12 col-md-6">
                                <label className="form-label-tight">Description</label>
                                <div className="form-element">
                                    {/* Placeholder for description */}
                                    <div className="indented-content">
                                        {quiz.description || "Description goes here"}
                                    </div>
                                </div>
                                <div className="error-message-placeholder-height"></div>
                            </div>

                            {/* INSTRUCTIONS BLOCK (FULL WIDTH) */}
                            <div className="page-item col-12 mt-3">
                                <label className="form-label-tight">Instructions</label>
                                <div className="form-element">
                                    <div className="indented-content">
                                        <p>
                                            Read each question carefully. Select the best answer.
                                            When you're ready, click “Start Quiz” below.
                                        </p>
                                    </div>
                                </div>
                                <div className="error-message-placeholder-height"></div>
                            </div>

                        </div>
                    </div>
                </div>
            </form>

            {/* BUTTON GRID */}
            <ButtonGrid
                buttons={[
                    {
                        text: "Leave",
                        onClick: handleGoBack,
                        type: "button",
                        mobileSlot: 1,
                        desktopSlot: 1
                    },
                    {
                        text: "Start Quiz",
                        onClick: handleStartQuiz,
                        type: "button",
                        mobileSlot: 3,
                        desktopSlot: 5
                    }
                ]}
            />
        </>
    );

}
