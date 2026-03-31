import React, { useEffect, useRef } from "react"
import { mergeAttributes, Node } from "@tiptap/core"
import {
    ReactNodeViewRenderer,
    NodeViewWrapper,
    type NodeViewProps,
} from "@tiptap/react"
import { MathfieldElement } from "mathlive"


// Extend TipTap commands
declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        insertInlineMath: () => ReturnType
    }
}

export const InlineMathNode = Node.create({
    name: "inlineMath",

    addOptions() {
        return {
            editorId: null,
        }
    },

    group: "inline",
    inline: true,
    atom: true,
    draggable: false,
    selectable: false,
    isolating: false,

    // VERY IMPORTANT:
    // This prevents TipTap from wrapping it in its own paragraph.
    defining: false,


    // addAttributes() {
    //     return {
    //         latex: {
    //             default: "",
    //         },
    //         editorId: {
    //             default: null,   // <-- add this
    //         },
    //     }
    // },
    addAttributes() {
        return {
            latex: {
                default: "",
                parseHTML: element => element.getAttribute("data-latex"),
            },
            editorId: {
                default: null,
                parseHTML: element => element.getAttribute("editorId"),
            },
        }
    },

    parseHTML() {
        return [{ tag: "span[data-inline-math]" }]
    },

    renderHTML({ HTMLAttributes }) {
        return [
            "span",
            mergeAttributes(HTMLAttributes, {
                "data-inline-math": "true",
                "data-latex": HTMLAttributes.latex,
            }),
        ];
    },

    addCommands() {
        return {
            insertInlineMath:
                () =>
                    ({ editor }) => {
                        return editor.commands.insertContent({
                            type: "inlineMath",
                            attrs: { latex: "", editorId: editor.options.editorId },
                        })
                    },
        }
    },

    addNodeView() {
        return ReactNodeViewRenderer(InlineMathView)
    },
    //     addNodeView() {
    //   return () => {
    //     const span = document.createElement("span");
    //     span.textContent = "[MATH]";
    //     span.setAttribute("data-inline-math", "true");
    //     return { dom: span };
    //   };
    // }
})

const InlineMathView: React.FC<NodeViewProps> = ({
    node,
    updateAttributes,
}) => {
    const spanRef = useRef<HTMLSpanElement | null>(null)
    const mfRef = useRef<MathfieldElement | null>(null)

    useEffect(() => {
        if (!spanRef.current) return

        const mf = new MathfieldElement({
            virtualKeyboardMode: "off",
        } as any)

        const editorId = node.attrs.editorId
        mf.dataset.editorId = editorId

        mf.applyStyle({ backgroundColor: '#000000' });

        mf.setAttribute("data-inline-math", "true");

        //mf.value = node.attrs.latex || ""
        const latex = (node.attrs.latex || "").replace(/\\\\/g, "\\");
        mf.setValue(latex, { format: "latex" });

        mf.addEventListener("input", () => {
            updateAttributes({ latex: mf.getValue() })
        })

        //spanRef.current.replaceWith(mf)
        spanRef.current.innerHTML = ""   // clear placeholder
        spanRef.current.appendChild(mf)  // mount MathLive inside the node
        mfRef.current = mf

        //mf.style.minWidth = "80px";
        mf.style.minWidth = "min(80px, 100%)";
        mf.style.maxWidth = "100%";
        mf.style.boxSizing = "border-box";
        mf.style.padding = "2px 2px 2px 16px";
        mf.style.borderRadius = "4px";
        mf.placeholder = "\\text{Type math here}";


        //Arrow key behavior
        mf.addEventListener("keydown", (e) => {
            // Exit to the right
            if (e.key === "ArrowRight") {
                const sel = mf.selection;
                if (sel.r === mf.value.length) {
                    e.preventDefault();
                    mf.blur();

                    const dom = mf.closest("[data-node-view-wrapper]");
                    if (dom) {
                        const range = document.createRange();
                        range.setStartAfter(dom);
                        range.setEndAfter(dom);
                        const sel = window.getSelection();
                        sel?.removeAllRanges();
                        sel?.addRange(range);
                    }
                }
            }

            // Exit to the left
            if (e.key === "ArrowLeft") {
                const sel = mf.selection;
                if (sel.l === 0) {
                    e.preventDefault();
                    mf.blur();

                    const dom = mf.closest("[data-node-view-wrapper]");
                    if (dom) {
                        const range = document.createRange();
                        range.setStartBefore(dom);
                        range.setEndBefore(dom);
                        const sel = window.getSelection();
                        sel?.removeAllRanges();
                        sel?.addRange(range);
                    }
                }
            }
        });

        // function filterMenu(items: any[], prefixes: string[]) {
        //         return items
        //             .map(item => {
        //                 if (item.submenu) {
        //                     item.submenu = filterMenu(item.submenu, prefixes)
        //                 }
        //                 if (item.items) {
        //                     item.items = filterMenu(item.items, prefixes)
        //                 }
        //                 return item
        //             })
        //             .filter(item => {
        //                 const id = item.id ?? ""
        //                 return !prefixes.some(prefix => id.startsWith(prefix))
        //             })
        //     }

        //     mf.addEventListener("mount", () => {
        //         const prefixes = ["mode", "copy as typst", "copy as asciimath", "copy as mathml"]
        //         mf.menuItems = filterMenu(mf.menuItems as any[], prefixes)
        //     })


        //Wait until MathLive is fully initialized
        mf.addEventListener("mount", () => {
            const items = mf.menuItems as any[];
            mf.menuItems = items.filter(item =>
                !item.id?.startsWith("color") &&
                !item.id?.startsWith("background") &&
                !item.id?.startsWith("mode") &&
                !item.id?.startsWith("cut") &&
                !item.id?.startsWith("copy") &&
                !item.id?.startsWith("paste") &&
                !item.id?.startsWith("select")
            );
        });


        return () => {
            mf.remove()
        }
    }, [])


    useEffect(() => {
        // if (mfRef.current && mfRef.current.value !== node.attrs.latex) {
        //     mfRef.current.value = node.attrs.latex
        // }
        if (mfRef.current && node.attrs.latex !== mfRef.current.getValue()) {
            mfRef.current.setValue(node.attrs.latex || "", { format: "latex" })
        }
    }, [node.attrs.latex])

    //Needed for INSERT (Parse LATEX)
    useEffect(() => {
        if (mfRef.current) {
            const latex = (node.attrs.latex || "").replace(/\\\\/g, "\\");
            mfRef.current.setValue(latex, { format: "latex" });
        }
    }, []);

    return (
        <NodeViewWrapper
            as="span"
            data-inline-math="true"
            data-node-view-wrapper
        >
            <span ref={spanRef} />
        </NodeViewWrapper>
    )
}