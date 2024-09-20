import { decodeTable } from "../../../(explorer)/[chainName]/worlds/[worldAddress]/explore/utils/decodeTable";
import { bufferToBigInt } from "../../../(explorer)/[chainName]/worlds/[worldAddress]/utils/bufferToBigInt";
import { camelCase } from "../../../../lib/utils";
import { getDatabase } from "./getDatabase";

export const dynamic = "force-dynamic";

type Row = {
  [key: string]: string;
};

type Table = Row[] | undefined;

function doesTableExist(tableId: string) {
  const db = getDatabase();
  const result = db?.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").get(tableId);

  return Boolean(result);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tableId = searchParams.get("tableId");

  try {
    if (!tableId || !doesTableExist(tableId)) {
      return Response.json({ error: "Table does not exist" }, { status: 400 });
    }

    const db = getDatabase();
    const query = `SELECT * FROM "${tableId}"`;
    let data = db?.prepare(query).all() as Table;

    if (tableId.includes("store__tables")) {
      data = data?.map((row) => {
        return decodeTable({
          tableId: row.table_id,
          fieldLayout: row.field_layout,
          keySchema: row.key_schema,
          valueSchema: row.value_schema,
          abiEncodedKeyNames: row.abi_encoded_key_names,
          abiEncodedFieldNames: row.abi_encoded_field_names,
        });
      });
    } else {
      data = data?.map((row: object) => {
        return Object.fromEntries(
          Object.entries(row).map(([key, value]) => {
            if (value?.type === "Buffer") {
              return [camelCase(key), bufferToBigInt(value?.data)];
            }
            return [camelCase(key), value];
          }),
        );
      });
    }

    console.log("DATA FROM ROUTE:", data);

    return Response.json({ data });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    } else {
      return Response.json({ error: "An unknown error occurred" }, { status: 400 });
    }
  }
}
