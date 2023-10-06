import type { CommandModule, Options } from "yargs";
import { logError } from "../utils/errors";
import { DeployOptions } from "../utils/deployHandler";
import { deploy } from "../deploy/deploy";
import {
  createWalletClient,
  http,
  Hex,
  Abi,
  getCreate2Address,
  getFunctionSelector,
  getAddress,
  hexToBytes,
  encodeAbiParameters,
  encodePacked,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { loadConfig } from "@latticexyz/config/node";
import { StoreConfig } from "@latticexyz/store";
import { WorldConfig, resolveWorldConfig } from "@latticexyz/world";
import { getOutDirectory, getSrcDirectory } from "@latticexyz/common/foundry";
import { getExistingContracts } from "../utils/getExistingContracts";
import { configToTables } from "../deploy/configToTables";
import { System, WorldFunction, salt } from "../deploy/common";
import { hexToResource, resourceToHex } from "@latticexyz/common";
import glob from "glob";
import { basename } from "path";
import { getContractData } from "../utils/utils/getContractData";
import { deployer } from "../deploy/ensureDeployer";
import { getRegisterFunctionSelectorsCallData } from "../utils/systems/getRegisterFunctionSelectorsCallData";
import { loadFunctionSignatures } from "../utils/systems/utils";
import { resourceLabel } from "../deploy/resourceLabel";
import { resolveWithContext } from "@latticexyz/config";

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
        transport: http(args.rpc ?? "http://127.0.0.1:8545"),
        account: privateKeyToAccount(process.env.PRIVATE_KEY as Hex),
      });

      const config = (await loadConfig()) as StoreConfig & WorldConfig;

      // TODO: should the config parser/loader help with resolving systems?
      const srcDir = args?.srcDir ?? (await getSrcDirectory());
      const outDir = await getOutDirectory(args.profile);
      const contractNames = getExistingContracts(srcDir).map(({ basename }) => basename);
      const resolvedConfig = resolveWorldConfig(config, contractNames);
      const baseSystemFunctions = loadFunctionSignatures("System", outDir);

      const systems = Object.entries(resolvedConfig.systems).map(([systemName, system]) => {
        const namespace = config.namespace;
        const name = system.name;
        const systemId = resourceToHex({ type: "system", namespace, name });
        const contractData = getContractData(systemName, outDir);

        const systemFunctions = loadFunctionSignatures(systemName, outDir)
          .filter((sig) => !baseSystemFunctions.includes(sig))
          .map((sig): WorldFunction => {
            // TODO: figure out how to not duplicate contract behavior (https://github.com/latticexyz/mud/issues/1708)
            const worldSignature = namespace === "" ? sig : `${namespace}_${name}_${sig}`;
            return {
              signature: worldSignature,
              selector: getFunctionSelector(worldSignature),
              systemId,
              systemFunctionSignature: sig,
              systemFunctionSelector: getFunctionSelector(sig),
            };
          });

        return {
          namespace,
          name,
          systemId,
          allowAll: system.openAccess,
          allowedAddresses: system.accessListAddresses as Hex[],
          allowedSystemIds: system.accessListSystems.map((name) =>
            resourceToHex({ type: "system", namespace, name: resolvedConfig.systems[name].name })
          ),
          address: getCreate2Address({ from: deployer, bytecode: contractData.bytecode, salt }),
          bytecode: contractData.bytecode,
          abi: contractData.abi,
          functions: systemFunctions,
        };
      });

      // resolve allowedSystemIds
      // TODO: resolve this at deploy time so we can allow for arbitrary system IDs registered in the world as the source-of-truth rather than config
      const systemsWithAccess = systems.map(({ allowedAddresses, allowedSystemIds, ...system }) => {
        const allowedSystemAddresses = allowedSystemIds.map((systemId) => {
          const targetSystem = systems.find((s) => s.systemId === systemId);
          if (!targetSystem) {
            throw new Error(
              `System ${resourceLabel(system)} wanted access to ${resourceLabel(
                hexToResource(systemId)
              )}, but it wasn't found in the config.`
            );
          }
          return targetSystem.address;
        });
        return {
          ...system,
          allowedAddresses: Array.from(
            new Set([...allowedAddresses, ...allowedSystemAddresses].map((addr) => getAddress(addr)))
          ),
        };
      });

      // ugh
      const resolveContext = {
        tableIds: Object.fromEntries(
          Object.entries(config.tables).map(([tableName, table]) => [
            tableName,
            hexToBytes(
              resourceToHex({
                type: table.offchainOnly ? "offchainTable" : "table",
                namespace: config.namespace,
                name: table.name,
              })
            ),
          ])
        ),
      };

      const modules = config.modules.map((mod) => {
        const contractData = getContractData(mod.name, outDir);
        const installArgs = mod.args
          .map((arg) => resolveWithContext(arg, resolveContext))
          .map(({ type, value }) => encodePacked([type], [value]));
        if (installArgs.length > 1) {
          throw new Error(`${mod.name} module should only have 0-1 args, but had ${installArgs.length} args.`);
        }
        return {
          name: mod.name,
          installAsRoot: mod.root,
          installData: installArgs.length === 0 ? "0x" : installArgs[0],
          address: getCreate2Address({ from: deployer, bytecode: contractData.bytecode, salt }),
          bytecode: contractData.bytecode,
          abi: contractData.abi,
        };
      });

      await deploy({
        worldAddress: args.worldAddress as Hex | undefined,
        client,
        config: {
          tables: configToTables(config),
          systems: systemsWithAccess,
          modules,
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
