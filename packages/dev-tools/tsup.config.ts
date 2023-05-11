import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  target: "esnext",
  format: ["esm"],
  dts: false,
  sourcemap: true,
  clean: true,
  minify: true,
  injectStyle: true,
  // bundle react deps so folks can use this in non-react clients
  noExternal: ["react", "react-dom", "react-router-dom"],
});
