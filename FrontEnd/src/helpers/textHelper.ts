
export function truncateByLength(text: string, maxChars: number) {
    return text.length > maxChars ? text.slice(0, maxChars) + "…" : text;
}



// export function isEditorEmpty(doc: any) {
//     function walk(node: any): boolean {
//         if (node.type === 'text' && node.text?.trim().length > 0) {
//             return true
//         }

//         if (node.type === 'inlineMath' && node.attrs?.latex?.trim().length > 0) {
//             return true
//         }

//         if (Array.isArray(node.content)) {
//             return node.content.some(walk)
//         }

//         return false
//     }
//     if (!doc) return true; // treat missing JSON as empty

//     return !walk(doc)
// }

export function isEditorEmpty(doc: any): boolean {
    if (!doc) return true;

    function walk(node: any): boolean {
        if (!node) return false;

        // 1. TEXT NODE WITH NON-WHITESPACE
        if (node.type === 'text' && node.text?.trim().length > 0) {
            return true;
        }

        // 2. MATH AS A NODE (inline or block)
        if (
            (node.type === 'inlineMath' ||
                node.type === 'mathInline' ||
                node.type === 'math' ||
                node.type === 'mathBlock' ||
                node.type === 'blockMath' ||
                node.type === 'equation') &&
            node.attrs?.latex?.trim().length > 0
        ) {
            return true;
        }

        // 3. MATH AS A MARK ON A TEXT NODE
        if (Array.isArray(node.marks)) {
            const hasMathMarkWithContent = node.marks.some((mark: any) =>
                (mark.type === 'math' ||
                    mark.type === 'inlineMath' ||
                    mark.type === 'mathInline') &&
                mark.attrs?.latex?.trim().length > 0
            );

            if (hasMathMarkWithContent) {
                return true;
            }
        }

        // 4. RECURSE INTO CHILD CONTENT
        if (Array.isArray(node.content)) {
            return node.content.some(walk);
        }

        return false;
    }

    // doc might be a single node or an array of nodes
    if (Array.isArray(doc)) {
        return !doc.some(walk);
    }

    return !walk(doc);
}
