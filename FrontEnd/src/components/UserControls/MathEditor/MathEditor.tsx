import React, {
    useEffect,
    useRef,
    useState,
    useImperativeHandle,
} from "react"
import { useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import { MathfieldElement } from "mathlive"
import { Toolbar } from "./Toolbar"
import { Editor } from "./Editor"
import "./matheditor.css"
import { InlineMathNode } from "../../../extensions/InlineMathNode"
import { isEditorEmpty } from "../../../helpers/textHelper"

import type { EditorJson } from '../../../types/Editor/EditorJSON';

// -----------------------------
// Props
// -----------------------------
type MathEditorProps = {
    editorId: string
    recordId?: string
    label?: string
    initialHtml?: string
    onChangeHtml?: (html: string) => void
    onChangeJson?: (json: EditorJson) => void
    initialLatex?: string
    onChangeLatex?: (latex: string) => void
    hiddenLatexName?: string
    splitToolbarOnWidth?: number | false

    // added for forwardRef wrapper
    forwardedRef?: React.Ref<any>
}

// -----------------------------
// Handle exposed to parent
// -----------------------------
export type MathEditorHandle = {
    isEditorEmpty: () => boolean
}

// -----------------------------
// ORIGINAL COMPONENT (unchanged)
// -----------------------------
const MathEditorComponent: React.FC<MathEditorProps> = ({
    editorId,
    recordId,
    label,
    initialHtml = "",
    onChangeHtml,
    onChangeJson,
    initialLatex = "",
    onChangeLatex,
    hiddenLatexName = "mathLatex",
    splitToolbarOnWidth = false,
    forwardedRef, // <-- added
}) => {
    const [latex, setLatex] = useState(initialLatex)

    const mathfieldRef = useRef<MathfieldElement | null>(null)
    const mathContainerRef = useRef<HTMLDivElement | null>(null)

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: {},
                orderedList: {},
                codeBlock: {},
                horizontalRule: {},
            }),
            Underline,
            InlineMathNode.configure({ editorId }),
        ],
        editorProps: {
            attributes: {
                id: editorId,
            },
        },
        content: initialHtml,
        onCreate: ({ editor }) => {
            // This fires immediately on mount
            onChangeHtml?.(editor.getHTML())
            onChangeJson?.(editor.getJSON())
        },

        onUpdate: ({ editor }) => {
            const fullHtml = editor.getHTML()
            const fullJson = editor.getJSON()

            onChangeHtml?.(fullHtml)
            onChangeJson?.(fullJson)
        },
    })

    // hydrate initial HTML
    useEffect(() => {
        if (editor && initialHtml) {
            editor.commands.setContent(initialHtml)
        }
    }, [editor, initialHtml])

    // create MathLive field
    useEffect(() => {
        if (!mathContainerRef.current) return

        const mf = new MathfieldElement({ virtualKeyboardMode: "off" } as any)
        mf.classList.add("math-editor-mathfield")
        mf.value = initialLatex

        const handleInput = () => {
            const value = mf.getValue()
            setLatex(value)
            onChangeLatex?.(value)
        }

        mf.addEventListener("input", handleInput)
        mathContainerRef.current.appendChild(mf)
        mathfieldRef.current = mf

        return () => {
            mf.removeEventListener("input", handleInput)
        }
    }, [])

    // sync external latex changes
    useEffect(() => {
        if (mathfieldRef.current && initialLatex !== latex) {
            mathfieldRef.current.setValue(initialLatex)
        }
    }, [initialLatex])

    // expose method to parent
    useImperativeHandle(forwardedRef, () => ({
        isEditorEmpty() {
            if (!editor) return true
            return isEditorEmpty(editor.getJSON())
        },
    }))

    return (
        <div className="math-editor-wrapper">
            {label && <div className="math-editor-label">{label}</div>}

            <Toolbar editor={editor} editorId={editorId} splitOnWidth={splitToolbarOnWidth} />
            <Editor editor={editor} editorId={editorId} recordId={recordId} />

            {/* MathLive field (currently commented out) */}
            {/*
      <div className="math-editor-math-container">
        <div className="math-editor-math-label">Math</div>
        <div
          ref={mathContainerRef}
          className="math-editor-mathfield-wrapper"
        />
      </div>

      <input
        type="hidden"
        name={hiddenLatexName}
        value={latex}
        readOnly
      />
      */}
        </div>
    )
}

// -----------------------------
// SAFE WRAPPER WITH forwardRef
// -----------------------------
export const MathEditor = React.forwardRef<MathEditorHandle, MathEditorProps>(
    (props, ref) => {
        return <MathEditorComponent {...props} forwardedRef={ref} />
    }
)