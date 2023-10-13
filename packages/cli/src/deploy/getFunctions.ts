import { Client, getFunctionSelector, parseAbiItem } from "viem";
import { WorldDeploy, WorldFunction, worldTables } from "./common";
import { debug } from "./debug";
import { storeSetRecordEvent } from "@latticexyz/store";
import { getLogs } from "viem/actions";
import { decodeValueArgs } from "@latticexyz/protocol-parser";
import { getTableValue } from "./getTableValue";
import { hexToResource } from "@latticexyz/common";

export async function getFunctions({
  client,
  worldDeploy,
}: {
  readonly client: Client;
  readonly worldDeploy: WorldDeploy;
}): Promise<readonly WorldFunction[]> {
  // This assumes we only use `FunctionSelectors._set(...)`, which is true as of this writing.
  debug("looking up function signatures for", worldDeploy.address);
  const logs = await getLogs(client, {
    strict: true,
    fromBlock: worldDeploy.deployBlock,
    toBlock: worldDeploy.stateBlock,
    address: worldDeploy.address,
    event: parseAbiItem(storeSetRecordEvent),
    args: { tableId: worldTables.world_FunctionSignatures.tableId },
  });

  const signatures = logs.map((log) => {
    const value = decodeValueArgs(worldTables.world_FunctionSignatures.valueSchema, log.args);
    return value.functionSignature;
  });
  debug("found", signatures.length, "function signatures for", worldDeploy.address);

  // TODO: parallelize with a bulk getRecords
  const functions = await Promise.all(
    signatures.map(async (signature) => {
      const selector = getFunctionSelector(signature);
      const { systemId, systemFunctionSelector } = await getTableValue({
        client,
        worldDeploy,
        table: worldTables.world_FunctionSelectors,
        key: { functionSelector: selector },
      });
      const { namespace, name } = hexToResource(systemId);
      // TODO: find away around undoing contract logic (https://github.com/latticexyz/mud/issues/1708)
      const systemFunctionSignature = namespace === "" ? signature : signature.replace(`${namespace}_${name}_`, "");
      return {
        signature,
        selector,
        systemId,
        systemFunctionSignature,
        systemFunctionSelector,
      };
    })
  );

  return functions;
}
