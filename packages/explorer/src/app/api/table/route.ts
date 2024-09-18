import { getDatabase } from "../utils/getDatabase";

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
    const query = `SELECT * FROM "${tableId}" LIMIT 50`;
    const table = db?.prepare(query).all() as Table;

    return Response.json({ table });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    } else {
      return Response.json({ error: "An unknown error occurred" }, { status: 400 });
    }
  }
}
