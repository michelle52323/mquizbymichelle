import { useEffect, useState, useRef, useCallback } from "react";
import axios from 'axios';
import { useNavigate, useLocation, useParams, useOutletContext } from "react-router-dom";
import ButtonGrid from '../../../UserControls/ButtonGrid/ButtonGrid';
import Icon from '../../../UserControls/Icons/icons';
import ProgressBar from '../../../UserControls/ProgressBar/ProgressBar';
import type { LayoutContext } from '../../../../components/Layout';
import { getApiBaseUrl, isMobileTouchDevice } from '../../../../helpers/config';
import { MathEditor, MathEditorHandle } from "../../../UserControls/MathEditor/MathEditor";
import { renderMathInHtml } from '../../../../helpers/mathHelper'
import Modal from 'react-modal';
import EditPageToolbar from '../../../UserControls/EditPageToolbar/EditPageToolbar';
import AnswerChoices from '../AnswerChoices/AnswerChoices';

import { normalizeSortOrder } from '../../../../helpers/sortingHelpers';


import "./edit.css";

import type { AnswerChoice } from '../../../../types/AnswerChoices/AnswerChoice';
import { QuestionType, mapStringToQuestionType } from '../../../../types/Questions/QuestionType';
import { canPublishQuestion } from '../../../../helpers/editorHelper';
import type { QuestionEditorState } from '../../../../helpers/editorHelper';
import type { EditorJson } from '../../../../types/Editor/EditorJSON';

import { generateJSON } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import { InlineMathNode } from "../../../../extensions/InlineMathNode"

Modal.setAppElement('#root'); // for accessibility



type EditProps = {
    mode: "add" | "edit";
    quizId?: string;
};

export default function EditPage() {
    const { id } = useParams();
    return <Edit mode="edit" />;
}

