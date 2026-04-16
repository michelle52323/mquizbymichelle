import { useEffect, useState } from 'react';
import { useOutletContext, useParams, useNavigate, useLocation } from 'react-router-dom';
import type { LayoutContext } from '../../Layout';
import { getApiBaseUrl } from '../../../helpers/config';
import ButtonGrid from '../../../components/UserControls/ButtonGrid/ButtonGrid';
import { useQuiz } from "../../QuizTaker/QuizProvider/QuizProvider";
import Loader from "../../UserControls/Loader/Loader";
import { calculateScore } from "../../../helpers/scoring"

import Icon from '../../UserControls/Icons/icons';


const API_BASE = getApiBaseUrl();

export default function Score() {
    const {
        quiz,
        answerSheet,
    } = useQuiz();

    const navigate = useNavigate();

    const [isLoaded, setIsLoaded] = useState(false);
    const [rawScore, setRawScore] = useState<number | null>(null);


    //const { setTitle, setBanner } = useOutletContext<LayoutContext>();
    const numQuestions = quiz.questions.length;
    const showPercentScore = numQuestions >= 5;

    useEffect(() => {
        
        setIsLoaded(false);

        const timer = setTimeout(() => {
            const { correct, total } = calculateScore(quiz, answerSheet);
            setRawScore(correct);
            //console.log("Calculated score:", correct);

            setIsLoaded(true);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (answerSheet.attempt.isCompleted)
            return;              // only run if attempt is not complete

        if (!isLoaded) return;   // only run when fully loaded

        const completeAttempt = async () => {
            try {
                const response = await fetch(
                    `${API_BASE}/api/QuizTaker/complete-attempt`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        credentials: "include",
                        body: JSON.stringify({
                            id: answerSheet.attempt.attemptId,   // your attempt Id
                            score: rawScore  // your computed score
                        })
                    }
                );

                if (!response.ok) {
                    console.error("Failed to complete attempt");
                    return;
                }

                answerSheet.attempt.isCompleted = true;
            } catch (err) {
                console.error("Error completing attempt:", err);
            }
        };

        completeAttempt();
    }, [isLoaded]);



    if (!isLoaded) {
        return (
            <div className="page-container w-100">
                <div className="content-holder-desktop quiz-page-content">
                    <div className="content-inner-desktop pt-2">

                        <div className="text-center mb-3">
                            <h2>Quiz complete</h2>
                            <p></p>
                        </div>

                        <Loader message="Calculating your score... this will take a few seconds." />

                    </div>
                </div>
            </div>
        );
    }



    return (
        <>
            <div className="page-container w-100">
                <div className="content-holder-desktop quiz-page-content">


                    <div className="content-inner-desktop pt-2">
                        <div className="text-center">
                            <h2>Quiz complete</h2>
                            <p></p>
                            <h4>You got {rawScore} out of {numQuestions} correct</h4>

                            {showPercentScore && (
                                <h4>
                                    {Math.round((rawScore / numQuestions) * 100)}%
                                </h4>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}