import { Hex } from "viem";
import mudConfig from "@latticexyz/store/mud.config";
import { decodeTable } from "../../utils/decodeTable";
import { fetchDozer } from "../../utils/fetchDozer";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { chainName: string; worldAddress: Hex } }) {
  const { chainName, worldAddress } = params;
  try {
    const storeTablesKey = "store__Tables";
    const data = await fetchDozer(chainName, {
      address: worldAddress,
      query: `SELECT ${Object.keys(mudConfig.tables[storeTablesKey].schema).join(", ")} FROM ${storeTablesKey}`,
    });
    const decodedData = data.result[0].slice(1).map((row: Hex[]) => {
      return decodeTable({
        tableId: row[0],
        keySchema: row[2],
        valueSchema: row[3],
        abiEncodedKeyNames: row[4],
        abiEncodedFieldNames: row[5],
      });
    });
    return Response.json({ data: decodedData });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return Response.json({ error: errorMessage }, { status: 400 });
  }
}
