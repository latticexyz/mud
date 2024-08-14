import { Hex } from "viem";
import { getDatabase } from "../utils/getDatabase";

export const dynamic = "force-dynamic";

export type TableConfig = {
  address: Hex;
  id: string;
  key_schema: Record<string, string>;
  last_error: string | null;
  name: string;
  namespace: string;
  schema_version: number;
  table_id: Hex;
  value_schema: Record<string, string>;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const table = searchParams.get("table") as Hex;

  if (!table) {
    return Response.json({ error: "table is required" }, { status: 400 });
  }

  try {
    const db = getDatabase();
    const tableData = db?.prepare("SELECT * FROM __mudStoreTables WHERE id = ?").get(table) as TableConfig;

    return Response.json({ table: tableData });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    } else {
      return Response.json({ error: "An unknown error occurred" }, { status: 400 });
    }
  }
}
