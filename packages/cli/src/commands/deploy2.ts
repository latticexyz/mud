import type { CommandModule, Options } from "yargs";
import { logError } from "../utils/errors";
import { DeployOptions } from "../utils/deployHandler";
import { deploy } from "../deploy/deploy";
import { createWalletClient, http, Hex, Abi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { loadConfig } from "@latticexyz/config/node";
import { StoreConfig } from "@latticexyz/store";
import { WorldConfig, resolveWorldConfig } from "@latticexyz/world";
import { getOutDirectory, getSrcDirectory } from "@latticexyz/common/foundry";
import { getExistingContracts } from "../utils/getExistingContracts";
import { configToTables } from "../deploy/configToTables";
import { System } from "../deploy/common";
import { resourceIdToHex } from "@latticexyz/common";
import glob from "glob";
import { basename } from "path";
import { getContractData } from "../utils/utils/getContractData";

// TODO: redo options
export const yDeployOptions = {
  configPath: { type: "string", desc: "Path to the config file" },
  clean: { type: "boolean", desc: "Remove the build forge artifacts and cache directories before building" },
  printConfig: { type: "boolean", desc: "Print the resolved config" },
  profile: { type: "string", desc: "The foundry profile to use" },
  debug: { type: "boolean", desc: "Print debug logs, like full error messages" },
  priorityFeeMultiplier: {
    type: "number",
    desc: "Multiply the estimated priority fee by the provided factor",
    default: 1,
  },
  saveDeployment: { type: "boolean", desc: "Save the deployment info to a file", default: true },
  rpc: { type: "string", desc: "The RPC URL to use. Defaults to the RPC url from the local foundry.toml" },
  worldAddress: { type: "string", desc: "Deploy to an existing World at the given address" },
  srcDir: { type: "string", desc: "Source directory. Defaults to foundry src directory." },
  disableTxWait: { type: "boolean", desc: "Disable waiting for transactions to be confirmed.", default: false },
  pollInterval: {
    type: "number",
    desc: "Interval in miliseconds to use to poll for transaction receipts / block inclusion",
    default: 1000,
  },
  skipBuild: { type: "boolean", desc: "Skip rebuilding the contracts before deploying" },
} satisfies Record<keyof DeployOptions, Options>;

const commandModule: CommandModule<DeployOptions, DeployOptions> = {
  command: "deploy2",

  describe: "Deploy MUD contracts",

  builder(yargs) {
    return yargs.options(yDeployOptions);
  },

  async handler(args) {
    try {
      const client = createWalletClient({
        transport: http("http://127.0.0.1:8545"),
        account: privateKeyToAccount(process.env.PRIVATE_KEY as Hex),
      });

      const config = (await loadConfig()) as StoreConfig & WorldConfig;

      // TODO: should the config parser/loader help with resolving systems?
      const srcDir = args?.srcDir ?? (await getSrcDirectory());
      const outDir = await getOutDirectory(args.profile);
      const contractNames = getExistingContracts(srcDir).map(({ basename }) => basename);
      const resolvedConfig = resolveWorldConfig(config, contractNames);
      const systems = Object.fromEntries<System>(
        Object.entries(resolvedConfig.systems).map(([systemName, system]) => {
          const name = system.name ?? systemName;
          const contractData = getContractData(systemName, outDir);
          return [
            `${config.namespace}_${name}`,
            {
              namespace: config.namespace,
              name,
              label: `${config.namespace}:${name}`,
              systemId: resourceIdToHex({ type: "system", namespace: config.namespace, name: system.name }),
              allowAll: system.openAccess,
              allowedAddresses: system.accessListAddresses as Hex[],
              allowedSystemIds: system.accessListSystems.map((systemName) =>
                resourceIdToHex({ type: "system", namespace: config.namespace, name: systemName })
              ),
              bytecode: contractData.bytecode,
              abi: contractData.abi,
            },
          ] as const;
        })
      );
      await deploy({
        client,
        config: {
          tables: configToTables(config),
          systems,
        },
      });
    } catch (error: any) {
      logError(error);
      process.exit(1);
    }
    process.exit(0);
  },
};

export default commandModule;
