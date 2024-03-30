import { GLSLLanguage } from "./language"
import { LanguageSupport } from "@codemirror/language"

import { autocomplete_extensions } from "./autocomplete"
import { highlight_extensions } from "./highlight"

export function GLSL(): LanguageSupport {
  return new LanguageSupport(GLSLLanguage, [highlight_extensions, autocomplete_extensions]);
};
