import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/workers/Sync.worker.ts", "src/workers/Recover.worker.ts"],
  target: "esnext",
  format: ["esm"],
  dts: false,
  sourcemap: true,
  clean: true,
  minify: true,
});
