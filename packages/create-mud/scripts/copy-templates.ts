import fs from "node:fs/promises";
import path from "node:path";
import { execa } from "execa";
import { glob } from "glob";

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

  const files = (await execa("git", ["ls-files", "templates"], { cwd: rootDir })).stdout.trim().split("\n");

  for (const file of files) {
    const sourcePath = path.resolve(rootDir, file);
    const destPath = path.resolve(
      packageDir,
      "dist",
      // Rename `.gitignore` to `gitignore`, so that create-create-app can copy it properly.
      file.replace(/\.gitignore$/, "gitignore"),
    );

    await fs.mkdir(path.dirname(destPath), { recursive: true });

    if (/package.json$/.test(destPath)) {
      let source = await fs.readFile(sourcePath, "utf-8");
      // Replace all MUD package links with mustache placeholder used by create-create-app
      // that will be replaced with the latest MUD version number when the template is used.
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
    else if (/templates\/[^/]+\/tsconfig.json/.test(destPath)) {
      await fs.copyFile(path.join(__dirname, "tsconfig.base.json"), destPath);
    } else {
      await fs.copyFile(sourcePath, destPath);
    }
  }
})();
