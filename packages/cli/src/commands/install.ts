import { readFileSync, rmSync, writeFileSync } from "fs";
import path from "path";
import type { CommandModule } from "yargs";
import { logError, MUDError } from "../utils/errors.js";

type Options = {
  branch?: string;
  backup?: boolean;
  restore?: boolean;
};

const BACKUP_FILE = ".mudinstall";

const commandModule: CommandModule<Options, Options> = {
  command: "install",

  describe: "Install a custom MUD version (local or GitHub) and backup the previous version",

  builder(yargs) {
    return yargs.options({
      branch: { type: "string" },
      backup: { type: "boolean", description: "Back up the current MUD versions to `.mudinstall`" },
      restore: { type: "boolean", description: "Restore the previous MUD versions from `.mudinstall`" },
    });
  },

  async handler(options) {
    const { branch } = options;

    try {
      console.log("Installing on", branch);

      // Read the current package.json
      const rootPath = "./package.json";
      const { workspaces } = updatePackageJson(rootPath, options);

      // Load the package.json of each workspace
      if (workspaces) {
        for (const workspace of workspaces) {
          const filePath = path.join(workspace, "/package.json");
          updatePackageJson(filePath, options);
        }
      }
    } catch (e) {
      logError(e);
    } finally {
      process.exit(0);
    }
  },
};

function updatePackageJson(filePath: string, { backup, restore }: Options): { workspaces?: string[] } {
  console.log("Updating", filePath);
  const packageJson = readPackageJson(filePath);
  const backupFilePath = path.join(path.dirname(filePath), BACKUP_FILE);

  // Load .mudinstall if `restore` is true
  const backupJson = restore ? readPackageJson(backupFilePath) : undefined;

  // Find all @latticexyz dependencies
  const mudDependencies: Record<string, string> = {};
  for (const key in packageJson.dependencies) {
    if (key.startsWith("@latticexyz")) {
      mudDependencies[key] = packageJson.dependencies[key];
    }
  }

  // Find all @latticexyz devDependencies
  const mudDevDependencies: Record<string, string> = {};
  for (const key in packageJson.devDependencies) {
    if (key.startsWith("@latticexyz")) {
      mudDevDependencies[key] = packageJson.devDependencies[key];
    }
  }

  console.log("Dependencies", mudDependencies);
  console.log("Dev Dependencies", mudDevDependencies);

  // Back up the current dependencies if `backup` is true
  if (backup) {
    writeFileSync(
      backupFilePath,
      JSON.stringify({ dependencies: mudDependencies, devDependencies: mudDevDependencies }, null, 2)
    );
  }

  // Update the dependencies
  for (const key in packageJson.dependencies) {
    if (key.startsWith("@latticexyz")) {
      packageJson.dependencies[key] =
        restore && backupJson ? backupJson.dependencies[key] : packageJson.dependencies[key];
    }
  }

  // Update the devDependencies
  for (const key in packageJson.devDependencies) {
    if (key.startsWith("@latticexyz")) {
      packageJson.devDependencies[key] =
        restore && backupJson ? backupJson.devDependencies[key] : packageJson.devDependencies[key];
    }
  }

  // Write the updated package.json
  writeFileSync(filePath, JSON.stringify(packageJson, null, 2) + "\n");

  // Remove the backup file if `restore` is true and `backup` is false
  // because the old backup file is no longer needed
  if (restore && !backup) rmSync(backupFilePath);

  return packageJson;
}

function readPackageJson(path: string): {
  workspaces?: string[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
} {
  try {
    const jsonString = readFileSync(path, "utf8");
    return JSON.parse(jsonString);
  } catch {
    throw new MUDError("Could not read JSON at " + path);
  }
}

export default commandModule;
