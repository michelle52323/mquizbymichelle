import React from 'react';
import { useEffect, useState, useRef } from "react";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Icon from '../../../UserControls/Icons/icons';
import '../../../../multiple-choice-selection.css';
import { MathEditor, MathEditorHandle } from "../../../UserControls/MathEditor/MathEditor";
import { renderMathInHtml } from '../../../../helpers/mathHelper';

import type { AnswerChoice } from "../../../../types/AnswerChoices/AnswerChoice";


interface Props {
    answerChoice: AnswerChoice;
    index: number;
    onRequestDelete: (choice: AnswerChoice) => void;
    //onRequestDelete: () => void;
    //setAnswerChoices: (choices: AnswerChoice[]) => void;
    setAnswerChoices: React.Dispatch<React.SetStateAction<AnswerChoice[]>>;

    expandedId: string | null;
    setExpandedId: (id: string | null) => void;

}

const SortableAnswerChoiceItem: React.FC<Props> = ({ answerChoice, index, onRequestDelete, setAnswerChoices, expandedId, setExpandedId }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: answerChoice.clientId });




    //Editor states
    const editorRef = useRef<MathEditorHandle | null>(null);
    const [initialHtml, setInitialHtml] = useState<string | null>(null);
    const [initialLatex, setInitialLatex] = useState<string | null>(null);
    const [frozenInitialHtml] = useState(answerChoice.description);

    // Parent state for text + math
    const [html, setHtml] = useState<string>("<p></p>");        //Insert placeholder text here
    const [latex, setLatex] = useState<string>("");

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    //const [isExpanded, setIsExpanded] = React.useState(false);
    const isExpanded = (expandedId === answerChoice.clientId);

    //Update state for selecting correct answer choice
    function handleCorrectSelected() {
        setAnswerChoices(prev =>
            prev.map(c =>
                c.clientId === answerChoice.clientId
                    ? { ...c, isCorrect: true }
                    : { ...c, isCorrect: false }
            )
        );
    }

    //Update Html for current answer choice
    const handleChoiceHtmlChange = (newHtml: string) => {
        setAnswerChoices(prev =>
            prev.map(c =>
                c.clientId === answerChoice.clientId
                    ? { ...c, description: newHtml }
                    : c
            )
        );
    };

    const handleChoiceJsonChange = (newJson: EditorJson) => {
        setAnswerChoices(prev =>
            prev.map(c =>
                c.clientId === answerChoice.clientId
                    ? { ...c, editorJson: newJson }
                    : c
            )
        );
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className="grid-page-row  sortable-container"
        >
            <div className="d-flex align-items-start">
                {/* Drag handle */}
                <div className="d-flex">
                    <div className="drag-handle drag-handle-width-desktop" {...listeners}>
                        <Icon name="drag" />
                    </div>
                </div>

                {/* Main content */}
                <div className="flex-grow-1">
                    <div className="row">

                        {/* Letter (col-1) */}
                        <div className="col-2 fw-bold text-center" style={{ paddingLeft: "17px", border: "0px solid red" }}>
                            {String.fromCharCode(97 + index).toUpperCase()}
                        </div>

                        {/* Description (col-7) */}
                        <div
                            style={{ border: "0px solid red" }}
                            className="col-8 truncate-html"
                            dangerouslySetInnerHTML={{
                                __html: renderMathInHtml(answerChoice.description)
                            }}
                        />

                        {/* Radio + icons (col-4) */}
                        <div className="col-2 d-flex justify-content-end align-items-center" style={{ border: "0px solid red" }}>
                            {answerChoice.isCorrect ? (
                                <div style={{ paddingTop: "3px" }}>
                                    <Icon name="success" />
                                </div>
                            ) : (
                                <label className="answer-choice-radio">
                                    <input type="radio" onChange={handleCorrectSelected} />
                                    <span className="circle"></span>
                                </label>
                            )}

                        </div>

                    </div>


                </div>

                {/* Edit / Remove buttons */}
                <div className="d-flex ms-3">


                    <div className="">
                        <button
                            className="button button-icon-full-screen"
                            // onClick={() => setIsExpanded(prev => !prev)}
                            onClick={() => {
                                setExpandedId(isExpanded ? null : answerChoice.clientId);
                            }}
                        >
                            <Icon name={isExpanded ? "chevronUp" : "pencil"} />
                        </button>
                    </div>


                </div>
            </div>


            <div>
                {/* {isExpanded && ( */}
                <div className={`${isExpanded ? "expanded" : "collapsed"} answer-choice-expanded mt-2`}
                >
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="edit-section-content editor-width-wrapper">
                            <div className="">
                                <MathEditor
                                    ref={editorRef}
                                    editorId={answerChoice.clientId}
                                    initialHtml={frozenInitialHtml}     //should be null if add mode
                                    initialLatex={latex}
                                    onChangeHtml={handleChoiceHtmlChange}
                                    onChangeJson={handleChoiceJsonChange}
                                    onChangeLatex={setLatex}
                                    splitToolbarOnWidth={850}
                                />
                            </div>



                        </div>
                    </div>

                    {/* Placeholder for future content */}
                    <div className="d-flex gap-3 ms-5 mt-3 justify-content-end">
                        {/* <button
                            className="button button-icon-full-screen"
                        >
                            <Icon name="save" />
                        </button> */}
                        <button
                            className="button button-icon"
                            onClick={() => onRequestDelete(answerChoice)}
                        >
                            <Icon name="delete" />
                        </button>
                    </div>
                </div>
                {/* )} */}
            </div>
        </div>
    );
};

export default SortableAnswerChoiceItem;