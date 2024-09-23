import { bufferToBigInt, camelCase } from "../../../../../../../../lib/utils";
import { fetchSqliteTable } from "../../utils/fetchSqlite";
import { getDatabase } from "../../utils/getDatabase";

export const dynamic = "force-dynamic";

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

    const data = await fetchSqliteTable(tableId);
    const formattedData = data?.map((row: object) => {
      return Object.fromEntries(
        Object.entries(row).map(([key, value]) => {
          if (value?.type === "Buffer") {
            return [camelCase(key), bufferToBigInt(value?.data)];
          }
          return [camelCase(key), value];
        }),
      );
    });

    return Response.json({ data: formattedData });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return Response.json({ error: errorMessage }, { status: 400 });
  }
}
