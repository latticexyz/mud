import { resourceToHex } from "@latticexyz/common";
import { World } from "../config/v2/output";
import { getContracts } from "./getContracts";

const namespacePattern = /\/namespaces\/(?<namespace>[^/]+)\//;

export async function getSystemContracts({ configPath, config }: { configPath: string; config: World }) {
  const contracts = await getContracts({ configPath, config });

  // TODO: validate alignment between config systems (namespaces, system names)

  return contracts
    .filter(
      (contract) =>
        contract.name.endsWith("System") &&
        // exclude the base System contract
        contract.name !== "System" &&
        // exclude interfaces
        !/^I[A-Z]/.test(contract.name),
    )
    .map((contract) => {
      if (config.internal.multipleNamespaces) {
        const match = contract.source.match(namespacePattern);
        const namespace = match?.groups?.namespace;
        if (namespace == null) {
          throw new Error(
            `This MUD app is configured to use multiple namespaces, but system contract at \`${contract.source}\` was not in a namespace directory.`,
          );
        }
        return { namespace, name: contract.name, source: contract.source };
      }

      if (namespacePattern.test(contract.source)) {
        throw new Error(
          `This MUD app is configured to use a single namespace, but system contract at \`${contract.source}\` was in a namespace directory.`,
        );
      }
      return { namespace: config.namespace, name: contract.name, source: contract.source };
    })
    .map((system) => ({
      ...system,
      systemId: resourceToHex({
        type: "system",
        namespace: system.namespace,
        name: system.namespace,
      }),
    }));
}
