import { EditorView } from "codemirror";

export const is_dark_mode =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

const stone = is_dark_mode ? "#7d8799" : "", // Brightened compared to original to increase contrast
    highlightBackground = is_dark_mode ? "#2c313a" : "",
    background = is_dark_mode ? "#1E1E1E" : "#FFFFFF",
    foreground = is_dark_mode ? "#D4D4D4" : "#000000",
    selection = is_dark_mode ? "#ADD6FF26" : "#ADD6FF80",
    cursor = is_dark_mode ? "#bebebe" : "";

const theme_specs = {
    "&": {
        color: foreground,
        backgroundColor: background,
    },

    ".cm-content": {
        caretColor: cursor,
    },

    ".cm-cursor, .cm-dropCursor": { borderLeftColor: cursor },
    "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
        {
            backgroundColor: selection,
        },

    ".cm-panels": { backgroundColor: background, color: foreground },
    ".cm-panels.cm-panels-top": { borderBottom: "2px solid black" },
    ".cm-panels.cm-panels-bottom": { borderTop: "2px solid black" },

    ".cm-searchMatch": {
        backgroundColor: "#72a1ff59",
        outline: "1px solid #457dff",
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
        backgroundColor: "#6199ff2f",
    },

    ".cm-activeLine": { backgroundColor: "#6699ff0b" },
    ".cm-selectionMatch": { backgroundColor: "#aafe661a" },

    "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
        backgroundColor: "#bad0f847",
    },

    ".cm-gutters": {
        backgroundColor: background,
        color: stone,
        border: "none",
    },

    ".cm-activeLineGutter": {
        fontWeight: "bold",
        backgroundColor: highlightBackground,
    },
};

export const theme = [
    EditorView.theme(theme_specs),
    EditorView.darkTheme.of(is_dark_mode),
];
