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

const keyword_completions = (keywords + " " + glsl_keywords).split(" ").map((name: string) => { return { label: name, type: "keyword" } });

const primitive_type_completions =

// Define all basic primitive types
["int", "double", "float", "void", "bool", "uint"]

// Define all vector types
.concat(["b", "i", "u", "", "d"].map(pref => { return [pref + "vec2", pref + "vec3", pref + "vec4"]; }).flat())

// Define all matrix types
.concat(["mat2", "mat3", "mat4"].map(mat_type => {return [mat_type, mat_type + "x2", mat_type + "x3", mat_type + "x4"];}).flat())

// Make completion object out of all the primitive types
.map(type_name => {return {label: type_name, type: "type"}});


export const autocomplete_extensions = [
    GLSLLanguage.data.of({
        autocomplete: completeFromList(keyword_completions)
    }),

    GLSLLanguage.data.of({
        autocomplete: completeFromList(primitive_type_completions)
    }),

    //GLSLLanguage.data.of({
    //  autocomplete: local_completion
    //})
];