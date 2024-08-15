import { Hex, Client, Transport, Chain, Account, stringToHex, BaseError, hexToString } from "viem";
import { WorldDeploy } from "./common";
import { debug } from "./debug";
import { hexToResource, writeContract } from "@latticexyz/common";
import { isDefined } from "@latticexyz/common/utils";
import metadataConfig from "@latticexyz/world-module-metadata/mud.config";
import metadataAbi from "@latticexyz/world-module-metadata/out/IMetadataSystem.sol/IMetadataSystem.abi.json" assert { type: "json" };
import { getTableValue } from "./getTableValue";

type LabeledResource = {
  readonly resourceId: Hex;
  readonly label: string;
};

export async function ensureResourceLabels({
  client,
  worldDeploy,
  resources,
}: {
  readonly client: Client<Transport, Chain | undefined, Account>;
  readonly worldDeploy: WorldDeploy;
  readonly resources: readonly LabeledResource[];
}): Promise<readonly Hex[]> {
  const currentLabels = await Promise.all(
    resources.map(async (resource) => {
      const { value } = await getTableValue({
        client,
        worldDeploy,
        table: metadataConfig.tables.metadata__ResourceTag,
        key: { resource: resource.resourceId, tag: stringToHex("label", { size: 32 }) },
      });
      return hexToString(value);
    }),
  );

  const resourcesToSet = resources.filter((resource, i) => resource.label !== currentLabels[i]);
  if (resourcesToSet.length === 0) {
    return [];
  }

  debug("setting", resources.length, "resource labels");
  return (
    await Promise.all(
      resourcesToSet.map(async ({ resourceId, label }) => {
        const resource = hexToResource(resourceId);
        // TODO: move to resourceToDebugString
        const resourceString = `${resource.type}:${resource.namespace}:${resource.name}`;
        debug(`setting resource label for ${resourceString} to ${label}`);
        try {
          return await writeContract(client, {
            chain: client.chain ?? null,
            address: worldDeploy.address,
            abi: metadataAbi,
            // TODO: replace with batchCall (https://github.com/latticexyz/mud/issues/1645)
            functionName: "metadata__setResourceTag",
            args: [resourceId, stringToHex("label", { size: 32 }), stringToHex(label)],
          });
        } catch (error) {
          debug(
            `failed to set resource label for ${resourceString}, skipping\n  ${error instanceof BaseError ? error.shortMessage : error}`,
          );
        }
      }),
    )
  ).filter(isDefined);
}
