import chalk from "chalk";
import { ethers } from "ethers";
import { execa } from "execa";
import glob from "glob";
import { basename } from "path";
import type { CommandModule } from "yargs";
import { loadWorldConfig, ResolvedWorldConfig } from "../config/loadWorldConfig.js";
import { deploy } from "../utils/deploy-v2.js";
import { getOutDirectory } from "../utils/forgeConfig.js";

type Options = {
  configPath?: string;
  print?: boolean;
};

const commandModule: CommandModule<Options, Options> = {
  command: "deploy-v2",

  describe: "Deploy MUD v2 contracts",

  builder(yargs) {
    return yargs.options({
      configPath: { type: "string", desc: "Path to the config file" },
      print: { type: "boolean", desc: "Print the resolved config" },
    });
  },

  async handler({ configPath, print }) {
    const config = await loadWorldConfig(configPath);

    // Run forge build
    try {
      await execa("forge", ["build"], { stdout: "inherit", stderr: "pipe" });
    } catch (error: any) {
      if (error?.stderr) {
        console.error(error.stderr);
      }
      console.error(chalk.red("Error running `forge build`"));
      process.exit(1);
    }

    // Get a list of all contracts in output ending with `System`
    const outDir = await getOutDirectory();
    const defaultSystemNames = glob
      // Get all files in outDir ending in `*System.sol  `
      .sync(`${outDir}/*System.sol`)
      // Get the basename of the file
      .map((path) => basename(path, ".sol"))
      // Ignore the base System contract
      .filter((name) => name !== "System");

    // Include overridden systems (even if they don't end with `System`)
    const allSystemNames = [...new Set([...defaultSystemNames, ...Object.keys(config.overrideSystems)])];

    // Exclude systems that are in the exclude list
    const systemNames = allSystemNames.filter((name) => !config.excludeSystems.includes(name));

    // Get all contract names
    const allContractNames = glob
      // Get all files in outDir ending in `*.sol  `
      .sync(`${outDir}/*.sol`)
      // Get the basename of the file
      .map((path) => basename(path, ".sol"));

    // Verify that the list of system names is valid
    for (const systemName of systemNames) {
      if (!allContractNames.includes(systemName)) {
        console.log(chalk.red(`Can not find system "${systemName}"`));
        process.exit(1);
      }
    }

    // Verify that the access lists only include existing systems
    for (const [systemName, system] of Object.entries(config.overrideSystems)) {
      if (system.openAccess) continue;
      for (const accessElement of system.accessList) {
        if (!ethers.utils.isAddress(accessElement) && !systemNames.includes(accessElement)) {
          console.log(
            chalk.red(
              `Invalid access list in "${systemName}": "${accessElement}" is not a valid Ethereum address or name of a local system.`
            )
          );
          process.exit(1);
        }
      }
    }

    // Extend the config with default values for non-overridden, non-excluded systems
    const systems: ResolvedWorldConfig["systems"] = {};
    for (const systemName of systemNames) {
      const defaultConfig = { route: `/${systemName}`, openAccess: true, accessList: [] };
      const overriddenConfig = config.overrideSystems[systemName] ?? defaultConfig;
      const { route, openAccess, accessList } = { ...defaultConfig, ...overriddenConfig };
      systems[systemName] = {
        route,
        openAccess,
        accessListAddresses: openAccess ? [] : accessList.filter(ethers.utils.isAddress),
        accessListSystems: openAccess ? [] : accessList.filter((name) => systemNames.includes(name)),
      };
    }
    const { excludeSystems, overrideSystems, ...otherConfig } = config; // Omit the fields that are not part of the ResolvedWorldConfig
    const resolvedConfig: ResolvedWorldConfig = { ...otherConfig, systems };

    if (print) console.log(chalk.green("\nResolved config:\n"), JSON.stringify(resolvedConfig, null, 2));

    deploy(resolvedConfig);
    process.exit(0);
  },
};

export default commandModule;
