import { existsSync, readFileSync, rmSync, writeFileSync } from "fs";
import path from "path";
import type { CommandModule } from "yargs";
import { logError, MUDError } from "../utils/errors.js";

type Options = {
  github?: string;
  backup?: boolean;
  force?: boolean;
  restore?: boolean;
  npm?: string;
};

const BACKUP_FILE = ".mudbackup";

function getGitUrl(pkg: string, branch: string) {
  return `https://gitpkg.now.sh/latticexyz/mud/packages/${pkg}?${branch}`;
}

const commandModule: CommandModule<Options, Options> = {
  command: "set-version",

  describe: "Install a custom MUD version (local or GitHub) and backup the previous version",

  builder(yargs) {
    return yargs.options({
      github: { type: "string", description: "The MUD GitHub branch to install from" },
      npm: { type: "string", description: "The MUD NPM version to install" },
      backup: { type: "boolean", description: "Back up the current MUD versions to `.mudinstall`" },
      force: {
        type: "boolean",
        description: "Backup fails if a .mudinstall file is found, unless --force is provided",
      },
      restore: { type: "boolean", description: "Restore the previous MUD versions from `.mudinstall`" },
    });
  },

  async handler(options) {
    const { github, npm, restore } = options;

    try {
      const sources = { github, npm };
      const numSources = Object.values(sources).filter((x) => x).length;
      if (numSources > 1) {
        throw new MUDError(`Options ${Object.keys(sources).join(", ")} are mutually exclusive`);
      }
      if (!restore && numSources === 0) {
        throw new MUDError(`No source provided. Choose one of (${Object.keys(sources).join(", ")}).`);
      }

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

function updatePackageJson(filePath: string, options: Options): { workspaces?: string[] } {
  const { backup, restore, force } = options;
  const backupFilePath = path.join(path.dirname(filePath), BACKUP_FILE);

  // If `backup` is true and force not set, check if a backup file already exists and throw an error if it does
  if (backup && !force && existsSync(backupFilePath)) {
    throw new MUDError(
      `A backup file already exists at ${backupFilePath}.\nUse --force to overwrite it or --restore to restore it.`
    );
  }

  console.log("Updating", filePath);
  const packageJson = readPackageJson(filePath);

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
        restore && backupJson ? backupJson.dependencies[key] : updatedPackageVersion(key, options);
    }
  }

  // Update the devDependencies
  for (const key in packageJson.devDependencies) {
    if (key.startsWith("@latticexyz")) {
      packageJson.devDependencies[key] =
        restore && backupJson ? backupJson.devDependencies[key] : updatedPackageVersion(key, options);
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

function updatedPackageVersion(pkg: string, { npm, github }: Options) {
  if (npm) return npm;
  if (github) return getGitUrl(pkg.replace("@latticexyz/", ""), github);
  return "";
}

export default commandModule;
