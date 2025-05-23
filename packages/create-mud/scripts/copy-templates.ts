import fs from "node:fs/promises";
import path from "node:path";
import { execa } from "execa";
import glob from "fast-glob";
import { fileURLToPath } from "node:url";
import { exists } from "../src/exists";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const packageDir = path.resolve(__dirname, "..");
  const rootDir = path.resolve(packageDir, "../..");

  // TODO: could swap this with `pnpm m ls --json --depth=-1`
  const mudPackageNames = await (async () => {
    const files = await glob("packages/*/package.json", { cwd: rootDir });
    const packages = await Promise.all(
      files.map(async (file) => JSON.parse(await fs.readFile(path.join(rootDir, file), "utf-8"))),
    );
    return packages.filter((p) => !p.private).map((p) => p.name);
  })();

  const sourceDir = path.join(rootDir, "templates");
  const destDir = path.join(packageDir, "templates");

  // clean
  if (await exists(destDir)) {
    await fs.rm(destDir, { recursive: true });
  }

  const files = (await execa("git", ["ls-files"], { cwd: sourceDir })).stdout.trim().split("\n");

  for (const file of files) {
    const sourcePath = path.resolve(sourceDir, file);
    const destPath = path.resolve(destDir, file);

    await fs.mkdir(path.dirname(destPath), { recursive: true });

    if (/package\.json$/.test(destPath)) {
      let source = await fs.readFile(sourcePath, "utf-8");
      // Replace all MUD package links with placeholder that we can use to later replace
      // with the latest MUD version number when the template is used.
      source = source.replace(/"([^"]+)":\s*"(link|file):[^"]+"/g, (match, packageName) =>
        mudPackageNames.includes(packageName) ? `"${packageName}": "{{mud-version}}"` : match,
      );
      const json = JSON.parse(source);
      // Strip out pnpm overrides
      delete json.pnpm;
      await fs.writeFile(destPath, JSON.stringify(json, null, 2) + "\n");
    }
    // Replace template workspace root `tsconfig.json` files (which have paths relative to monorepo)
    // with one that inherits our base tsconfig.
    else if (/templates\/[^/]+\/tsconfig\.json$/.test(destPath)) {
      await fs.copyFile(path.join(__dirname, "tsconfig.base.json"), destPath);
    }
    // npm excludes .gitignore files during packaging/publishing, so we move this aside for now.
    // When creating a project from the template, we'll move this back.
    else if (/\.gitignore$/.test(destPath)) {
      await fs.copyFile(sourcePath, destPath.replace(/\.gitignore$/, ".gitignore_"));
    } else {
      await fs.copyFile(sourcePath, destPath);
    }
  }
})();
