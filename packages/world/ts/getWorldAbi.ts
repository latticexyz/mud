import { Client, Abi, Address, getAddress, parseAbi } from "viem";
import { worldDeployEvents } from "./common";
import { getBlockNumber, getLogs } from "viem/actions";

import { getSystems } from "./getSystems";
import { functionSignatureToAbiItem } from "./functionSignatureToAbiItem";

export async function getWorldAbi({
  client,
  worldAddress,
}: {
  readonly client: Client;
  readonly worldAddress: Address;
}): Promise<Abi> {
  const formattedWorldAddress = getAddress(worldAddress);
  const stateBlock = await getBlockNumber(client);
  const logs = await getLogs(client, {
    strict: true,
    address: worldAddress,
    events: parseAbi(worldDeployEvents),
    // this may fail for certain RPC providers with block range limits
    // if so, could potentially use our fetchLogs helper (which does pagination)
    fromBlock: "earliest",
    toBlock: stateBlock,
  });
  const deployBlock = logs[0].blockNumber;

  const systems = await getSystems({
    client,
    worldAddress: formattedWorldAddress,
    stateBlock,
    deployBlock,
  });

  const worldAbi = systems.flatMap((system) =>
    system.worldFunctions.map((func) => functionSignatureToAbiItem(func.signature)),
  );

  return worldAbi;
}
