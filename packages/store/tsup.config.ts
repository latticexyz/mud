import { defineConfig } from "tsup";
import pkg from "./package.json";
import rootPkg from "../../package.json";

export default defineConfig({
  entry: ["ts/index.ts", "mud.config.ts"],
  outDir: "dist",
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  dts: true,
  format: [
    "esm",
    // "cjs"
  ],
  target: "esnext",
  external: [
    // Array Difference of rootPkg - pkg devDependencies
    ...[...Object.keys(rootPkg.devDependencies)].filter((x) => ![...Object.keys(pkg.devDependencies)].includes(x)),
    ...Object.keys(pkg.peerDependencies || {}),
    "esbuild",
    "react",
    "next",
  ],
});
