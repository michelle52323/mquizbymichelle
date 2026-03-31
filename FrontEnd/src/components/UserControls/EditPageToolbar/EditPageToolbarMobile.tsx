import React, { useEffect, useState } from "react";
import "./editpagetoolbar.css";

export default function EditPageToolbarMobile({
    pageMode,
    toolbarMode,
    publishable,
    currentQuestionNumber,
    totalQuestions,
    onPrevious,
    onNext,
    onCancel,
    onSaveDraft,
    onPublish,
    onSave,
    onAddNew,
    onCompleteQuiz
}) {

    const [DraftButtonLabel, setDraftButtonLabel] = useState("Save as Draft");

    useEffect(() => {
        const updateLabel = () => {
            const useNbsp = window.innerWidth < 825;
            setDraftButtonLabel(
                useNbsp ? "Save\u00A0as Draft" : "Save as Draft"
            );
        };

        updateLabel();
        window.addEventListener("resize", updateLabel);
        return () => window.removeEventListener("resize", updateLabel);
    }, []);

    return (
        <div className="edit-page-toolbar-mobile">

            {/* Row 1: Navigation */}
            <div className="toolbar-row">
                <button
                    type="button"
                    onClick={onPrevious}
                    disabled={currentQuestionNumber === 1}
                >
                    Previous
                </button>

                <button
                    type="button"
                    onClick={onNext}
                    disabled={currentQuestionNumber === totalQuestions}
                >
                    Next
                </button>

                <button type="button" onClick={onCancel}>
                    Cancel
                </button>
            </div>

            {/* Row 2: Save / Publish */}
            <div className="toolbar-row toolbar-row-save">
                {toolbarMode === "draft" && (
                    <>
                        <button
                            type="button"
                            onClick={onSaveDraft}
                            className="toolbar-btn"
                        >
                            {DraftButtonLabel}
                        </button>

                        <div className="toolbar-spacer-flex" />

                        <button
                            type="button"
                            onClick={onPublish}
                            disabled={!publishable}
                            className="toolbar-btn-publish"
                        >
                            Publish
                        </button>
                    </>
                )}

                {toolbarMode === "published" && (
                    <>
                        <button
                            type="button"
                            onClick={onSave}
                            className="toolbar-btn-save"
                        >
                            Save
                        </button>

                        <div className="toolbar-spacer-flex" />
                        <div className="toolbar-spacer-flex" />
                    </>
                )}
            </div>

            {/* Row 3: Quiz Actions */}
            <div className="toolbar-row toolbar-row-actions">
                <button
                    type="button"
                    onClick={onAddNew}
                    disabled={pageMode === "add"}
                    className="toolbar-btn toolbar-btn-wide"
                >
                    Add New Question
                </button>

                <div className="toolbar-spacer-flex" />

                <button
                    type="button"
                    onClick={onCompleteQuiz}
                    className="toolbar-btn"
                >
                    Complete Quiz
                </button>
            </div>

        </div>
    );
}