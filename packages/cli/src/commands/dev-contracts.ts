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
import { BehaviorSubject, debounceTime, exhaustMap, filter } from "rxjs";
import { Address } from "viem";
import { isDefined } from "@latticexyz/common/utils";

const devOptions = {
  rpc: deployOptions.rpc,
  configPath: deployOptions.configPath,
  alwaysRunPostDeploy: deployOptions.alwaysRunPostDeploy,
  worldAddress: deployOptions.worldAddress,
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
    }

    // Watch for changes
    const lastChange$ = new BehaviorSubject<number>(Date.now());
    chokidar.watch([configPath, srcDir, scriptDir], { ignoreInitial: true }).on("all", async (_, updatePath) => {
      if (updatePath.includes(configPath)) {
        console.log(chalk.blue("Config changed, queuing deploy…"));
        lastChange$.next(Date.now());
      }
      if (updatePath.includes(srcDir) || updatePath.includes(scriptDir)) {
        // Ignore changes to codegen files to avoid an infinite loop
        if (!updatePath.includes(initialConfig.codegenDirectory)) {
          console.log(chalk.blue("Contracts changed, queuing deploy…"));
          lastChange$.next(Date.now());
        }
      }
    });

    let worldAddress = opts.worldAddress as Address | undefined;

    const deploys$ = lastChange$.pipe(
      // debounce so that a large batch of file changes only triggers a deploy after it settles down, rather than the first change it sees (and then redeploying immediately after)
      debounceTime(200),
      exhaustMap(async (lastChange) => {
        if (worldAddress) {
          console.log(chalk.blue("Rebuilding and upgrading world…"));
        }

        try {
          const deploy = await runDeploy({
            ...opts,
            configPath,
            rpc,
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
            console.log(chalk.gray("\nWaiting for file changes…\n"));
          }
          return deploy;
        } catch (error) {
          console.error(chalk.bgRed(chalk.whiteBright("\n Error while attempting deploy \n")));
          console.error(error);
          console.log(chalk.gray("\nWaiting for file changes…\n"));
        }
      }),
      filter(isDefined)
    );

    deploys$.subscribe();
  },
};

export default commandModule;
