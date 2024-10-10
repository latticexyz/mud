import { Address } from "viem";
import { getDatabase } from "../../utils/getDatabase";

export const dynamic = "force-dynamic";

type Row = {
  address: Address;
};

type SqliteTable = Row[] | undefined;

export async function GET() {
  try {
    const db = getDatabase();
    const data = (await db?.prepare("SELECT DISTINCT address FROM __mudStoreTables").all()) as SqliteTable;
    const items = data?.map((row) => ({
      address: {
        hash: row.address,
      },
    }));
    return Response.json({ items: items || [] });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return Response.json({ error: errorMessage }, { status: 400 });
  }
}
