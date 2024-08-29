import { defineConfig } from "tsup";

export default defineConfig({
  define: {
    "process.env.NODE_ENV": "production",
  },
  entry: ["bin/explorer.ts"],
  target: "esnext",
  format: ["esm"],
  sourcemap: true,
  clean: true,
  minify: true,
});
