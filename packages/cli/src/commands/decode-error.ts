import path from "node:path";
import { readFileSync } from "node:fs";
import type { CommandModule } from "yargs";
import chalk from "chalk";
import { Abi, BaseError, decodeErrorResult, Hex, isHex } from "viem";
import { formatAbiItemWithArgs } from "viem/utils";
import { loadConfig, resolveConfigPath } from "@latticexyz/config/node";
import { getOutDirectory } from "@latticexyz/common/foundry";
import { World as WorldConfig } from "@latticexyz/world";
import { MUDError } from "@latticexyz/common/errors";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json" assert { type: "json" };
import { logError } from "../utils/errors";

type Options = {
  error: string;
  configPath?: string;
  profile?: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "decode-error",

  describe: "Decode an error in HEX format into a human-readable error",

  builder(yargs) {
    return yargs.options({
      error: { type: "string", required: true, desc: "An error in HEX format" },
      configPath: { type: "string", desc: "Path to the MUD config file" },
      profile: { type: "string", desc: "The foundry profile to use" },
    });
  },

  async handler(opts) {
    try {
      if (!isHex(opts.error)) {
        throw new MUDError('Argument "error" must be in HEX format');
      }

      let IWorldAbi: Abi;
      try {
        // first try to use the user ABI located in the MUD project
        const profile = opts.profile ?? process.env.FOUNDRY_PROFILE;

        const configPath = await resolveConfigPath(opts.configPath);
        const config = (await loadConfig(configPath)) as WorldConfig;
        const rootDir = path.dirname(configPath);

        const outDir = await getOutDirectory(profile);

        const IWorldAbiPath = path.join(
          rootDir,
          outDir,
          `${config.codegen.worldInterfaceName}.sol`,
          `${config.codegen.worldInterfaceName}.abi.json`,
        );

        IWorldAbi = JSON.parse(readFileSync(IWorldAbiPath, "utf8"));
      } catch (error) {
        // catch and log error and warn user that we'll be using MUD's IBaseWorld ABI
        console.log(error);
        console.log(chalk.yellow("Could not find user ABI, using MUD's IBaseWorld ABI instead"));
        IWorldAbi = IBaseWorldAbi;
      }

      const { abiItem, args: errorArgs } = decodeErrorResult({
        abi: IWorldAbi,
        data: opts.error as Hex,
      });

      const formattedError = formatAbiItemWithArgs({
        abiItem,
        args: errorArgs ?? [],
        includeName: true,
      });

      console.log(chalk.green(`Decoded error: ${formattedError}`));
    } catch (error) {
      // process viem error to extract the error message
      if (error instanceof BaseError) {
        logError(chalk.red((error as BaseError).shortMessage));
      } else {
        logError(error);
      }
      process.exit(1);
    }

    process.exit(0);
  },
};

export default commandModule;
