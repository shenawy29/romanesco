import { GLSLLanguage, keywords, glsl_keywords } from "./language";

import { syntaxTree } from "@codemirror/language";
import {
    SyntaxNode,
    SyntaxNodeRef,
    IterMode,
    NodeWeakMap,
} from "@lezer/common";
import {
    completeFromList,
    CompletionContext,
    CompletionResult,
    Completion,
} from "@codemirror/autocomplete";

// Just to be explicit about the type we are referencing by "Text"
import { Text } from "@codemirror/state";

// An array of tuples that defines how to check for definitions
const definition_dispatcher: [
    match: (node: SyntaxNodeRef) => SyntaxNodeRef | null,
    type: string,
][] = [
    [
        (node: SyntaxNodeRef) => {
            if (node.name == "VariableDeclaration")
                return node.node.getChild("Identifier");
            return null;
        },
        "variable",
    ],

    [
        (node: SyntaxNodeRef) => {
            if (
                node.name == "FunctionDeclaration" ||
                node.name == "FunctionDefinition"
            )
                return node.node
                    .getChild("FunctionHeader")!
                    .getChild("Identifier");
            return null;
        },
        "function",
    ],

    [
        (node: SyntaxNodeRef) => {
            if (node.name == "StructDefinition")
                return node.node.getChild("Identifier");
            return null;
        },
        "class",
    ],
];

// Keep one "static" cache for now, but it would be nice to have one per extension instance
// TODO : gather definitions for macros
const cache = new NodeWeakMap<readonly Completion[]>();

function GetDefinitionsUntil(
    doc: Text,
    node: SyntaxNode,
    until: number,
): readonly Completion[] {
    const cached = cache.get(node);
    if (cached) return cached;

    let definitions: Completion[] = [],
        top = true;

    // Iterate through all the nodes in the block and gather all the definitions.
    node.cursor(IterMode.IncludeAnonymous).iterate((current_node) => {
        // Skip the root node that we started iterating from. We only want to iterate on it's children recursively.
        if (top) {
            top = false;
            return;
        }

        // Stop iterating when we reach the limit
        if (current_node.from >= until) return false;

        // Don't iterate through other blocks with different scopes that the node from where we started
        if (current_node.name == "Block") return false;

        // Find all the definitions (variables, function, etc..) and make completion data out of them.
        for (const [search, type] of definition_dispatcher) {
            const definition_identifier_node = search(current_node);
            if (definition_identifier_node) {
                definitions.push({
                    label: doc.sliceString(
                        definition_identifier_node.from,
                        definition_identifier_node.to,
                    ),
                    type: type,
                });
                break;
            }
        }
    });

    // Repeat the same process for all parent nodes until the root of the syntax tree
    if (node.parent)
        definitions = definitions.concat(
            GetDefinitionsUntil(doc, node.parent, node.from),
        );

    cache.set(node, definitions);

    return definitions;
}

function LocalCompletion(context: CompletionContext): CompletionResult | null {
    const inner_node = syntaxTree(context.state).resolveInner(context.pos, -1);

    const is_word = inner_node.name == "Identifier";
    if (!is_word && !context.explicit) return null;

    const parent_node = inner_node.parent;

    if (parent_node) {
        const definitions = GetDefinitionsUntil(
            context.state.doc,
            parent_node,
            context.pos,
        );
        if (definitions.length != 0)
            return {
                options: definitions,

                // TODO : figure out what the following "from" value does. (cargo-culted for now)
                from: is_word ? inner_node.from : context.pos,

                // Let's just copy this from the javascript example and assume it matches all identifiers
                validFor: /^[\w$\xa1-\uffff][\w$\d\xa1-\uffff]*$/,
            };
    }

    return null;
}

// All of the language's keywords
const keyword_completions = (keywords + " " + glsl_keywords)
    .split(" ")
    .map((name: string) => {
        return { label: name, type: "keyword" };
    });

// All of the language's primitive types
const primitive_type_completions =
    // Define all basic primitive types
    ["int", "double", "float", "void", "bool", "uint"]

        // Define all vector types
        .concat(
            ["b", "i", "u", "", "d"]
                .map((pref) => {
                    return [pref + "vec2", pref + "vec3", pref + "vec4"];
                })
                .flat(),
        )

        // Define all matrix types
        .concat(
            ["mat2", "mat3", "mat4"]
                .map((mat_type) => {
                    return [
                        mat_type,
                        mat_type + "x2",
                        mat_type + "x3",
                        mat_type + "x4",
                    ];
                })
                .flat(),
        )

        // Make completion objects out of all the primitive types
        .map((type_name) => {
            return { label: type_name, type: "type" };
        });

// All builtin constant values (only bool)
const constants = ["true", "false"].map((constant) => {
    return { label: constant, type: "constant" };
});

// All builtin functions
const builtin_functions = [
    "radians",
    "degrees",
    "sin",
    "cos",
    "asin",
    "acos",
    "pow",
    "exp",
    "log",
    "exp2",
    "log2",
    "sqrt",
    "inversesqrt",
    "abs",
    "sign",
    "floor",
    "trunc",
    "round",
    "ceil",
    "mod",
    "min",
    "max",
    "clamp",
    "length",
    "dot",
    "normalize",
].map((fun) => {
    return { label: fun, type: "function" };
});

export const autocomplete_extensions = [
    GLSLLanguage.data.of({
        autocomplete: completeFromList(
            keyword_completions
                .concat(primitive_type_completions)
                .concat(constants)
                .concat(builtin_functions),
        ),
    }),

    GLSLLanguage.data.of({
        autocomplete: LocalCompletion,
    }),
];
