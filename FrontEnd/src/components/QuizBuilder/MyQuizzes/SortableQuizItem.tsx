import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Icon from '../../UserControls/Icons/icons';



interface Quiz {
    id: number;
    name: string;
    description: string;
    sortOrder: number;
    subject: {
        id: number;
        description: string;
    };
    canTake: boolean;
}

interface Props {
    quiz: Quiz;
    index: number;
    isMobile: boolean;
    openDeleteModal: () => void;
    setSelectedQuiz?: (quiz: Quiz) => void;
    setIsMenuOpen?: (open: boolean) => void;

}

const SortableQuizItem: React.FC<Props> = ({ quiz, index, isMobile, openDeleteModal, setSelectedQuiz, setIsMenuOpen }) => {
    const navigate = useNavigate();

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: quiz.id.toString() });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className="d-flex align-items-start grid-page-row grid-page-row-height-desktop sortable-container"
        >
            <div className="d-flex">
                <div className="drag-handle drag-handle-width-desktop"
                    {...listeners}
                >
                    <Icon name="drag" />
                </div>
            </div>

            <div className="flex-grow-1">
                <div className="row">
                    <input type="hidden" name={`MyQuizzesViewModel[${index}].Id`} value={quiz.id} />
                    <input type="hidden" name={`MyQuizzesViewModel[${index}].SortOrder`} value={quiz.sortOrder} />
                    <div className="col-4 col-custom-4-6-12 fw-bold truncate-two-lines">{quiz.name}</div>
                    <div className="col-4 col-custom-4-0 truncate-two-lines-responsive">{quiz.description}</div>
                    <div className="col-4 col-custom-4-6-0 truncate-two-lines-responsive-drop-first">
                        {quiz.subject?.description ?? '—'}
                    </div>
                </div>
            </div>

            <div className="d-flex">

                {!isMobile && (
                    <>
                        {/* Take Quiz (desktop only, still respects CanTake) */}
                        <div className="fixed-button">
                            {quiz.canTake && (
                                <button
                                    className="button button-tiny"
                                    onClick={() => navigate(`/quiz/${quiz.id}/intro`)}
                                >
                                    Take Quiz
                                </button>
                            )}
                            &nbsp;
                        </div>

                        {/* Edit Basic Info */}
                        <div className="fixed-button-icon">
                            <button
                                className="button button-icon"
                                onClick={() => navigate(`/QuizBuilder/QuizInfo/${quiz.id}`)}
                            >
                                <Icon name="pencil" />
                            </button>
                        </div>

                        {/* Questions */}
                        <div className="fixed-button">
                            <button
                                className="button button-tiny"
                                onClick={() => navigate(`/QuizBuilder/Questions/${quiz.id}`)}
                            >
                                Questions
                            </button>
                        </div>

                        {/* Review */}
                        <div className="fixed-button-icon">
                            <button
                                className="button button-icon"
                                onClick={() => navigate(`/QuizBuilder/Review/${quiz.id}`)}
                            >
                                <Icon name="review" />
                            </button>
                        </div>

                        {/* Delete */}
                        <div className="fixed-button-icon">
                            <button
                                className="button button-icon button-icon-delete"
                                data-bs-toggle="modal"
                                data-bs-target="#deleteModal"
                                data-quiz={quiz.name}
                                data-id={quiz.id}
                                onClick={openDeleteModal}
                            >
                                <Icon name="delete" />
                            </button>
                        </div>
                    </>
                )}
                {isMobile && (
                    <div
                        onClick={() => {
                            setSelectedQuiz?.(quiz);
                            setIsMenuOpen?.(true);
                        }}
                    >
                        <Icon name="moreOptions" />
                    </div>
                )}

                {/* {isMobile && openMenuId === quiz.id && (
                    <MobileQuizActionsMenu
                        quiz={quiz}
                        navigate={navigate}
                        openDeleteModal={openDeleteModal}
                        closeMenu={() => setOpenMenuId(null)}
                    />
                )} */}


            </div>

        </div>
    );
};

export default SortableQuizItem;