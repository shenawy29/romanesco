import { GLSLLanguage, keywords, glsl_keywords } from "./language"
import { syntaxTree } from "@codemirror/language"
import { SyntaxNode } from "@lezer/common"
import { completeFromList, CompletionContext, CompletionResult, Completion } from "@codemirror/autocomplete"

function local_completion(context: CompletionContext): CompletionResult | null {
    let inner = syntaxTree(context.state).resolveInner(context.pos, -1);
    //let inner = syntaxTree(context.state).resolveInner(context.pos, -1);
    ////if (dontComplete.indexOf(inner.name) > -1) return null
    let is_word = inner.name == "Identifier";
    if (!is_word && !context.explicit) return null;

    let options: Completion[] = []
    console.log(context.state.doc.sliceString(inner.from, inner.to));
    for (let pos: SyntaxNode | null = inner; pos; pos = pos.parent) {
        //if (ScopeNodes.has(pos.name)) options = options.concat(getScope(context.state.doc, pos))
    }

    options.push({ label: "ggg" });

    return {
        options,
        from: is_word ? inner.from : context.pos,
        //  validFor: Identifier
    }
    return { options, from: 1 };
}

const keyword_completion = (name: string) => { return { label: name, type: "keyword" } };

export const autocomplete_extensions = [
    GLSLLanguage.data.of({
        autocomplete: completeFromList((keywords + " " + glsl_keywords).split(" ").map(keyword_completion))
    }),
    //GLSLLanguage.data.of({
    //  autocomplete: local_completion
    //})
];