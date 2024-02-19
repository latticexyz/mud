import { ClientConfig, Hex, RpcLog, createPublicClient, encodeEventTopics, http, numberToHex } from "viem";
import { storeEventsAbi } from "@latticexyz/store";
import { redstoneHolesky } from "./chains";

export async function getLogs(worldAddress: Hex, fromBlock: number, toBlock: number): Promise<RpcLog[]> {
  const clientOptions = {
    chain: redstoneHolesky,
    transport: http(redstoneHolesky.rpcUrls.default.http[0]),
    pollingInterval: 1000,
  } as const satisfies ClientConfig;

  const publicClient = createPublicClient(clientOptions);

  const logs = await publicClient.request({
    method: "eth_getLogs",
    params: [
      {
        address: worldAddress,
        topics: [
          storeEventsAbi.flatMap((event) =>
            encodeEventTopics({
              abi: [event],
              eventName: event.name,
            })
          ),
        ],
        fromBlock: numberToHex(fromBlock),
        toBlock: numberToHex(toBlock),
      },
    ],
  });

  return logs;
}
