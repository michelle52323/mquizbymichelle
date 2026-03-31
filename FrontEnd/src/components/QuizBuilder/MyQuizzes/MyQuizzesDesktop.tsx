import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Modal from 'react-modal';
import { getApiBaseUrl } from '../../../helpers/config';
import '../../../grid-layout.css';
import SortableQuizItem from './SortableQuizItem';
const API_BASE = getApiBaseUrl();
import { TouchSensor } from '@dnd-kit/core';

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

interface Quiz {
    id: number;
    name: string;
    description: string;
    sortOrder: number;
    subject: {
        id: number;
        description: string;
    };
}

const MyQuizzesDesktop: React.FC = () => {

    const [quizzes, setQuizzes] = useState<Quiz[]>([]);

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [quizToDelete, setQuizToDelete] = useState<{ id: number; name: string } | null>(null);


    const openDeleteModal = (quiz: { id: number; name: string }) => {
        setQuizToDelete(quiz);
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
        const fetchQuizzes = async () => {
            const response = await fetch(`${API_BASE}/api/MyQuizzes/getQuizzes`, {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setQuizzes(data);
            } else {
                console.error('Failed to fetch quizzes');
            }
        };

        fetchQuizzes();
    }, []);

    const handleDragEnd = async (event: any) => {
        setBanner('');
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = quizzes.findIndex(q => q.id.toString() === active.id);
            const newIndex = quizzes.findIndex(q => q.id.toString() === over?.id);
            const newOrder = arrayMove(quizzes, oldIndex, newIndex).map((quiz, index) => ({
                ...quiz,
                sortOrder: index + 1,
            }));

            setQuizzes(newOrder);

            //Call API to perform update sort order

            const response = await fetch(API_BASE + `/api/myQuizzes/updateSortOrder`, {
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
                setBanner('Quizzes successfully re-ordered!');
            } else {
                setBanner('Error occurred during sorting');
            }

        }
    };

    const handleDelete = async () => {
        setBanner('');

        const response = await fetch(`${API_BASE}/api/MyQuizzes/${quizToDelete?.id}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (response.ok) {
            // Re-fetch quizzes after deletion
            const refreshed = await fetch(`${API_BASE}/api/MyQuizzes/getQuizzes`, {
                credentials: 'include',
            });

            if (refreshed.ok) {
                const data = await refreshed.json();
                setQuizzes(data);
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

        <div className="page-container w-100 pt-3">

            <div className="content-inner-desktop">

                {quizzes.length === 0 ? (
                    <div className="empty-grid">No quizzes found. Start by creating one.</div>
                ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={quizzes.map(q => q.id.toString())} strategy={verticalListSortingStrategy}>
                            {/* Header */}
                            <div className="d-flex align-items-start">
                                <div className="d-flex">
                                    <div className="drag-handle-width-desktop"></div>
                                </div>

                                <div className="flex-grow-1">
                                    <div className="row">
                                        <div className="col-4 col-custom-12 fw-bold">Name</div>
                                        <div className="col-4 col-responsive fw-bold">Description</div>
                                        <div className="col-4 col-responsive fw-bold">Subject</div>
                                    </div>
                                </div>

                                <div className="d-flex ms-3">
                                    <div className="fixed-button-icon"></div>
                                    <div className="fixed-button"></div>
                                    <div className="fixed-button-icon"></div>
                                    <div className="fixed-button-icon"></div>
                                </div>
                            </div>

                            {/* Rows */}
                            <div className="grid-overflow-box gof-tall" id="sortable">
                                {quizzes.map((quiz, i) => (
                                    <SortableQuizItem key={quiz.id} quiz={quiz} index={i} openDeleteModal={() => openDeleteModal(quiz)} />
                                ))}
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
                        Are you sure you want to delete quiz "{quizToDelete?.name}"?
                        <input type="hidden" value={quizToDelete?.id} />
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
};

export default MyQuizzesDesktop;