import type { CommandModule, InferredOptionTypes } from "yargs";
import { Hex, createWalletClient, http } from "viem";
import { getWorldDeploy } from "../deploy/getWorldDeploy";
import { getRpcUrl } from "@latticexyz/common/foundry";
import fs from "node:fs/promises";
import path from "node:path";
import { mkdirSync } from "node:fs";
import { getWorldAbi } from "../utils/getWorldAbi";

const ABI_DIRECTORY = "abis";
const ABI_FILE = "worldRegisteredFunctions.abi.json";

const generateAbiOptions = {
  worldAddress: { type: "string", required: true, desc: "Verify an existing World at the given address" },
  profile: { type: "string", desc: "The foundry profile to use" },
  rpc: {
    type: "string",
    desc: "The RPC URL to use. Defaults to the RPC url from the local foundry.toml",
  },
} as const;

type Options = InferredOptionTypes<typeof generateAbiOptions>;

const commandModule: CommandModule<Options, Options> = {
  command: "generate-abi",

  describe: "Generate ABI's for Systems and World based on World address",

  builder(yargs) {
    return yargs.options(generateAbiOptions);
  },

  async handler(args) {
    await generateAbiHandler(args);
    process.exit(0);
  },
};

export async function generateAbiHandler(opts: Options) {
  const worldAddress = opts.worldAddress as Hex;
  const profile = opts.profile ?? process.env.FOUNDRY_PROFILE;
  const rpc = opts.rpc ?? (await getRpcUrl(profile));

  const client = createWalletClient({
    transport: http(rpc),
  });

  const worldDeploy = await getWorldDeploy(client, worldAddress);

  mkdirSync(ABI_DIRECTORY);

  // render World ABI
  const worldAbi = await getWorldAbi({ client, worldDeploy });

  const fullOutputPath = path.join(ABI_DIRECTORY, ABI_FILE);
  await fs.writeFile(fullOutputPath, JSON.stringify(worldAbi));
}

export default commandModule;
