import type { CommandModule, InferredOptionTypes } from "yargs";
import { anvil, getScriptDirectory, getSrcDirectory } from "@latticexyz/common/foundry";
import chalk from "chalk";
import chokidar from "chokidar";
import { loadConfig, resolveConfigPath } from "@latticexyz/config/node";
import { StoreConfig } from "@latticexyz/store";
import path from "path";
import { WorldConfig } from "@latticexyz/world";
import { homedir } from "os";
import { rmSync } from "fs";
import { deployOptions, runDeploy } from "../runDeploy";
import { BehaviorSubject, debounceTime, exhaustMap } from "rxjs";
import { Address } from "viem";

const devOptions = {
  rpc: deployOptions.rpc,
  configPath: deployOptions.configPath,
};

const commandModule: CommandModule<typeof devOptions, InferredOptionTypes<typeof devOptions>> = {
  command: "dev-contracts",

  describe: "Start a development server for MUD contracts",

  builder(yargs) {
    return yargs.options(devOptions);
  },

  async handler(opts) {
    let rpc = opts.rpc;
    const configPath = opts.configPath ?? (await resolveConfigPath(opts.configPath));
    const srcDir = await getSrcDirectory();
    const scriptDir = await getScriptDirectory();
    const initialConfig = (await loadConfig(configPath)) as StoreConfig & WorldConfig;

    // Start an anvil instance in the background if no RPC url is provided
    if (!opts.rpc) {
      // Clean anvil cache as 1s block times can fill up the disk
      // - https://github.com/foundry-rs/foundry/issues/3623
      // - https://github.com/foundry-rs/foundry/issues/4989
      // - https://github.com/foundry-rs/foundry/issues/3699
      // - https://github.com/foundry-rs/foundry/issues/3512
      console.log(chalk.gray("Cleaning devnode cache"));
      const userHomeDir = homedir();
      rmSync(path.join(userHomeDir, ".foundry", "anvil", "tmp"), { recursive: true, force: true });

      const anvilArgs = ["--block-time", "1", "--block-base-fee-per-gas", "0"];
      anvil(anvilArgs);
      rpc = "http://127.0.0.1:8545";
      // TODO: kill anvil when we're done
    }

    // Watch for changes
    const lastChange$ = new BehaviorSubject<number>(Date.now());
    chokidar.watch([configPath, srcDir, scriptDir]).on("all", async (_, updatePath) => {
      if (updatePath.includes(configPath)) {
        lastChange$.next(Date.now());
      }
      if (updatePath.includes(srcDir) || updatePath.includes(scriptDir)) {
        // Ignore changes to codegen files to avoid an infinite loop
        if (!updatePath.includes(initialConfig.codegenDirectory)) {
          lastChange$.next(Date.now());
        }
      }
    });

    let worldAddress: Address | undefined;

    const deploys$ = lastChange$.pipe(
      debounceTime(100),
      exhaustMap(async (lastChange) => {
        if (worldAddress) {
          console.log(chalk.blue("Change detected, rebuilding and running deploy..."));
        }
        // TODO: handle errors
        const deploy = await runDeploy({
          configPath,
          rpc,
          clean: true,
          skipBuild: false,
          printConfig: false,
          profile: undefined,
          saveDeployment: true,
          worldAddress,
          srcDir,
        });
        worldAddress = deploy.address;
        // if there were changes while we were deploying, trigger it again
        if (lastChange < lastChange$.value) {
          lastChange$.next(lastChange$.value);
        } else {
          console.log(chalk.gray("Watching for file changes..."));
        }
        return deploy;
      })
    );

    deploys$.subscribe();
  },
};

export default commandModule;
