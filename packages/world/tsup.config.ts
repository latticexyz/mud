import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["mud.config.ts", "ts/index.ts", "ts/register/index.ts", "ts/node/index.ts"],
  target: "esnext",
  format: ["esm"],
  dts: false,
  sourcemap: true,
  clean: true,
  minify: true,
});
