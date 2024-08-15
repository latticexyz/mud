import {
  Hex,
  Client,
  Transport,
  Chain,
  Account,
  stringToHex,
  BaseError,
  hexToString,
  toFunctionSelector,
  AbiFunction,
  AbiItem,
  toFunctionSignature,
} from "viem";
import { WorldDeploy } from "./common";
import { debug } from "./debug";
import { hexToResource, writeContract } from "@latticexyz/common";
import { isDefined } from "@latticexyz/common/utils";
import worldConfig from "@latticexyz/world/mud.config";
import metadataConfig from "@latticexyz/world-module-metadata/mud.config";
import metadataAbi from "@latticexyz/world-module-metadata/out/IMetadataSystem.sol/IMetadataSystem.abi.json" assert { type: "json" };
import { getTableValue } from "./getTableValue";

type LabeledResource = {
  readonly resourceId: Hex;
  readonly label: string;
};

function isAbiFunction(item: AbiItem): item is AbiFunction {
  return item.type === "function";
}

function isEmptyHex(hex: Hex): boolean {
  return /^0x0*/.test(hex);
}

export async function ensureResourceLabels({
  client,
  worldDeploy,
  resources,
}: {
  readonly client: Client<Transport, Chain | undefined, Account>;
  readonly worldDeploy: WorldDeploy;
  readonly resources: readonly LabeledResource[];
}): Promise<readonly Hex[]> {
  // it's safe to use ! here because the abi is strongly typed and TS will show an error if the name used below is not in the ABI
  const functionAbi = metadataAbi.filter(isAbiFunction).find((fn) => fn.name === "metadata__setResourceTag")!;
  const worldFunction = await getTableValue({
    client,
    worldDeploy,
    table: worldConfig.tables.world__FunctionSelectors,
    key: { worldFunctionSelector: toFunctionSelector(functionAbi) },
  });
  console.log("world function", worldFunction);
  if (isEmptyHex(worldFunction.systemId)) {
    debug(
      `Skipping resource labels because \`${toFunctionSignature(functionAbi)}\` world function was missing. Is the metadata module not installed or outdated?`,
    );
    return [];
  }

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

  debug(`setting ${resources.length} resource labels`);
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
