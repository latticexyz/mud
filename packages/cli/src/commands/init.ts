import type { CommandModule, InferredOptionTypes } from "yargs";
import { loadConfig } from "@latticexyz/config/node";
import { World as WorldConfig } from "@latticexyz/world";
import { getRpcUrl } from "@latticexyz/common/foundry";
import { Hex, createWalletClient, http } from "viem";
import { getWorldDeploy } from "../deploy/getWorldDeploy";
import { writeDeploymentResult } from "../utils/writeDeploymentResult";

const verifyOptions = {
  configPath: { type: "string", desc: "Path to the MUD config file" },
  worldAddress: { type: "string", required: true, desc: "Verify an existing World at the given address" },
  profile: { type: "string", desc: "The foundry profile to use" },
  rpc: { type: "string", desc: "The RPC URL to use. Defaults to the RPC url from the local foundry.toml" },
} as const;

type Options = InferredOptionTypes<typeof verifyOptions>;

const commandModule: CommandModule<Options, Options> = {
  command: "init",

  describe: "Populates the local project with the MUD artefacts for a given World.",

  builder(yargs) {
    return yargs.options(verifyOptions);
  },

  async handler(opts) {
    const profile = opts.profile ?? process.env.FOUNDRY_PROFILE;

    const config = (await loadConfig(opts.configPath)) as WorldConfig;

    const rpc = opts.rpc ?? (await getRpcUrl(profile));

    const client = createWalletClient({
      transport: http(rpc),
    });

    const worldDeploy = await getWorldDeploy(client, opts.worldAddress as Hex);

    const deploymentInfo = {
      worldAddress: worldDeploy.address,
      blockNumber: Number(worldDeploy.deployBlock),
    };

    writeDeploymentResult({ client, config, deploymentInfo });
  },
};

export default commandModule;
