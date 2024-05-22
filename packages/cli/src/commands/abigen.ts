import type { CommandModule, InferredOptionTypes } from "yargs";
import { Hex, createWalletClient, http } from "viem";
import { getSystems } from "../deploy/getSystems";
import { getWorldDeploy } from "../deploy/getWorldDeploy";
import { systemFunctionSignaturesToAbi } from "@latticexyz/world/node";
import { getRpcUrl } from "@latticexyz/common/foundry";
import fs from "node:fs/promises";

const abigenOptions = {
  worldAddress: { type: "string", required: true, desc: "Verify an existing World at the given address" },
  profile: { type: "string", desc: "The foundry profile to use" },
  rpc: {
    type: "string",
    desc: "The RPC URL to use. Defaults to the RPC url from the local foundry.toml",
  },
} as const;

type Options = InferredOptionTypes<typeof abigenOptions>;

const commandModule: CommandModule<Options, Options> = {
  command: "abigen",

  describe: "Autogenerate interfaces for Systems and World based on RPC",

  builder(yargs) {
    return yargs.options(abigenOptions);
  },

  async handler(args) {
    await abigenHandler(args);
    process.exit(0);
  },
};

export async function abigenHandler(opts: Options) {
  const worldAddress = opts.worldAddress as Hex;
  const profile = opts.profile ?? process.env.FOUNDRY_PROFILE;
  const rpc = opts.rpc ?? (await getRpcUrl(profile));

  const client = createWalletClient({
    transport: http(rpc),
  });

  const worldDeploy = await getWorldDeploy(client, worldAddress);

  const systems = await getSystems({ client, worldDeploy });

  for (const system of systems) {
    const fullOutputPath = `${system.systemId}.json`;
    const abi = systemFunctionSignaturesToAbi(system.functions.map((func) => func.systemFunctionSignature));
    await fs.writeFile(fullOutputPath, JSON.stringify(abi));
  }
}

export default commandModule;
