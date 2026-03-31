import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Icon from '../../UserControls/Icons/icons';

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
    question: Question;
    index: number;
    openDeleteModal: (question: Question) => void;
    deviceType: "desktop" | "mobile";
}

const SortableQuestionItem: React.FC<Props> = ({ question, index, openDeleteModal, deviceType }) => {
    const navigate = useNavigate();

    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: question.id.toString() });

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
            {/* Drag handle */}
            <div className="d-flex">
                <div
                    className="drag-handle drag-handle-width-desktop"
                    {...listeners}
                >
                    <Icon name="drag" />
                </div>
            </div>

            {/* Main content */}
            <div className="flex-grow-1">
                <div className="row">
                    {/* Question # */}
                    <div className="col-1 fw-bold">
                        {index + 1}
                    </div>

                    {/* Description */}
                    <div
                        style={{ border: "0px solid red" }}
                        className="col-7 truncate-html"
                        dangerouslySetInnerHTML={{ __html: question.description }}
                    />

                    {/* Question Type */}
                    <div
                        className={`${deviceType === "mobile" ? "col-3 shrinkable" : "col-4"} truncate-two-lines`}
                        style={{ border: "0px solid red" }}
                    >
                        {question.questionType?.description ?? '—'}
                    </div>
                </div>
            </div>

            <div className="d-flex ms-3">

                {/* Edit Button (text + icon) */}
                <div className="fixed-button-icon">
                    <button
                        className="button button-icon"
                        onClick={() => navigate(`/QuizBuilder/Questions/Edit/${question.id}`)}
                    >
                        <Icon name="pencil" />
                    </button>
                </div>

                {/* Remove Button (text + icon) */}
                <div className="fixed-button-icon">
                    <button
                        className="button button-icon button-icon-delete"
                        onClick={() => openDeleteModal(question)}
                    >
                        <Icon name="delete" />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SortableQuestionItem;