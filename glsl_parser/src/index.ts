import * as _codemirror_state from '@codemirror/state';
import {parser} from "./syntax.grammar"
import {LRLanguage, LanguageSupport, indentNodeProp, foldNodeProp, foldInside, delimitedIndent} from "@codemirror/language"
import {styleTags, tags as t} from "@lezer/highlight"

import {HighlightStyle, syntaxHighlighting} from "@codemirror/language"

const GLSLHighlightStyle = HighlightStyle.define([
  {tag: t.keyword, color: "#fc6"},
  {tag: t.comment, color: "#f5d", fontStyle: "italic"}
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
        Identifier: t.variableName,
        Boolean: t.bool,
        String: t.string,
        LineComment: t.lineComment,
        "( )": t.paren
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
  return new LanguageSupport(GLSLLanguage)
};
