import { World } from "../config/v2";
import { SolidityContract } from "./getSystemContracts";
import { resourceToHex } from "@latticexyz/common";
import { Hex } from "viem";

export const namespacePattern = /\/namespaces\/(?<namespace>[^/]+)\//;

export type GetSystemManifestOptions = {
  readonly config: World;
  readonly systemContracts: readonly SolidityContract[];
};

export type System = {
  readonly sourcePath: string;
  readonly namespace: string;
  readonly name: string;
  readonly systemId: Hex;
};

export type SystemManifest = {
  readonly systems: readonly System[];
};

export function getSystemManifest({ config, systemContracts }: GetSystemManifestOptions): SystemManifest {
  // TODO: check namespaced systems when config namespaces are enabled
  const configSystemsWithoutFiles = Object.keys(config.systems).filter(
    (label) => !systemContracts.some((system) => system.name === label),
  );
  if (configSystemsWithoutFiles.length) {
    throw new Error(
      `Found systems in config without corresponding source files: ${configSystemsWithoutFiles.join(", ")}`,
    );
  }

  const systems = systemContracts
    .map((system) => {
      if (config.internal.multipleNamespaces) {
        const match = system.sourcePath.match(namespacePattern);
        const namespace = match?.groups?.namespace;
        if (namespace == null) {
          throw new Error(
            `This MUD app is configured to use multiple namespaces, but system contract at \`${system.sourcePath}\` was not in a namespace directory.`,
          );
        }
        // TODO: look up namespace in config in case this is a label
        return { sourcePath: system.sourcePath, namespace, name: system.name };
      }

      if (namespacePattern.test(system.sourcePath)) {
        throw new Error(
          `This MUD app is configured to use a single namespace, but system contract at \`${system.sourcePath}\` was in a namespace directory.`,
        );
      }
      return { sourcePath: system.sourcePath, namespace: config.namespace, name: system.name };
    })
    .map((system) => ({
      ...system,
      systemId: resourceToHex({
        type: "system",
        // TODO: pull namespace override from config when it's available
        namespace: system.namespace,
        name: config.systems[system.name]?.name ?? system.name,
      }),
    }))
    // TODO: should this be excluded at deploy time rather than at manifest-generation time?
    .filter(
      (system) =>
        // TODO: add other ways to reference a system here? system ID? system with namespace?
        !config.excludeSystems.includes(system.name),
    );

  // TODO: resolve access control here?

  return { systems };
}
