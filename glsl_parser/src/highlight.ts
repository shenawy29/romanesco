import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

const GLSLHighlightStyle_light = HighlightStyle.define(
    [
        { tag: t.keyword, color: "#af00db" },
        { tag: t.comment, color: "#008000", fontStyle: "italic" },
        { tag: t.number, color: "#098658" },
        { tag: t.string, color: "#a31515" },
        { tag: t.bool, color: "#0000ff" },
        { tag: t.variableName, color: "#000000" },
        { tag: t.typeName, color: "#0000ff" },
        { tag: t.className, color: "#000000" },
        { tag: t.processingInstruction, color: "#af00db" },
        { tag: t.function(t.variableName), color: "#795e26" },
        { tag: t.function(t.definition(t.variableName)), color: "#795e26" },
    ],
    {
        themeType: "light",
    },
);

const GLSLHighlightStyle_dark = HighlightStyle.define(
    [
        { tag: t.keyword, color: "#C586C0" },
        { tag: t.comment, color: "#6A9955", fontStyle: "italic" },
        { tag: t.number, color: "#b5cea8" },
        { tag: t.string, color: "#ce9178" },
        { tag: t.bool, color: "#569cd6" },
        { tag: t.variableName, color: "#9CDCFE" },
        { tag: t.typeName, color: "#569cd6" },
        { tag: t.className, color: "#d4d4d4" },
        { tag: t.processingInstruction, color: "#c586c0" },
        { tag: t.function(t.variableName), color: "#dcdcaa" },
        { tag: t.function(t.definition(t.variableName)), color: "#dcdcaa" },
    ],
    {
        themeType: "dark",
    },
);

export const highlight_extensions = [
    syntaxHighlighting(GLSLHighlightStyle_light),
    syntaxHighlighting(GLSLHighlightStyle_dark),
];
