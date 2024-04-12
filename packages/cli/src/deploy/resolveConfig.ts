import path from "path";
import { resolveWorldConfig } from "@latticexyz/world/internal";
import { Config, ConfigInput, Library, Module, System, WorldFunction } from "./common";
import { resourceToHex } from "@latticexyz/common";
import { resolveWithContext } from "@latticexyz/config/library";
import { encodeField } from "@latticexyz/protocol-parser/internal";
import { SchemaAbiType, SchemaAbiTypeToPrimitiveType } from "@latticexyz/schema-type/internal";
import { Hex, hexToBytes, bytesToHex, toFunctionSelector, toFunctionSignature } from "viem";
import { getExistingContracts } from "../utils/getExistingContracts";
import { defaultModuleContracts } from "../utils/defaultModuleContracts";
import { getContractData } from "../utils/getContractData";
import { configToTables } from "./configToTables";
import { groupBy } from "@latticexyz/common/utils";
import { findLibraries } from "./findLibraries";
import { createPrepareDeploy } from "./createPrepareDeploy";

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
  const libraries = findLibraries(forgeOutDir).map((library): Library => {
    // foundry/solc flattens artifacts, so we just use the path basename
    const contractData = getContractData(path.basename(library.path), library.name, forgeOutDir);
    return {
      path: library.path,
      name: library.name,
      abi: contractData.abi,
      prepareDeploy: createPrepareDeploy(contractData.bytecode, contractData.placeholders),
      deployedBytecodeSize: contractData.deployedBytecodeSize,
    };
  });

  const tables = configToTables(config);

  // TODO: should the config parser/loader help with resolving systems?
  const contractNames = getExistingContracts(forgeSourceDir).map(({ basename }) => basename);
  const resolvedConfig = resolveWorldConfig(config, contractNames);
  const baseSystemContractData = getContractData("System.sol", "System", forgeOutDir);
  const baseSystemFunctions = baseSystemContractData.abi
    .filter((item): item is typeof item & { type: "function" } => item.type === "function")
    .map(toFunctionSignature);

  const systems = Object.entries(resolvedConfig.systems).map(([systemName, system]): System => {
    const namespace = config.namespace;
    const name = system.name;
    const systemId = resourceToHex({ type: "system", namespace, name });
    const contractData = getContractData(`${systemName}.sol`, systemName, forgeOutDir);

    const systemFunctions = contractData.abi
      .filter((item): item is typeof item & { type: "function" } => item.type === "function")
      .map(toFunctionSignature)
      .filter((sig) => !baseSystemFunctions.includes(sig))
      .map((sig): WorldFunction => {
        // TODO: figure out how to not duplicate contract behavior (https://github.com/latticexyz/mud/issues/1708)
        const worldSignature = namespace === "" ? sig : `${namespace}__${sig}`;
        return {
          signature: worldSignature,
          selector: toFunctionSelector(worldSignature),
          systemId,
          systemFunctionSignature: sig,
          systemFunctionSelector: toFunctionSelector(sig),
        };
      });

    return {
      namespace,
      name,
      systemId,
      allowAll: system.openAccess,
      allowedAddresses: system.accessListAddresses as Hex[],
      allowedSystemIds: system.accessListSystems.map((name) =>
        resourceToHex({ type: "system", namespace, name: resolvedConfig.systems[name].name }),
      ),
      prepareDeploy: createPrepareDeploy(contractData.bytecode, contractData.placeholders),
      deployedBytecodeSize: contractData.deployedBytecodeSize,
      abi: contractData.abi,
      functions: systemFunctions,
    };
  });

  // Check for overlapping system IDs (since names get truncated when turning into IDs)
  // TODO: move this into the world config resolve step once it resolves system IDs
  const systemsById = groupBy(systems, (system) => system.systemId);
  const overlappingSystems = Array.from(systemsById.values())
    .filter((matches) => matches.length > 1)
    .flat();
  if (overlappingSystems.length) {
    const names = overlappingSystems.map((system) => system.name);
    throw new Error(
      `Found systems with overlapping system ID: ${names.join(
        ", ",
      )}.\n\nSystem IDs are generated from the first 16 bytes of the name, so you may need to rename them to avoid the overlap.`,
    );
  }

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
          }),
        ),
      ]),
    ),
  };

  const modules = config.modules.map((mod): Module => {
    const contractData =
      defaultModuleContracts.find((defaultMod) => defaultMod.name === mod.name) ??
      getContractData(`${mod.name}.sol`, mod.name, forgeOutDir);
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
      prepareDeploy: createPrepareDeploy(contractData.bytecode, contractData.placeholders),
      deployedBytecodeSize: contractData.deployedBytecodeSize,
      abi: contractData.abi,
    };
  });

  return {
    tables,
    systems,
    modules,
    libraries,
  };
}
