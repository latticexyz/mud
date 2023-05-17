import type { CommandModule } from "yargs";
import { anvil, forge, getRpcUrl, getSrcDirectory } from "@latticexyz/common/foundry";
import chalk from "chalk";
import chokidar from "chokidar";
import { loadConfig, resolveConfigPath } from "@latticexyz/config/node";
import { StoreConfig, tablegen } from "@latticexyz/store";
import path from "path";
import { tsgen } from "../render-ts";
import { debounce } from "throttle-debounce";
import { worldgenHandler } from "./worldgen";
import { WorldConfig } from "@latticexyz/world";
import { deployHandler, printMUD, worldtypes } from "../utils";

type Options = {
  rpc?: string;
  configPath?: string;
  tsgenOutput: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "dev-contracts",

  describe: "Start a development server for MUD contracts",

  builder(yargs) {
    return yargs.options({
      rpc: {
        type: "string",
        decs: "RPC endpoint of the development node. If none is provided, an anvil instance is spawned in the background on port 8545.",
      },
      configPath: {
        type: "string",
        decs: "Path to MUD config",
      },
      tsgenOutput: { type: "string", demandOption: true, desc: "Directory to output MUD typescript definition files" },
    });
  },

  async handler(args) {
    if (!args.tsgenOutputDir) {
      console.error("No output provided");
    }

    // Initial cleanup
    await forge(["clean"]);

    // Start an anvil instance in the background if no RPC url is provided
    if (!args.rpc) {
      const anvilArgs = ["--block-time", "1", "--block-base-fee-per-gas", "0"];
      anvil(anvilArgs);
    }
    const rpc = args.rpc ?? (await getRpcUrl());
    const configPath = args.configPath ?? (await resolveConfigPath(args.configPath));
    const srcDirectory = await getSrcDirectory();
    const initialConfig = (await loadConfig(configPath)) as StoreConfig & WorldConfig;

    const changedSinceLastHandled = {
      config: false,
      contracts: false,
    };

    const changeInProgress = {
      current: false,
    };

    // Watch for changes
    const configWatcher = chokidar.watch([configPath, srcDirectory]);
    configWatcher.on("all", async (_, updatePath) => {
      if (updatePath.includes(configPath)) {
        changedSinceLastHandled.config = true;
        // We trigger contract changes if the config changed here instead of
        // listening to changes in the codegen directory to avoid an infinite loop
        changedSinceLastHandled.contracts = true;
      }

      if (updatePath.includes(srcDirectory)) {
        // Ignore changes to codegen files to avoid an infinite loop
        if (updatePath.includes(initialConfig.codegenDirectory)) return;
        changedSinceLastHandled.contracts = true;
      }

      // Trigger debounced onChange
      handleChange();
    });

    const handleChange = debounce(100, async () => {
      // Avoid handling changes multiple times in parallel
      if (changeInProgress.current) return;
      changeInProgress.current = true;

      // Load latest config
      const mudConfig = (await loadConfig(configPath)) as StoreConfig & WorldConfig;

      // Reset dirty flags
      const { config, contracts } = changedSinceLastHandled;
      changedSinceLastHandled.config = false;
      changedSinceLastHandled.contracts = false;

      // Handle changes
      try {
        if (config) await handleConfigChange(mudConfig);
        if (contracts) await handleContractsChange(mudConfig);

        await deploy();
      } catch (e) {
        console.error(e);
      }

      changeInProgress.current = false;
      if (changedSinceLastHandled.config || changedSinceLastHandled.contracts) {
        console.log("Detected change while handling the previous change");
        handleChange();
      }

      printMUD();
      console.log("MUD watching for changes...");
    });

    /** Codegen to run if config changes */
    async function handleConfigChange(config: StoreConfig & WorldConfig) {
      console.log(chalk.blue("mud.config.ts changed - regenerating tables and recs types"));
      // Run tablegen to generate tables based on the config
      const outPath = path.join(srcDirectory, config.codegenDirectory);
      await tablegen(config, outPath);

      // Run tsgen to regenerate recs types based on the mud config
      await tsgen(config, args.tsgenOutput);
    }

    /** Codegen to run if contracts changed */
    async function handleContractsChange(config: StoreConfig & WorldConfig) {
      console.log(chalk.blue("contracts changed - regenerating interfaces and contract types"));

      // Run worldgen to generate interfaces based on the systems
      await worldgenHandler({ config, clean: true, srcDir: srcDirectory });

      // Build the contracts
      await forge(["build"]);

      // Run typechain to rebuild typescript types for the contracts
      await worldtypes();
    }

    /** Run after codegen if either mud config or contracts changed */
    async function deploy() {
      console.log(chalk.blue("redeploying World"));
      await deployHandler({
        configPath,
        skipBuild: true,
        priorityFeeMultiplier: 1,
        disableTxWait: true,
        pollInterval: 1000,
        saveDeployment: true,
        srcDir: srcDirectory,
        rpc,
      });
    }
  },
};

export default commandModule;
