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
}

interface Props {
    quiz: Quiz;
    index: number;
    openDeleteModal: () => void;
}

const SortableQuizItem: React.FC<Props> = ({ quiz, index, openDeleteModal }) => {
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
                    <div className="col-4 col-custom-12 fw-bold truncate-two-lines">{quiz.name}</div>
                    <div className="col-4 col-responsive truncate-two-lines-responsive">{quiz.description}</div>
                    <div className="col-4 col-responsive truncate-two-lines-responsive">
                        {quiz.subject?.description ?? '—'}
                    </div>
                </div>
            </div>

            <div className="d-flex">
                <div className="fixed-button-icon">
                    <button className="button button-icon" onClick={() => navigate(`/QuizBuilder/QuizInfo/${quiz.id}`)}>
                        <Icon name="pencil" />
                    </button>
                </div>
                <div className="fixed-button">
                    <button className="button button-tiny" onClick={() => navigate(`/QuizBuilder/Questions/${quiz.id}`)}>
                        Questions
                    </button>
                </div>
                <div className="fixed-button-icon">
                    <button className="button button-icon" onClick={() => navigate(`/QuizBuilder/Review/${quiz.id}`)}>
                        <Icon name="review" />
                    </button>
                </div>
                {/* <div className="fixed-button-responsive">
                    <button className="button button-tiny-responsive" onClick={() => navigate(`/QuizBuilder/Review/${quiz.id}`)}>
                        Review
                    </button>
                    <button className="button button-icon-responsive button-icon-view" onClick={() => navigate(`/QuizBuilder/Review/${quiz.id}`)}>
                        <Icon name="eye" />
                    </button>
                </div> */}
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
            </div>
        </div>
    );
};

export default SortableQuizItem;