import { camelCase } from "../../../lib/utils";
import { getDatabase } from "../database";
import { TableRow } from "../tables/route";

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

export async function GET(request: Request) {
  const db = getDatabase();
  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table");

  const tables = db
    ?.prepare("SELECT name FROM sqlite_master WHERE type='table'")
    .all() as TableRow[];

  const isTable = tables.find((t) => t.name === table);
  if (!isTable) {
    return Response.json({ error: "table does not exist" }, { status: 400 });
  }

  const rows = db
    ?.prepare(`SELECT * FROM "${table}" LIMIT 30`)
    .all() as RowsResponse;

  return Response.json({ rows: convertKeysToCamelCase(rows) });
}
