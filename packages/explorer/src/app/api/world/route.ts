import { AbiFunction, Address, Hex, createWalletClient, http, parseAbi } from "viem";
import { getBlockNumber, getLogs } from "viem/actions";
import { getRpcUrl } from "@latticexyz/common/foundry";
import { helloStoreEvent } from "@latticexyz/store";
import { helloWorldEvent } from "@latticexyz/world";
import { getWorldAbi } from "@latticexyz/world/internal";

export const dynamic = "force-dynamic";

async function getClient() {
  const profile = process.env.FOUNDRY_PROFILE;
  const rpc = await getRpcUrl(profile);
  const client = createWalletClient({
    transport: http(rpc),
  });

  return client;
}

async function getParameters(worldAddress: Address) {
  const client = await getClient();
  const toBlock = await getBlockNumber(client);
  const logs = await getLogs(client, {
    strict: true,
    address: worldAddress,
    events: parseAbi([helloStoreEvent, helloWorldEvent] as const),
    fromBlock: "earliest",
    toBlock,
  });
  const fromBlock = logs[0]?.blockNumber ?? 0n;

  return { fromBlock, toBlock };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const worldAddress = searchParams.get("address") as Hex;

  if (!worldAddress) {
    return Response.json({ error: "address is required" }, { status: 400 });
  }

  try {
    const client = await getClient();
    const { fromBlock, toBlock } = await getParameters(worldAddress);
    const worldAbiResponse = await getWorldAbi({
      client,
      worldAddress,
      fromBlock,
      toBlock,
    });
    const abi = worldAbiResponse
      .filter((entry): entry is AbiFunction => entry.type === "function")
      .sort((a, b) => a.name.localeCompare(b.name));

    return Response.json({ abi });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    } else {
      return Response.json({ error: "An unknown error occurred" }, { status: 400 });
    }
  }
}
