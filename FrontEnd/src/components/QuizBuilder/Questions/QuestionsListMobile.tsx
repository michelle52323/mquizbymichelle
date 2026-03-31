import { useEffect, useState } from "react";
import { getApiBaseUrl } from "../../../helpers/config";
import { TouchSensor } from '@dnd-kit/core';
import Modal from 'react-modal';
import { useOutletContext } from 'react-router-dom';
import { renderMathInHtml } from '../../../helpers/mathHelper'
import SortableQuestionItem from './SortableQuestionItem';


import {
    DndContext,
    closestCenter,
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    useSortable,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

Modal.setAppElement('#root'); // for accessibility

const API_BASE = getApiBaseUrl();

interface Question {
    id: number;
    description: string;
    questionTypeId: number;
    questionType: {
        id: number;
        description: string;
        sortOrder: number;
        isActive: boolean;
    };
    sortOrder: number;
    isActive: boolean;
}

interface Props {
    quizId: string;
}

function QuestionsListMobile({ quizId }: Props) {
    const [questions, setQuestions] = useState<Question[]>([]);

    const [modalIsOpen, setModalIsOpen] = useState(false);
    // const [questionToDelete, setQuestionToDelete] = useState<{ id: number; description: string } | null>(null);
    // const openDeleteModal = (question: { id: number; description: string }) => {
    //     setQuestionToDelete(question);
    //     setModalIsOpen(true);
    // };

    const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
    const [questionIndexToDelete, setQuestionIndexToDelete] = useState<number | null>(null);

    const openDeleteModal = (question: Question, index: number) => {
        setQuestionToDelete(question);
        setQuestionIndexToDelete(index);
        setModalIsOpen(true);
    };


    const { setBanner } = useOutletContext<{
        setBanner: (message: string) => void;
    }>();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        async function fetchQuestions() {
            const response = await fetch(
                `${API_BASE}/api/Questions/${quizId}/questions`,
                { credentials: "include" }
            );

            if (response.ok) {
                const data = await response.json();

                // Transform each question's HTML once
                const transformed = data.map(q => ({
                    ...q,
                    description: renderMathInHtml(q.description)
                }));

                setQuestions(transformed);
            } else {
                console.error("Failed to fetch questions");
            }
        }

        fetchQuestions();
    }, [quizId]);

    // useEffect(() => {
    //     async function fetchQuestions() {
    //         const response = await fetch(
    //             `${API_BASE}/api/Questions/${quizId}/questions`,
    //             { credentials: "include" }
    //         );

    //         if (response.ok) {
    //             const data = await response.json();
    //             setQuestions(data);
    //         } else {
    //             console.error("Failed to fetch questions");
    //         }
    //     }

    //     fetchQuestions();
    // }, [quizId]);

    // useEffect(() => {
    //     console.log("Running KaTeX…");

    //     const container = document.getElementById("questions-list-container");
    //     if (container) {
    //         renderMathInElement(container, {
    //             delimiters: [
    //                 { left: "$$", right: "$$", display: true },
    //                 { left: "$", right: "$", display: false }
    //             ]
    //         });
    //     }
    // }, [questions]);



    const handleDragEnd = async (event: any) => {
        setBanner('');
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = questions.findIndex(q => q.id.toString() === active.id);
            const newIndex = questions.findIndex(q => q.id.toString() === over?.id);

            const newOrder = arrayMove(questions, oldIndex, newIndex).map((question, index) => ({
                ...question,
                sortOrder: index + 1,
            }));

            setQuestions(newOrder);

            // Call API to perform update sort order
            const response = await fetch(`${API_BASE}/api/Questions/${quizId}/update-sort-order`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newOrder.map(q => ({
                    id: q.id,
                    sortOrder: q.sortOrder,
                }))),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setBanner('Questions successfully re-ordered!');
            } else {
                setBanner('Error occurred during sorting');
            }
        }
    };

    const handleDelete = async () => {
        setBanner('');

        const response = await fetch(`${API_BASE}/api/Questions/${questionToDelete?.id}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (response.ok) {
            // Re-fetch quizzes after deletion
            const refreshed = await fetch(`${API_BASE}/api/Questions/${quizId}/questions`, {
                credentials: 'include',
            });

            if (refreshed.ok) {
                const data = await refreshed.json();
                setQuestions(data);
                setBanner('Quiz successfully deleted!');
            } else {
                setBanner('Quiz deleted, but failed to reload list.');
            }
        } else {
            setBanner('Error occurred during deletion');
        }

        setModalIsOpen(false);
    };

    return (
        <div className="pt-3">

            <div className="content-inner-desktop">

                {questions.length === 0 ? (
                    <div className="empty-grid">No questions found. Start by creating one.</div>
                ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={questions.map(q => q.id.toString())} strategy={verticalListSortingStrategy}>

                            {/* Header */}
                            <div className="d-flex align-items-start">

                                {/* Drag handle spacer */}
                                <div className="d-flex">
                                    <div className="drag-handle-width-desktop"></div>
                                </div>

                                {/* Main header columns */}
                                <div className="flex-grow-1">
                                    <div className="row align-items-end">
                                        <div className="col-1 fw-bold">#</div>
                                        <div className="col-7 fw-bold">Description</div>
                                        <div className="col-3 fw-bold">Question Type</div>
                                    </div>
                                </div>

                                {/* Right-side button placeholders */}
                                <div className="d-flex ms-3">
                                    <div className="fixed-button-icon"></div>
                                    <div className="fixed-button-icon"></div>
                                </div>
                            </div>

                            {/* Rows */}
                            <div className="grid-overflow-box gof-tall" id="sortable">
                                <div id="questions-list-container">
                                    {questions.map((question, i) => (
                                        <SortableQuestionItem
                                            key={question.id}
                                            question={question}
                                            index={i}
                                            openDeleteModal={() => openDeleteModal(question, i + 1)}
                                            deviceType="mobile"
                                        />
                                    ))}
                                </div>

                            </div>

                        </SortableContext>
                    </DndContext>
                )}

            </div>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                contentLabel="Confirm Delete"
                className="dialog-wrapper"

            >
                <div className="modal-header dialog-header">
                    <h5 className="modal-title">Confirm Delete</h5>
                    <button className="btn-close" onClick={() => setModalIsOpen(false)} ></button>
                </div>
                <div className="dialog-content-holder">
                    <div className="dialog-content modal-body dialog-text">

                        {/* Fixed text stays normal */}
                        <div>
                            Are you sure you want to delete question #{questionIndexToDelete})?
                        </div>

                        {/* Render the question’s HTML safely */}
                        <div
                            className="mt-2"
                            dangerouslySetInnerHTML={{ __html: questionToDelete?.description ?? "" }}
                        />

                        {/* Hidden input stays separate */}
                        <input type="hidden" value={questionToDelete?.id} />
                    </div>

                    <div className="dialog-footer d-flex justify-content-end gap-2">
                        <button
                            className="button button-modal"
                            onClick={() => {
                                setBanner(null);
                                setModalIsOpen(false);
                            }}
                        >
                            Cancel
                        </button>
                        <button className="button button-modal" onClick={handleDelete}>Yes, Delete</button>
                    </div>
                </div>

            </Modal>

        </div>


    );
}

export default QuestionsListMobile;