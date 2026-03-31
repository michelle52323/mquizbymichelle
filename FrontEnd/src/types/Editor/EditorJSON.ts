export type EditorJson = {
    type?: string;
    attrs?: Record<string, any>;
    content?: EditorJson[];
    text?: string;
    marks?: {
        type: string;
        attrs?: Record<string, any>;
        [key: string]: any;
    }[];
    [key: string]: any;
};