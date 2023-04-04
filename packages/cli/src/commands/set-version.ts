import chalk from "chalk";
import { existsSync, readFileSync, rmSync, writeFileSync } from "fs";
import path from "path";
import type { CommandModule } from "yargs";
import { logError, MUDError } from "../utils/errors.js";
import localPackageJson from "../../package.json";

type Options = {
  backup?: boolean;
  force?: boolean;
  restore?: boolean;
  mudVersion?: string;
};

const BACKUP_FILE = ".mudbackup";
const MUD_PREFIX = "@latticexyz";

const commandModule: CommandModule<Options, Options> = {
  command: "set-version",

  describe: "Install a custom MUD version and optionally backup the previously installed version",

  builder(yargs) {
    return yargs.options({
      backup: { type: "boolean", description: `Back up the current MUD versions to "${BACKUP_FILE}"` },
      force: {
        type: "boolean",
        description: `Backup fails if a "${BACKUP_FILE}" file is found, unless --force is provided`,
      },
      restore: { type: "boolean", description: `Restore the previous MUD versions from "${BACKUP_FILE}"` },
      mudVersion: { alias: "v", type: "string", description: "The MUD version to install" },
    });
  },

  async handler(options) {
    try {
      if (!options.mudVersion && !options.restore) {
        throw new MUDError(`Version parameter is required unless --restore is provided.`);
      }

      // Resolve the `canary` version number if needed
      options.mudVersion =
        options.mudVersion === "canary" ? await getCanaryVersion(localPackageJson.name) : options.mudVersion;

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
  const { backup, restore, force, mudVersion } = options;
  const backupFilePath = path.join(path.dirname(filePath), BACKUP_FILE);

  // If `backup` is true and force not set, check if a backup file already exists and throw an error if it does
  if (backup && !force && existsSync(backupFilePath)) {
    throw new MUDError(
      `A backup file already exists at ${backupFilePath}.\nUse --force to overwrite it or --restore to restore it.`
    );
  }

  const packageJson = readPackageJson(filePath);

  // Load .mudbackup if `restore` is true
  const backupJson = restore ? readPackageJson(backupFilePath) : undefined;

  // Find all MUD dependencies
  const mudDependencies: Record<string, string> = {};
  for (const key in packageJson.dependencies) {
    if (key.startsWith(MUD_PREFIX)) {
      mudDependencies[key] = packageJson.dependencies[key];
    }
  }

  // Find all MUD devDependencies
  const mudDevDependencies: Record<string, string> = {};
  for (const key in packageJson.devDependencies) {
    if (key.startsWith(MUD_PREFIX)) {
      mudDevDependencies[key] = packageJson.devDependencies[key];
    }
  }

  // Back up the current dependencies if `backup` is true
  if (backup) {
    writeFileSync(
      backupFilePath,
      JSON.stringify({ dependencies: mudDependencies, devDependencies: mudDevDependencies }, null, 2)
    );
    console.log(chalk.green(`Backed up MUD dependencies from ${filePath} to ${backupFilePath}`));
  }

  // Update the dependencies
  for (const key in packageJson.dependencies) {
    if (key.startsWith(MUD_PREFIX)) {
      packageJson.dependencies[key] =
        restore && backupJson ? backupJson.dependencies[key] : mudVersion || packageJson.dependencies[key];
    }
  }

  // Update the devDependencies
  for (const key in packageJson.devDependencies) {
    if (key.startsWith(MUD_PREFIX)) {
      packageJson.devDependencies[key] =
        restore && backupJson ? backupJson.devDependencies[key] : mudVersion || packageJson.devDependencies[key];
    }
  }

  // Write the updated package.json
  writeFileSync(filePath, JSON.stringify(packageJson, null, 2) + "\n");

  console.log(`Updating ${filePath}`);
  logComparison(mudDependencies, packageJson.dependencies);
  logComparison(mudDevDependencies, packageJson.devDependencies);

  // Remove the backup file if `restore` is true and `backup` is false
  // because the old backup file is no longer needed
  if (restore && !backup) {
    rmSync(backupFilePath);
    console.log(chalk.green(`Cleaned up ${backupFilePath}`));
  }

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

async function getCanaryVersion(pkg: string) {
  try {
    console.log(chalk.blue("fetching MUD canary version..."));
    const result = await (await fetch(`https://registry.npmjs.org/${pkg}`)).json();
    const canary = result["dist-tags"].canary;
    console.log(chalk.green("MUD canary version:", canary));
    return canary;
  } catch (e) {
    throw new MUDError(`Could not fetch canary version of ${pkg}`);
  }
}

function logComparison(prev: Record<string, string>, curr: Record<string, string>) {
  for (const key in prev) {
    if (prev[key] !== curr[key]) {
      console.log(`${key}: ${chalk.red(prev[key])} -> ${chalk.green(curr[key])}`);
    }
  }
}

export default commandModule;
