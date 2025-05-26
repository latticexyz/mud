import { Address, Hex, parseAbi, size } from "viem";
import { getBlockNumber, getCode } from "viem/actions";
import { getAction } from "viem/utils";
import { fetchBlockLogs } from "@latticexyz/block-logs-stream";
import { helloStoreEvent } from "@latticexyz/store";
import { getWorldAbi } from "@latticexyz/store-sync/world";
import { helloWorldEvent } from "@latticexyz/world";
import { supportedChainId, validateChainId } from "../../../../common";
import { getClient } from "../utils/getClient";
import { getIndexerUrl } from "../utils/getIndexerUrl";

export const dynamic = "force-dynamic";

async function getParameters(chainId: supportedChainId, worldAddress: Address) {
  const client = await getClient(chainId);
  const toBlock = await getAction(client, getBlockNumber, "getBlockNumber")({});
  const logs = await fetchBlockLogs({
    fromBlock: 0n,
    toBlock,
    maxBlockRange: 100_000n,
    publicClient: client,
    address: worldAddress,
    events: parseAbi([helloStoreEvent, helloWorldEvent] as const),
  });

  const fromBlock = logs[0]?.blockNumber ?? 0n;
  // world is considered loaded when both events are emitted
  const isWorldDeployed = logs[0]?.logs.length === 2;

  return { fromBlock, toBlock, isWorldDeployed };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const chainId = Number(searchParams.get("chainId"));
  const worldAddress = searchParams.get("worldAddress") as Hex;

  if (!chainId || !worldAddress) {
    return Response.json({ error: "Missing chainId or worldAddress" }, { status: 400 });
  }
  validateChainId(chainId);

  try {
    const client = await getClient(chainId);
    const indexerUrl = getIndexerUrl(chainId);

    if (indexerUrl) {
      const [code, abi] = await Promise.all([
        getCode(client, { address: worldAddress }),
        getWorldAbi({
          client,
          worldAddress,
          indexerUrl,
          chainId,
        }),
      ]);

      return Response.json({ abi, isWorldDeployed: code && size(code) > 0 });
    }

    const { fromBlock, toBlock, isWorldDeployed } = await getParameters(chainId, worldAddress);
    const worldAbi = await getWorldAbi({
      client,
      worldAddress,
      fromBlock,
      toBlock,
      chainId,
    });

    return Response.json({ abi: worldAbi, isWorldDeployed });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return Response.json({ error: errorMessage }, { status: 400 });
  }
}
