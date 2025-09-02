import { setDiagnostics } from "@codemirror/lint";
import { EditorView } from "codemirror";

let UpdateLints = function (editor: EditorView, errors, warnings) {
    let diagnostics = [];

    errors.forEach((err) => {
        const error_line = editor.state.doc.line(err.line);
        diagnostics.push({
            from: error_line.from,
            to: error_line.to,
            severity: "error",
            message: err.text,
        });
    });

    warnings.forEach((warn) => {
        const warning_line = editor.state.doc.line(warn.line);
        diagnostics.push({
            from: warning_line.from,
            to: warning_line.to,
            severity: "warning",
            message: warn.text,
        });
    });

    editor.dispatch(setDiagnostics(editor.state, diagnostics));
};

export { UpdateLints };
