import { Abi, Hex } from "viem";
import { getSystemAbis } from "@latticexyz/store-sync/internal";
import { validateChainId } from "../../../../common";
import { getClient } from "../utils/getClient";
import { getIndexerUrl } from "../utils/getIndexerUrl";

export const dynamic = "force-dynamic";

export type SystemAbisResponse = {
  abis: {
    [systemId: Hex]: Abi;
  };
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const chainId = Number(searchParams.get("chainId"));
  const worldAddress = searchParams.get("worldAddress") as Hex;
  const systemIds = searchParams.get("systemIds")?.split(",") as Hex[];

  if (!chainId || !worldAddress || !systemIds) {
    return Response.json({ error: "Missing chainId, worldAddress or systemIds" }, { status: 400 });
  }
  validateChainId(chainId);

  try {
    const client = await getClient(chainId);
    const indexerUrl = getIndexerUrl(chainId);
    const abis = await getSystemAbis({
      client,
      worldAddress,
      systemIds,
      indexerUrl,
      chainId,
    });

    return Response.json({ abis });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return Response.json({ error: errorMessage }, { status: 400 });
  }
}
