import chalk from "chalk";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import type { CommandModule } from "yargs";
import { MUDError } from "@latticexyz/common/errors";
import { logError } from "../utils/errors";
import localPackageJson from "../../package.json" assert { type: "json" };
import glob from "glob";
import { mudPackages } from "../mudPackages";

type Options = {
  backup?: boolean;
  force?: boolean;
  restore?: boolean;
  mudVersion?: string;
  tag?: string;
  commit?: string;
  link?: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "set-version",

  describe: "Set MUD version in all package.json files and optionally backup the previously installed version",

  builder(yargs) {
    return yargs.options({
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
  const { link } = options;
  let { mudVersion } = options;

  const packageJson = readPackageJson(filePath);
  const mudPackageNames = Object.keys(mudPackages);

  // Find all MUD dependencies
  const mudDependencies: Record<string, string> = {};
  for (const packageName in packageJson.dependencies) {
    if (mudPackageNames.includes(packageName)) {
      mudDependencies[packageName] = packageJson.dependencies[packageName];
    }
  }

  // Find all MUD devDependencies
  const mudDevDependencies: Record<string, string> = {};
  for (const packageName in packageJson.devDependencies) {
    if (mudPackageNames.includes(packageName)) {
      mudDevDependencies[packageName] = packageJson.devDependencies[packageName];
    }
  }

  // Update the dependencies
  for (const packageName in packageJson.dependencies) {
    if (mudPackageNames.includes(packageName)) {
      packageJson.dependencies[packageName] = resolveMudVersion(packageName, "dependencies");
    }
  }

  // Update the devDependencies
  for (const packageName in packageJson.devDependencies) {
    if (mudPackageNames.includes(packageName)) {
      packageJson.devDependencies[packageName] = resolveMudVersion(packageName, "devDependencies");
    }
  }

  // Write the updated package.json
  writeFileSync(filePath, JSON.stringify(packageJson, null, 2) + "\n");

  console.log(`Updating ${filePath}`);
  logComparison(mudDependencies, packageJson.dependencies);
  logComparison(mudDevDependencies, packageJson.devDependencies);

  return packageJson;

  function resolveMudVersion(key: string, type: "dependencies" | "devDependencies") {
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
function resolveLinkPath(packageJsonPath: string, mudLinkPath: string, packageName: string) {
  const packageJsonToRootPath = path.relative(path.dirname(packageJsonPath), process.cwd());
  const linkPath = path.join(packageJsonToRootPath, mudLinkPath, mudPackages[packageName].localPath);
  return "link:" + linkPath;
}

export default commandModule;
