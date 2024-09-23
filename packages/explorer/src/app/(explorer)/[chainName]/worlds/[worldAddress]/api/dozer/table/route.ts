import { Hex } from "viem";
import { fetchDozer } from "../../utils/fetchDozer";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { chainName: string; worldAddress: Hex } }) {
  const { chainName, worldAddress } = params;
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const columnNames = searchParams.get("columnNames");

  if (!query) {
    return Response.json({ error: "query is required" }, { status: 400 });
  } else if (!columnNames) {
    return Response.json({ error: "columnNames is required" }, { status: 400 });
  }

  try {
    const data = await fetchDozer(chainName, {
      address: worldAddress,
      query,
    });
    const columns = columnNames.split(",");
    const formattedData = data?.result?.[0]
      .slice(1)
      .map((row) => Object.fromEntries(columns.map((key, index) => [key, row[index]])));

    return Response.json({ data: formattedData || [] });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return Response.json({ error: errorMessage }, { status: 400 });
  }
}
