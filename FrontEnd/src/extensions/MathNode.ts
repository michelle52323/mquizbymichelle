import { Node } from "@tiptap/core"

export const MathNode = Node.create({
  name: "mathNode",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      latex: {
        default: "",
      },
    }
  },

  addCommands() {
    return {
      insertMathNode:
        () =>
        ({ editor }) => {
          return editor.commands.insertContent({
            type: "mathNode",
            attrs: { latex: "" },
          })
        },
    }
  },
})