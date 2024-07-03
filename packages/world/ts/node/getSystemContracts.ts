import { resourceToHex } from "@latticexyz/common";
import { World } from "../config/v2/output";
import { findSolidityFiles } from "./findSolidityFiles";

const namespacePattern = /\/namespaces\/(?<namespace>[^/]+)\//;

export async function getSystemContracts({ configPath, config }: { configPath: string; config: World }) {
  const solidityFiles = await findSolidityFiles({ configPath, config });

  // TODO: validate alignment between config systems (namespaces, system names)

  return solidityFiles
    .map((file) => ({
      sourcePath: file.filename,
      name: file.basename,
    }))
    .filter(
      (file) =>
        file.name.endsWith("System") &&
        // exclude the base System contract
        file.name !== "System" &&
        // exclude interfaces
        !/^I[A-Z]/.test(file.name),
    )
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
        return { source: system.sourcePath, namespace, name: system.name };
      }

      if (namespacePattern.test(system.sourcePath)) {
        throw new Error(
          `This MUD app is configured to use a single namespace, but system contract at \`${system.sourcePath}\` was in a namespace directory.`,
        );
      }
      return { source: system.sourcePath, namespace: config.namespace, name: system.name };
    })
    .map((system) => {
      console.log("system", system);
      return {
        ...system,
        systemId: resourceToHex({
          type: "system",
          namespace: system.namespace,
          name: system.name,
        }),
      };
    });
}
