import path from "path";
import { resolveSystems } from "@latticexyz/world/node";
import { Library, System, WorldFunction } from "./common";
import { Hex, isHex, toFunctionSelector, toFunctionSignature } from "viem";
import { getContractData } from "../utils/getContractData";
import { groupBy } from "@latticexyz/common/utils";
import { findLibraries } from "./findLibraries";
import { createPrepareDeploy } from "./createPrepareDeploy";
import { World } from "@latticexyz/world";

// TODO: replace this with a manifest/combined config output

export async function resolveConfig({
  rootDir,
  config,
  forgeOutDir,
}: {
  rootDir: string;
  config: World;
  forgeOutDir: string;
}): Promise<{
  readonly systems: readonly System[];
  readonly libraries: readonly Library[];
}> {
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

  const baseSystemContractData = getContractData("System.sol", "System", forgeOutDir);
  const baseSystemFunctions = baseSystemContractData.abi
    .filter((item): item is typeof item & { type: "function" } => item.type === "function")
    .map(toFunctionSignature);

  const configSystems = await resolveSystems({ rootDir, config });

  const systems = configSystems.map((system): System => {
    const contractData = getContractData(`${system.label}.sol`, system.label, forgeOutDir);

    const systemFunctions = contractData.abi
      .filter((item): item is typeof item & { type: "function" } => item.type === "function")
      .map(toFunctionSignature)
      .filter((sig) => !baseSystemFunctions.includes(sig))
      .map((sig): WorldFunction => {
        // TODO: figure out how to not duplicate contract behavior (https://github.com/latticexyz/mud/issues/1708)
        const worldSignature = system.namespace === "" ? sig : `${system.namespace}__${sig}`;
        return {
          signature: worldSignature,
          selector: toFunctionSelector(worldSignature),
          systemId: system.systemId,
          systemFunctionSignature: sig,
          systemFunctionSelector: toFunctionSelector(sig),
        };
      });

    // TODO: move to resolveSystems?
    const allowedAddresses = system.accessList.filter((target): target is Hex => isHex(target));
    const allowedSystemIds = system.accessList
      .filter((target) => !isHex(target))
      .map((label) => {
        const system = configSystems.find((s) => s.label === label)!;
        return system.systemId;
      });

    return {
      ...system,
      allowAll: system.openAccess,
      allowedAddresses,
      allowedSystemIds,
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

  return {
    systems,
    libraries,
  };
}
