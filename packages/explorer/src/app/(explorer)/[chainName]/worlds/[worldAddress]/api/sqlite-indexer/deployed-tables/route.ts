import { Hex } from "viem";
import { decodeTable } from "../../utils/decodeTable";
import { fetchSqliteTable } from "../../utils/fetchSqlite";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { worldAddress: Hex } }) {
  const { worldAddress } = params;
  try {
    const data = await fetchSqliteTable(`SELECT * FROM "${worldAddress}__store__Tables"`);
    const decodedData = data?.map((row) => {
      return decodeTable({
        tableId: row.table_id,
        fieldLayout: row.field_layout,
        keySchema: row.key_schema,
        valueSchema: row.value_schema,
        abiEncodedKeyNames: row.abi_encoded_key_names,
        abiEncodedFieldNames: row.abi_encoded_field_names,
      });
    });

    return Response.json({ data: decodedData });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return Response.json({ error: errorMessage }, { status: 400 });
  }
}
