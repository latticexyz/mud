import { AbiFunction, Address, Hex, createWalletClient, http, parseAbi } from "viem";
import { getBlockNumber, getLogs } from "viem/actions";
import { helloStoreEvent } from "@latticexyz/store";
import { helloWorldEvent } from "@latticexyz/world";
import { getWorldAbi } from "@latticexyz/world/internal";
import { supportedChainId, supportedChains, validateChainName } from "../../../../../../../common";

export const dynamic = "force-dynamic";

async function getClient(chainId: supportedChainId) {
  const chain = Object.values(supportedChains).find((c) => c.id === chainId);
  const client = createWalletClient({
    chain,
    transport: http(),
  });

  return client;
}

async function getParameters(chainId: supportedChainId, worldAddress: Address) {
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

export async function GET(req: Request, { params }: { params: { chainName: string; worldAddress: Hex } }) {
  const { chainName, worldAddress } = params;
  validateChainName(chainName);
  const chainId = supportedChains[chainName].id;

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
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return Response.json({ error: errorMessage }, { status: 400 });
  }
}
