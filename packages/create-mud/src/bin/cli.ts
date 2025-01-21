import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yargsInteractive from "yargs-interactive";
import glob from "fast-glob";
import packageJson from "../../package.json";
import { templates } from "../common";
import { exists } from "../exists";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  yargsInteractive()
    .usage("$0 [args]")
    .interactive({
      interactive: { default: true },
      name: {
        describe: "Name your project",
        type: "input",
      },
      template: {
        describe: "Pick a template",
        type: "list",
        choices: templates,
      },
      "mud-version": {
        type: "input",
        describe: "The version of MUD packages to use, defaults to latest",
        default: packageJson.version,
      },
    })
    .then(async (args) => {
      if (!args.name) throw new Error("No project name provided.");

      const destDir = path.join(process.cwd(), args.name);
      if (await exists(destDir)) {
        throw new Error(`Target directory "${destDir}" already exists.`);
      }

      const sourceDir = path.join(__dirname, "..", "templates", args.template);
      const files = await glob("**/*", { cwd: sourceDir, dot: true });

      for (const filename of files) {
        const sourceFile = path.join(sourceDir, filename);
        const destFile = path.join(destDir, filename);

        await fs.mkdir(path.dirname(destFile), { recursive: true });

        if (/package\.json$/.test(sourceFile)) {
          const source = await fs.readFile(sourceFile, "utf-8");
          await fs.writeFile(destFile, source.replaceAll(/{{mud-version}}/g, args.mudVersion), "utf-8");
        } else {
          await fs.copyFile(sourceFile, destFile);
        }
      }

      console.log(`\nDone! Play in the MUD with \`cd ${args.name}\` and \`pnpm run dev\`\n`);
    });
}

run();
