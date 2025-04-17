import { anvil } from "viem/chains";
import { indexerForChainId } from "../../../utils/indexerForChainId";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const indexer = indexerForChainId(anvil.id);
    const response = await fetch(indexer.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        {
          query: "SELECT DISTINCT address FROM __mudStoreTables",
        },
      ]),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const result = data.result[0];
    if (!result || !Array.isArray(result) || result.length < 2) {
      return Response.json({ items: [] });
    }

    const rows = result.slice(1);
    const items = rows.map((row: string[]) => ({
      address: {
        hash: row[0],
      },
    }));

    return Response.json({ items });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return Response.json({ error: errorMessage }, { status: 400 });
  }
}
