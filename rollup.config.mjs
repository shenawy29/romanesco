// For the main application
import { nodeResolve } from "@rollup/plugin-node-resolve"

// For the GLSL parser
import typescript from "rollup-plugin-ts"
import { lezer } from "@lezer/generator/rollup"

export default [
  // GLSL parser
  {
    input: "glsl_parser/src/index.ts",
    external: id => id != "tslib" && !/^(\.?\/|\w:)/.test(id),
    output: [
      { file: "glsl_parser/dist/index.cjs", format: "cjs" },
      { dir: "glsl_parser/dist", format: "es" }
    ],
    plugins: [lezer(), typescript()]
  },

  // Main application
  {
    input: "./src/editor.mjs",
    output: {
      file: "./dist/editor.bundle.js",
      format: "iife"
    },
    plugins: [nodeResolve()]
  }
]