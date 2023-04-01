import type { CommandModule } from "yargs";
import readline from "readline";
import { deployHandler, DeployOptions } from "./deploy-v2.js";
import { yDeployOptions } from "./deploy-v2.js";
import { anvil, forge, getRpcUrl, getTestDirectory } from "../utils/foundry.js";
import chalk from "chalk";
import { rmSync, writeFileSync } from "fs";
import { CommandFailedError } from "../utils/errors.js";

type Options = DeployOptions & { port?: number; worldAddress?: string; forgeOptions?: string };

const WORLD_ADDRESS_FILE = ".mudtest";

const listenForKeyPresses = (keys: string[], exit: string) => {
  return new Promise<string>((res, rej) => {
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.on("keypress", (str, key) => {
      if (key.name === exit) {
        rej();
      } else if (keys.includes(key.name)) {
        if (process.stdin.isTTY) {
          process.stdin.setRawMode(false);
        }
        res(key.name);
      }
    });
  });
};

const commandModule: CommandModule<Options, Options> = {
  command: "test-v2",

  describe: "Run tests in MUD v2 contracts",

  builder(yargs) {
    return yargs.options({
      ...yDeployOptions,
      port: { type: "number", description: "Port to run internal node for fork testing on", default: 4242 },
      worldAddress: {
        type: "string",
        description:
          "Address of an existing world contract. If provided, deployment is skipped and the RPC provided in the foundry.toml is used for fork testing.",
      },
      forgeOptions: { type: "string", description: "Options to pass to forge test" },
    });
  },

  async handler(args) {
    // Start an internal anvil process if no world address is provided
    if (!args.worldAddress) {
      const anvilArgs = ["--block-base-fee-per-gas", "0", "--port", String(args.port)];
      anvil(anvilArgs);
    }

    const forkRpc = args.worldAddress ? await getRpcUrl(args.profile) : `http://127.0.0.1:${args.port}`;
    const userOptions = args.forgeOptions?.replaceAll("\\", "").split(" ") ?? [];

    try {
      while ([].length === 0) {
        const worldAddress =
          args.worldAddress ??
          (
            await deployHandler({
              ...args,
              saveDeployment: false,
              rpc: forkRpc,
            })
          ).worldAddress;
        console.log(chalk.blue("World address", worldAddress));

        // Create a temporary file to pass the world address to the tests
        writeFileSync(WORLD_ADDRESS_FILE, worldAddress);
        while ([].length === 0) {
          try {
            await forge(["test", "--fork-url", forkRpc, ...userOptions], {
              profile: args.profile,
            });
          } catch (e) {
            if (e instanceof CommandFailedError) {
              console.error(chalk.red("Test failed"));
            } else {
              console.error(e);
              break;
            }
          }
          console.log(
            chalk.gray(
              chalk.green("[r]"),
              " to restart, ",
              chalk.blue("[d]"),
              " to redeploy, and",
              chalk.red("[q]"),
              " to quit."
            )
          );
          const keyPressed = await listenForKeyPresses(["r", "d"], "q");
          if (keyPressed === "d") {
            break;
          }
        }
      }
    } finally {
      rmSync(WORLD_ADDRESS_FILE);
      process.exit(0);
    }
  },
};

export default commandModule;
