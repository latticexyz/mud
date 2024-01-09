import { Account, Chain, Client, Hex, Transport, getAddress } from "viem";
import { WorldDeploy, worldAbi, worldTables } from "./common";
import { hexToResource, resourceToHex, writeContract } from "@latticexyz/common";
import { getResourceIds } from "./getResourceIds";
import { getTableValue } from "./getTableValue";
import { isDefined } from "@latticexyz/common/utils";

export async function ensureNamespaceOwner({
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
  const existingNamespaces = new Set(existingResourceIds.map((resourceId) => hexToResource(resourceId).namespace));

  const namespaceOwners = (
    await Promise.all(
      desiredNamespaces.map(async (namespace) => {
        // Assert ownership of existing namespaces
        if (existingNamespaces.has(namespace)) {
          const { owner } = await getTableValue({
            client,
            worldDeploy,
            table: worldTables.world_NamespaceOwner,
            key: { namespaceId: resourceToHex({ type: "namespace", namespace, name: "" }) },
          });
          return [namespace, owner];
        }

        // Register namespaces that don't exist yet
        await writeContract(client, {
          chain: client.chain ?? null,
          address: worldDeploy.address,
          abi: worldAbi,
          functionName: "registerNamespace",
          args: [resourceToHex({ namespace, type: "namespace", name: "" })],
        });
      })
    )
  ).filter(isDefined);

  const unauthorizedNamespaces = namespaceOwners
    .filter(([, owner]) => getAddress(owner) !== getAddress(client.account.address))
    .map(([namespace]) => namespace);

  if (unauthorizedNamespaces.length) {
    throw new Error(`You are attempting to deploy to namespaces you do not own: ${unauthorizedNamespaces.join(", ")}`);
  }
}
