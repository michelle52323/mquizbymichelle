import React from "react";
import { useEffect, useState } from "react";
import "./editpagetoolbar.css";
import EditPageToolbarMobile from "./EditPageToolbarMobile";

export default function EditPageToolbar({
    pageMode,
    toolbarMode,                 // "draft" | "published"
    publishable,
    deviceType,
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

    if (deviceType === "mobile") {
    return <EditPageToolbarMobile
        pageMode={pageMode}
        toolbarMode={toolbarMode}
        publishable={publishable}
        currentQuestionNumber={currentQuestionNumber}
        totalQuestions={totalQuestions}
        onPrevious={onPrevious}
        onNext={onNext}
        onCancel={onCancel}
        onSaveDraft={onSaveDraft}
        onPublish={onPublish}
        onSave={onSave}
        onAddNew={onAddNew}
        onCompleteQuiz={onCompleteQuiz}
    />;
}

    const [DraftButtonLabel, setDraftButtonLabel] = useState("Save as Draft");

    useEffect(() => {
        const updateLabel = () => {
            const useNbsp = window.innerWidth < 825;
            setDraftButtonLabel(
                useNbsp ? "Save\u00A0as Draft" : "Save as Draft"
            );
        };

        updateLabel(); // run on mount
        window.addEventListener("resize", updateLabel);

        return () => window.removeEventListener("resize", updateLabel);
    }, []);

    return (
        <div className="edit-page-toolbar">

            {/* LEFT SECTION */}
            <div className="toolbar-section toolbar-left">
                <button
                    type="button"
                    onClick={onPrevious}
                    disabled={currentQuestionNumber === 1}
                >
                    Previous
                </button>
                <button type="button"
                    onClick={onNext}
                    disabled={currentQuestionNumber === totalQuestions}
                >Next</button>
                <button type="button" onClick={onCancel}>Cancel</button>
            </div>

            {/* CENTER SECTION */}
            <div className="toolbar-section toolbar-center">
                {toolbarMode === "draft" && (
                    <>
                        <button type="button" onClick={onSaveDraft}>
                            {DraftButtonLabel}
                        </button>
                        <button
                            type="button"
                            onClick={onPublish}
                            disabled={!publishable}
                        >
                            Publish
                        </button>
                    </>
                )}

                {toolbarMode === "published" && (
                    <>
                        <button type="button" onClick={onSave}>Save</button>
                        <div className="toolbar-spacer"></div>
                    </>
                )}
            </div>

            {/* RIGHT SECTION */}
            <div className="toolbar-section toolbar-right">
                <button
                    type="button"
                    onClick={onAddNew}
                    disabled={pageMode === "add"}
                >
                    Add New Question
                </button>

                <button type="button" onClick={onCompleteQuiz}>Complete Quiz</button>
            </div>

        </div>
    );
}