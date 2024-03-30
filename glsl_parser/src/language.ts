import { parser } from "./syntax.grammar"
import { styleTags, tags as t, Tag } from "@lezer/highlight"
import { LRLanguage, indentNodeProp, foldNodeProp, foldInside, delimitedIndent } from "@codemirror/language"

export const keywords = "for while do break continue if else return switch case default struct";
export const reserved_keywords = "goto typedef enum class template using namespace extern this sizeof static volatile public long";
export const glsl_keywords = "in out uniform sample flat layout";

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