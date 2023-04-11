import type { CommandModule } from "yargs";
import readline from "readline";
import chokidar from "chokidar";
import { resolveConfigPath } from "@latticexyz/config";
import chalk from "chalk";
import { rmSync, writeFileSync } from "fs";
import EventEmitter from "events";

import { deployHandler, DeployOptions } from "./deploy-v2.js";
import { yDeployOptions } from "./deploy-v2.js";
import {
  anvil,
  forge,
  FOUNDRY_OPTIONS_IGNORE_CODES,
  getRpcUrl,
  getSrcDirectory,
  getTestDirectory,
} from "../utils/foundry.js";
import { CommandFailedError } from "../utils/errors.js";
import { execLog } from "../utils/execLog.js";

type Options = DeployOptions & {
  port?: number;
  interactive?: boolean;
  forgeOptions?: string;
};

const WORLD_ADDRESS_FILE = ".mudtest";

enum Events {
  TESTS_CHANGED = "TESTS_CHANGED",
  SOURCES_CHANGED = "SOURCES_CHANGED",
  CONFIG_CHANGED = "CONFIG_CHANGED",
}

const listenForKeyPressesOrEvents = (keys: string[], exit: string, events: EventEmitter) => {
  return new Promise<{ keyPressed?: string; filesChanged: string[] }>((resolve, reject) => {
    const removeListenersAndResolve = (returnValue: { keyPressed?: string; filesChanged: string[] }) => {
      events.removeAllListeners();
      resolve(returnValue);
    };

    events.on(Events.TESTS_CHANGED, (filesChanged) => removeListenersAndResolve({ filesChanged }));
    events.on(Events.SOURCES_CHANGED, (filesChanged) => removeListenersAndResolve({ filesChanged }));
    events.on(Events.CONFIG_CHANGED, (filesChanged) => removeListenersAndResolve({ filesChanged }));

    // Emit keypress events for stdin
    readline.emitKeypressEvents(process.stdin);

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    process.stdin.on("keypress", (_, key) => {
      if (key.name === exit || (key.name === "c" && key.ctrl)) {
        reject();
      } else if (keys.includes(key.name)) {
        if (process.stdin.isTTY) {
          process.stdin.setRawMode(false);
        }
        resolve({ keyPressed: key.name, filesChanged: [] });
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
      interactive: { type: "boolean", alias: "i" },
      configPath: { type: "string", desc: "Path to the config file" },
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
    const { verbosity } = JSON.parse(await execLog("forge", ["config", "--json"]));

    async function deployWorld() {
      return (
        args.worldAddress ??
        (
          await deployHandler({
            ...args,
            saveDeployment: false,
            rpc: forkRpc,
          })
        ).worldAddress
      );
    }

    async function runTests() {
      return forge(["test", "--silent", ...FOUNDRY_OPTIONS_IGNORE_CODES, "--fork-url", forkRpc, ...userOptions], {
        profile: args.profile,
      });
    }

    async function runCodegen() {
      console.log("TODO: rerun all codegen if stale detected");
    }

    if (process.env.CI || !args.interactive) {
      await runCodegen();
      const worldAddress = await deployWorld();
      writeFileSync(WORLD_ADDRESS_FILE, worldAddress);
      try {
        await runTests();
      } catch (e) {
        rmSync(WORLD_ADDRESS_FILE);
        if (e instanceof CommandFailedError) {
          console.error(chalk.red(chalk.bold("Tests failed")));
          if (verbosity < 3) {
            console.log(
              chalk.greenBright(
                chalk.bold('To get additional traces for your tests, set "verbosity" in your foundry.toml to "3"')
              )
            );
          }
        } else {
          console.error(e);
        }
        process.exit(1); // non-zero exit code in CI to notify tests failed;
      }
      rmSync(WORLD_ADDRESS_FILE);
      process.exit(0);
    }

    if (verbosity < 2) {
      console.log(
        chalk.redBright(
          chalk.bold(`Your Foundry config has low verbosity (${verbosity}), you won't see why your tests fail.`)
        )
      );
    } else if (verbosity < 3) {
      console.log(chalk.blueBright(`Your Foundry config has low verbosity (${verbosity}), you won't see traces.`));
    }

    const testDir = await getTestDirectory();
    const srcDir = await getSrcDirectory();
    const configPath = await resolveConfigPath(args.configPath);

    const signals: { testsChanged: string[]; sourceChanged: string[]; configChanged: boolean } = {
      testsChanged: [],
      sourceChanged: [],
      configChanged: false,
    };

    function resetSignals() {
      signals.testsChanged = [];
      signals.sourceChanged = [];
      signals.configChanged = false;
    }

    const signalEvents = new EventEmitter();

    chokidar.watch([configPath, testDir, srcDir]).on("all", async (_, path) => {
      if (path.includes(testDir)) {
        signals.testsChanged.push(path);
        signalEvents.emit(Events.TESTS_CHANGED, signals.testsChanged);
      } else if (path.includes(srcDir)) {
        signals.sourceChanged.push(path);
        signalEvents.emit(Events.SOURCES_CHANGED, signals.sourceChanged);
      } else if (path.includes(configPath)) {
        signals.configChanged = true;
        signalEvents.emit(Events.CONFIG_CHANGED, path);
      }
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
    resetSignals();

    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        await runCodegen();
        const worldAddress = await deployWorld();
        console.log(chalk.blue("World address", worldAddress));
        // Create a temporary file to pass the world address to the tests
        writeFileSync(WORLD_ADDRESS_FILE, worldAddress);

        // eslint-disable-next-line no-constant-condition
        while (true) {
          try {
            await runTests();
          } catch (e) {
            if (e instanceof CommandFailedError) {
              console.error(chalk.red(chalk.bold("Tests failed")));
              if (verbosity < 3) {
                console.log(
                  chalk.greenBright(
                    chalk.bold('To get additional traces for your tests, set "verbosity" in your foundry.toml to "3"')
                  )
                );
              }
            } else {
              console.error(e);
              break;
            }
          }

          if (signals.configChanged || signals.sourceChanged.length > 0 || signals.testsChanged.length > 0) {
            if (signals.configChanged) {
              console.log(chalk.green("Config changed. redeploying world"));
              resetSignals();
              break;
            } else if (signals.sourceChanged.length > 0) {
              console.log(chalk.green("System changed. redeploying world"));
              for (const filesChanged of signals.sourceChanged) {
                console.log(chalk.gray("changed: ", filesChanged));
              }
              resetSignals();
              break;
            } else {
              console.log(chalk.green("Tests changed. rerunning forge tests."));
              for (const filesChanged of signals.testsChanged) {
                console.log(chalk.gray("changed: ", filesChanged));
              }
              resetSignals();
              continue;
            }
          } else {
            console.log(
              chalk.gray(
                chalk.green("[r]"),
                "to rerun tests, ",
                chalk.blue("[d]"),
                "to rerun the deployer, and",
                chalk.red("[q]"),
                "to quit."
              )
            );
            console.log(
              chalk.dim(chalk.blue("Changes to your systems, MUD config, or tests will rerun tests and/or deployer."))
            );

            const { keyPressed, filesChanged } = await listenForKeyPressesOrEvents(
              ["r", "return", "d"],
              "q",
              signalEvents
            );
            if (filesChanged.length > 0) {
              const file = filesChanged[0];
              if (file.includes(configPath)) {
                console.log(chalk.green("Config changed, redeploying world"));
                resetSignals();
                break;
              } else if (file.includes(srcDir)) {
                console.log(chalk.green("System changed, redeploying world"));
                for (const filesChanged of signals.sourceChanged) {
                  console.log(chalk.gray("changed: ", filesChanged));
                }
                resetSignals();
                break;
              } else {
                console.log(chalk.green("Tests changed, rerunning forge tests."));
                for (const filesChanged of signals.testsChanged) {
                  console.log(chalk.gray("changed: ", filesChanged));
                }
                resetSignals();
                continue;
              }
            } else {
              if (keyPressed === "r" || keyPressed === "return") {
                continue;
              } else if (keyPressed === "d") {
                break;
              }
            }
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
