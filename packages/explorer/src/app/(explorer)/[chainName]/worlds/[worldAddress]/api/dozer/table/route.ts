import { Hex } from "viem";
import { fetchDozer } from "../../utils/fetchDozer";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { chainName: string; worldAddress: Hex } }) {
  const { chainName, worldAddress } = params;
  const { searchParams } = new URL(request.url);
  const tableId = searchParams.get("tableId");
  const columns = searchParams.get("columns");

  if (!tableId) {
    return Response.json({ error: "tableId is required" }, { status: 400 });
  } else if (!columns) {
    return Response.json({ error: "columns are required" }, { status: 400 });
  }

  try {
    const data = await fetchDozer(chainName, {
      address: worldAddress,
      query: `select ${columns} from ${tableId}`,
    });
    const schemaKeys = columns.split(",");
    const formattedData = data.result[0]
      .slice(1)
      .map((row) => Object.fromEntries(schemaKeys.map((key, index) => [key, row[index]])));

    return Response.json({ data: formattedData });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return Response.json({ error: errorMessage }, { status: 400 });
  }
}
