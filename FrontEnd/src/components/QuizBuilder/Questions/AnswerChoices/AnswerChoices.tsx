import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";

import { isMobileTouchDevice } from "../../../../helpers/config";
import CheckAuth from "../../../../components/Account/checkAuth";
import type { LayoutContext } from "../../../Layout";

import AnswerChoicesListMobile from "./AnswerChoicesListMobile";
import AnswerChoicesListDesktop from "./AnswerChoicesListDesktop";

import { getApiBaseUrl } from "../../../../helpers/config";

const API_BASE = getApiBaseUrl();

import type { AnswerChoice } from "../../../../types/AnswerChoices/AnswerChoice";


interface AuthResult {
    auth: boolean;
    claims: Record<string, string>;
}


interface Props {
    mode: "add" | "edit";
    questionId?: string;   // optional in add mode
    answerChoices: AnswerChoice[];
    setAnswerChoices: React.Dispatch<React.SetStateAction<AnswerChoice[]>>;
    //onRequestDelete: (choice: AnswerChoice) => void;
    onRequestDelete: (choice: AnswerChoice) => void;
    //onRequestDelete: () => void;
}

function AnswerChoices({ mode, questionId, answerChoices, setAnswerChoices, onRequestDelete }: Props) {
    const navigate = useNavigate();
    const { setTitle } = useOutletContext<{ setTitle: (title: string) => void }>();
    const { setBanner } = useOutletContext<LayoutContext>();

    const [auth, setAuth] = useState<AuthResult | null>(null);

    const { id: questionIdFromUrl } = useParams();

    // Merge prop + URL param safely
    const resolvedQuestionId = questionId ?? questionIdFromUrl ?? null;

    // In EDIT mode, questionId must exist
    if (mode === "edit" && !resolvedQuestionId) {
        return <div>Error: No question ID provided.</div>;
    }

    // In ADD mode, it's okay if resolvedQuestionId is null
    // (we will use local state for answer choices)

    // Enforce presence only in edit mode
    useEffect(() => {
        if (mode === "edit" && !resolvedQuestionId) {
            navigate("/dashboard");
        }
    }, [mode, resolvedQuestionId, navigate]);

    // Auth check
    useEffect(() => {
        async function hydrateAuth() {
            const result = await CheckAuth();

            if (
                result &&
                typeof result.auth === "boolean" &&
                result.claims &&
                typeof result.claims === "object"
            ) {
                setAuth(result as AuthResult);
            } else {
                setAuth({ auth: false, claims: {} });
            }
        }

        hydrateAuth();
    }, []);

    // Title
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
            //setTitle("Answer Choices");
        }
    }, [auth, navigate, setTitle]);

    if (auth === null) return <div>Loading answer choices...</div>;
    if (!auth.auth) return null;

//     console.log("###Answer Choice onRequestDelete:", onRequestDelete, typeof onRequestDelete);
// console.log("###resolvedQuestionId: " + resolvedQuestionId);
    return (
        <div className="page-container w-100">
            {/* <div className={isMobileTouchDevice() ? "content-holder-mobile" : "content-holder-desktop"}> */}
            <div>

                {isMobileTouchDevice() ? (
                    <AnswerChoicesListMobile
                        mode={mode}
                        questionId={resolvedQuestionId}
                        answerChoices={answerChoices}
                        setAnswerChoices={setAnswerChoices}
                        onRequestDelete={onRequestDelete}
                    />
                ) : (
                    <AnswerChoicesListDesktop
                        mode={mode}
                        questionId={resolvedQuestionId}
                        answerChoices={answerChoices}
                        setAnswerChoices={setAnswerChoices}
                        onRequestDelete={onRequestDelete}
                    />
                )}

            </div>
        </div>
    );
}

export default AnswerChoices;
