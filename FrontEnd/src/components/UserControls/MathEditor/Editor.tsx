import React from "react";
import { EditorContent, Editor as TipTapEditor } from "@tiptap/react";

type EditorProps = {
    editor: TipTapEditor | null;
    editorId: string;     // semantic, required
    recordId?: string;    // DB ID, optional
};

export const Editor: React.FC<EditorProps> = ({ editor, editorId, recordId }) => {
    if (!editor) return null;

    return (
        <div id={editorId} className="math-editor-textarea">
            <EditorContent editor={editor} />
        </div>
    );
};
