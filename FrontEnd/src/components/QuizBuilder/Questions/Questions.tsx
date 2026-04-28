import { useEffect, useState } from "react";
import { useNavigate, useLocation, useOutletContext, useParams } from "react-router-dom";

import { isMobileTouchDevice } from "../../../helpers/config";
import CheckAuth from "../../../components/Account/CheckAuth";
import type { LayoutContext } from '../../Layout';

import QuestionsListMobile from "./QuestionsListMobile";
import QuestionsListDesktop from "./QuestionsListDesktop";
import { getApiBaseUrl } from '../../../helpers/config';
import ProgressBar from '../../UserControls/ProgressBar/ProgressBar';

import ButtonGrid from '../../UserControls/ButtonGrid/ButtonGrid';
import Icon from '../../UserControls/Icons/icons';

const API_BASE = getApiBaseUrl();

interface QuizForm {
    name: string;
    description: string;
    subjectId: string;
}

interface AuthResult {
    auth: boolean;
    claims: Record<string, string>;
}

function Questions() {

    const navigate = useNavigate();
    const { setTitle } = useOutletContext<{ setTitle: (title: string) => void }>();
    const { setBanner } = useOutletContext<LayoutContext>();
    const [auth, setAuth] = useState<AuthResult | null>(null);

    const [quiz, setQuiz] = useState<QuizForm>({
        name: '',
        description: '',
        subjectId: '',
    });

    const location = useLocation();

    useEffect(() => {

        return () => {

            setBanner('');

        };
    }, []);

    useEffect(() => {
        if (location.state?.banner) {
            setBanner(location.state.banner);
            navigate(location.pathname, {
                replace: true,
                state: {},
            });
        }
    }, [location.state?.banner, setBanner, navigate, location.pathname]);

    const { id: quizId } = useParams();
    if (!quizId) return null;

    // Enforce quizId presence
    useEffect(() => {
        if (!quizId) {
            navigate("/dashboard");
        }
    }, [quizId, navigate]);

    useEffect(() => {
        async function hydrateAuth() {
            const result = await CheckAuth();

            // Runtime guard to ensure claims is present and shaped correctly
            if (
                result &&
                typeof result.auth === "boolean" &&
                result.claims &&
                typeof result.claims === "object"
            ) {
                setAuth(result as AuthResult);
            } else {
                setAuth({ auth: false, claims: {} }); // fallback to unauthenticated state
            }
        }

        hydrateAuth();
    }, []);


    useEffect(() => {


        fetch(`${API_BASE}/api/QuizInfo/${quizId}`, { credentials: 'include' })
            .then(res => res.ok ? res.json() : Promise.reject('Quiz not found'))
            .then(data => {


                const hydratedQuiz: QuizForm = {
                    name: data.name,
                    description: data.description,
                    subjectId: data.subjectId?.toString() || '',
                };

                setQuiz(hydratedQuiz);


            })
            .catch(err => {
                console.error(err);
                navigate('/dashboard');
            });
    }, [navigate]);

    useEffect(() => {
        if (auth === null) return;

        if (!auth.auth) {
            navigate("/signin");
        } else if (
            auth.claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] !==
            "Instructor"
        ) {
            navigate("/dashboard");
        } else {
            setTitle(`${quiz.name}`);
        }
    }, [auth, navigate, quiz.name, setTitle]);

    if (auth === null) return <div>Loading questions...</div>;
    if (!auth.auth) return null;

    return (
        <>

            <div className="page-container w-100">


                <div className={isMobileTouchDevice() ? "content-holder-mobile" : "content-holder-desktop"}>
                    <ProgressBar />
                    {isMobileTouchDevice() ? (
                        <QuestionsListMobile quizId={quizId} />
                    ) : (
                        <QuestionsListDesktop quizId={quizId} />
                    )}
                </div>
            </div>


            {/* NAVIGATION BUTTON ROW */}
            <ButtonGrid
                buttons={[
                    {
                        text: "Back",
                        url: `/quizbuilder/quizInfo/${quizId}`,
                        icon: <Icon name="leftArrow" />,
                        type: "button",
                        mobileSlot: 1,
                        desktopSlot: 1
                    },
                    {
                        text: "My Quizzes",
                        url: "/quizbuilder/myquizzes",
                        type: "button",
                        mobileSlot: 2,
                        desktopSlot: 3
                    },
                    {
                        text: "Question",
                        url: `/quizbuilder/questions/add/${quizId}`,
                        icon: <Icon name="add" />,
                        type: "button",
                        mobileSlot: 3,
                        desktopSlot: 5
                    }
                ]}
            />
        </>
    );
}

export default Questions;