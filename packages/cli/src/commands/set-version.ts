import chalk from "chalk";
import { existsSync, readFileSync, rmSync, writeFileSync } from "fs";
import path from "path";
import type { CommandModule } from "yargs";
import { MUDError } from "@latticexyz/common/errors";
import { logError } from "../utils/errors";
import localPackageJson from "../../package.json" assert { type: "json" };
import glob from "glob";

type Options = {
  backup?: boolean;
  force?: boolean;
  restore?: boolean;
  mudVersion?: string;
  tag?: string;
  commit?: string;
  link?: string;
};

const BACKUP_FILE = ".mudbackup";
const MUD_PREFIX = "@latticexyz";

const commandModule: CommandModule<Options, Options> = {
  command: "set-version",

  describe: "Set MUD version in all package.json files and optionally backup the previously installed version",

  builder(yargs) {
    return yargs.options({
      backup: { type: "boolean", description: `Back up the current MUD versions to "${BACKUP_FILE}"` },
      force: {
        type: "boolean",
        description: `Backup fails if a "${BACKUP_FILE}" file is found, unless --force is provided`,
      },
      restore: { type: "boolean", description: `Restore the previous MUD versions from "${BACKUP_FILE}"` },
      mudVersion: { alias: "v", type: "string", description: "Set MUD to the given version" },
      tag: {
        alias: "t",
        type: "string",
        description: "Set MUD to the latest version with the given tag from npm",
      },
      commit: {
        alias: "c",
        type: "string",
        description: "Set MUD to the version based on a given git commit hash from npm",
      },
      link: { alias: "l", type: "string", description: "Relative path to the local MUD root directory to link" },
    });
  },

  async handler(options) {
    try {
      const mutuallyExclusiveOptions = ["mudVersion", "link", "tag", "commit", "restore"];
      const numMutuallyExclusiveOptions = mutuallyExclusiveOptions.reduce(
        (acc, opt) => (options[opt] ? acc + 1 : acc),
        0
      );

      if (numMutuallyExclusiveOptions === 0) {
        throw new MUDError(`You need to provide one these options: ${mutuallyExclusiveOptions.join(", ")}`);
      }

      if (numMutuallyExclusiveOptions > 1) {
        throw new MUDError(`These options are mutually exclusive: ${mutuallyExclusiveOptions.join(", ")}`);
      }

      // Resolve the version number from available options like `tag` or `commit`
      options.mudVersion = await resolveVersion(options);

      // Update all package.json below the current working directory (except in node_modules)
      const packageJsons = glob.sync("**/package.json").filter((p) => !p.includes("node_modules"));
      for (const packageJson of packageJsons) {
        updatePackageJson(packageJson, options);
      }
    } catch (e) {
      logError(e);
    } finally {
      process.exit(0);
    }
  },
};

async function resolveVersion(options: Options) {
  // Backwards compatibility to previous behavior of this script where passing "canary" as the version resolved to the latest commit on main
  if (options.mudVersion === "canary") options.tag = "main";

  let npmResult;
  try {
    console.log(chalk.blue(`Fetching available versions`));
    npmResult = await (await fetch(`https://registry.npmjs.org/${localPackageJson.name}`)).json();
  } catch (e) {
    throw new MUDError(`Could not fetch available MUD versions`);
  }

  if (options.tag) {
    const version = npmResult["dist-tags"][options.tag];
    if (!version) {
      throw new MUDError(`Could not find npm version with tag "${options.tag}"`);
    }
    console.log(chalk.green(`Latest version with tag ${options.tag}: ${version}`));
    return version;
  }

  if (options.commit) {
    // Find a version with this commit hash
    const commit = options.commit.substring(0, 8); // changesets uses the first 8 characters of the commit hash as version for prereleases/snapshot releases
    const version = Object.keys(npmResult["versions"]).find((v) => (v as string).includes(commit));
    if (!version) {
      throw new MUDError(`Could not find npm version based on commit "${options.commit}"`);
    }
    console.log(chalk.green(`Version from commit ${options.commit}: ${version}`));
    return version;
  }

  // If neither a tag nor a commit option is given, return the `mudVersion`
  return options.mudVersion;
}

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
