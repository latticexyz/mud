import { camelCase } from "../../../lib/utils";
import { getDatabase } from "../database";

export const dynamic = "force-dynamic";

type Row = {
  [key: string]: string;
};

type RowsResponse = Row[] | undefined;

function convertKeysToCamelCase(rows: RowsResponse): Row[] {
  if (rows == undefined) {
    return [];
  }

  return rows.map((row) => {
    return Object.keys(row).reduce((result: { [key: string]: string }, key) => {
      const camelKey = camelCase(key);
      result[camelKey] = row[key];
      return result;
    }, {});
  });
}

function doesTableExist(table: string) {
  const db = getDatabase();
  const result = db
    ?.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?")
    .get(table);

  return Boolean(result);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table");

  try {
    if (!table || !doesTableExist(table)) {
      return Response.json({ error: "table does not exist" }, { status: 400 });
    }

    const db = getDatabase();
    const query = `SELECT * FROM "${table}" LIMIT 30`;
    const rows = db?.prepare(query).all() as RowsResponse;

    return Response.json({ rows: convertKeysToCamelCase(rows) });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    } else {
      return Response.json(
        { error: "An unknown error occurred" },
        { status: 400 },
      );
    }
  }
}
