import { parser } from "./syntax.grammar"
import { syntaxTree, LRLanguage, LanguageSupport, indentNodeProp, foldNodeProp, foldInside, delimitedIndent } from "@codemirror/language"
import { styleTags, tags as t, Tag } from "@lezer/highlight"
import { SyntaxNode } from "@lezer/common"
import { completeFromList, CompletionContext, CompletionResult, Completion } from "@codemirror/autocomplete"
import { Extension } from "@codemirror/state"
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language"

const GLSLHighlightStyle_light = HighlightStyle.define([
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
], {
  themeType: "light"
});

const GLSLHighlightStyle_dark = HighlightStyle.define([
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
], {
  themeType: "dark"
});

const keywords = "for while do break continue if else return switch case default struct";
const reserved_keywords = "goto typedef enum class template using namespace extern this sizeof static volatile public long";
const glsl_keywords = "in out uniform sample flat layout";

const style_tags: { [key: string]: Tag } = {
  "Builtin": t.keyword,
  "PreprocDirectiveName": t.processingInstruction,
  "Identifier": t.variableName,
  "CallExpression/Identifier": t.function(t.variableName),
  "FunctionDeclaration/FunctionHeader/Identifier FunctionDefinition/FunctionHeader/Identifier": t.function(t.definition(t.variableName)),
  "Boolean": t.bool,
  "String": t.string,
  "LineComment": t.lineComment,
  "BlockComment": t.blockComment,
  "Integer": t.integer,
  "Float": t.float,
  "PrimitiveType": t.typeName,
  "( )": t.paren,
  "{ }": t.brace,
  "[ ]": t.squareBracket
};
style_tags[keywords] = style_tags[reserved_keywords] = style_tags[glsl_keywords] = t.keyword;

export const GLSLLanguage = LRLanguage.define({
  name: "GLSL",
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        Application: delimitedIndent({ closing: ")", align: false })
      }),
      foldNodeProp.add({ "Block": foldInside }),
      styleTags(style_tags)
    ]
  }),
  languageData: {
    closeBrackets: { brackets: ["(", "[", "{", "'", '"', "`"] },
    commentTokens: { line: "//", block: { open: "/*", close: "*/" } },
    indentOnInput: /^\s*(?:case |default:|\{|\}|<\/)$/,
    wordChars: "$"
  }
});

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

  options.push({label : "ggg"});

  return {
    options,
    from: is_word ? inner.from : context.pos,
  //  validFor: Identifier
  }
  return {options, from:1};
}

const keyword_completion = (name: string) => { return { label: name, type: "keyword" } };

let autocomplete = [
  GLSLLanguage.data.of({
    autocomplete: completeFromList((keywords + " " + glsl_keywords).split(" ").map(keyword_completion))
  }),
  //GLSLLanguage.data.of({
  //  autocomplete: local_completion
  //})
];

export function GLSL(): LanguageSupport {
  return new LanguageSupport(GLSLLanguage, [syntaxHighlighting(GLSLHighlightStyle_light), syntaxHighlighting(GLSLHighlightStyle_dark), autocomplete]);
};
