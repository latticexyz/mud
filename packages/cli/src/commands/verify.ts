import type { CommandModule, InferredOptionTypes } from "yargs";
import { verify } from "../verify";
import { loadConfig } from "@latticexyz/config/node";
import { World as WorldConfig } from "@latticexyz/world";
import { resolveWorldConfig } from "@latticexyz/world/internal";
import { worldToV1 } from "@latticexyz/world/config/v2";
import { getOutDirectory, getRpcUrl } from "@latticexyz/common/foundry";
import { getContractData } from "../utils/getContractData";
import { Hex, createWalletClient, http } from "viem";
import chalk from "chalk";
import { configToModules } from "../deploy/configToModules";
import { getExistingDatas } from "../utils/getExistingDatas";

const verifyOptions = {
  deployerAddress: {
    type: "string",
    desc: "Deploy using an existing deterministic deployer (https://github.com/Arachnid/deterministic-deployment-proxy)",
  },
  worldAddress: { type: "string", required: true, desc: "Verify an existing World at the given address" },
  configPath: { type: "string", desc: "Path to the MUD config file" },
  profile: { type: "string", desc: "The foundry profile to use" },
  rpc: { type: "string", desc: "The RPC URL to use. Defaults to the RPC url from the local foundry.toml" },
  rpcBatch: {
    type: "boolean",
    desc: "Enable batch processing of RPC requests in viem client (defaults to batch size of 100 and wait of 1s)",
  },
  verifier: { type: "string", desc: "The verifier to use. Defaults to blockscout", default: "blockscout" },
  verifierUrl: {
    type: "string",
    desc: "The verification provider.",
  },
} as const;

type Options = InferredOptionTypes<typeof verifyOptions>;

const commandModule: CommandModule<Options, Options> = {
  command: "verify",

  describe: "Verify contracts",

  builder(yargs) {
    return yargs.options(verifyOptions);
  },

  async handler(opts) {
    const profile = opts.profile ?? process.env.FOUNDRY_PROFILE;

    const configV2 = (await loadConfig(opts.configPath)) as WorldConfig;
    const config = worldToV1(configV2);

    const outDir = await getOutDirectory(profile);

    const rpc = opts.rpc ?? (await getRpcUrl(profile));
    console.log(
      chalk.bgBlue(
        chalk.whiteBright(`\n Verifying MUD contracts${profile ? " with profile " + profile : ""} to RPC ${rpc} \n`),
      ),
    );

    const client = createWalletClient({
      transport: http(rpc, {
        batch: opts.rpcBatch
          ? {
              batchSize: 100,
              wait: 1000,
            }
          : undefined,
      }),
    });

    const contractNames = getExistingDatas(outDir).map(({ basename }) => basename);
    const resolvedWorldConfig = resolveWorldConfig(config, contractNames);

    const systems = Object.keys(resolvedWorldConfig.systems).map((name) => {
      const contractData = getContractData(`${name}.sol`, name, outDir);

      return {
        name,
        bytecode: contractData.bytecode,
      };
    });

    const modules = await configToModules(configV2, outDir);

    await verify({
      client,
      rpc,
      systems,
      modules,
      deployerAddress: opts.deployerAddress as Hex | undefined,
      worldAddress: opts.worldAddress as Hex,
      verifier: opts.verifier,
      verifierUrl: opts.verifierUrl,
    });
  },
};

export default commandModule;
