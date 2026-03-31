import React from "react";
import Icon from "../../../UserControls/Icons/icons";
import "../../../../multiple-choice-selection.css";

interface Props {
    onAdd: () => void;
}

const AddAnswerChoiceRow: React.FC<Props> = ({ onAdd }) => {
    return (
        <div
            className="grid-page-row add-answer-choice-row d-flex align-items-center"
            onClick={onAdd}
            style={{
                cursor: "pointer",
                padding: "12px 16px",
                borderTop: "2px solid var(--sortableBorder)"
            }}
        >
            <div className="d-flex align-items-center">
                <div className="add-icon me-3">
                    <Icon name="add" />
                </div>
            </div>

            <div className="flex-grow-1">
                <span className="fw-bold">Add Answer Choice</span>
            </div>
        </div>
    );
};

export default AddAnswerChoiceRow;