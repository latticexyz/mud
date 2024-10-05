import { formatAndWriteTypescript } from "@latticexyz/common/codegen";
import { getRpcUrl } from "@latticexyz/common/foundry";
import { Hex, createWalletClient, http } from "viem";
import type { CommandModule, InferredOptionTypes } from "yargs";
import { getWorldDeploy } from "../deploy/getWorldDeploy";
import { getWorldInput } from "../utils/getWorldInput";

const generateConfigOptions = {
  worldAddress: { type: "string", required: true, desc: "Verify an existing World at the given address" },
  profile: { type: "string", desc: "The foundry profile to use" },
  rpc: { type: "string", desc: "The RPC URL to use. Defaults to the RPC url from the local foundry.toml" },
} as const;

type Options = InferredOptionTypes<typeof generateConfigOptions>;

const commandModule: CommandModule<Options, Options> = {
  command: "generate-config",

  describe: "Generate a MUD config given a world address",

  builder(yargs) {
    return yargs.options(generateConfigOptions);
  },

  async handler(opts) {
    const profile = opts.profile ?? process.env.FOUNDRY_PROFILE;

    const rpc = opts.rpc ?? (await getRpcUrl(profile));

    const client = createWalletClient({
      transport: http(rpc),
    });

    const worldDeploy = await getWorldDeploy(client, opts.worldAddress as Hex);

    const config = await getWorldInput({ client, worldDeploy });

    formatAndWriteTypescript(
      `
      import { defineWorld } from "@latticexyz/world";
      
      export default defineWorld(
        ${JSON.stringify(config)}
      );
      `,
      "world.config.ts",
      "generating MUD config from world",
    );
  },
};

export default commandModule;
