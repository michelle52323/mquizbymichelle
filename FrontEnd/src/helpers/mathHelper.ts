import katex from "katex";
import "katex/dist/katex.min.css";

export function renderMathInHtml(html: string) {
    const container = document.createElement("div");
    container.innerHTML = html;

    container.querySelectorAll("span[data-inline-math]").forEach(span => {
        const latex = span.getAttribute("data-latex") || "";
        const rendered = katex.renderToString(latex, {
            throwOnError: false,
            displayMode: false
        });
        span.outerHTML = rendered;
    });

    return container.innerHTML;
}