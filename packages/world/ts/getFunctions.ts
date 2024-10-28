import { Client, Address } from "viem";
import { WorldFunction } from "./common";
import { debug } from "./debug";
import {
  decodeKey,
  decodeValueArgs,
  getKeySchema,
  getSchemaTypes,
  getValueSchema,
} from "@latticexyz/protocol-parser/internal";
import worldConfig from "../mud.config";
import { fetchBlockLogs } from "@latticexyz/block-logs-stream";
import { flattenStoreLogs, getStoreLogs } from "@latticexyz/store/internal";

export async function getFunctions({
  client,
  worldAddress,
  fromBlock,
  toBlock,
}: {
  readonly client: Client;
  readonly worldAddress: Address;
  readonly fromBlock: bigint;
  readonly toBlock: bigint;
}): Promise<readonly WorldFunction[]> {
  // This assumes we only use `FunctionSelectors._set(...)`, which is true as of this writing.
  debug("looking up function selectors for", worldAddress);

  const selectorBlocks = await fetchBlockLogs({
    fromBlock,
    toBlock,
    maxBlockRange: 100_000n,
    async getLogs({ fromBlock, toBlock }) {
      return getStoreLogs(client, {
        address: worldAddress,
        fromBlock,
        toBlock,
        tableId: worldConfig.namespaces.world.tables.FunctionSelectors.tableId,
      });
    },
  });
  const selectorLogs = flattenStoreLogs(selectorBlocks.flatMap((block) => block.logs));

  const selectors = selectorLogs.map((log) => {
    return {
      ...decodeValueArgs(
        getSchemaTypes(getValueSchema(worldConfig.namespaces.world.tables.FunctionSelectors)),
        log.args,
      ),
      ...decodeKey(
        getSchemaTypes(getKeySchema(worldConfig.namespaces.world.tables.FunctionSelectors)),
        log.args.keyTuple,
      ),
    };
  });
  debug("found", selectors.length, "function selectors for", worldAddress);

  // This assumes we only use `FunctionSignatures._set(...)`, which is true as of this writing.
  debug("looking up function signatures for", worldAddress);

  const signatureBlocks = await fetchBlockLogs({
    fromBlock,
    toBlock,
    maxBlockRange: 100_000n,
    async getLogs({ fromBlock, toBlock }) {
      return getStoreLogs(client, {
        address: worldAddress,
        fromBlock,
        toBlock,
        tableId: worldConfig.namespaces.world.tables.FunctionSignatures.tableId,
      });
    },
  });
  const signatureLogs = flattenStoreLogs(signatureBlocks.flatMap((block) => block.logs));

  const selectorToSignature = Object.fromEntries(
    signatureLogs.map((log) => {
      return [
        decodeKey(
          getSchemaTypes(getKeySchema(worldConfig.namespaces.world.tables.FunctionSignatures)),
          log.args.keyTuple,
        ).functionSelector,
        decodeValueArgs(
          getSchemaTypes(getValueSchema(worldConfig.namespaces.world.tables.FunctionSignatures)),
          log.args,
        ).functionSignature,
      ];
    }),
  );
  debug("found", signatureLogs.length, "function signatures for", worldAddress);

  const functions = selectors.map(({ worldFunctionSelector, systemFunctionSelector, systemId }) => ({
    selector: worldFunctionSelector,
    signature: selectorToSignature[worldFunctionSelector],
    systemFunctionSelector,
    systemFunctionSignature: selectorToSignature[systemFunctionSelector],
    systemId,
  }));

  return functions;
}
