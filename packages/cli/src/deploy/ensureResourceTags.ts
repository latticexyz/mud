import { Hex, Client, Transport, Chain, Account, stringToHex, BaseError } from "viem";
import { WorldDeploy } from "./common";
import { debug } from "./debug";
import { hexToResource, writeContract } from "@latticexyz/common";
import { identity, isDefined } from "@latticexyz/common/utils";
import metadataConfig from "@latticexyz/world-module-metadata/mud.config";
import metadataAbi from "@latticexyz/world-module-metadata/out/IMetadataSystem.sol/IMetadataSystem.abi.json" assert { type: "json" };
import { getRecord } from "./getRecord";

export type ResourceTag<value> = {
  resourceId: Hex;
  tag: string;
  value: value;
};

export async function ensureResourceTags<const value>({
  client,
  worldDeploy,
  tags,
  valueToHex = identity,
}: {
  readonly client: Client<Transport, Chain | undefined, Account>;
  readonly worldDeploy: WorldDeploy;
  readonly tags: readonly ResourceTag<value>[];
} & (value extends Hex
  ? { readonly valueToHex?: (value: value) => Hex }
  : { readonly valueToHex: (value: value) => Hex })): Promise<readonly Hex[]> {
  const pendingTags = (
    await Promise.all(
      tags.map(async (tag) => {
        const { value } = await getRecord({
          client,
          worldDeploy,
          table: metadataConfig.tables.metadata__ResourceTag,
          key: { resource: tag.resourceId, tag: stringToHex(tag.tag, { size: 32 }) },
        });
        if (value === valueToHex(tag.value)) return;
        return tag;
      }),
    )
  ).filter(isDefined);

  if (pendingTags.length === 0) return [];

  debug("setting", pendingTags.length, "resource tags");
  return (
    await Promise.all(
      pendingTags.map(async (tag) => {
        const resource = hexToResource(tag.resourceId);
        // TODO: move to resourceToDebugString
        const resourceString = `${resource.type}:${resource.namespace}:${resource.name}`;
        debug(`setting resource tag for ${resourceString}`, { [tag.tag]: tag.value });
        try {
          return await writeContract(client, {
            chain: client.chain ?? null,
            address: worldDeploy.address,
            abi: metadataAbi,
            // TODO: replace with batchCall (https://github.com/latticexyz/mud/issues/1645)
            functionName: "metadata__setResourceTag",
            args: [tag.resourceId, stringToHex(tag.tag, { size: 32 }), valueToHex(tag.value)],
          });
        } catch (error) {
          debug(
            `failed to set resource tag for ${resourceString}, skipping\n  ${error instanceof BaseError ? error.shortMessage : error}`,
          );
        }
      }),
    )
  ).filter(isDefined);
}
