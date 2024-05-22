import type { CommandModule, InferredOptionTypes } from "yargs";
import { Hex, createWalletClient, http } from "viem";
import { getSystems } from "../deploy/getSystems";
import { getWorldDeploy } from "../deploy/getWorldDeploy";
import { getRpcUrl } from "@latticexyz/common/foundry";
import fs from "node:fs/promises";
import { functionSignatureToAbiItem } from "../utils/functionSignatureToAbiItem";
import path from "node:path";
import { mkdirSync } from "node:fs";
import { generateSolidity } from "abi-to-sol";

const DIRECTORY = "abis";

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

  mkdirSync(DIRECTORY);

  // render World ABI
  const systems = await getSystems({ client, worldDeploy });

  const worldAbi = systems.flatMap((system) =>
    system.functions.map((func) => functionSignatureToAbiItem(func.signature)),
  );

  const fullOutputPath = path.join(DIRECTORY, "worldRegisteredFunctions.abi.json");
  await fs.writeFile(fullOutputPath, JSON.stringify(worldAbi));

  // render World interface
  const worldInterface = generateSolidity({ abi: worldAbi });

  console.log(worldInterface);
}

export default commandModule;
