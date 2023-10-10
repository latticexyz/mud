import { Account, Chain, Client, Hex, Transport, getAddress } from "viem";
import { WorldDeploy, worldTables } from "./common";
import { hexToResource, resourceToHex } from "@latticexyz/common";
import { getResourceIds } from "./getResourceIds";
import { getTableValue } from "./getTableValue";

export async function assertNamespaceOwner({
  client,
  worldDeploy,
  resourceIds,
}: {
  readonly client: Client<Transport, Chain | undefined, Account>;
  readonly worldDeploy: WorldDeploy;
  readonly resourceIds: readonly Hex[];
}): Promise<void> {
  const desiredNamespaces = Array.from(new Set(resourceIds.map((resourceId) => hexToResource(resourceId).namespace)));
  const existingResourceIds = await getResourceIds({ client, worldDeploy });
  const existingNamespaces = Array.from(
    new Set(existingResourceIds.map((resourceId) => hexToResource(resourceId).namespace))
  );

  const namespaces = desiredNamespaces.filter((namespace) => existingNamespaces.includes(namespace));
  const namespaceOwners = await Promise.all(
    namespaces.map(async (namespace) => {
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
}
