declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    insertInlineMath: () => ReturnType
  }
}