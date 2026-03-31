import { useEffect, useState } from 'react';
import { useOutletContext, useParams, useNavigate, useLocation } from 'react-router-dom';
import type { LayoutContext } from '../../Layout';
import CheckAuth from '../../../components/Account/checkAuth';
import { getApiBaseUrl } from '../../../helpers/config';
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
        firstQuestionId
    } = useQuiz();


    const navigate = useNavigate();
    const { setTitle, setBanner } = useOutletContext<LayoutContext>();
    const [auth, setAuth] = useState(null);

    const { quizId } = useParams<{ quizId: string }>();

    // const [quiz, setQuiz] = useState<QuizInfo>({
    //     name: '',
    //     description: '',
    //     subjectId: '',
    //     subjectName: '',
    // });

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

    // useEffect(() => {
    //     if (!quizId || !auth?.claims?.UserId) return;

    //     fetch(`${API_BASE}/api/QuizInfo/${quizId}`, { credentials: 'include' })
    //         .then(res => res.ok ? res.json() : Promise.reject('Quiz not found'))
    //         .then(data => {
    //             if (data.userId !== auth.claims?.UserId) {
    //                 console.warn('Unauthorized access attempt');
    //                 navigate('/dashboard');
    //                 return;
    //             }

    //             const hydratedQuiz: QuizInfo = {
    //                 name: data.name,
    //                 description: data.description,
    //                 subjectId: data.subjectId?.toString() || '',
    //                 subjectName: data.subjectName?.toString() || '',
    //             };

    //             setQuiz(hydratedQuiz);
    //             setTitle(data.name);

    //         })
    //         .catch(err => {
    //             console.error(err);
    //             navigate('/dashboard');
    //         });
    // }, [quizId, auth?.claims?.UserId, navigate]);

    const handleGoBack = () => {
        // TODO: navigate back to previous page
    };

    const handleStartQuiz = () => {
        navigate("/quiz/" + quiz.id + "/questions/" + firstQuestionId);
    };


    // if (auth === null) return <div>Loading dashboard...</div>;
    // if (!auth.auth) return null;

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
