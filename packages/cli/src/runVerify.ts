import { InferredOptionTypes, Options } from "yargs";
import { createWalletClient, http, Hex } from "viem";
import { loadConfig } from "@latticexyz/config/node";
import { World as WorldConfig } from "@latticexyz/world";
import { worldToV1 } from "@latticexyz/world/config/v2";
import { getOutDirectory, getRpcUrl, getSrcDirectory } from "@latticexyz/common/foundry";
import { verify } from "./verify/verify";
import { defaultModuleContracts } from "./utils/defaultModuleContracts";
import { getContractData } from "./utils/getContractData";
import { getExistingContracts } from "./utils/getExistingContracts";
import { resolveWorldConfig } from "@latticexyz/world/internal";
import chalk from "chalk";

export const verifyOptions = {
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
  srcDir: { type: "string", desc: "Source directory. Defaults to foundry src directory." },
  verifier: { type: "string", desc: "The verifier to use" },
  verifierUrl: {
    type: "string",
    desc: "The verification provider.",
  },
  useProxy: {
    type: "boolean",
    desc: "Whether the World was deployed with a proxy.",
  },
} as const satisfies Record<string, Options>;

export type VerifyOptions = InferredOptionTypes<typeof verifyOptions>;

/**
 * Given some CLI arguments, finds and resolves a MUD config, foundry profile, and runs a deploy.
 * This is used by the deploy, test, and dev-contracts CLI commands.
 */
export async function runVerify(opts: VerifyOptions) {
  const profile = opts.profile ?? process.env.FOUNDRY_PROFILE;

  const configV2 = (await loadConfig(opts.configPath)) as WorldConfig;
  const config = worldToV1(configV2);

  const srcDir = opts.srcDir ?? (await getSrcDirectory(profile));
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

  const contractNames = getExistingContracts(srcDir).map(({ basename }) => basename);
  const resolvedWorldConfig = resolveWorldConfig(config, contractNames);

  const systems = Object.keys(resolvedWorldConfig.systems).map((name) => {
    const contractData = getContractData(`${name}.sol`, name, outDir);

    return {
      name,
      bytecode: contractData.bytecode,
    };
  });

  // Get modules
  const modules = config.modules.map((mod) => {
    const contractData =
      defaultModuleContracts.find((defaultMod) => defaultMod.name === mod.name) ??
      getContractData(`${mod.name}.sol`, mod.name, outDir);

    return {
      name: mod.name,
      bytecode: contractData.bytecode,
    };
  });

  await verify({
    client,
    foundryProfile: profile,
    systems,
    modules,
    deployerAddress: opts.deployerAddress as Hex | undefined,
    worldAddress: opts.worldAddress as Hex,
    verifier: opts.verifier,
    verifierUrl: opts.verifierUrl,
    useProxy: opts.useProxy,
  });
}