export const Edit: React.FC<EditProps> = ({ mode, quizId }) => {
    const editorRef = useRef<MathEditorHandle | null>(null)

    const navigate = useNavigate();
    const { id: questionId } = useParams();
    const API_BASE = getApiBaseUrl();

    const [resolvedQuizId, setResolvedQuizId] = useState(null);
    const [previousQuestionId, setPreviousQuestionId] = useState<number | null>(null);
    const [nextQuestionId, setNextQuestionId] = useState<number | null>(null);

    //Question and answer choice states
    const [initialHtml, setInitialHtml] = useState<string | null>("<p></p>");
    const [html, setHtml] = useState<string>("<p></p>");        //Insert placeholder text here
    const [htmlEditorJson, setHtmlEditorJson] = useState<EditorJson>();
    const [initialAnswerChoices, setInitialAnswerChoices] = useState<AnswerChoice[]>([]);
    const [answerChoices, setAnswerChoices] = useState<AnswerChoice[]>([]);
    const [questionType, setQuestionType] = useState<QuestionType | null>(QuestionType.MultipleChoice);
    const [publishable, setPublishable] = useState(false);

    const { setTitle } = useOutletContext<{ setTitle: (title: string) => void }>();
    const { setBanner } = useOutletContext<LayoutContext>();

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [warningModalIsOpen, setWarningModalIsOpen] = useState(false);
    const [pendingNavAction, setPendingNavAction] = useState<null | (() => void)>(null);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [answerChoiceToDelete, setAnswerChoiceToDelete] = useState(null);

    const location = useLocation();


    const openEditorModal = () => {

        setModalIsOpen(true);
    };

    const openWarningModal = () => {

        setWarningModalIsOpen(true);
    };

    const openDeleteModal = (choice: AnswerChoice) => {
        setAnswerChoiceToDelete(choice);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setAnswerChoiceToDelete(null);
        setDeleteModalOpen(false);
    };

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

    const [position, setPosition] = useState({
        quizId: 0,
        totalQuestions: 0,
        currentQuestionNumber: 0
    });


    const [initialLatex, setInitialLatex] = useState<string | null>(null);
    const [total, setTotalQuestions] = useState<number | null>(null);

    const [quiz, setQuiz] = useState({
        name: "",
        description: ""
    });

    useEffect(() => {
        if (mode === "add") {
            setResolvedQuizId(quizId); // whatever your param is called
        }
    }, [mode, quizId]);

    // Fetch question position
    useEffect(() => {
        if (!questionId) return;

        const fetchPosition = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/Questions/question/${questionId}/position`);
                if (!response.ok) {
                    console.error("Failed to load question position");
                    return;
                }

                const data = await response.json();
                setPosition(data);

            } catch (err) {
                console.error("Error fetching question position", err);
            }
        };

        fetchPosition();
    }, [questionId]);

    //Get total questions for add mode
    useEffect(() => {

        if (!quizId || mode != "add") return;

        const fetchQuestionCount = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/Questions/questionCount/${quizId}`);

                if (!response.ok) {
                    console.error("Failed to load question count");
                    return;
                }

                const total = await response.json();
                setTotalQuestions(total);   // whatever your state setter is
                setPosition({
                    quizId: Number(quizId),
                    totalQuestions: total + 1,
                    currentQuestionNumber: total + 1
                });
            } catch (err) {
                console.error("Error fetching question count", err);
            }
        };

        fetchQuestionCount();
    }, [quizId, API_BASE]);

    // Fetch quiz info once we know quizId
    useEffect(() => {


        if (!position.quizId) return;

        const fetchQuiz = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/QuizInfo/${position.quizId}`);

                if (!response.ok) {
                    console.error("Failed to load quiz info");
                    return;
                }

                const data = await response.json();
                setQuiz(data);

                // Set page title using QuizDto fields
                setTitle(`${data.name}`);
                setResolvedQuizId(position.quizId);

            } catch (err) {
                console.error("Error fetching quiz info", err);
            }
        };

        fetchQuiz();
    }, [position.quizId, API_BASE, setTitle]);

    // Fetch question payload for hydration (edit mode)
    useEffect(() => {
        if (!questionId || mode != "edit") {
            // Add mode → leave initialHtml = null
            return;
        }

        //Fetch question info if edit mode
        const fetchQuestionPayload = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/Questions/question/${questionId}`);
                if (!response.ok) {
                    console.error("Failed to load question payload");
                    return;
                }

                const data = await response.json();

                // Assuming API returns { description: "<p>...</p>", questionTypeId: 1 }
                setInitialHtml(data.description || "<p></p>");
                setInitialLatex(null); // You can adjust this later if you store latex separately
                setHtml(data.description || "<p></p>");
                setQuestionType(mapStringToQuestionType(data.questionType.description));

                setQuestion(data);
                //console.log("######: " + data.description);
                const hydratedQuestionJson = generateJSON(data.description ?? "", [
                    StarterKit,
                    InlineMathNode
                ])
                //console.log("######: " + hydratedQuestionJson);
                setHtmlEditorJson(hydratedQuestionJson);

                if (mode == "edit")
                    setToolbarMode(data.isPublished ? "published" : "draft");
                else
                    setToolbarMode("draft");



            } catch (err) {
                console.error("Error fetching question payload", err);
            }
        };

        fetchQuestionPayload();
    }, [questionId, API_BASE]);

    //console.log("Question Type: " + questionType);

    //Fetch answer choices for question (edit mode)
    useEffect(() => {

        if (!questionId || mode != "edit") {
            // Add mode → leave initialHtml = null
            return;
        }
        //console.log("*****:" + questionId);
        async function fetchChoices() {
            const response = await fetch(
                `${API_BASE}/api/AnswerChoices/${questionId}`,
                { credentials: "include" }
            );

            if (response.ok) {
                const data = await response.json();

                // Fallback to [] if DB returns null or undefined
                const safeChoices = Array.isArray(data) ? data : [];

                // Add clientId to each choice
                const withClientIds = safeChoices.map(choice => ({
                    ...choice,
                }));

                // Set BOTH initial and current states
                setInitialAnswerChoices(withClientIds);
                setAnswerChoices(withClientIds);

            } else {
                console.error("Failed to fetch answer choices");
            }
        }

        fetchChoices();

    }, [questionId]);



    //console.log("Choices: " + JSON.stringify(answerChoices, null, 2));
    //console.log("Initial HTML: " + JSON.stringify(initialHtml, null, 2));
    //console.log("HTML: " + JSON.stringify(html, null, 2));
    //console.log("Editor JSON: " + JSON.stringify(htmlEditorJson, null, 2));

    //Fetch next and previous question Id
    useEffect(() => {
        const loadNavigation = async () => {
            if (mode == "add") {
                // ADD MODE LOGIC
                try {
                    const response = await fetch(`${API_BASE}/api/Questions/quiz/${quizId}/last-question`);
                    const lastId = await response.json();

                    setPreviousQuestionId(lastId);   // last existing question
                    setNextQuestionId(null);         // no next question in Add Mode
                } catch (error) {
                    console.error("Failed to load last question for Add Mode", error);
                }

                return; // stop here — Add Mode is done
            }

            // EDIT MODE LOGIC
            try {
                const response = await fetch(`${API_BASE}/api/Questions/question/${questionId}/neighbors`);
                const data = await response.json();

                setPreviousQuestionId(data.previousQuestionId);
                setNextQuestionId(data.nextQuestionId);
            } catch (error) {
                console.error("Failed to load neighbors", error);
            }
        };

        loadNavigation();
    }, [quizId, questionId, mode]);

    //Determine whether question meets requirements to be published or not
    useEffect(() => {

        const isPublished = (toolbarMode === "published");
        if (!isPublished) {
            const q: QuestionEditorState = {
                questionId,
                resolvedQuizId,
                questionType,
                htmlEditorJson,
                answerChoices,
                isPublished
            };
            //console.log("Can publish?");
            setPublishable(canPublishQuestion(q));
        }

    }, [htmlEditorJson, answerChoices, questionType]);


    // Parent state for text + math
    const [latex, setLatex] = useState<string>("");





    const buildQuestionPayload = (isPublished) => {

        // console.log ("build: mode: " + toolbarMode);
        // const aa = toolbarMode === "published";
        // console.log ("build: is published: " + aa);
        // return;

        return {
            quizId: position.quizId,
            questionTypeId: 1,
            questionId,
            isPublished: isPublished,
            html,
            latex
        };
    };

    //Toolbar functions
    const [toolbarMode, setToolbarMode] = useState("draft"); // or "published"
    const [question, setQuestion] = useState(null);

    //console.log("Previous Question Id: ", previousQuestionId);
    //console.log("Next Question Id: ", nextQuestionId);

    // --- Toolbar handlers ---
    const handlePrevious = () => {
        if (contentHasChanged()) {
            setPendingNavAction(() => () => {
                setBanner(null);
                navigate(`/quizbuilder/questions/edit/${previousQuestionId}`);
            });
            setWarningModalIsOpen(true);
            return;
        }

        // No changes → navigate immediately
        setBanner(null);
        navigate(`/quizbuilder/questions/edit/${previousQuestionId}`);
    };


    const handleNext = () => {
        if (contentHasChanged()) {
            setPendingNavAction(() => () => {
                setBanner(null);
                navigate(`/quizbuilder/questions/edit/${nextQuestionId}`);
            });
            setWarningModalIsOpen(true);
            return;
        }

        // No changes → navigate immediately
        setBanner(null);
        navigate(`/quizbuilder/questions/edit/${nextQuestionId}`);
    };

    const handleCancel = () => {
        if (contentHasChanged()) {
            setPendingNavAction(() => () => {
                setBanner(null);
                navigate(`/quizbuilder/questions/${resolvedQuizId}`);
                window.scrollTo({ top: 0, behavior: "smooth" });

            });
            setWarningModalIsOpen(true);
            return;
        }

        // No changes → navigate immediately
        setBanner(null);
        navigate(`/quizbuilder/questions/${resolvedQuizId}`);
        window.scrollTo({ top: 0, behavior: "smooth" });


    };

    const handleSaveDraft = async () => {


        await performSave(false);
    };


    const performSave = async (isPublished) => {
        setBanner(null);
        const isEmpty = editorRef.current?.isEditorEmpty?.();
        if (isEmpty === true) {
            setBanner(null);
            openEditorModal();
            return;
        }

        const payload = buildQuestionPayload(isPublished);

        let insertResult: number | false | undefined;

        if (mode === "add") {
            insertResult = await insertQuestion(payload, quizId);
            if (insertResult === false) return;


        } else {
            await updateQuestion(payload);

        }

        const finalQuestionId = mode === "add" ? insertResult! : questionId;

        await saveAnswerChoices(finalQuestionId);

        //setInitialAnswerChoices(answerChoices);

        setInitialHtml(html);

        if (mode == "add") {
            navigate(`/QuizBuilder/Questions/Edit/${insertResult}`, {
                state: { banner: "Question created successfully!" },
            });
        } else {
            navigate(`/QuizBuilder/Questions/Edit/${questionId}`, {
                state: { banner: "Question updated successfully!" },
            });
        }


    };

    // const saveAnswerChoices = async (questionId: number) => {

    //     // After saving the question (insert or update)
    //     for (let i = 0; i < answerChoices.length; i++) {
    //         const choice = answerChoices[i];

    //         if (choice.id === null) {
    //             // INSERT
    //             await insertAnswerChoice({
    //                 questionId, // or insertResult if in add mode
    //                 description: choice.description,
    //                 sortOrder: choice.sortOrder,
    //                 isCorrect: choice.isCorrect
    //             }, choice.clientId);
    //         } else {
    //             // UPDATE
    //             await updateAnswerChoice({
    //                 id: choice.id,
    //                 description: choice.description,
    //                 sortOrder: choice.sortOrder,
    //                 isCorrect: choice.isCorrect,
    //                 isActive: true
    //             });
    //         }
    //     }
    // }

    // const insertAnswerChoice = async (dto) => {
    //     try {
    //         const response = await fetch(
    //             `${API_BASE}/api/AnswerChoices/create-answer-choice`,
    //             {
    //                 method: "POST",
    //                 headers: {
    //                     "Content-Type": "application/json"
    //                 },
    //                 body: JSON.stringify(dto)
    //             }
    //         );

    //         if (!response.ok) {
    //             console.error("Failed to insert answer choice");
    //             return false;
    //         }

    //         const { answerChoiceId } = await response.json();
    //         const clientId = dto.clientId;

    //         // Update current answerChoices
    //         setAnswerChoices(prev =>
    //             prev.map(choice =>
    //                 choice.clientId === clientId
    //                     ? { ...choice, id: answerChoiceId }
    //                     : choice
    //             )
    //         );

    //         // Update initialAnswerChoices
    //         setInitialAnswerChoices(prev =>
    //             prev.map(choice =>
    //                 choice.clientId === clientId
    //                     ? { ...choice, id: answerChoiceId }
    //                     : choice
    //             )
    //         );

    //         return answerChoiceId;
    //     } catch (error) {
    //         console.error("Error inserting answer choice:", error);
    //         return false;
    //     }
    // };

    // const saveAnswerChoices = async (questionId: number) => {
    //     const inserts: { clientId: string; answerChoiceId: number }[] = [];

    //     // 1. Call API for each choice, but DO NOT touch React state here
    //     for (const choice of answerChoices) {
    //         if (choice.id === null) {
    //             // INSERT
    //             const dto = {
    //                 questionId,
    //                 description: choice.description,
    //                 sortOrder: choice.sortOrder,
    //                 isCorrect: choice.isCorrect
    //             };

    //             const result = await insertAnswerChoice(dto, choice.clientId);
    //             if (result) {
    //                 inserts.push(result); // { clientId, answerChoiceId }
    //             }
    //         } else {
    //             // UPDATE
    //             await updateAnswerChoice({
    //                 id: choice.id,
    //                 description: choice.description,
    //                 sortOrder: choice.sortOrder,
    //                 isCorrect: choice.isCorrect,
    //                 isActive: true
    //             });
    //         }
    //     }

    //     // console.log("initial before merge", initialAnswerChoices);
    //     // console.log("current before merge", answerChoices);
    //     // console.log("inserts", inserts);


    //     // 2. After all API calls finish, merge new IDs into state ONCE
    //     if (inserts.length > 0) {
    //         // Build the merged array ONCE using the current answerChoices
    //         const merged = answerChoices.map(choice => {
    //             const match = inserts.find(x => x.clientId === choice.clientId);
    //             return match ? { ...choice, id: match.answerChoiceId } : choice;
    //         });

    //         // Now update BOTH states using the SAME merged array
    //         setAnswerChoices(merged);
    //         setInitialAnswerChoices(merged);
    //     }

    //     const merged = answerChoices.map(choice => {
    //         const match = inserts.find(x => x.clientId === choice.clientId);
    //         return match ? { ...choice, id: match.answerChoiceId } : choice;
    //     });

    //     setAnswerChoices(merged);
    //     setInitialAnswerChoices(merged);



    // };

    const saveAnswerChoices = async (questionId: number) => {
        // Collect all inserts so we can merge IDs AFTER the loop
        const inserts: { clientId: string; answerChoiceId: number }[] = [];

        // 1. Loop through answerChoices and call API (NO state updates here)
        for (const choice of answerChoices) {
            if (choice.id === null) {
                // INSERT
                const dto = {
                    questionId,
                    description: choice.description,
                    sortOrder: choice.sortOrder,
                    isCorrect: choice.isCorrect
                };

                const result = await insertAnswerChoice(dto, choice.clientId);
                if (result) {
                    inserts.push(result); // { clientId, answerChoiceId }
                }
            } else {
                // UPDATE
                await updateAnswerChoice({
                    id: choice.id,
                    description: choice.description,
                    sortOrder: choice.sortOrder,
                    isCorrect: choice.isCorrect,
                    isActive: true
                });
            }
        }

        // 2. Merge new IDs into BOTH arrays using answerChoices as the source of truth
        if (inserts.length > 0) {
            const merged = answerChoices.map(choice => {
                const match = inserts.find(x => x.clientId === choice.clientId);
                return match ? { ...choice, id: match.answerChoiceId } : choice;
            });

            setAnswerChoices(merged);
            setInitialAnswerChoices(merged);
        }
        else {
            setInitialAnswerChoices(answerChoices);
        }
    };

    // console.log(
    //     "Choices: " +
    //     JSON.stringify(
    //         initialAnswerChoices.map(({ editorJson, ...rest }) => rest),
    //         null,
    //         2
    //     )
    // );

    // console.log(
    //     "Choices: " +
    //     JSON.stringify(
    //         answerChoices.map(({ editorJson, ...rest }) => rest),
    //         null,
    //         2
    //     )
    // );

    //     useEffect(() => {
    //         console.log("initialAnswerChoices CHANGED:", initialAnswerChoices);
    //     }, [initialAnswerChoices]);
    // console.log("clientIds", initialAnswerChoices.map(c => c.clientId));


    const insertAnswerChoice = async (dto, clientId) => {
        try {
            const response = await fetch(
                `${API_BASE}/api/AnswerChoices/create-answer-choice`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dto)
                }
            );

            if (!response.ok) {
                console.error("Failed to insert answer choice");
                return false;
            }

            const { answerChoiceId } = await response.json();

            // You attach the clientId here — not the server
            return { clientId, answerChoiceId };
        } catch (error) {
            console.error("Error inserting answer choice:", error);
            return false;
        }
    };



    // useEffect(() => {
    //     console.log("answerChoices updated:", answerChoices);
    // }, [answerChoices]);

    const updateAnswerChoice = async (dto) => {
        try {
            const response = await fetch(
                `${API_BASE}/api/AnswerChoices/update-answer-choice`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(dto)
                }
            );

            if (!response.ok) {
                console.error("Failed to update answer choice");
                return false;
            }

            const result = await response.json();
            return result.success === true;
        } catch (error) {
            console.error("Error updating answer choice:", error);
            return false;
        }
    };

    const handlePublish = async () => {
        setBanner(null);

        performSave(true);
        setToolbarMode("published");
    };

    const handleAddNew = () => {

        if (contentHasChanged()) {
            setPendingNavAction(() => () => {
                setBanner(null);
                navigate(`/quizbuilder/questions/add/${resolvedQuizId}`);
            });
            setWarningModalIsOpen(true);
            return;
        }

        // No changes → navigate immediately
        setBanner(null);
        navigate(`/quizbuilder/questions/add/${resolvedQuizId}`);
    };

    const handleCompleteQuiz = () => {

        if (contentHasChanged()) {
            setPendingNavAction(() => () => {
                setBanner(null);
                navigate(`/quizbuilder/review/${resolvedQuizId}`);
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
            setWarningModalIsOpen(true);
            return;
        }
        setBanner(null);
        navigate(`/quizbuilder/review/${resolvedQuizId}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSave = async () => {

        await performSave(true);
    };

    const updateQuestion = async (payload) => {
        try {
            const response = await fetch(
                `${API_BASE}/api/Questions/update-question/${payload.questionId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        latex: payload.html,
                        questionTypeId: payload.questionTypeId,
                        isPublished: payload.isPublished
                    })
                }
            );

            if (!response.ok) {
                console.error("Failed to update question");
                return false;
            }

            const result = await response.json();
            //console.log ("Update success:", result);
            return true;

        } catch (error) {
            //console.error("Error updating question:", error);
            return false;
        }
    };

    const insertQuestion = async (payload, quizId) => {
        try {
            const dto = {
                quizId: Number(quizId),
                description: payload.html,
                questionTypeId: payload.questionTypeId
            };

            const response = await axios.post(
                `${API_BASE}/api/questions/create-question`,
                dto
            );

            if (response.data?.success) {
                return response.data.questionId;
            }


            return false;

        } catch (err) {

            return false;
        }
    };

    // const handleDelete = async (choice) => {
    //     if (choice.id == null) {
    //         // Local-only delete
    //         setAnswerChoices(prev => prev.filter(c => c.clientId !== choice.clientId));
    //         return;
    //     }

    //     // Server delete
    //     //await api.delete(`/answerChoices/${choice.id}`);

    //     // Remove from state
    //     setAnswerChoices(prev => prev.filter(c => c.id !== choice.id));

    //     // Reset baseline so navigation guard doesn’t fire
    //     setInitialAnswerChoices(prev =>
    //         prev.filter(c => c.id !== choice.id)
    //     );
    // };

    const handleConfirmDelete = async () => {
        if (!answerChoiceToDelete) return;

        const { id, clientId } = answerChoiceToDelete;

        // Case 1: Unsaved choice → local delete only
        if (id == null) {
            // setAnswerChoices(prev =>
            //     prev.filter(c => c.clientId !== clientId)
            // );
            // setInitialAnswerChoices(prev =>
            //     prev.filter(c => c.id !== id)
            // );
            // After filtering out the deleted choice:
            const clientId = answerChoiceToDelete.clientId;

            setAnswerChoices(prev =>
                normalizeSortOrder(prev.filter(c => c.clientId !== clientId))
            );

            setInitialAnswerChoices(prev =>
                normalizeSortOrder(prev.filter(c => c.clientId !== clientId))
            );


            setDeleteModalOpen(false);
            setAnswerChoiceToDelete(null);
            return;
        }

        // Case 2: Saved choice → call API
        try {
            await axios.delete(`${API_BASE}/api/AnswerChoices/answerChoices/${id}`);

            // Remove from state
            // setAnswerChoices(prev =>
            //     prev.filter(c => c.id !== id)
            // );

            // // Also update baseline so navigation guard stays clean
            // setInitialAnswerChoices(prev =>
            //     prev.filter(c => c.id !== id)
            // );

            const clientId = answerChoiceToDelete.clientId;

            setAnswerChoices(prev =>
                normalizeSortOrder(prev.filter(c => c.clientId !== clientId))
            );

            setInitialAnswerChoices(prev =>
                normalizeSortOrder(prev.filter(c => c.clientId !== clientId))
            );

            // Close modal
            setDeleteModalOpen(false);
            setAnswerChoiceToDelete(null);

            // Show banner
            setBanner("Answer choice successfully deleted!");

            // Optional: navigate back to the same page to refresh
            navigate(`/quizbuilder/questions/edit/${questionId}`);

        } catch (err) {
            console.error(err);

        }
    };


    // const contentHasChanged = useCallback(() => {
    //     if (initialHtml !== html) return true;
    //     if (initialAnswerChoices.length !== answerChoices.length) return true;


    //     for (let i = 0; i < initialAnswerChoices.length; i++) {
    //         const a = initialAnswerChoices[i];
    //         const b = answerChoices[i];
    //         if (
    //             a.id !== b.id ||
    //             a.description !== b.description ||
    //             a.sortOrder !== b.sortOrder ||
    //             a.isCorrect !== b.isCorrect
    //         ) {
    //             return true;
    //         }
    //     }

    //     return false;
    // }, [initialHtml, html, initialAnswerChoices, answerChoices]);

    const contentHasChanged = useCallback(() => {
        if (initialHtml !== html) return true;

        // Strip editorJson from both arrays before comparing
        const initialNoJson = initialAnswerChoices.map(({ editorJson, ...rest }) => rest);
        const currentNoJson = answerChoices.map(({ editorJson, ...rest }) => rest);

        if (initialNoJson.length !== currentNoJson.length) return true;

        for (let i = 0; i < initialNoJson.length; i++) {
            const a = initialNoJson[i];
            const b = currentNoJson[i];

            if (
                a.id !== b.id ||
                a.description !== b.description ||
                a.sortOrder !== b.sortOrder ||
                a.isCorrect !== b.isCorrect
            ) {
                return true;
            }
        }

        return false;
    }, [initialHtml, html, initialAnswerChoices, answerChoices]);




    return (
        <>

            <div className="page-container w-100">
                <div className="content-holder-desktop edit-page-content">
                    <ProgressBar />
                    {/* Progress bar (Question X of Y) */}
                    <div className="edit-progress-bar">
                        <span className="question-number">Question {position.currentQuestionNumber} of {position.totalQuestions}</span>
                        <span className="publish-status">{toolbarMode}</span>
                    </div>
                    <div className="page-toolbar-holder">
                        <form id="page-form">
                            <div className="edit-page">

                                <EditPageToolbar
                                    pageMode={mode}
                                    toolbarMode={toolbarMode}
                                    publishable={publishable}
                                    deviceType={isMobileTouchDevice() ? "mobile" : "desktop"}
                                    currentQuestionNumber={position.currentQuestionNumber}
                                    totalQuestions={position.totalQuestions}
                                    onPrevious={handlePrevious}
                                    onNext={handleNext}
                                    onCancel={handleCancel}
                                    onSaveDraft={handleSaveDraft}
                                    onPublish={handlePublish}
                                    onSave={handleSave}
                                    onAddNew={handleAddNew}
                                    onCompleteQuiz={handleCompleteQuiz}
                                />

                                {/* Your question editor goes here */}
                                <div className="edit-content">
                                    {/* text editor, math editor, answer choices, etc */}
                                </div>

                            </div>
                        </form>
                    </div>
                    <div className="scroll-region">
                        <div className="edit-inner-desktop">
                            <div className="page-container row">
                                <div className="edit-container">



                                    {/* Main content area: editor (left) + symbol library (right) */}
                                    <div className="edit-main">

                                        {/* Left padded area */}

                                        {!isMobileTouchDevice() && (
                                            <div className={"edit-left-padding"}>

                                            </div>
                                        )}

                                        {/* Left side: main editor */}
                                        <div
                                            className={
                                                `edit-left ${!isMobileTouchDevice() ? "edit-main-section" : ""}`
                                            }
                                        >

                                            <div className="edit-section">
                                                <div className="edit-section-header"><h4>Question</h4></div>

                                                <div className="edit-section-content">
                                                    <MathEditor
                                                        ref={editorRef}
                                                        editorId="editorQuestion"
                                                        initialHtml={initialHtml}     //should be null if add mode
                                                        initialLatex={latex}
                                                        onChangeHtml={setHtml}
                                                        onChangeJson={setHtmlEditorJson}
                                                        onChangeLatex={setLatex}
                                                    />


                                                </div>
                                            </div>

                                            <div className="edit-section">
                                                <div className="edit-section-header"><h4>Answer Choices</h4></div>
                                                <div className="edit-section-content">
                                                    {mode == "edit" ? (
                                                        <AnswerChoices mode="edit" questionId={questionId} answerChoices={answerChoices} setAnswerChoices={setAnswerChoices} onRequestDelete={openDeleteModal} />
                                                    ) : (
                                                        <AnswerChoices mode="add" answerChoices={answerChoices} setAnswerChoices={setAnswerChoices} onRequestDelete={openDeleteModal} />
                                                    )}

                                                </div>
                                            </div>
                                        </div>

                                        {!isMobileTouchDevice() && (
                                            <div className={"edit-right-padding"}>

                                            </div>
                                        )}

                                        {/* Right side: symbol library placeholder */}
                                        {/* {!isMobileTouchDevice() && (
                                            <div className="edit-right">
                                                <div className="edit-section-header"><h4>Symbol Library</h4></div>
                                                <div className="symbol-placeholder">
                                                    Symbol library placeholder
                                                </div>
                                            </div>
                                        )} */}


                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={() => setModalIsOpen(false)}
                    contentLabel="Confirm Delete"
                    className="dialog-wrapper"

                >
                    <div className="modal-header dialog-header">
                        <h5 className="modal-title">Question Required</h5>
                        <button className="btn-close" onClick={() => setModalIsOpen(false)} ></button>
                    </div>
                    <div className="dialog-content-holder">
                        <div className="dialog-content modal-body dialog-text">

                            {/* Fixed text stays normal */}
                            <div>
                                Your question is empty. Please add a question before saving.
                            </div>


                        </div>

                        <div className="dialog-footer d-flex justify-content-end gap-2">
                            <button className="button button-modal" onClick={() => setModalIsOpen(false)}>Ok</button>
                        </div>
                    </div>

                </Modal>

                <Modal
                    isOpen={warningModalIsOpen}
                    onRequestClose={() => setWarningModalIsOpen(false)}
                    contentLabel="Confirm Delete"
                    className="dialog-wrapper"

                >
                    <div className="modal-header dialog-header">
                        <h5 className="modal-title">Unsaved Changes</h5>
                        <button className="btn-close" onClick={() => setWarningModalIsOpen(false)} ></button>
                    </div>
                    <div className="dialog-content-holder">
                        <div className="dialog-content modal-body dialog-text">

                            {/* Fixed text stays normal */}
                            <div>
                                You have unsaved changes. Are you sure you want to leave?
                            </div>


                        </div>

                        <div className="dialog-footer d-flex justify-content-end gap-2">
                            <button className="button button-modal" onClick={() => setWarningModalIsOpen(false)}>No</button>
                            <button
                                className="button button-modal"
                                onClick={() => {
                                    setWarningModalIsOpen(false);
                                    if (pendingNavAction) {
                                        pendingNavAction();
                                    }
                                }}
                            >
                                Yes, Continue
                            </button>
                        </div>
                    </div>

                </Modal>

                <Modal
                    isOpen={deleteModalOpen}
                    onRequestClose={() => setDeleteModalOpen(false)}
                    contentLabel="Confirm Delete"
                    className="dialog-wrapper"

                >
                    <div className="modal-header dialog-header">
                        <h5 className="modal-title">Confirm Delete</h5>
                        <button className="btn-close" onClick={() => setDeleteModalOpen(false)} ></button>
                    </div>
                    <div className="dialog-content-holder">
                        <div className="dialog-content modal-body dialog-text">

                            {/* Fixed text stays normal */}
                            <div>
                                Are you sure you want to delete answer choice #{
                                    String.fromCharCode(96 + answerChoiceToDelete?.sortOrder).toUpperCase()})?
                            </div>

                            {/* Render the question’s HTML safely */}
                            <div
                                className="mt-2"
                                dangerouslySetInnerHTML={{ __html: renderMathInHtml(answerChoiceToDelete?.description) ?? "" }}
                            />

                            {/* Hidden input stays separate */}
                            <input type="hidden" value={answerChoiceToDelete?.id} />
                        </div>

                        <div className="dialog-footer d-flex justify-content-end gap-2">
                            <button
                                className="button button-modal"
                                onClick={() => {
                                    setBanner(null);
                                    setDeleteModalOpen(false);
                                }}
                            >
                                Cancel
                            </button>
                            <button className="button button-modal" onClick={handleConfirmDelete}>Yes, Delete</button>
                        </div>
                    </div>

                </Modal>
            </div>



        </>

    );
}