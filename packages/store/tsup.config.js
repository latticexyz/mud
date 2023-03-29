import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["mud.config.mts"],
  outDir: "dist",
  format: ["esm"],
  sourcemap: false,
  clean: true,
  bundle: false,
});
