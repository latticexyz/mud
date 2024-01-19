import { Account, Chain, Client, Hex, Transport, getAddress } from "viem";
import { WorldDeploy, worldAbi, worldTables } from "./common";
import { hexToResource, resourceToHex, writeContract } from "@latticexyz/common";
import { getResourceIds } from "./getResourceIds";
import { getTableValue } from "./getTableValue";
import { debug } from "./debug";

export async function ensureNamespaceOwner({
  client,
  worldDeploy,
  resourceIds,
}: {
  readonly client: Client<Transport, Chain | undefined, Account>;
  readonly worldDeploy: WorldDeploy;
  readonly resourceIds: readonly Hex[];
}): Promise<readonly Hex[]> {
  const desiredNamespaces = Array.from(new Set(resourceIds.map((resourceId) => hexToResource(resourceId).namespace)));
  const existingResourceIds = await getResourceIds({ client, worldDeploy });
  const existingNamespaces = new Set(existingResourceIds.map((resourceId) => hexToResource(resourceId).namespace));
  if (existingNamespaces.size) {
    debug(
      "found",
      existingNamespaces.size,
      "existing namespaces:",
      Array.from(existingNamespaces)
        .map((namespace) => (namespace === "" ? "<root>" : namespace))
        .join(", ")
    );
  }

  // Assert ownership of existing namespaces
  const existingDesiredNamespaces = desiredNamespaces.filter((namespace) => existingNamespaces.has(namespace));
  const namespaceOwners = await Promise.all(
    existingDesiredNamespaces.map(async (namespace) => {
      const { owner } = await getTableValue({
        client,
        worldDeploy,
        table: worldTables.world_NamespaceOwner,
        key: { namespaceId: resourceToHex({ type: "namespace", namespace, name: "" }) },
      });
      return [namespace, owner];
    })
  );

  const unauthorizedNamespaces = namespaceOwners
    .filter(([, owner]) => getAddress(owner) !== getAddress(client.account.address))
    .map(([namespace]) => namespace);

  if (unauthorizedNamespaces.length) {
    throw new Error(`You are attempting to deploy to namespaces you do not own: ${unauthorizedNamespaces.join(", ")}`);
  }

  // Register missing namespaces
  const missingNamespaces = desiredNamespaces.filter((namespace) => !existingNamespaces.has(namespace));
  if (missingNamespaces.length > 0) {
    debug("registering namespaces", Array.from(missingNamespaces).join(", "));
  }
  const registrationTxs = Promise.all(
    missingNamespaces.map((namespace) =>
      writeContract(client, {
        chain: client.chain ?? null,
        address: worldDeploy.address,
        abi: worldAbi,
        functionName: "registerNamespace",
        args: [resourceToHex({ namespace, type: "namespace", name: "" })],
      })
    )
  );

  return registrationTxs;
}
