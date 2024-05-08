import { Client, parseAbiItem } from "viem";
import { WorldDeploy, WorldFunction, worldTables } from "./common";
import { debug } from "./debug";
import { storeSetRecordEvent } from "@latticexyz/store";
import { getLogs } from "viem/actions";
import { decodeKey, decodeValueArgs } from "@latticexyz/protocol-parser/internal";

export async function getFunctions({
  client,
  worldDeploy,
}: {
  readonly client: Client;
  readonly worldDeploy: WorldDeploy;
}): Promise<readonly WorldFunction[]> {
  // This assumes we only use `FunctionSelectors._set(...)`, which is true as of this writing.
  debug("looking up function selectors for", worldDeploy.address);
  const selectorLogs = await getLogs(client, {
    strict: true,
    fromBlock: worldDeploy.deployBlock,
    toBlock: worldDeploy.stateBlock,
    address: worldDeploy.address,
    event: parseAbiItem(storeSetRecordEvent),
    args: { tableId: worldTables.world_FunctionSelectors.tableId },
  });

  const selectors = selectorLogs.map((log) => {
    return {
      ...decodeValueArgs(worldTables.world_FunctionSelectors.valueSchema, log.args),
      ...decodeKey(worldTables.world_FunctionSelectors.keySchema, log.args.keyTuple),
    };
  });
  debug("found", selectors.length, "function selectors for", worldDeploy.address);

  // This assumes we only use `FunctionSignatures._set(...)`, which is true as of this writing.
  debug("looking up function signatures for", worldDeploy.address);
  const signatureLogs = await getLogs(client, {
    strict: true,
    fromBlock: worldDeploy.deployBlock,
    toBlock: worldDeploy.stateBlock,
    address: worldDeploy.address,
    event: parseAbiItem(storeSetRecordEvent),
    args: { tableId: worldTables.world_FunctionSignatures.tableId },
  });

  const selectorToSignature = Object.fromEntries(
    signatureLogs.map((log) => {
      return [
        decodeKey(worldTables.world_FunctionSignatures.keySchema, log.args.keyTuple).functionSelector,
        decodeValueArgs(worldTables.world_FunctionSignatures.valueSchema, log.args).functionSignature,
      ];
    }),
  );
  debug("found", signatureLogs.length, "function signatures for", worldDeploy.address);

  const functions = selectors.map(({ worldFunctionSelector, systemFunctionSelector, systemId }) => ({
    selector: worldFunctionSelector,
    signature: selectorToSignature[worldFunctionSelector],
    systemFunctionSelector,
    systemFunctionSignature: selectorToSignature[systemFunctionSelector],
    systemId,
  }));

  return functions;
}
