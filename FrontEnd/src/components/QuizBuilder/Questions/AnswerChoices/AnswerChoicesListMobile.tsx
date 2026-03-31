import { useEffect, useState } from "react";
import { getApiBaseUrl } from "../../../../helpers/config";
import SortableAnswerChoiceItem from "./SortableAnswerChoiceItem";
import AddAnswerChoiceRow from "./AddAnswerChoiceRow";
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

const API_BASE = getApiBaseUrl();

import type { AnswerChoice } from "../../../../types/AnswerChoices/AnswerChoice";


interface Props {
    mode: "add" | "edit";
    questionId: string;
    answerChoices: AnswerChoice[];
    setAnswerChoices: React.Dispatch<React.SetStateAction<AnswerChoice[]>>;
    onRequestDelete: (choice: AnswerChoice) => void;
}

function AnswerChoiceListMobile({ questionId, answerChoices, setAnswerChoices, onRequestDelete }: Props) {

    const [expandedId, setExpandedId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );


    function openDeleteModal() {
        // TODO: implement modal
    }



    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const oldIndex = answerChoices.findIndex(ac => ac.clientId === active.id);
        const newIndex = answerChoices.findIndex(ac => ac.clientId === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        const newOrder = arrayMove(answerChoices, oldIndex, newIndex).map((ac, index) => ({
            ...ac,
            sortOrder: index + 1,
        }));

        setAnswerChoices(newOrder);
    };

    let tempCounter = 0;

    function generateTempId() {
        tempCounter++;
        return `temp-${Date.now()}-${tempCounter}`;
    }


    return (
        <div className="pt-1">
            <div className="answer-choice-inner-desktop inner-content-background pt-3 pb-3">

                <div className="grid-overflow-box gof-short">

                    {answerChoices.length === 0 && (
                        <div className="empty-grid">No answer choices found.</div>
                    )}
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={answerChoices.map(ac => ac.clientId.toString())} strategy={verticalListSortingStrategy}>

                            {answerChoices.map((choice, i) => (
                                <SortableAnswerChoiceItem
                                    key={choice.clientId}
                                    answerChoice={choice}
                                    setAnswerChoices={setAnswerChoices}
                                    index={i}
                                    expandedId={expandedId}
                                    setExpandedId={setExpandedId}
                                    onRequestDelete={onRequestDelete}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>


                    {/* Always present, always at the bottom */}
                    <AddAnswerChoiceRow
                        onAdd={() => {
                            setAnswerChoices(prev => {
                                const maxSortOrder = prev.length > 0
                                    ? Math.max(...prev.map(ac => ac.sortOrder ?? 0))
                                    : 0;

                                return [
                                    ...prev,
                                    {
                                        id: null,
                                        clientId: generateTempId(),
                                        description: "<p></p>",
                                        editorJson: null,
                                        sortOrder: maxSortOrder + 1,
                                        isCorrect: false
                                    }
                                ];
                            });
                        }}
                    />

                </div>

            </div>
        </div>
    );
}

export default AnswerChoiceListMobile;