import { Hex } from "viem";
import { getDatabase } from "../database";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tableId = searchParams.get("tableId") as Hex;

  if (!tableId) {
    return Response.json({ error: "tableId is required" }, { status: 400 });
  }

  const db = getDatabase();
  const table = db
    ?.prepare(`SELECT * FROM __mudStoreTables WHERE id='${tableId}'`)
    .get();

  return Response.json({ table });
}
