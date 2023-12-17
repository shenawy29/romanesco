import { setDiagnostics} from "@codemirror/lint"

let UpdateLints = function(editor, errors, warnings)
{
    let diagnostics = [];

    errors.forEach(err => {
        let error_line = editor.state.doc.line(err.line);
        diagnostics.push({
            from: error_line.from,
            to: error_line.to,
            severity: "error",
            message: err.text
        })
    });

    warnings.forEach(warn => {
        let warning_line = editor.state.doc.line(warn.line);
        diagnostics.push({
            from: warning_line.from,
            to: warning_line.to,
            severity: "warning",
            message: warn.text
        })
    });

    editor.dispatch(setDiagnostics(editor.state, diagnostics));
};

export { UpdateLints };