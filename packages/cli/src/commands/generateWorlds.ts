import type { CommandModule, InferredOptionTypes } from "yargs";
import { loadConfig } from "@latticexyz/config/node";
import { World as WorldConfig } from "@latticexyz/world";
import { worldToV1 } from "@latticexyz/world/config/v2";
import { getRpcUrl } from "@latticexyz/common/foundry";
import { Hex, createWalletClient, http } from "viem";
import chalk from "chalk";
import { getWorldDeploy } from "../deploy/getWorldDeploy";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { getChainId } from "viem/actions";
import { localChains } from "../runDeploy";

const verifyOptions = {
  configPath: { type: "string", desc: "Path to the MUD config file" },
  worldAddress: { type: "string", required: true, desc: "Verify an existing World at the given address" },
  profile: { type: "string", desc: "The foundry profile to use" },
  rpc: { type: "string", desc: "The RPC URL to use. Defaults to the RPC url from the local foundry.toml" },
} as const;

type Options = InferredOptionTypes<typeof verifyOptions>;

const commandModule: CommandModule<Options, Options> = {
  command: "generate-worlds",

  describe: "Generate worlds.json from a given World address",

  builder(yargs) {
    return yargs.options(verifyOptions);
  },

  async handler(opts) {
    const profile = opts.profile ?? process.env.FOUNDRY_PROFILE;

    const configV2 = (await loadConfig(opts.configPath)) as WorldConfig;
    const config = worldToV1(configV2);
    if (opts.printConfig) {
      console.log(chalk.green("\nResolved config:\n"), JSON.stringify(config, null, 2));
    }

    const rpc = opts.rpc ?? (await getRpcUrl(profile));

    const client = createWalletClient({
      transport: http(rpc),
    });

    const worldDeploy = await getWorldDeploy(client, opts.worldAddress as Hex);

    const deploymentInfo = {
      worldAddress: worldDeploy.address,
      blockNumber: Number(worldDeploy.deployBlock),
    };

    const chainId = await getChainId(client);

    const deploys = existsSync(config.worldsFile) ? JSON.parse(readFileSync(config.worldsFile, "utf-8")) : {};
    deploys[chainId] = {
      address: deploymentInfo.worldAddress,
      // We expect the worlds file to be committed and since local deployments are often
      // a consistent address but different block number, we'll ignore the block number.
      blockNumber: localChains.includes(chainId) ? undefined : deploymentInfo.blockNumber,
    };
    writeFileSync(config.worldsFile, JSON.stringify(deploys, null, 2));
  },
};

export default commandModule;
