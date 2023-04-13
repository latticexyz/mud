import chalk from "chalk";
import { existsSync, readFileSync, rmSync, writeFileSync } from "fs";
import path from "path";
import type { CommandModule } from "yargs";
import { MUDError } from "@latticexyz/config";
import { logError } from "../utils/errors.js";
import localPackageJson from "../../package.json" assert { type: "json" };

type Options = {
  backup?: boolean;
  force?: boolean;
  restore?: boolean;
  mudVersion?: string;
  link?: string;
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
      link: { alias: "l", type: "string", description: "The local MUD clone to link" },
    });
  },

  async handler(options) {
    try {
      if (!options.mudVersion && !options.link && !options.restore) {
        throw new MUDError("`--mudVersion` or `--link` is required unless --restore is provided.");
      }

      // `link` and `mudVersion` are mutually exclusive
      if (options.link && options.mudVersion) {
        throw new MUDError("Options `--link` and `--mudVersion` are mutually exclusive");
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
  const { restore, force, link } = options;
  let { backup, mudVersion } = options;

  const backupFilePath = path.join(path.dirname(filePath), BACKUP_FILE);
  const backupFileExists = existsSync(backupFilePath);

  // Create a backup file for previous MUD versions by default if linking to local MUD
  if (link && !backupFileExists) backup = true;

  // If `backup` is true and force not set, check if a backup file already exists and throw an error if it does
  if (backup && !force && backupFileExists) {
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
      packageJson.dependencies[key] = resolveMudVersion(key, "dependencies");
    }
  }

  // Update the devDependencies
  for (const key in packageJson.devDependencies) {
    if (key.startsWith(MUD_PREFIX)) {
      packageJson.devDependencies[key] = resolveMudVersion(key, "devDependencies");
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

  function resolveMudVersion(key: string, type: "dependencies" | "devDependencies") {
    if (restore && backupJson) return backupJson[type][key];
    if (link) mudVersion = resolveLinkPath(filePath, link, key);
    if (!mudVersion) return packageJson[type][key];
    return mudVersion;
  }
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

/**
 * Returns path of the package to link, given a path to a local MUD clone and a package
 */
function resolveLinkPath(packageJsonPath: string, mudLinkPath: string, pkg: string) {
  const pkgName = pkg.replace(MUD_PREFIX, "");
  const packageJsonToRootPath = path.relative(path.dirname(packageJsonPath), process.cwd());
  const linkPath = path.join(packageJsonToRootPath, mudLinkPath, "packages", pkgName);
  return "link:" + linkPath;
}

export default commandModule;
