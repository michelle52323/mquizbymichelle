import React, { useEffect, useState } from "react";
import { Editor as TipTapEditor } from "@tiptap/react";
import Icon from "../Icons/icons";
import "../../../extensions/MathNode"

type ToolbarProps = {
    editor: TipTapEditor | null;
    editorId: string;
    splitOnWidth: number | false;
};


export const Toolbar: React.FC<ToolbarProps> = ({ editor, editorId, splitOnWidth }) => {
    const [, rerender] = useState(0);

    useEffect(() => {
        if (!editor) return;

        const update = () => {
            // Delay ensures list toggles complete before re-render
            Promise.resolve().then(() => rerender(x => x + 1));
        };

        editor.on("selectionUpdate", update);
        editor.on("transaction", update);

        return () => {
            editor.off("selectionUpdate", update);
            editor.off("transaction", update);
        };
    }, [editor]);

    const [isNarrow, setIsNarrow] = useState(false);
    //console.log("Width: " + splitOnWidth);
    useEffect(() => {

        // Case 1: splitting disabled → always wide
        if (splitOnWidth === false) {
            setIsNarrow(false);
            return;
        }

        // Case 2: splitting enabled → use the number
        const check = () => {
            setIsNarrow(window.innerWidth < splitOnWidth);
        };

        // Run after first paint
        check();

        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);

    }, [splitOnWidth]);

    if (!editor) return null;

    return (
        <div className="text-editor-toolbar-wrapper">
            {isNarrow ? (
                <>
                    {/* Row 1: BIU + lists */}
                    <div className="text-editor-toolbar row-1">
                        {/* BOLD */}
                        <button
                            className={`text-editor-biu ${editor.isActive("bold") ? "active" : ""}`}
                            onClick={() => editor.chain().focus().toggleBold().run()}
                        >
                            <div className="text-editor-bold"><strong>B</strong></div>
                        </button>

                        {/* ITALIC */}
                        <button
                            className={`text-editor-biu ${editor.isActive("italic") ? "active" : ""}`}
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                        >
                            <div className="text-editor-italic"><i>i</i></div>
                        </button>

                        {/* UNDERLINE */}
                        <button
                            className={`text-editor-biu ${editor.isActive("underline") ? "active" : ""}`}
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                        >
                            <div className="text-editor-underline"><u>u</u></div>
                        </button>

                        {/* BULLET LIST */}
                        <button
                            className={`text-editor-text-block ${editor.isActive("bulletList") ? "active" : ""}`}
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                        >
                            <svg
                                width="23"
                                height="23"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <text x="1" y="5" fontSize="4" fontFamily="sans-serif">1.</text>
                                <rect x="7" y="3" width="7" height="2" rx="1" />
                                <text x="1" y="9" fontSize="4" fontFamily="sans-serif">2.</text>
                                <rect x="7" y="7" width="7" height="2" rx="1" />
                                <text x="1" y="13" fontSize="4" fontFamily="sans-serif">3.</text>
                                <rect x="7" y="11" width="7" height="2" rx="1" />
                            </svg>
                        </button>

                        {/* ORDERED LIST */}
                        <button
                            className={`text-editor-text-block ${editor.isActive("orderedList") ? "active" : ""}`}
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        >
                            <svg
                                width="23"
                                height="23"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <text x="1" y="5" fontSize="4" fontFamily="sans-serif">1.</text>
                                <rect x="7" y="3" width="7" height="2" rx="1" />
                                <text x="1" y="9" fontSize="4" fontFamily="sans-serif">2.</text>
                                <rect x="7" y="7" width="7" height="2" rx="1" />
                                <text x="1" y="13" fontSize="4" fontFamily="sans-serif">3.</text>
                                <rect x="7" y="11" width="7" height="2" rx="1" />
                            </svg>

                        </button>
                    </div>

                    {/* Row 2: Math + Code + HR */}
                    <div className="text-editor-toolbar row-2">
                        {/* MATH */}
                        <button
                            className={`text-editor-text-block ${editor.isActive("mathNode") ? "active" : ""}`}
                            onClick={() => {
                                editor
                                    .chain()
                                    .focus()
                                    .insertContent([
                                        { type: "inlineMath", attrs: { editorId } },
                                        { type: "text", text: "\u00A0" }
                                    ])
                                    .run();
                            }}
                        >
                            Math
                        </button>

                        {/* CODE */}
                        <button
                            className={`text-editor-text-block ${editor.isActive("codeBlock") ? "active" : ""}`}
                            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        >
                            Code
                        </button>

                        {/* HR */}
                        <button
                            className={`text-editor-text-block ${editor.isActive("horizontalRule") ? "active" : ""}`}
                            onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        >
                            ― HR
                        </button>
                    </div>
                </>
            ) : (
                // Wide: single row with everything
                <div className="text-editor-toolbar row-1">
                    {/* BOLD */}
                    <button
                        className={`text-editor-biu ${editor.isActive("bold") ? "active" : ""}`}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                    >
                        <div className="text-editor-bold"><strong>B</strong></div>
                    </button>

                    {/* ITALIC */}
                    <button
                        className={`text-editor-biu ${editor.isActive("italic") ? "active" : ""}`}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                    >
                        <div className="text-editor-italic"><i>i</i></div>
                    </button>

                    {/* UNDERLINE */}
                    <button
                        className={`text-editor-biu ${editor.isActive("underline") ? "active" : ""}`}
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                    >
                        <div className="text-editor-underline"><u>u</u></div>
                    </button>

                    {/* BULLET LIST */}
                    <button
                        className={`text-editor-text-block ${editor.isActive("bulletList") ? "active" : ""}`}
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                    >
                        <svg
                            width="23"
                            height="23"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <circle cx="3" cy="4" r="1.5" />
                            <rect x="7" y="3" width="7" height="2" rx="1" />
                            <circle cx="3" cy="8" r="1.5" />
                            <rect x="7" y="7" width="7" height="2" rx="1" />
                            <circle cx="3" cy="12" r="1.5" />
                            <rect x="7" y="11" width="7" height="2" rx="1" />
                        </svg>

                    </button>

                    {/* ORDERED LIST */}
                    <button
                        className={`text-editor-text-block ${editor.isActive("orderedList") ? "active" : ""}`}
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    >
                        <svg
                            width="23"
                            height="23"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <text x="1" y="5" fontSize="4" fontFamily="sans-serif">1.</text>
                            <rect x="7" y="3" width="7" height="2" rx="1" />
                            <text x="1" y="9" fontSize="4" fontFamily="sans-serif">2.</text>
                            <rect x="7" y="7" width="7" height="2" rx="1" />
                            <text x="1" y="13" fontSize="4" fontFamily="sans-serif">3.</text>
                            <rect x="7" y="11" width="7" height="2" rx="1" />
                        </svg>

                    </button>

                    {/* MATH */}
                    <button
                        className={`text-editor-text-block ${editor.isActive("mathNode") ? "active" : ""}`}
                        onClick={() => {
                            editor
                                .chain()
                                .focus()
                                .insertContent([
                                    { type: "inlineMath", attrs: { editorId } },
                                    { type: "text", text: "\u00A0" }
                                ])
                                .run();
                        }}
                    >
                        Math
                    </button>

                    {/* CODE */}
                    <button
                        className={`text-editor-text-block ${editor.isActive("codeBlock") ? "active" : ""}`}
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    >
                        Code
                    </button>

                    {/* HR */}
                    <button
                        className={`text-editor-text-block ${editor.isActive("horizontalRule") ? "active" : ""}`}
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    >
                        ― HR
                    </button>
                </div>
            )}
        </div>
    );
};