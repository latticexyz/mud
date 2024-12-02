import { Client, Address } from "viem";
import worldConfig from "@latticexyz/world/mud.config";
import { debug } from "../debug";
import { WorldFunction } from "./common";
import { getRecords } from "../getRecords";

export async function getFunctions({
  worldAddress,
}: {
  readonly client: Client;
  readonly worldAddress: Address;
  readonly fromBlock: bigint;
  readonly toBlock: bigint;
}): Promise<readonly WorldFunction[]> {
  // This assumes we only use `FunctionSelectors._set(...)`, which is true as of this writing.
  debug("looking up function selectors for", worldAddress);

  const { records: selectors } = await getRecords({
    indexerUrl: "https://indexer.mud.garnetchain.com",
    chainId: 17069,
    table: worldConfig.namespaces.world.tables.FunctionSelectors,
    worldAddress,
  });

  debug("found", selectors.length, "function selectors for", worldAddress);

  // This assumes we only use `FunctionSignatures._set(...)`, which is true as of this writing.
  debug("looking up function signatures for", worldAddress);

  const { records: signatures } = await getRecords({
    indexerUrl: "https://indexer.mud.garnetchain.com",
    chainId: 17069,
    table: worldConfig.namespaces.world.tables.FunctionSignatures,
    worldAddress,
  });

  const selectorToSignature = Object.fromEntries(
    signatures.map((record) => [record.functionSelector, record.functionSignature]),
  );

  debug("found", signatures.length, "function signatures for", worldAddress);

  const functions = selectors.map(({ worldFunctionSelector, systemFunctionSelector, systemId }) => ({
    selector: worldFunctionSelector,
    signature: selectorToSignature[worldFunctionSelector],
    systemFunctionSelector,
    systemFunctionSignature: selectorToSignature[systemFunctionSelector],
    systemId,
  }));

  return functions;
}
