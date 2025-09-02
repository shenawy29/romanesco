import { lezer } from "@lezer/generator/rollup";
import { defineConfig } from "rolldown";

export default defineConfig([
    {
        input: "./src/editor/index.ts",
        output: {
            file: "./dist/dist.js",
            format: "iife",
        },
        plugins: [lezer()],
    },
]);
