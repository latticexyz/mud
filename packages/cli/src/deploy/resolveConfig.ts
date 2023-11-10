import { resolveWorldConfig } from "@latticexyz/world";
import { Config, ConfigInput, WorldFunction, salt } from "./common";
import { resourceToHex, hexToResource } from "@latticexyz/common";
import { resolveWithContext } from "@latticexyz/config";
import { encodeField } from "@latticexyz/protocol-parser";
import { SchemaAbiType, SchemaAbiTypeToPrimitiveType } from "@latticexyz/schema-type";
import {
  getFunctionSelector,
  Hex,
  getCreate2Address,
  getAddress,
  hexToBytes,
  Abi,
  bytesToHex,
  getFunctionSignature,
} from "viem";
import { getExistingContracts } from "../utils/getExistingContracts";
import { defaultModuleContracts } from "../utils/modules/constants";
import { getContractData } from "../utils/utils/getContractData";
import { configToTables } from "./configToTables";
import { deployer } from "./ensureDeployer";
import { resourceLabel } from "./resourceLabel";

// TODO: this should be replaced by https://github.com/latticexyz/mud/issues/1668

export function resolveConfig<config extends ConfigInput>({
  config,
  forgeSourceDir,
  forgeOutDir,
}: {
  config: config;
  forgeSourceDir: string;
  forgeOutDir: string;
}): Config<config> {
  const tables = configToTables(config);

  // TODO: should the config parser/loader help with resolving systems?
  const contractNames = getExistingContracts(forgeSourceDir).map(({ basename }) => basename);
  const resolvedConfig = resolveWorldConfig(config, contractNames);
  const baseSystemContractData = getContractData("System", forgeOutDir);
  const baseSystemFunctions = baseSystemContractData.abi
    .filter((item): item is typeof item & { type: "function" } => item.type === "function")
    .map(getFunctionSignature);

  const systems = Object.entries(resolvedConfig.systems).map(([systemName, system]) => {
    const namespace = config.namespace;
    const name = system.name;
    const systemId = resourceToHex({ type: "system", namespace, name });
    const contractData = getContractData(systemName, forgeOutDir);

    const systemFunctions = contractData.abi
      .filter((item): item is typeof item & { type: "function" } => item.type === "function")
      .map(getFunctionSignature)
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
      deployedBytecodeSize: contractData.deployedBytecodeSize,
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

  // ugh (https://github.com/latticexyz/mud/issues/1668)
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
    const contractData =
      defaultModuleContracts.find((defaultMod) => defaultMod.name === mod.name) ??
      getContractData(mod.name, forgeOutDir);
    const installArgs = mod.args
      .map((arg) => resolveWithContext(arg, resolveContext))
      .map((arg) => {
        const value = arg.value instanceof Uint8Array ? bytesToHex(arg.value) : arg.value;
        return encodeField(arg.type as SchemaAbiType, value as SchemaAbiTypeToPrimitiveType<SchemaAbiType>);
      });
    if (installArgs.length > 1) {
      throw new Error(`${mod.name} module should only have 0-1 args, but had ${installArgs.length} args.`);
    }
    return {
      name: mod.name,
      installAsRoot: mod.root,
      installData: installArgs.length === 0 ? "0x" : installArgs[0],
      address: getCreate2Address({ from: deployer, bytecode: contractData.bytecode, salt }),
      bytecode: contractData.bytecode,
      deployedBytecodeSize: contractData.deployedBytecodeSize,
      abi: contractData.abi,
    };
  });

  return {
    tables,
    systems: systemsWithAccess,
    modules,
  };
}
