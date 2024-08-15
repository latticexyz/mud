import { Hex, Client, Transport, Chain, Account, stringToHex, BaseError } from "viem";
import { WorldDeploy } from "./common";
import { debug } from "./debug";
import { hexToResource, writeContract } from "@latticexyz/common";
import { isDefined } from "@latticexyz/common/utils";
import metadataAbi from "@latticexyz/world-module-metadata/out/IMetadataSystem.sol/IMetadataSystem.abi.json" assert { type: "json" };

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
  // TODO: check if `metadata__setResourceTag` function exists
  // TODO: filter already registered labels

  debug(`setting ${resources.length} resource labels`);
  return (
    await Promise.all(
      resources.map(async ({ resourceId, label }) => {
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
