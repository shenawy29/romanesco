import {parser} from "./syntax.grammar"
import {LRLanguage, LanguageSupport, indentNodeProp, foldNodeProp, foldInside, delimitedIndent} from "@codemirror/language"
import {styleTags, tags as t} from "@lezer/highlight"

import {HighlightStyle, syntaxHighlighting} from "@codemirror/language"

const GLSLHighlightStyle = HighlightStyle.define([
  {tag: t.keyword, color: "#708"},
  {tag: t.comment, color: "#a50", fontStyle: "italic"},
  {tag: t.number, color: "#164"},
  {tag: t.string, color: "#a11"},
  {tag: t.bool, color: "#219"},
  {tag: t.variableName, color: "#000"},
  {tag: t.typeName, color: "#085"},
  {tag: t.processingInstruction, color: "#555"},
])

export const GLSLLanguage = LRLanguage.define({
  name: "GLSL",
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        Application: delimitedIndent({closing: ")", align: false})
      }),
      foldNodeProp.add({
        Application: foldInside
      }),
      styleTags({
        "for while do in out uniform break continue if else return"   : t.keyword,
        "goto typedef enum class template using namespace extern this"   : t.keyword,
        "PreprocDirectiveName" : t.processingInstruction,
        "Identifier"  : t.variableName,
        "Boolean"     : t.bool,
        "String"      : t.string,
        "LineComment" : t.lineComment,
        "BlockComment" : t.blockComment,
        "Integer"     : t.integer,
        "Float"       : t.float,
        "Type"        : t.typeName,
        "( )"         : t.paren
      })
    ]
  }),
  languageData: {
    closeBrackets: { brackets: ["(", "[", "{", "'", '"', "`"] },
    commentTokens: { line: "//", block: { open: "/*", close: "*/" } },
    indentOnInput: /^\s*(?:case |default:|\{|\}|<\/)$/,
    wordChars: "$"
  }
})

export function GLSL():LanguageSupport{
  return new LanguageSupport(GLSLLanguage, syntaxHighlighting(GLSLHighlightStyle))
};
