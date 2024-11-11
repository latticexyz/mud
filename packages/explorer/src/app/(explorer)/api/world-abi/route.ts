import { Address, Hex, createPublicClient, http, parseAbi } from "viem";
import { fetchBlockLogs } from "@latticexyz/block-logs-stream";
import { helloStoreEvent } from "@latticexyz/store";
import { helloWorldEvent } from "@latticexyz/world";
import { getWorldAbi } from "@latticexyz/world/internal";
import { chainIdToName, supportedChainId, supportedChains, validateChainId } from "../../../../common";

export const dynamic = "force-dynamic";

async function getClient(chainId: supportedChainId) {
  const chain = supportedChains[chainIdToName[chainId]];
  const client = createPublicClient({
    chain,
    transport: http(),
  });

  return client;
}

async function getParameters(chainId: supportedChainId, worldAddress: Address) {
  const client = await getClient(chainId);
  const toBlock = await client.getBlockNumber();
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
    const { fromBlock, toBlock, isWorldDeployed } = await getParameters(chainId, worldAddress);
    const abi = await getWorldAbi({
      client,
      worldAddress,
      fromBlock,
      toBlock,
    });

    return Response.json({ abi, isWorldDeployed });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return Response.json({ error: errorMessage }, { status: 400 });
  }
}
