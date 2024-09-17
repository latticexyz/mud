import { AbiFunction, Address, Hex, createWalletClient, http, parseAbi } from "viem";
import { getBlockNumber, getLogs } from "viem/actions";
import { helloStoreEvent } from "@latticexyz/store";
import { helloWorldEvent } from "@latticexyz/world";
import { getWorldAbi } from "@latticexyz/world/internal";
import { SupportedChainIds, chains, validateChainId } from "../../../common";

export const dynamic = "force-dynamic";

async function getClient(chainId: SupportedChainIds) {
  const client = createWalletClient({
    chain: chains[chainId],
    transport: http(),
  });

  return client;
}

async function getParameters(chainId: SupportedChainIds, worldAddress: Address) {
  const client = await getClient(chainId);
  const toBlock = await getBlockNumber(client);
  const logs = await getLogs(client, {
    strict: true,
    address: worldAddress,
    events: parseAbi([helloStoreEvent, helloWorldEvent] as const),
    fromBlock: "earliest",
    toBlock,
  });
  const fromBlock = logs[0]?.blockNumber ?? 0n;
  // world is considered loaded when both events are emitted
  const isWorldDeployed = logs.length === 2;

  return { fromBlock, toBlock, isWorldDeployed };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const worldAddress = searchParams.get("worldAddress") as Hex;
  const chainId = Number(searchParams.get("chainId"));
  validateChainId(chainId);

  if (!worldAddress) {
    return Response.json({ error: "address is required" }, { status: 400 });
  }

  try {
    const client = await getClient(chainId);
    const { fromBlock, toBlock, isWorldDeployed } = await getParameters(chainId, worldAddress);
    const worldAbiResponse = await getWorldAbi({
      client,
      worldAddress,
      fromBlock,
      toBlock,
    });
    const abi = worldAbiResponse
      .filter((entry): entry is AbiFunction => entry.type === "function")
      .sort((a, b) => a.name.localeCompare(b.name));

    return Response.json({ abi, isWorldDeployed });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    } else {
      return Response.json({ error: "An unknown error occurred" }, { status: 400 });
    }
  }
}
